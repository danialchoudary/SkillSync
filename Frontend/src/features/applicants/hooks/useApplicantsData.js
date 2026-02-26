import { useCallback, useEffect, useState } from 'react';
import { getMyJobs } from '../../../services/jobApi';
import { getApplicantsByJob, updateApplicationStatus } from '../../../services/applicationApi';

function normalizeApplicant(job, app) {
  const currentJob = typeof app.jobId === 'object' && app.jobId !== null ? app.jobId : {};
  const jobId = String(job._id || job.id);

  return {
    ...app,
    jobTitle: job.title,
    jobId: {
      ...currentJob,
      _id: jobId,
      id: jobId,
      title: job.title,
      salary: job.salary,
      location: job.location,
      experience: job.experience,
      industry: job.industry || job.recruiter?.industry || '',
    },
  };
}

export default function useApplicantsData({ setToast, setToastType }) {
  const [jobs, setJobs] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const recruiterJobs = (await getMyJobs()) || [];
      setJobs(Array.isArray(recruiterJobs) ? recruiterJobs : []);

      const appPromises = recruiterJobs.map((job) =>
        getApplicantsByJob(job._id || job.id)
          .then((applications) =>
            (Array.isArray(applications) ? applications : []).map((app) => normalizeApplicant(job, app)),
          )
          .catch(() => []),
      );

      const appResults = await Promise.all(appPromises);
      setAllApplicants(appResults.flat());
      setError('');
    } catch (fetchError) {
      setError('Failed to load applicants. Please try again.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = useCallback(
    async (appId, newStatus) => {
      const previousApplicants = [...allApplicants];
      setAllApplicants((prev) =>
        prev.map((app) => ((app._id || app.id) === appId ? { ...app, status: newStatus } : app)),
      );

      try {
        await updateApplicationStatus(appId, newStatus);
        setToast(`Applicant moved to ${newStatus}`);
        setToastType('success');
      } catch {
        setAllApplicants(previousApplicants);
        setToast('Failed to update status');
        setToastType('error');
      }
    },
    [allApplicants, setToast, setToastType],
  );

  return {
    jobs,
    allApplicants,
    loading,
    error,
    fetchData,
    handleStatusChange,
  };
}
