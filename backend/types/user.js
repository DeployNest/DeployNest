const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const environment = require("../modules/environment");
const databases = require("../modules/databases");
const { MongoServerError } = require("mongodb")

class User {
    constructor(username) {
        this.username = username;
    }

    // Signup
    async signup(email, password) {
        const users = await databases.getUserCollection().catch(() => {
            throw Error("Failed to fetch collection!")
        });

        const userData = await users.findOne({ "_id": this.username }).catch(() => {
            throw Error("Failed to fetch user!")
        });

        if (userData) {
            throw Error("User already exists!")
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await users.insertOne({
            "_id": this.username,
            "passwordHash": passwordHash,
            "email": email,
            "oneTimeCodes": [],
            "deviceTokens": [],
            "bearerTokens": [],
            "forceChangePassword": false
        }).catch((err) => {
            if (err instanceof MongoServerError && err.code === 11000 && err.keyPattern?.email) {
                throw Error("This email is being used!")
            }
            throw Error("Failed to create user!")
        })

        return true
    }

    // Change Password
    async changePassword(oldPassword, newPassword) {
        const users = await databases.getUserCollection();
        const userData = await users.findOne({ "_id": this.username });

        if (!userData) {
            throw Error("User not found!");
        }

        const isValid = await bcrypt.compare(oldPassword, userData.passwordHash);
        if (!isValid) {
            throw Error("Invalid old password!");
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await users.updateOne(
            { "_id": this.username },
            { $set: { passwordHash: newPasswordHash, forceChangePassword: false } }
        );

        return true;
    }

    // Authenticate
    async authWithPassword(password) {
        if (!(password && typeof password == "string")) {
            throw Error("Password must be a string!")
        }

        const userData = await databases.getUserCollection().then((users) => {
            return users.findOne({ "_id": this.username });
        }).catch(() => {
            throw Error("Failed to fetch user!")
        });

        if (!userData) {
            throw Error("Wrong username or password!")
        }

        const success = await bcrypt.compare(password, userData.passwordHash);
       
        if (success) {
            return true
        }
        throw Error("Wrong username or password!");
    }

    async authWithOneTimeCode(oneTimeCode) {
        if (!(oneTimeCode && typeof oneTimeCode == "string")) {
            throw Error("One Time Code must be a string!")
        }

        const users = await databases.getUserCollection();
        const userData = await users.findOne({ "_id": this.username });

        if (!userData) {
            throw Error("Wrong username or OTP!");
        }

        const validCode = userData.oneTimeCodes.find(code => 
            code.code === oneTimeCode && code.expiresAt > new Date()
        );

        if (validCode) {
            await users.updateOne(
                { "_id": this.username },
                { $pull: { oneTimeCodes: { code: oneTimeCode } } }
            );
            return true;
        }

        throw Error("Wrong username or OTP!");
    }

    async authenticate(options) {
        if (options.type === "password") {
            return this.authWithPassword(options.password);
        } else if (options.type === "oneTimeCode") {
            return this.authWithOneTimeCode(options.oneTimeCode);
        } else {
            return false;
        }
    }

    // Access Tokens
    async generateDeviceToken() {
        const secret = environment.get("JWT_SECRET");
        const tokenId = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const token = jwt.sign({ username: this.username, type: 'device', jti: tokenId }, secret, { expiresIn: '30d' });

        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $push: { deviceTokens: { id: tokenId, expiresAt } } }
        );

        return token;
    }

    async generateBearerToken() {
        const secret = environment.get("JWT_SECRET");
        const tokenId = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const token = jwt.sign({ username: this.username, type: 'bearer', jti: tokenId }, secret, { expiresIn: '7d' });

        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $push: { bearerTokens: { id: tokenId, expiresAt } } }
        );

        return token;
    }

    // Invalidate Tokens
    async invalidateDeviceToken(tokenId) {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $pull: { deviceTokens: { id: tokenId } } }
        );
    }

    async invalidateDeviceTokens() {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { deviceTokens: [] } }
        );
    }

    async invalidateBearerToken(tokenId) {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $pull: { bearerTokens: { id: tokenId } } }
        );
    }

    async invalidateBearerTokens() {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { bearerTokens: [] } }
        );
    }

    async cleanupExpiredTokens() {
        const users = await databases.getUserCollection();
        const now = new Date();
        await users.updateOne(
            { "_id": this.username },
            { 
                $pull: { 
                    deviceTokens: { expiresAt: { $lt: now } },
                    bearerTokens: { expiresAt: { $lt: now } }
                }
            }
        );
    }

    // Set Password
    async setPassword(password) {
        const users = await databases.getUserCollection();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await users.updateOne(
            { "_id": this.username },
            { $set: { passwordHash: passwordHash } }
        );

        return result.modifiedCount === 1;
    }

    async setForceChangePassword(bool) {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { forceChangePassword: bool } }
        );
    }

    // Magic Links
    async generateOneTimeCode() {
        const code = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $push: { oneTimeCodes: { code, expiresAt } } }
        );

        return code;
    }

    async generateLoginLink() {
        const baseUrl = environment.get("BASE_URL");
        const oneTimeCode = await this.generateOneTimeCode();
        return `${baseUrl}/login?code=${oneTimeCode}`;
    }
}

module.exports = User;