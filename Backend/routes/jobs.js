import express from 'express';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper to get user ID from token without throwing error if no token
const getUserIdFromRequest = (req) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

// PUT /jobs/:id - update a job (for compatibility with frontend)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json(job);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job. Please try again.' });
  }
});

// Save a job
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const jobId = req.params.id;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const jobObjectId = Job.schema.path('_id').cast(jobId);
    if (user.savedJobs && user.savedJobs.some(j => j.toString() === jobObjectId.toString())) {
      return res.status(400).json({ error: 'Job already saved.' });
    }
    user.savedJobs = user.savedJobs ? user.savedJobs.map(j => Job.schema.path('_id').cast(j)) : [];
    user.savedJobs.push(jobObjectId);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Save job error:', err);
    res.status(500).json({ error: 'Failed to save job. Please try again.' });
  }
});

// Unsave a job
router.post('/:id/unsave', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const jobId = req.params.id;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const jobObjectId = Job.schema.path('_id').cast(jobId);
    user.savedJobs = user.savedJobs ? user.savedJobs.map(j => Job.schema.path('_id').cast(j)) : [];
    user.savedJobs = user.savedJobs.filter(j => j.toString() !== jobObjectId.toString());
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Unsave job error:', err);
    res.status(500).json({ error: 'Failed to unsave job. Please try again.' });
  }
});

// Get saved jobs for user
import User from '../models/User.js';

router.get('/saved', authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(req.user._id).populate({ path: 'savedJobs', populate: { path: 'recruiter', select: 'companyLogo' } });
    // Logging for debugging
    console.log('Populated savedJobs:', user.savedJobs);
    const userStatusMap = {};
    if (req.user) {
      const userApplications = await JobApplication.find({ jobSeekerId: req.user._id });
      userApplications.forEach(app => {
        if (app.jobId) {
          userStatusMap[app.jobId.toString()] = app.status;
        }
      });
    }

    const jobsWithStatus = (user.savedJobs || []).map(job => {
      if (!job) return null;
      let jobObj = job.toObject ? job.toObject() : job;
      const id = jobObj._id || jobObj.id;
      return {
        ...jobObj,
        companyLogo: jobObj.recruiter?.companyLogo || '',
        applied: !!userStatusMap[id.toString()],
        status: userStatusMap[id.toString()] || null
      };
    }).filter(Boolean);
    res.json(jobsWithStatus);
  } catch (err) {
    console.error('Fetch saved jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch saved jobs. Please try again.' });
  }
});

// POST /jobs - create a new job
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, company, description, location, salary, skills, experience } = req.body;
    const recruiter = req.user.id;
    const job = new Job({
      title,
      company,
      description,
      location,
      salary,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      experience: Number(experience),
      recruiter,
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ error: 'Failed to create job. Please try again.' });
  }
});

// GET /jobs - get all jobs
router.get('/', async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .populate('recruiter', 'companyLogo');

    let userStatusMap = {};
    if (userId) {
      const userApplications = await JobApplication.find({ jobSeekerId: userId });
      userApplications.forEach(app => {
        if (app.jobId) {
          userStatusMap[app.jobId.toString()] = app.status;
        }
      });
    }

    // Map jobs to include companyLogo and application status
    const jobsWithLogo = jobs.map(job => {
      const jobObj = job.toObject();
      const id = jobObj._id || jobObj.id;
      return {
        ...jobObj,
        companyLogo: jobObj.recruiter?.companyLogo || '',
        applied: !!userStatusMap[id.toString()],
        status: userStatusMap[id.toString()] || null
      };
    });
    res.json(jobsWithLogo);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch jobs. Please try again.' });
  }
});

// GET /jobs/my - get jobs posted by current recruiter
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id })
      .sort({ createdAt: -1 })
      .populate('recruiter', 'companyLogo');
    const jobsWithLogo = jobs.map(job => ({
      ...job.toObject(),
      companyLogo: job.recruiter?.companyLogo || '',
    }));
    res.json(jobsWithLogo);
  } catch (err) {
    console.error('Fetch recruiter jobs error:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter jobs. Please try again.' });
  }
});

// DELETE /jobs/:id - delete a job
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job. Please try again.' });
  }
});

// PATCH /jobs/:id - update a job
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json(job);
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ error: 'Failed to update job. Please try again.' });
  }
});

export default router;
