import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getUsers } from '../controllers/usersController.js';

const router = express.Router();

// GET /users - get all users (for messaging)
router.get('/', authMiddleware, getUsers);

export default router;
