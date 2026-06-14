import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongo } from '../utils/mongoConnection.js';

const CONFIRMATION = 'YES';

async function resetDatabase() {
  if (process.env.CONFIRM_DB_RESET !== CONFIRMATION) {
    console.error('[Reset] Refusing to run without CONFIRM_DB_RESET=YES.');
    process.exit(1);
  }

  const targetMongoUri = process.env.TARGET_MONGO_URI?.trim() || process.env.MONGO_URI?.trim();
  const targetDbName = process.env.TARGET_DB_NAME?.trim();

  await connectMongo({
    mongoUri: targetMongoUri,
    dbName: targetDbName,
  });

  const dbName = mongoose.connection.name || '<unknown>';
  const collections = await mongoose.connection.db.collections();

  console.log(`[Reset] Connected to database: ${dbName}`);
  console.log(`[Reset] Clearing ${collections.length} collections...`);

  for (const collection of collections) {
    const count = await collection.countDocuments();
    await collection.deleteMany({});
    console.log(`[Reset] ${collection.collectionName}: deleted ${count} documents`);
  }

  await mongoose.disconnect();
  console.log('[Reset] Database reset complete.');
}

resetDatabase().catch((error) => {
  console.error('[Reset] Failed:', error);
  process.exit(1);
});
