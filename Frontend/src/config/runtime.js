import { trimTrailingSlash } from '../utils/urlUtils';

const DEFAULT_BACKEND_ORIGIN = 'http://localhost:5000';

function readRuntimeEnv(key) {
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Vite specific
  // @ts-ignore
  const viteEnv = import.meta.env;
  if (viteEnv && viteEnv[key]) {
    return viteEnv[key];
  }
  return '';
}

const configuredBaseUrl = readRuntimeEnv('VITE_API_BASE_URL');
const configuredApiUrl = readRuntimeEnv('VITE_API_URL');

// Fallback logic for production if env vars are missing
let fallbackOrigin = DEFAULT_BACKEND_ORIGIN;
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  // Try to find a matching Render backend (standard pattern)
  fallbackOrigin = 'https://skillsync-backend-so6r.onrender.com'; 
}

const resolvedBaseUrl = trimTrailingSlash(
  configuredBaseUrl || configuredApiUrl || fallbackOrigin,
);

export const apiBaseUrl = resolvedBaseUrl;
