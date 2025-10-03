import app from './app.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Static file serving is handled in app.js

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});