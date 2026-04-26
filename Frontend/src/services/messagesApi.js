import api from './api';

export const fetchUsers = async () => api.get('/users'); // You may need to implement this endpoint
export const fetchConversation = async (userId) => {
	// Debug log to verify fetchConversation API call
	console.log('Fetching conversation for userId:', userId);
	return api.get(`/api/messages/conversation/${userId}`);
};
export const sendMessage = async (receiverId, content, options = {}) => {
	// Debug log to verify sendMessage API call
	console.log('Sending message to:', receiverId, 'with content:', content, 'options:', options);
	try {
		const res = await api.post('/api/messages/send', {
			receiverId,
			content,
			...options
		});
		return res.data;
	} catch (err) {
		console.error('Send message error:', err);
		throw err;
	}
};

export const uploadMessageFile = async (file) => {
	const formData = new FormData();
	formData.append('file', file);
	const res = await api.post('/api/messages/upload', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});
	return res.data;
};

export const markMessageSeen = async (id) => api.put(`/api/messages/${id}/seen`);

export const deleteConversation = async (userId) => {
	console.log('Deleting conversation for userId:', userId);
	return api.delete(`/api/messages/conversation/${userId}`);
};
