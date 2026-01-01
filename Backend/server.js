import 'dotenv/config';
import http from 'http';
import app from './app.js';
import mongoose from 'mongoose';
import dashboardRoutes from './routes/dashboard.js';
import { initSocket } from './socket/index.js';

// Register dashboard routes
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
initSocket(httpServer);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 50000,
  socketTimeoutMS: 60000,
})
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB error:', err));