import api from './api';

export const getNotifications = async () => {
  try {
    const res = await api.get('/api/notifications', { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Get notifications error:', err);
    throw err;
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.patch(`/api/notifications/${id}/read`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Mark notification as read error:', err);
    throw err;
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.patch('/api/notifications/read-all', {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    throw err;
  }
};
