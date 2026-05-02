const DEFAULT_BACKEND_ORIGIN = 'http://localhost:5000';

function readRuntimeEnv(key) {
  return (
    import.meta.env?.[key] ||
    globalThis?.process?.env?.[key] ||
    ''
  );
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function dropApiSuffix(value) {
  return value.replace(/\/api\/?$/, '');
}

const configuredBaseUrl = readRuntimeEnv('VITE_API_BASE_URL');
const configuredApiUrl = readRuntimeEnv('VITE_API_URL');

// Fallback logic for production if env vars are missing
let fallbackOrigin = DEFAULT_BACKEND_ORIGIN;
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
  // Try to find a matching Render backend (standard pattern)
  fallbackOrigin = 'https://skillsync-api.onrender.com'; // Adjust this if your render name is different
}

const resolvedBaseUrl = trimTrailingSlash(
  configuredBaseUrl || configuredApiUrl || fallbackOrigin,
);

export const apiBaseUrl = resolvedBaseUrl;
export const backendOrigin = dropApiSuffix(resolvedBaseUrl);
export const socketUrl = backendOrigin;

export function toBackendUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin}${cleanPath}`;
}

