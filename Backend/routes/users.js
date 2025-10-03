import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /users - get all users (for messaging)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role companyName companyLogo profilePicture');
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users. Please try again.' });
  }
});

export default router;
