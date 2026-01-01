export function companyLogoUploadMiddleware(req, res, next) {
  companyLogoUpload.single('file')(req, res, function (err) {
    if (err) {
      if (err.message === 'Only JPG, JPEG, PNG files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message || 'File too large' });
      }
      return next(err);
    }
    next();
  });
}
import multer from 'multer';
import { createCloudinaryStorage } from '../utils/cloudinary.js';

const profilePictureStorage = createCloudinaryStorage('skillsync/profile-pictures');
const companyLogoStorage = createCloudinaryStorage('skillsync/company-logos');

function fileFilter(req, file, cb) {
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG files are allowed'), false);
  }
  cb(null, true);
}

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const companyLogoUpload = multer({
  storage: companyLogoStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export function profilePictureUploadMiddleware(req, res, next) {
  profilePictureUpload.single('file')(req, res, function (err) {
    if (err) {
      if (err.message === 'Only JPG, JPEG, PNG files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message || 'File too large' });
      }
      return next(err);
    }
    next();
  });
}
