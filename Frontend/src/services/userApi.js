import api from './api';

// Fetch all users except the current user
export const fetchAllUsers = async () => {
		try {
			const res = await api.get('/users');
			return res.data;
		} catch (err) {
			console.error('Fetch users error:', err);
			throw err;
		}
};
