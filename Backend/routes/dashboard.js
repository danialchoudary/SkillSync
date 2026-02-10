import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

// Dashboard stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[Dashboard] Fetching stats for recruiter:', userId);

    // 1. Count jobs posted by this recruiter
    const totalJobs = await Job.countDocuments({ recruiter: userId });
    console.log('[Dashboard] Total jobs:', totalJobs);

    // 2. Count applications for jobs posted by this recruiter
    const recruiterJobs = await Job.find({ recruiter: userId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    const totalApplications = await JobApplication.countDocuments({ jobId: { $in: jobIds } });
    console.log('[Dashboard] Total applications:', totalApplications);

    // 3. Application Activity (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityData = await JobApplication.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          appliedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('[Dashboard] Activity data raw:', activityData);

    // Format for frontend (ensure all 7 days are present even if count is 0)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = activityData.find(a => a._id === dateStr);
      last7Days.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        apps: match ? match.count : 0
      });
    }

    res.json({
      totalJobs,
      totalApplications,
      activity: last7Days
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// Recent applicants endpoint
// Recent applicants endpoint
router.get('/recent-applicants', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[Dashboard] Fetching recent applicants for recruiter:', userId);

    // Find jobs posted by this recruiter
    const recruiterJobs = await Job.find({ recruiter: userId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    console.log('[Dashboard] Found jobs:', jobIds.length);

    // Find applications for these jobs
    const recentApplicants = await JobApplication.find({ jobId: { $in: jobIds } })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate('jobSeekerId', 'name email profilePicture')
      .populate('jobId', 'title');

    console.log('[Dashboard] Found recent applicants:', recentApplicants.length);

    res.json(recentApplicants.map(app => ({
      id: app._id,
      name: app.jobSeekerId?.name || 'Unknown',
      email: app.jobSeekerId?.email || 'Unknown',
      profilePicture: app.jobSeekerId?.profilePicture,
      jobTitle: app.jobId?.title || 'Unknown Job',
      status: app.status,
      appliedAt: app.appliedAt,
    })));
  } catch (error) {
    console.error('Error fetching recent applicants:', error);
    res.status(500).json({ error: 'Failed to fetch recent applicants', details: error.message });
  }
});

export default router;