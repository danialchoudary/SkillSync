const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const PRODUCTION_REQUIRED_VARS = [
  'BACKEND_URL',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
];

const MIN_SECRET_LENGTH = 16;

function isLocalhostLike(value) {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function validateEnv() {
  const requiredVars = process.env.NODE_ENV === 'production'
    ? [...REQUIRED_VARS, ...PRODUCTION_REQUIRED_VARS]
    : REQUIRED_VARS;

  const missing = requiredVars.filter((key) => {
    const val = process.env[key];
    return !val || String(val).trim() === '';
  });

  if (missing.length > 0) {
    console.error('[ENV] Missing required environment variables:');
    for (const key of missing) {
      console.error(`- ${key}`);
    }
    process.exit(1);
  }

  const weak = [];
  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';
  
  if (jwtSecret && jwtSecret.length < MIN_SECRET_LENGTH) {
    weak.push(`JWT_SECRET should be at least ${MIN_SECRET_LENGTH} characters`);
  }
  
  if (jwtRefreshSecret && jwtRefreshSecret.length < MIN_SECRET_LENGTH) {
    weak.push(`JWT_REFRESH_SECRET should be at least ${MIN_SECRET_LENGTH} characters`);
  }

  if (weak.length > 0) {
    console.warn('[ENV] Security warnings:');
    for (const w of weak) {
      console.warn(`- ${w}`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const productionErrors = [];

    if (isLocalhostLike(process.env.FRONTEND_URL)) {
      productionErrors.push('FRONTEND_URL must point to the live frontend URL, not localhost');
    }

    if (isLocalhostLike(process.env.BACKEND_URL)) {
      productionErrors.push('BACKEND_URL must point to the live backend URL, not localhost');
    }
    if (productionErrors.length > 0) {
      console.error('[ENV] Production configuration errors:');
      for (const error of productionErrors) {
        console.error(`- ${error}`);
      }
      process.exit(1);
    }
  }
}
