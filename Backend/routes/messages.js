import express from 'express';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user._id;
  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation between current user and another user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user._id.toString();
  try {
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Mark a message as seen
router.put('/:id/seen', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { seen: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as seen' });
  }
});

export default router;
