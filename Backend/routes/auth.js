import express from 'express';
import { registerUser, loginUser, logoutUser, verifyEmail, resendVerificationCode } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
// Register
router.post('/register', registerUser);

// Verify Email
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);

// ...existing code...

export default router;
