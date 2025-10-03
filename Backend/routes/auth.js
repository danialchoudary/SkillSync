import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);
    
	// ...existing code...

export default router;
