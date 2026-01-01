import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Attach Authorization header for protected calls
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export function getMe() {
  return api.get('/me');
}

export function updateMe(payload) {
  return api.patch('/me', payload);
}

export function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/me/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export default api;