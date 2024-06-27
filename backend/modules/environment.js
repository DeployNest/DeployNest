require("dotenv").config();

const { cleanEnv, str, bool } = require('envalid')

const variables = cleanEnv(process.env, {
    ENVIRONMENT: str({ default: "production" }),
    MONGO_URL: str({ default: "mongodb://localhost:27017/" }),
})

const environment = {}

environment.get = function(envName) {
    return variables[envName]
}

module.exports = environment