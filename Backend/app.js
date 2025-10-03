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

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // or your frontend port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure upload directory exists

const resumesDir = path.join(process.cwd(), 'Backend', 'uploads', 'resumes');
const profilePicturesDir = path.join(process.cwd(), 'Backend', 'uploads', 'profile-pictures');
try {
  fs.mkdirSync(resumesDir, { recursive: true });
  fs.mkdirSync(profilePicturesDir, { recursive: true });
} catch (err) {
  console.error('Error creating upload directories:', err);
}

// Serve static files from /uploads
app.use('/uploads/resumes', (req, res, next) => {
  // Remove leading slash from req.path to avoid path.join ignoring resumesDir
  const relativePath = req.path.replace(/^\//, '');
  const filePath = path.join(resumesDir, relativePath);
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      return res.status(404).send('Resume file not found');
    }
    next();
  });
}, express.static(resumesDir));
app.use('/uploads/profile-pictures', express.static(profilePicturesDir));

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



