const databases = require("../modules/databases");

const users = {}

// Identifier = Username / Email
users.getUserFromIdentifier = async function(userIdentifier) {
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
}

module.exports = users