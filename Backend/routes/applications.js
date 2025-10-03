


import express from 'express';
import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, path.join(process.cwd(), 'Backend', 'uploads', 'resumes'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const router = express.Router();

// GET /job/:jobId - get all applicants for a job (recruiter only)
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    console.log('[GET /applications/job/:jobId]', { user: req.user, jobId: req.params.jobId });
    // Only allow recruiters to view applicants for their jobs
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const jobId = req.params.jobId;
    // Find all applications for this job, populate jobSeeker info
    const applications = await JobApplication.find({ jobId })
      .populate('jobSeekerId', 'name email resumeLink');
    console.log('[GET /applications/job/:jobId] found applications:', applications);
    res.json(applications);
  } catch (err) {
    console.error('Fetch applicants error:', err);
    res.status(500).json({ error: 'Failed to fetch applicants. Please try again.' });
  }
});

// PATCH /:id/status - update application status (recruiter only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    console.log('[PATCH /applications/:id/status]', { user: req.user, appId: req.params.id, status: req.body.status });
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const appId = req.params.id;
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const application = await JobApplication.findById(appId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    application.status = status;
    await application.save();
    console.log('[PATCH /applications/:id/status] updated application:', application);
    res.json(application);
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ error: 'Failed to update application status. Please try again.' });
  }
});

// Middleware to allow only job seekers
function jobSeekerOnly(req, res, next) {
  if (!req.user || req.user.role !== 'jobseeker') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}

// POST /apply
router.post('/apply', authMiddleware, jobSeekerOnly, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const jobSeekerId = req.user._id;
    let resumeUrl = req.user.resumeLink || '';
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ error: 'Missing jobId.' });
    }
    if (!coverLetter) {
      return res.status(400).json({ error: 'Missing cover letter.' });
    }

    // Prevent duplicate application
    const existing = await JobApplication.findOne({ jobId, jobSeekerId });
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this job.' });
    }

    const application = new JobApplication({
      jobId,
      jobSeekerId,
      resumeUrl,
      coverLetter,
    });
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error('Apply for job error:', err);
    res.status(500).json({ error: 'Failed to apply for job. Please try again.' });
  }
});

// GET /mine
router.get('/mine', authMiddleware, jobSeekerOnly, async (req, res) => {
  try {
    const jobSeekerId = req.user._id;
    const applications = await JobApplication.find({ jobSeekerId })
      .populate('jobId');
    res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications. Please try again.' });
  }
});

export default router;
