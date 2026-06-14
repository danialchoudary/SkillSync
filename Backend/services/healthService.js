import { verifyEmailTransport } from '../utils/sendEmail.js';
import mongoose from 'mongoose';

export async function checkEmailHealth() {
  await verifyEmailTransport();
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
