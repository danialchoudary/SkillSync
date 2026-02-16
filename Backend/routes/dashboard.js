import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import User from '../models/User.js';
import { normalizeApplicationStatus } from '../utils/applicationStatus.js';

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

function toPercent(part, total) {
  if (!total || total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

function getLastSixMonthBuckets() {
  const now = new Date();
  const buckets = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    buckets.push({
      key,
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      count: 0,
    });
  }

  return buckets;
}

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

// Jobseeker analytics endpoint
router.get('/jobseeker-analytics', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'jobseeker') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user._id;

    const [applications, userDoc] = await Promise.all([
      JobApplication.find({ jobSeekerId: userId })
        .sort({ appliedAt: -1 })
        .select('status appliedAt jobId')
        .populate('jobId', 'title company'),
      User.findById(userId).select('savedJobs'),
    ]);

    const totalApplications = applications.length;
    const savedJobIds = Array.isArray(userDoc?.savedJobs) ? userDoc.savedJobs : [];
    let savedJobsCount = savedJobIds.length;

    if (savedJobIds.length > 0) {
      const existingSavedJobs = await Job.find({ _id: { $in: savedJobIds } }).select('_id').lean();
      const existingSavedJobIdSet = new Set(existingSavedJobs.map((job) => job._id.toString()));
      const staleSavedJobIds = savedJobIds.filter((id) => !existingSavedJobIdSet.has(id.toString()));

      savedJobsCount = existingSavedJobs.length;

      if (staleSavedJobIds.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $pull: { savedJobs: { $in: staleSavedJobIds } } },
        );
      }
    }

    const statusCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };

    for (const application of applications) {
      const status = normalizeApplicationStatus(application.status);
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status] += 1;
      }
    }

    const activeApplications =
      statusCounts.applied + statusCounts.screening + statusCounts.interview;
    const respondedApplications = totalApplications - statusCounts.applied;
    const interviewOrBetter = statusCounts.interview + statusCounts.hired;

    const monthlyBuckets = getLastSixMonthBuckets();
    const monthlyBucketMap = new Map(monthlyBuckets.map((bucket) => [bucket.key, bucket]));

    for (const application of applications) {
      const appliedDate = new Date(application.appliedAt);
      const monthKey = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthlyBucketMap.get(monthKey);
      if (bucket) {
        bucket.count += 1;
      }
    }

    const recentApplications = applications.slice(0, 5).map((application) => ({
      id: application._id,
      jobTitle: application.jobId?.title || 'Unknown Role',
      company: application.jobId?.company || 'Unknown Company',
      status: normalizeApplicationStatus(application.status),
      appliedAt: application.appliedAt,
    }));

    return res.json({
      overview: {
        totalApplications,
        savedJobs: savedJobsCount,
        activeApplications,
        respondedApplications,
        responseRate: toPercent(respondedApplications, totalApplications),
        interviewRate: toPercent(interviewOrBetter, totalApplications),
        successRate: toPercent(statusCounts.hired, totalApplications),
      },
      trends: {
        labels: monthlyBuckets.map((bucket) => bucket.label),
        data: monthlyBuckets.map((bucket) => bucket.count),
      },
      statusCounts,
      recentApplications,
    });
  } catch (error) {
    console.error('Error fetching jobseeker analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch jobseeker analytics' });
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
      status: normalizeApplicationStatus(app.status),
      appliedAt: app.appliedAt,
    })));
  } catch (error) {
    console.error('Error fetching recent applicants:', error);
    res.status(500).json({ error: 'Failed to fetch recent applicants', details: error.message });
  }
});

export default router;
