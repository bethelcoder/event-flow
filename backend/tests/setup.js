const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

require('dotenv').config();
jest.setTimeout(30000); // Increase timeout to 30s for slow DB tests

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
