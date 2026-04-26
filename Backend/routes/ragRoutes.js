import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { handleChat } from '../controllers/ragController.js';

const router = express.Router();

// POST /rag/chat — Recruiter AI Assistant chat endpoint
router.post('/chat', authMiddleware, handleChat);

export default router;
