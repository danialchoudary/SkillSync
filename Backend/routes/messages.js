import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import mongoose from 'mongoose';

import { createCloudinaryStorage } from '../utils/cloudinary.js';

const upload = multer({
  storage: createCloudinaryStorage('skillsync/messages'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  const { receiverId, content, messageType, fileUrl, fileName, fileType, fileSize } = req.body;
  const senderId = req.user._id.toString();
  const normalizedReceiverId = String(receiverId || '').trim();
  const normalizedContent = typeof content === 'string' ? content.trim() : '';

  if (!normalizedReceiverId || (!normalizedContent && messageType !== 'file')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidObjectId(normalizedReceiverId)) {
    return res.status(400).json({ error: 'Invalid receiverId' });
  }

  if (normalizedReceiverId === senderId) {
    return res.status(400).json({ error: 'You cannot send messages to yourself' });
  }

  try {
    const receiverExists = await User.exists({ _id: normalizedReceiverId });
    if (!receiverExists) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await Message.create({
      senderId,
      receiverId: normalizedReceiverId,
      content: normalizedContent,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileType,
      fileSize
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Upload message attachment
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = req.file.path;
    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get conversation between current user and another user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  const userId = String(req.params.userId || '').trim();
  const currentUserId = req.user._id.toString();

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  if (userId === currentUserId) {
    return res.json([]);
  }

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
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not allowed to mark this message as seen' });
    }

    if (!message.seen) {
      message.seen = true;
      await message.save();
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as seen' });
  }
});

export default router;
