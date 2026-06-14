import express from 'express';
import { registerUser, loginUser, logoutUser, verifyEmail, resendVerificationCode } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import passport from 'passport';
import { googleAuthCallback, completeOnboarding } from '../controllers/authController.js';
import { getFrontendUrl, getGoogleCallbackUrl } from '../utils/oauthUrls.js';
import { getAuthCookieOptions } from '../utils/authCookies.js';

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
router.get('/google', (req, res, next) => {
  const callbackURL = getGoogleCallbackUrl(req);
  const frontendUrl = getFrontendUrl('', req);
  console.log(`[Google OAuth] Starting flow with redirect URI: ${callbackURL}`);

  res.cookie('oauth_return_to', frontendUrl, getAuthCookieOptions(10 * 60 * 1000));

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    callbackURL,
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    callbackURL: getGoogleCallbackUrl(req),
    failureRedirect: getFrontendUrl('/login?error=google_auth_failed', req),
  })(req, res, next);
}, googleAuthCallback);

// Onboarding completion
router.post('/complete-onboarding', authMiddleware, completeOnboarding);

// ...existing code...

export default router;
