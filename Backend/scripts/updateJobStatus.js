import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Job from '../models/Job.js'; // Adjust the path if necessary

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Function to update job statuses
const updateJobStatuses = async () => {
  try {
    // Example logic to update statuses
    const jobs = await Job.find();

    for (const job of jobs) {
      // Set status based on custom logic (replace with actual conditions)
      if (!job.status || job.status === 'pending') {
        job.status = Math.random() > 0.5 ? 'accepted' : 'rejected'; // Example logic
        await job.save();
        console.log(`Updated job: ${job.title}, Status: ${job.status}`);
      }
    }

    console.log('Job statuses updated successfully');
  } catch (err) {
    console.error('Error updating job statuses:', err);
  } finally {
    mongoose.connection.close();
  }
};

// Run the update function
updateJobStatuses();