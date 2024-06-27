const { MongoClient } = require("mongodb");
const environment = require("./environment")

// Connection URI
const uri = environment.get("MONGO_URL")

// Create a new MongoClient
const client = new MongoClient(uri);

const database = {};

database.getMongo = async function() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log('Connected successfully to server');
  }
  return client.db('DeployNest');
}

module.exports = database;