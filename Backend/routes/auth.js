import express from 'express';
import { registerUser, loginUser, logoutUser, verifyOtp, resendOtp } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
// Register
router.post('/register', registerUser);

// Verify OTP
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', logoutUser);

export default router;
