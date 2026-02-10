import express from 'express';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads', 'messages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  const { receiverId, content, messageType, fileUrl, fileName, fileType, fileSize } = req.body;
  const senderId = req.user._id;
  if (!receiverId || (!content && messageType !== 'file')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content: content || '',
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
    const fileUrl = `/uploads/messages/${req.file.filename}`;
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
