import {
  applyApplicationsToMonthlyBuckets,
  buildLast7DaysActivity,
  buildRecentApplications,
  buildStatusCounts,
  countAndCleanupSavedJobs,
  countApplicationsByJobIds,
  countRecruiterJobs,
  getJobseekerApplications,
  getLastSixMonthBuckets,
  getRecentApplicantsForRecruiter,
  getRecruiterActivityData,
  getRecruiterJobIds,
  getSavedJobIds,
  mapRecentApplicants,
  toPercent,
} from '../services/dashboardService.js';

export async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    console.log('[Dashboard] Fetching stats for recruiter:', userId);

    const totalJobs = await countRecruiterJobs(userId);
    console.log('[Dashboard] Total jobs:', totalJobs);

    const jobIds = await getRecruiterJobIds(userId);
    const totalApplications = await countApplicationsByJobIds(jobIds);
    console.log('[Dashboard] Total applications:', totalApplications);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityData = await getRecruiterActivityData(jobIds, sevenDaysAgo);
    console.log('[Dashboard] Activity data raw:', activityData);

    const last7Days = buildLast7DaysActivity(activityData);

    return res.json({
      totalJobs,
      totalApplications,
      activity: last7Days,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
}

export async function getJobseekerAnalytics(req, res) {
  try {
    if (!req.user || req.user.role !== 'jobseeker') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user._id;

    const [applications, savedJobIds] = await Promise.all([
      getJobseekerApplications(userId),
      getSavedJobIds(userId),
    ]);

    const totalApplications = applications.length;
    const savedJobsCount = await countAndCleanupSavedJobs(userId, savedJobIds);
    const statusCounts = buildStatusCounts(applications);

    const activeApplications =
      statusCounts.applied + statusCounts.screening + statusCounts.interview;
    const respondedApplications = totalApplications - statusCounts.applied;
    const interviewOrBetter = statusCounts.interview + statusCounts.hired;

    const monthlyBuckets = getLastSixMonthBuckets();
    applyApplicationsToMonthlyBuckets(monthlyBuckets, applications);

    const recentApplications = buildRecentApplications(applications);

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
}

export async function getRecentApplicants(req, res) {
  try {
    const userId = req.user.id;
    console.log('[Dashboard] Fetching recent applicants for recruiter:', userId);

    const { jobIds, recentApplicants } = await getRecentApplicantsForRecruiter(userId);
    console.log('[Dashboard] Found jobs:', jobIds.length);
    console.log('[Dashboard] Found recent applicants:', recentApplicants.length);

    return res.json(mapRecentApplicants(recentApplicants));
  } catch (error) {
    console.error('Error fetching recent applicants:', error);
    return res.status(500).json({ error: 'Failed to fetch recent applicants', details: error.message });
  }
}

