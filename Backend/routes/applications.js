import express from 'express';
import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyzeMatch } from '../services/aiService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { createCloudinaryStorage } from '../utils/cloudinary.js';

const upload = multer({
  storage: createCloudinaryStorage('skillsync/resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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
      .populate('jobSeekerId', 'name email resumeLink profilePicture');
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
    if (!['applied', 'screening', 'interviewing', 'hired', 'rejected'].includes(status)) {
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
      resumeUrl = req.file.path;
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
      .populate({
        path: 'jobId',
        select: 'title company companyLogo', // Include companyLogo in the populated fields
      });
    res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications. Please try again.' });
  }
});

// GET /:id/ai-match - Analyze candidate match using AI
router.get('/:id/ai-match', authMiddleware, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('jobId')
      .populate('jobSeekerId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only recruiter who posted the job can access
    if (application.jobId.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const matchResult = await analyzeMatch(
      {
        title: application.jobId.title,
        description: application.jobId.description,
        skills: application.jobId.skills
      },
      {
        name: application.jobSeekerId.name,
        skills: application.jobSeekerId.skills,
        experience: application.jobSeekerId.experience,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl
      }
    );

    res.json(matchResult);
  } catch (err) {
    console.error('AI Match error:', err);
    res.status(500).json({ error: 'Failed to analyze match' });
  }
});

export default router;
