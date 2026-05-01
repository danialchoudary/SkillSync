import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUserUpdate } from '../middleware/validateUserUpdate.js';
import { validatePasswordUpdate } from '../middleware/validatePasswordUpdate.js';
import { userUpdateLimiter } from '../middleware/rateLimiter.js';
import { profilePictureUploadMiddleware, companyLogoUploadMiddleware } from '../middleware/profilePictureUpload.js';
import { resumeUploadMiddleware } from '../middleware/resumeUpload.js';
import {
  getCurrentUserProfile,
  updateUserProfile,
  updateUserPassword,
  uploadCompanyLogo,
  uploadProfilePicture,
  uploadResume,
} from '../controllers/meController.js';

const router = express.Router();

router.post('/profile-picture', userUpdateLimiter, authMiddleware, profilePictureUploadMiddleware, uploadProfilePicture);
router.post('/company-logo', userUpdateLimiter, authMiddleware, companyLogoUploadMiddleware, uploadCompanyLogo);
router.get('/', authMiddleware, getCurrentUserProfile);
router.patch('/', userUpdateLimiter, authMiddleware, validateUserUpdate, updateUserProfile);
router.patch('/password', userUpdateLimiter, authMiddleware, validatePasswordUpdate, updateUserPassword);
router.post('/resume', userUpdateLimiter, authMiddleware, resumeUploadMiddleware, uploadResume);

export default router;
