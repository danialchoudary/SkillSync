import api from './api';

export const updateApplicationStatus = async (applicationId, status) => {
    try {
        const response = await api.patch(`/applications/${applicationId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
};

export const getApplicantsByJob = async (jobId) => {
    try {
        const response = await api.get(`/applications/job/${jobId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching applicants:', error);
        throw error;
    }
};
