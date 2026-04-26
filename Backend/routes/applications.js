import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createCloudinaryStorage } from '../utils/cloudinary.js';
import {
  applyForJob,
  getApplicantsForJob,
  getApplicationAiMatch,
  getMyApplications,
  updateApplicationStatus,
} from '../controllers/applicationsController.js';

const upload = multer({
  storage: createCloudinaryStorage('skillsync/resumes'),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

function jobSeekerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'jobseeker') {
    return res.status(403).json({ error: 'Access denied' });
  }
  return next();        
}

router.get('/job/:jobId', authMiddleware, getApplicantsForJob);
router.patch('/:id/status', authMiddleware, updateApplicationStatus);
router.post('/apply', authMiddleware, jobSeekerOnly, upload.single('resume'), applyForJob);
router.get('/mine', authMiddleware, jobSeekerOnly, getMyApplications);
router.get('/:id/ai-match', authMiddleware, getApplicationAiMatch);

export default router;
