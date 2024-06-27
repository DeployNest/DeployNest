const { MongoClient } = require("mongodb");
const environment = require("./environment")

// Connection URI
const uri = environment.get("MONGO_URL")

// Create a new MongoClient
const client = new MongoClient(uri);

const databases = {};

databases.getMongo = async function() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log('Connected successfully to database');
  }
  return client.db('DeployNest');
}

databases.getUserCollection = async function() {
  const mongoDB = await databases.getMongo();
  return mongoDB.collection("users")
}

async function createIndexes() {
  databases.getUserCollection().then((collection) => {
    return collection.createIndex("email", {
      unique: true,
    })
  })
}
createIndexes()

module.exports = databases;