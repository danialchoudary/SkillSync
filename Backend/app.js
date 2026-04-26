import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import messagesRouter from './routes/messages.js';
import ragRouter from './routes/ragRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const backendRoot = path.dirname(fileURLToPath(import.meta.url));

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

// Serve static files (resumes, etc.) from the uploads folder
app.use('/uploads', express.static(path.join(backendRoot, 'uploads')));

app.use('/auth', authRoutes);
app.use('/health', healthRoutes);
app.use('/me', meRoutes);
app.use('/users', usersRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/rag', ragRouter);
app.get('/', (req, res) => {
  res.send('API is running');
});

// Protected route
app.get('/api/hello', authMiddleware, (req, res) => {
  res.json({ userId: req.user.id });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;



