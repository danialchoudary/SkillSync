import express from 'express';
import {
  beginPasskeyLogin,
  beginPasskeyRegistration,
  loginUser,
  logoutUser,
  registerUser,
  resendOtp,
  verifyOtp,
  verifyPasskeyLogin,
  verifyPasskeyRegistration,
} from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);
// Register
router.post('/register', registerUser);
router.post('/passkey/register/options', beginPasskeyRegistration);
router.post('/passkey/register/verify', verifyPasskeyRegistration);

// Verify OTP
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Login
router.post('/login', loginUser);
router.post('/passkey/login/options', beginPasskeyLogin);
router.post('/passkey/login/verify', verifyPasskeyLogin);

// Logout
router.post('/logout', logoutUser);

export default router;
