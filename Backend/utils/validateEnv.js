const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const MIN_SECRET_LENGTH = 16;

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => {
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
}
