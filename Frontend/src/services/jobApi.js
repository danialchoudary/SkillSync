import api from './api';

export const updateJob = async (jobId, updatedData) => {
  try {
    const res = await api.put(`/jobs/${jobId}`, updatedData, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Update job error:', err);
    throw err;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const res = await api.delete(`/jobs/${jobId}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Delete job error:', err);
    throw err;
  }
};

export const getJobs = async () => {
  try {
    const res = await api.get('/jobs', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Get jobs error:', err);
    throw err;
  }
};

export const saveJob = async (id) => {
  try {
    const res = await api.post(`/jobs/${id}/save`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Save job error:', err);
    throw err;
  }
};

export const unsaveJob = async (id) => {
  try {
    const res = await api.post(`/jobs/${id}/unsave`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Unsave job error:', err);
    throw err;
  }
};

export const getSavedJobs = async () => {
  try {
    const res = await api.get('/jobs/saved', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Get saved jobs error:', err);
    throw err;
  }
};

export const getRecommendedJobs = async () => {
  try {
    const res = await api.get('/jobs/recommended', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Get recommended jobs error:', err);
    throw err;
  }
};

export const applyForJob = async (jobId, coverLetter, resumeFile) => {
  try {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('coverLetter', coverLetter);
    if (resumeFile) formData.append('resume', resumeFile);
    const res = await api.post('/applications/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    console.error('Apply for job error:', err);
    throw err;
  }
};

export const postJob = async (job) => {
  try {
    const res = await api.post('/jobs', job, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Post job error:', err);
    throw err;
  }
};

export const getMyJobs = async () => {
  try {
    const res = await api.get('/jobs/my', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Get my jobs error:', err);
    throw err;
  }
};
