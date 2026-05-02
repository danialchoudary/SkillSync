
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
const configuredSocketUrl = readRuntimeEnv('VITE_SOCKET_URL');

// Fallback logic for production if env vars are missing
let fallbackOrigin = DEFAULT_BACKEND_ORIGIN;
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  fallbackOrigin = 'https://skillsync-backend-so6r.onrender.com'; 
}

let resolvedBaseUrl = configuredBaseUrl || configuredApiUrl || fallbackOrigin;

// Remove trailing slash if present
if (resolvedBaseUrl.endsWith('/')) {
  resolvedBaseUrl = resolvedBaseUrl.slice(0, -1);
}

export const apiBaseUrl = resolvedBaseUrl;
export const backendOrigin = resolvedBaseUrl; // Added missing backendOrigin export
export const socketUrl = configuredSocketUrl || resolvedBaseUrl;

// Added missing toBackendUrl helper
export const toBackendUrl = (path) => {
  if (!path) return resolvedBaseUrl;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${resolvedBaseUrl}${cleanPath}`;
};
