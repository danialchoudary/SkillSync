import express from 'express';
import { createInterview, getInterviews, updateInterviewStatus } from '../controllers/interviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createInterview);
router.get('/', authMiddleware, getInterviews);
router.patch('/:id/status', authMiddleware, updateInterviewStatus);

export default router;
