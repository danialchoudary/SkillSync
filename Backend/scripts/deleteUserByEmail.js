import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongo } from '../utils/mongoConnection.js';
import User from '../models/User.js';

const CONFIRMATION = 'YES';

async function deleteUserByEmail() {
  if (process.env.CONFIRM_DELETE_USER !== CONFIRMATION) {
    console.error('[DeleteUser] Refusing to run without CONFIRM_DELETE_USER=YES.');
    process.exit(1);
  }

  const targetEmail = String(process.env.TARGET_EMAIL || '').trim().toLowerCase();
  if (!targetEmail) {
    console.error('[DeleteUser] TARGET_EMAIL is missing.');
    process.exit(1);
  }

  const targetMongoUri = process.env.TARGET_MONGO_URI?.trim() || process.env.MONGO_URI?.trim();
  const targetDbName = process.env.TARGET_DB_NAME?.trim();

  await connectMongo({
    mongoUri: targetMongoUri,
    dbName: targetDbName,
  });

  const existing = await User.findOne({ email: targetEmail });
  if (!existing) {
    console.log(`[DeleteUser] No user found for ${targetEmail}`);
    await mongoose.disconnect();
    return;
  }

  await User.deleteOne({ email: targetEmail });
  console.log(`[DeleteUser] Deleted user for ${targetEmail} from database ${mongoose.connection.name || '<unknown>'}`);

  await mongoose.disconnect();
}

deleteUserByEmail().catch((error) => {
  console.error('[DeleteUser] Failed:', error);
  process.exit(1);
});
