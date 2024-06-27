require("dotenv").config();

const bcrypt = require('bcrypt');

const defaultSalt = bcrypt.genSaltSync()

const { cleanEnv, str, email, json } = require('envalid')

const variables = cleanEnv(process.env, {
    ENVIRONMENT: str({ default: "production" }),
    MONGO_URL: str({ default: "mongodb://localhost:27017/" }),
    HASH_SALT: str({ default: defaultSalt }),
})

const environment = {}

environment.get = function(envName) {
    return variables[envName]
}

module.exports = environment