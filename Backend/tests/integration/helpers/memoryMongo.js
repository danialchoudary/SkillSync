import os from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const defaultDownloadDir = path.join(os.homedir(), '.cache', 'mongodb-binaries');
const defaultLaunchTimeoutMs = Number(process.env.MONGOMS_LAUNCH_TIMEOUT || 120000);

export async function startInMemoryMongo() {
  const mongod = await MongoMemoryServer.create({
    binary: {
      version: process.env.MONGOMS_VERSION || '8.2.1',
      downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || defaultDownloadDir,
    },
    instance: {
      launchTimeout: defaultLaunchTimeoutMs,
    },
  });

  await mongoose.connect(mongod.getUri(), {
    dbName: 'skillsync_test',
  });

  return mongod;
}

export async function clearMongoDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

export async function stopInMemoryMongo(mongod) {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  if (mongod) {
    await mongod.stop();
  }
}
