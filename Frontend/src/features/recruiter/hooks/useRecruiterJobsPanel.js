import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteJob, getMyJobs, postJob, updateJob } from '../../../services/jobApi';

export default function useRecruiterJobsPanel(activeSection) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateSort, setDateSort] = useState('newest');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'myjobs') fetchJobs();
  }, [activeSection, fetchJobs]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handlePostJob = useCallback(async (job) => {
    try {
      await postJob(job);
      showToast('Job posted successfully!', 'success');
      fetchJobs();
    } catch {
      showToast('Failed to post job. Please try again.', 'error');
    }
  }, [fetchJobs, showToast]);

  const handleDeleteJob = useCallback(async (job) => {
    try {
      await deleteJob(job._id || job.id);
      showToast('Job deleted successfully!', 'success');
      fetchJobs();
    } catch {
      showToast('Failed to delete job.', 'error');
    }
  }, [fetchJobs, showToast]);

  const handleEditJob = useCallback((job) => {
    setEditJob(job);
  }, []);

  const closeEditJob = useCallback(() => {
    setEditJob(null);
  }, []);

  const handleUpdateJob = useCallback(async (updated) => {
    if (!editJob) return;

    setEditLoading(true);
    setEditError('');
    try {
      await updateJob(editJob._id || editJob.id, updated);
      setEditJob(null);
      showToast('Job updated successfully!', 'success');
      fetchJobs();
    } catch {
      setEditError('Failed to update job. Please try again.');
    } finally {
      setEditLoading(false);
    }
  }, [editJob, fetchJobs, showToast]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job) => String(job.title || '').toLowerCase().includes(query));
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [jobs, searchQuery, dateSort]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setDateSort('newest');
  }, []);

  return {
    jobs,
    loading,
    editJob,
    editLoading,
    editError,
    toast,
    setToast,
    searchQuery,
    setSearchQuery,
    dateSort,
    setDateSort,
    filteredAndSortedJobs,
    handleClearFilters,
    handlePostJob,
    handleDeleteJob,
    handleEditJob,
    closeEditJob,
    handleUpdateJob,
    showToast,
  };
}
