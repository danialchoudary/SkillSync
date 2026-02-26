import { listUsersForMessaging } from '../services/usersService.js';

export async function getUsers(req, res) {
  try {
    const users = await listUsersForMessaging(req.user._id);
    return res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users. Please try again.' });
  }
}
