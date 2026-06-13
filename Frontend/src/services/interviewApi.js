import api from './api';

export const createInterview = async (interviewData) => {
  const response = await api.post('/api/interviews', interviewData);
  return response.data;
};

export const getInterviews = async () => {
  const response = await api.get('/api/interviews');
  return response.data;
};

export const updateInterviewStatus = async (id, status) => {
  const response = await api.patch(`/api/interviews/${id}/status`, { status });
  return response.data;
};
