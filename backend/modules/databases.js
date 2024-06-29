const { MongoClient } = require("mongodb");
const { createClient: createRedisClient } = require("redis");

const environment = require("./environment")

// MongoDB //
const uri = environment.get("MONGO_URL")

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

async function createMongoIndexes() {
  databases.getUserCollection().then((collection) => {
    return collection.createIndex("email", {
      unique: true,
    })
  })
}
createMongoIndexes()

// Redis //
const redisConfig = {
  host: environment.get("REDIS_HOST"),
  port: environment.get("REDIS_PORT"),
  password: environment.get("REDIS_PASSWORD"),
};

const redisClient = createRedisClient(redisConfig);
databases.getRedis = async function() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected successfully to Redis');
  }
  return redisClient;
};

module.exports = databases;