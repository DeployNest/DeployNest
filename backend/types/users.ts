import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { MongoServerError } from "mongodb";

// You'll need to update these import statements based on your project structure
import { environment } from "../modules/environment";
import { databases } from "../modules/databases";

const { prisma } = databases;

interface AuthOptions {
    type: "password" | "oneTimeCode";
    password?: string;
    oneTimeCode?: string;
}

class User {
    private username: string;

    constructor(username: string) {
        this.username = username;
    }

    // Signup
    async signup(email: string, password: string): Promise<boolean> {
        prisma.user.findUnique({
            where: {
                "username": this.username
            }
        }).then((userData) => {
            throw new Error("User already exists!");
        }).catch(() => {
            throw new Error("Failed to fetch user!");
        });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await users.insertOne({
            "_id": this.username,
            passwordHash,
            email,
            oneTimeCodes: [],
            deviceTokens: [],
            bearerTokens: [],
            forceChangePassword: false
        }).catch((err) => {
            if (err instanceof MongoServerError && err.code === 11000 && err.keyPattern?.email) {
                throw new Error("This email is being used!");
            }
            throw new Error("Failed to create user!");
        });

        return true;
    }

    // Change Password
    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        const users = await databases.getUserCollection();
        const userData = await users.findOne({ "_id": this.username }) as UserData | null;

        if (!userData) {
            throw new Error("User not found!");
        }

        const isValid = await bcrypt.compare(oldPassword, userData.passwordHash);
        if (!isValid) {
            throw new Error("Invalid old password!");
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
    private async authWithPassword(password: string): Promise<boolean> {
        if (!(password && typeof password === "string")) {
            throw new Error("Password must be a string!");
        }

        const userData = await databases.getUserCollection().then((users) => {
            return users.findOne({ "_id": this.username }) as Promise<UserData | null>;
        }).catch(() => {
            throw new Error("Failed to fetch user!");
        });

        if (!userData) {
            throw new Error("Wrong username or password!");
        }

        const success = await bcrypt.compare(password, userData.passwordHash);
       
        if (success) {
            return true;
        }
        throw new Error("Wrong username or password!");
    }

    private async authWithOneTimeCode(oneTimeCode: string): Promise<boolean> {
        if (!(oneTimeCode && typeof oneTimeCode === "string")) {
            throw new Error("One Time Code must be a string!");
        }

        const users = await databases.getUserCollection();
        const userData = await users.findOne({ "_id": this.username }) as UserData | null;

        if (!userData) {
            throw new Error("Wrong username or OTP!");
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

        throw new Error("Wrong username or OTP!");
    }

    async authenticate(options: AuthOptions): Promise<boolean> {
        if (options.type === "password" && options.password) {
            return this.authWithPassword(options.password);
        } else if (options.type === "oneTimeCode" && options.oneTimeCode) {
            return this.authWithOneTimeCode(options.oneTimeCode);
        } else {
            return false;
        }
    }

    // Access Tokens
    async generateDeviceToken(): Promise<string> {
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

    async generateBearerToken(): Promise<string> {
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
    async invalidateDeviceToken(tokenId: string): Promise<void> {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $pull: { deviceTokens: { id: tokenId } } }
        );
    }

    async invalidateDeviceTokens(): Promise<void> {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { deviceTokens: [] } }
        );
    }

    async invalidateBearerToken(tokenId: string): Promise<void> {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $pull: { bearerTokens: { id: tokenId } } }
        );
    }

    async invalidateBearerTokens(): Promise<void> {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { bearerTokens: [] } }
        );
    }

    async cleanupExpiredTokens(): Promise<void> {
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
    async setPassword(password: string): Promise<boolean> {
        const users = await databases.getUserCollection();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await users.updateOne(
            { "_id": this.username },
            { $set: { passwordHash: passwordHash } }
        );

        return result.modifiedCount === 1;
    }

    async setForceChangePassword(bool: boolean): Promise<void> {
        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $set: { forceChangePassword: bool } }
        );
    }

    // Magic Links
    async generateOneTimeCode(): Promise<string> {
        const code = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        const users = await databases.getUserCollection();
        await users.updateOne(
            { "_id": this.username },
            { $push: { oneTimeCodes: { code, expiresAt } } }
        );

        return code;
    }

    async generateLoginLink(): Promise<string> {
        const baseUrl = environment.get("BASE_URL");
        const oneTimeCode = await this.generateOneTimeCode();
        return `${baseUrl}/login?code=${oneTimeCode}`;
    }

    // Permissions
    async getUserType(): Promise<string> {
        // TODO: Implement this method
        throw new Error("Method not implemented.");
    }

    async setUserType(userType: string): Promise<void> {
        // TODO: Implement this method
        throw new Error("Method not implemented.");
    }

    async getPermissionLevel(id: string): Promise<number> {
        // TODO: Implement this method
        throw new Error("Method not implemented.");
    }
}

const Users = {
    User,
    getUserFromIdentifier: async function(userIdentifier: string) {
        const users = await databases.getUserCollection().catch(() => {
            throw Error("Failed to fetch collection!")
        });
    
        const userQuery = {
            "$or": [
                { "_id": userIdentifier },
                { "email": userIdentifier },
            ],
        }
    
        const userData = await users.findOne(userQuery).catch(() => {
            throw Error("Failed to fetch user!")
        });
    
        if (userData) {
            return userData._id
        } else {
            throw Error("User not found!")
        }
    },
}

export { Users };