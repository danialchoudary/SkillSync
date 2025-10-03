import rateLimit from 'express-rate-limit';

export const userUpdateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
