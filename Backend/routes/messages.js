import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createCloudinaryStorage } from '../utils/cloudinary.js';
import {
  getConversation,
  markSeen,
  sendMessage,
  uploadMessageAttachment,
} from '../controllers/messagesController.js';

const upload = multer({
  storage: createCloudinaryStorage('skillsync/messages'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

router.post('/send', authMiddleware, sendMessage);
router.post('/upload', authMiddleware, upload.single('file'), uploadMessageAttachment);
router.get('/conversation/:userId', authMiddleware, getConversation);
router.put('/:id/seen', authMiddleware, markSeen);

export default router;
