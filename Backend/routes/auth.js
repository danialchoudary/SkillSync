import express from 'express';
import { registerUser, loginUser, logoutUser, verifyEmail, resendVerificationCode } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import passport from 'passport';
import { googleAuthCallback, completeOnboarding } from '../controllers/authController.js';

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

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` }), googleAuthCallback);

// Onboarding completion
router.post('/complete-onboarding', authMiddleware, completeOnboarding);

// ...existing code...

export default router;
