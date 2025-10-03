import api from './api';

export const fetchUsers = async () => api.get('/users'); // You may need to implement this endpoint
export const fetchConversation = async (userId) => api.get(`/api/messages/conversation/${userId}`);
export const sendMessage = async (receiverId, content) => {
	try {
		const res = await api.post('/api/messages/send', { receiverId, content });
		return res.data;
	} catch (err) {
		console.error('Send message error:', err);
		throw err;
	}
};
export const markMessageSeen = async (id) => api.put(`/api/messages/${id}/seen`);
