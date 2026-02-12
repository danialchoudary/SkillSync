import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { createCloudinaryStorage } from '../utils/cloudinary.js';

const storage = createCloudinaryStorage('skillsync/resumes');

function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export function resumeUploadMiddleware(req, res, next) {
  upload.single('file')(req, res, function (err) {
    if (err) {
      if (err.message === 'Only PDF files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message || 'File too large' });
      }
      return next(err);
    }
    next();
  });
}

