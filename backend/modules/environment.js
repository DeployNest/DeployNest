require("dotenv").config();

const { cleanEnv, str, bool } = require('envalid');
const crypto = require('crypto');

function generateJwtSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

const variables = cleanEnv(process.env, {
    ENVIRONMENT: str({ default: "production" }),
    MONGO_URL: str({ default: "mongodb://localhost:27017/" }),
    JWT_SECRET: str({ default: generateJwtSecret() }),
})

const environment = {}

environment.get = function (envName) {
    return variables[envName]
}

module.exports = environment