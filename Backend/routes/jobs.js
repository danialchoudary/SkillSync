import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createJob,
  deleteJob,
  getRecruiterJobs,
  getSavedJobs,
  listJobs,
  saveJob,
  unsaveJob,
  updateJob,
  getRecommendedJobs,
} from '../controllers/jobsController.js';

const router = express.Router();

router.put('/:id', authMiddleware, updateJob);
router.post('/:id/save', authMiddleware, saveJob);
router.post('/:id/unsave', authMiddleware, unsaveJob);
router.get('/saved', authMiddleware, getSavedJobs);
router.get('/recommended', authMiddleware, getRecommendedJobs);
router.post('/', authMiddleware, createJob);
router.get('/', listJobs);
router.get('/my', authMiddleware, getRecruiterJobs);
router.delete('/:id', authMiddleware, deleteJob);
router.patch('/:id', authMiddleware, updateJob);

export default router;
