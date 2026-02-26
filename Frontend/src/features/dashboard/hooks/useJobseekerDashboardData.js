import { useEffect, useMemo, useState } from 'react';
import { getMe } from '../../../services/api';
import { getJobSeekerAnalytics } from '../../../services/dashboardApi';

const DEFAULT_ANALYTICS = {
  overview: {
    totalApplications: 0,
    savedJobs: 0,
    activeApplications: 0,
    respondedApplications: 0,
    responseRate: 0,
    interviewRate: 0,
    successRate: 0,
  },
  trends: {
    labels: [],
    data: [],
  },
  statusCounts: {
    applied: 0,
    screening: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  },
  recentApplications: [],
};

function normalizeAnalytics(payload) {
  return {
    ...DEFAULT_ANALYTICS,
    ...payload,
    overview: {
      ...DEFAULT_ANALYTICS.overview,
      ...(payload?.overview || {}),
    },
    trends: {
      ...DEFAULT_ANALYTICS.trends,
      ...(payload?.trends || {}),
      labels: Array.isArray(payload?.trends?.labels) ? payload.trends.labels : [],
      data: Array.isArray(payload?.trends?.data) ? payload.trends.data : [],
    },
    statusCounts: {
      ...DEFAULT_ANALYTICS.statusCounts,
      ...(payload?.statusCounts || {}),
    },
    recentApplications: Array.isArray(payload?.recentApplications) ? payload.recentApplications : [],
  };
}

function getProfileCompletionAndMissing(user) {
  if (!user) return { percent: 0, missingFields: [] };

  const missingFields = [];
  let filled = 0;
  const total = 5;

  if (user.name && user.name.trim().length > 1) filled += 1;
  else missingFields.push('Name');

  if (user.email && user.email.includes('@')) filled += 1;
  else missingFields.push('Email');

  if (Array.isArray(user.skills) && user.skills.length > 0) filled += 1;
  else missingFields.push('Skills');

  if (user.experience && (user.experience.years > 0 || (user.experience.summary && user.experience.summary.length > 0))) filled += 1;
  else missingFields.push('Experience');

  if (user.resumeUrl || user.resumeLink) filled += 1;
  else missingFields.push('Resume');

  return { percent: Math.round((filled / total) * 100), missingFields };
}

export default function useJobseekerDashboardData() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [userRes, analyticsRes] = await Promise.all([
          getMe(),
          getJobSeekerAnalytics(),
        ]);

        if (cancelled) return;

        setUser(userRes.data);
        setAnalytics(normalizeAnalytics(analyticsRes));
        setError('');
      } catch (err) {
        if (cancelled) return;

        setError(err.response?.data?.error || 'Failed to load dashboard data');
        setUser(null);
        setAnalytics(DEFAULT_ANALYTICS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => ({
    Applied: analytics.overview.totalApplications,
    Hired: analytics.statusCounts.hired,
    Rejected: analytics.statusCounts.rejected,
  }), [analytics]);

  const statusChartData = useMemo(() => [
    { name: 'Applied', value: analytics.statusCounts.applied, color: '#0071E3' },
    { name: 'Screening', value: analytics.statusCounts.screening, color: '#0B79D0' },
    { name: 'Interview', value: analytics.statusCounts.interview, color: '#FF9F0A' },
    { name: 'Hired', value: analytics.statusCounts.hired, color: '#34C759' },
    { name: 'Rejected', value: analytics.statusCounts.rejected, color: '#FF3B30' },
  ], [analytics.statusCounts]);

  const hasStatusData = useMemo(
    () => statusChartData.some((entry) => entry.value > 0),
    [statusChartData],
  );

  const progressMetrics = useMemo(() => [
    {
      key: 'responseRate',
      label: 'Response Rate',
      value: analytics.overview.responseRate,
      description: 'Applications moved beyond the applied stage',
      barClass: 'bg-[var(--color-accent)]',
    },
    {
      key: 'interviewRate',
      label: 'Interview Rate',
      value: analytics.overview.interviewRate,
      description: 'Applications that reached interview or better',
      barClass: 'bg-[var(--color-warning)]',
    },
    {
      key: 'successRate',
      label: 'Success Rate',
      value: analytics.overview.successRate,
      description: 'Applications that resulted in a hired outcome',
      barClass: 'bg-[var(--color-success)]',
    },
  ], [analytics.overview.interviewRate, analytics.overview.responseRate, analytics.overview.successRate]);

  const { percent: profileCompletion, missingFields } = useMemo(
    () => getProfileCompletionAndMissing(user),
    [user],
  );

  return {
    user,
    analytics,
    loading,
    error,
    stats,
    statusChartData,
    hasStatusData,
    progressMetrics,
    profileCompletion,
    missingFields,
  };
}
