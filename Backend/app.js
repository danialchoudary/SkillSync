import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import usersRoutes from './routes/users.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import fs from 'fs';
import path from 'path';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import messagesRouter from './routes/messages.js';

const allowedOrigins = [
  "http://localhost:5173", // for local dev
  process.env.FRONTEND_URL // for deployed frontend
];

const app = express();
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (if any other than uploads are needed, unrelated to cloud storage)
app.use('/uploads', express.static(path.join(process.cwd(), 'Backend', 'uploads')));

app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/users', usersRoutes);
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/api/messages', messagesRouter);
app.get('/', (req, res) => {
  res.send('API is running');
});

// Protected route
app.get('/api/hello', authMiddleware, (req, res) => {
  res.json({ userId: req.user.id });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;



