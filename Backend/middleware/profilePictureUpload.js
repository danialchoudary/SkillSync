export function companyLogoUploadMiddleware(req, res, next) {
  upload.single('file')(req, res, function (err) {
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
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, path.join(process.cwd(), 'Backend', 'uploads', 'profile-pictures'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

function fileFilter(req, file, cb) {
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
    return cb(new Error('Only JPG, JPEG, PNG files are allowed'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export function profilePictureUploadMiddleware(req, res, next) {
  upload.single('file')(req, res, function (err) {
    if (err) {
      if (err.message === 'Only JPG, JPEG, PNG files are allowed' || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message || 'File too large' });
      }
      return next(err);
    }
    next();
  });
}
