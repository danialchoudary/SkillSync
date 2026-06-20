import mongoose from 'mongoose';

export async function checkSmsHealth() {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const fromNumber = String(process.env.TWILIO_FROM_NUMBER || '').trim();

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER must be configured');
  }

  return {
    provider: 'twilio',
    configured: true,
  };
}

export async function getDatabaseStats() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection is not ready');
  }

  const collections = await mongoose.connection.db.collections();
  const stats = {};

  for (const collection of collections) {
    stats[collection.collectionName] = await collection.countDocuments();
  }

  return {
    dbName: mongoose.connection.name || '',
    collections: stats,
  };
}
