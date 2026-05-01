import { connectMongo } from '../utils/mongoConnection.js';

const connectDB = async () => {
  try {
    await connectMongo();
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
