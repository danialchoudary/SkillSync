import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import User from '../models/User.js';
import { normalizeApplicationStatus } from '../utils/applicationStatus.js';

export function toPercent(part, total) {
  if (!total || total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

export function getLastSixMonthBuckets() {
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

export async function countRecruiterJobs(recruiterId) {
  return Job.countDocuments({ recruiter: recruiterId });
}

export async function getRecruiterJobIds(recruiterId) {
  const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
  return recruiterJobs.map((job) => job._id);
}

export async function countApplicationsByJobIds(jobIds) {
  return JobApplication.countDocuments({ jobId: { $in: jobIds } });
}

export async function getRecruiterActivityData(jobIds, sinceDate) {
  return JobApplication.aggregate([
    {
      $match: {
        jobId: { $in: jobIds },
        appliedAt: { $gte: sinceDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

export function buildLast7DaysActivity(activityData) {
  const last7Days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const match = activityData.find((item) => item._id === dateStr);

    last7Days.push({
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      apps: match ? match.count : 0,
    });
  }

  return last7Days;
}

export async function getJobseekerApplications(userId) {
  return JobApplication.find({ jobSeekerId: userId })
    .sort({ appliedAt: -1 })
    .select('status appliedAt jobId')
    .populate('jobId', 'title company');
}

export async function getSavedJobIds(userId) {
  const userDoc = await User.findById(userId).select('savedJobs');
  return Array.isArray(userDoc?.savedJobs) ? userDoc.savedJobs : [];
}

export async function countAndCleanupSavedJobs(userId, savedJobIds) {
  if (savedJobIds.length === 0) {
    return 0;
  }

  const existingSavedJobs = await Job.find({ _id: { $in: savedJobIds } }).select('_id').lean();
  const existingSavedJobIdSet = new Set(existingSavedJobs.map((job) => job._id.toString()));
  const staleSavedJobIds = savedJobIds.filter((id) => !existingSavedJobIdSet.has(id.toString()));

  if (staleSavedJobIds.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { savedJobs: { $in: staleSavedJobIds } } },
    );
  }

  return existingSavedJobs.length;
}

export function buildStatusCounts(applications) {
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

  return statusCounts;
}

export function applyApplicationsToMonthlyBuckets(monthlyBuckets, applications) {
  const monthlyBucketMap = new Map(monthlyBuckets.map((bucket) => [bucket.key, bucket]));

  for (const application of applications) {
    const appliedDate = new Date(application.appliedAt);
    const monthKey = `${appliedDate.getFullYear()}-${String(appliedDate.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthlyBucketMap.get(monthKey);
    if (bucket) {
      bucket.count += 1;
    }
  }
}

export function buildRecentApplications(applications) {
  return applications.slice(0, 5).map((application) => ({
    id: application._id,
    jobTitle: application.jobId?.title || 'Unknown Role',
    company: application.jobId?.company || 'Unknown Company',
    status: normalizeApplicationStatus(application.status),
    appliedAt: application.appliedAt,
  }));
}

export async function getRecentApplicantsForRecruiter(recruiterId, limit = 5) {
  const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
  const jobIds = recruiterJobs.map((job) => job._id);

  const recentApplicants = await JobApplication.find({ jobId: { $in: jobIds } })
    .sort({ appliedAt: -1 })
    .limit(limit)
    .populate('jobSeekerId', 'name email profilePicture')
    .populate('jobId', 'title');

  return { jobIds, recentApplicants };
}

export function mapRecentApplicants(recentApplicants) {
  return recentApplicants.map((application) => ({
    id: application._id,
    name: application.jobSeekerId?.name || 'Unknown',
    email: application.jobSeekerId?.email || 'Unknown',
    profilePicture: application.jobSeekerId?.profilePicture,
    jobTitle: application.jobId?.title || 'Unknown Job',
    status: normalizeApplicationStatus(application.status),
    appliedAt: application.appliedAt,
  }));
}

