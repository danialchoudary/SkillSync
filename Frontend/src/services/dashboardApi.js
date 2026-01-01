import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRecentApplicants = async () => {
    const response = await api.get('/dashboard/recent-applicants');
    return response.data;
};
