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
import passport from 'passport';
import { configurePassport } from './config/passport.js';

// Initialize Passport
configurePassport();

const backendRoot = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy for HTTPS detection
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow localhost, exact matches, and any vercel preview URL for skill-sync
    if (
      allowedOrigins.includes(origin) || 
      (origin.includes('skill-sync') && origin.endsWith('.vercel.app'))
    ) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

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



