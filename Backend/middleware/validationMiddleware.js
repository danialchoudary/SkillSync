import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// XSS protection middleware
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key], {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: []
        });
      }
    }
  }
  next();
};

// SQL injection prevention for MongoDB
export const preventNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Check for MongoDB operators
        if (key.startsWith('$')) {
          return true;
        }
        // Recursively check nested objects
        if (checkForInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.body && checkForInjection(req.body)) {
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  if (req.query && checkForInjection(req.query)) {
    return res.status(400).json({ error: 'Invalid query parameters detected' });
  }

  next();
};

// Enhanced validation schemas
export const validationSchemas = {
  // User profile update validation
  userUpdate: Joi.object({
    name: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s'-]+$/).optional(),
    skills: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    experience: Joi.string().max(2000).allow('').optional(),
    companyName: Joi.string().min(2).max(100).pattern(/^[a-zA-Z0-9\s&'-]+$/).optional(),
    companyAddress: Joi.string().min(2).max(200).optional(),
    companyWebsite: Joi.string().uri().allow('').optional(),
    industry: Joi.string().max(50).optional(),
    location: Joi.string().max(100).optional(),
    description: Joi.string().max(2000).allow('').optional()
  }),

  // Job posting validation
  jobPost: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(50).max(5000).required(),
    requirements: Joi.string().min(20).max(2000).required(),
    salary: Joi.object({
      min: Joi.number().min(0).optional(),
      max: Joi.number().min(0).optional(),
      currency: Joi.string().length(3).default('USD')
    }).optional(),
    location: Joi.string().max(100).required(),
    type: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'remote').required(),
    industry: Joi.string().max(50).required(),
    skills: Joi.array().items(Joi.string().max(50)).max(20).required()
  }),

  // Message validation
  message: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    receiverId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),

  // Application validation
  application: Joi.object({
    jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    coverLetter: Joi.string().min(10).max(2000).required()
  }),

  // Search and filter validation
  search: Joi.object({
    query: Joi.string().max(100).allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Generic validation middleware factory
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errorMessage
      });
    }

    req[source] = value; // Use sanitized values
    next();
  };
};

// File upload validation
export const validateFileUpload = (allowedTypes, maxSizeMB = 5) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      });
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (req.file.size > maxSizeBytes) {
      return res.status(400).json({ 
        error: `File too large. Maximum size: ${maxSizeMB}MB` 
      });
    }

    // Check filename for suspicious patterns
    const filename = req.file.originalname;
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid filename characters
      /\.(exe|bat|cmd|scr|pif)$/i  // Executable files
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(filename)) {
        return res.status(400).json({ error: 'Invalid filename detected' });
      }
    }

    next();
  };
};