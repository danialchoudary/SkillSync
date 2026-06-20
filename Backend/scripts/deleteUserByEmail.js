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
  const targetPhone = String(process.env.TARGET_PHONE || '').trim();
  if (!targetEmail && !targetPhone) {
    console.error('[DeleteUser] TARGET_EMAIL or TARGET_PHONE is missing.');
    process.exit(1);
  }

  const targetMongoUri = process.env.TARGET_MONGO_URI?.trim() || process.env.MONGO_URI?.trim();
  const targetDbName = process.env.TARGET_DB_NAME?.trim();

  await connectMongo({
    mongoUri: targetMongoUri,
    dbName: targetDbName,
  });

  const query = {
    $or: [],
  };

  if (targetEmail) {
    query.$or.push({ email: targetEmail });
  }

  if (targetPhone) {
    query.$or.push({ phoneNumber: targetPhone });
  }

  const existing = await User.findOne(query);
  if (!existing) {
    console.log(`[DeleteUser] No user found for ${targetEmail || targetPhone}`);
    await mongoose.disconnect();
    return;
  }

  await User.deleteMany(query);
  console.log(`[DeleteUser] Deleted user for ${targetEmail || targetPhone} from database ${mongoose.connection.name || '<unknown>'}`);

  await mongoose.disconnect();
}

deleteUserByEmail().catch((error) => {
  console.error('[DeleteUser] Failed:', error);
  process.exit(1);
});
