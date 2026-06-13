import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const notifs = await Notification.find();
  console.log('Total notifications:', notifs.length);
  if (notifs.length > 0) {
    console.log('Sample:', notifs[notifs.length - 1]);
  }
  process.exit(0);
}
check();
