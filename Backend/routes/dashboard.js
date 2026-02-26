import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getJobseekerAnalytics,
  getRecentApplicants,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/jobseeker-analytics', getJobseekerAnalytics);
router.get('/recent-applicants', getRecentApplicants);

export default router;
