import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMe } from '../../../services/api';
import { getMyApplications } from '../../../services/applicationApi';
import { getJobs, getSavedJobs, saveJob, unsaveJob, getRecommendedJobs } from '../../../services/jobApi';

export default function useJobsData() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const refreshSavedJobs = useCallback(async () => {
    try {
      const savedJobsData = await getSavedJobs();
      setSavedJobs(Array.isArray(savedJobsData) ? savedJobsData : []);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        const jobsData = await getJobs();
        if (cancelled) return;
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setError('');
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.error || 'Failed to load jobs');
        setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadRecommendedJobs = async () => {
      try {
        const recommended = await getRecommendedJobs();
        if (!cancelled) setRecommendedJobs(Array.isArray(recommended) ? recommended : []);
      } catch {
        if (!cancelled) setRecommendedJobs([]);
      }
    };

    const loadCurrentUser = async () => {
      try {
        const res = await getMe();
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) setUser(null);
      }
    };

    const loadApplications = async () => {
      try {
        const applicationsData = await getMyApplications();
        if (!cancelled) setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      } catch {
        if (!cancelled) setApplications([]);
      }
    };

    loadJobs();
    loadCurrentUser();
    refreshSavedJobs();
    loadApplications();
    loadRecommendedJobs();

    return () => {
      cancelled = true;
    };
  }, [refreshSavedJobs]);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((app) => app.jobId?._id || app.jobId?.id || app.jobId)),
    [applications],
  );

  const isJobSaved = useCallback(
    (jobId) => savedJobs.some((job) => (job._id || job.id) === jobId),
    [savedJobs],
  );

  const handleSave = useCallback(
    async (job) => {
      await saveJob(job._id || job.id);
      await refreshSavedJobs();
    },
    [refreshSavedJobs],
  );

  const handleUnsave = useCallback(
    async (job) => {
      await unsaveJob(job._id || job.id);
      await refreshSavedJobs();
    },
    [refreshSavedJobs],
  );

  return {
    jobs,
    loading,
    error,
    user,
    appliedJobIds,
    isJobSaved,
    handleSave,
    handleUnsave,
    recommendedJobs,
  };
}
