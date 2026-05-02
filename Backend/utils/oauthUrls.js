const DEFAULT_BACKEND_URL = 'http://localhost:5000';
const GOOGLE_CALLBACK_PATH = '/auth/google/callback';

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function joinUrl(origin, path) {
  return `${trimTrailingSlash(origin)}${path.startsWith('/') ? path : `/${path}`}`;
}

function isLocalhostUrl(value) {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

function getRequestOrigin(req) {
  if (!req) return '';

  const forwardedProto = req.get?.('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get?.('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || req.get?.('host');
  const protocol = forwardedProto || req.protocol;

  if (!host || !protocol) return '';
  return `${protocol}://${host}`;
}

export function getFrontendUrl(path = '') {
  const frontendUrl = trimTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173');
  return path ? joinUrl(frontendUrl, path) : frontendUrl;
}

export function getGoogleCallbackUrl(req) {
  const requestOrigin = getRequestOrigin(req);
  
  // Auto-detect Render production environment
  if (requestOrigin && requestOrigin.includes('.onrender.com')) {
    return joinUrl(requestOrigin, GOOGLE_CALLBACK_PATH);
  }

  if (process.env.GOOGLE_CALLBACK_URL) {
    const configuredCallbackUrl = trimTrailingSlash(process.env.GOOGLE_CALLBACK_URL);

    if (requestOrigin && !isLocalhostUrl(requestOrigin) && isLocalhostUrl(configuredCallbackUrl)) {
      return joinUrl(requestOrigin, GOOGLE_CALLBACK_PATH);
    }

    return configuredCallbackUrl;
  }

  const configuredBackendUrl = process.env.BACKEND_URL || process.env.API_BASE_URL;
  const backendUrl =
    requestOrigin && !isLocalhostUrl(requestOrigin) && (!configuredBackendUrl || isLocalhostUrl(configuredBackendUrl))
      ? requestOrigin
      : configuredBackendUrl || requestOrigin || DEFAULT_BACKEND_URL;

  return joinUrl(backendUrl, GOOGLE_CALLBACK_PATH);
}

export function logGoogleOAuthConfig() {
  if (process.env.GOOGLE_CALLBACK_URL || process.env.BACKEND_URL || process.env.API_BASE_URL) {
    console.log(`[Google OAuth] Redirect URI: ${getGoogleCallbackUrl()}`);
  } else {
    console.log('[Google OAuth] Redirect URI will be inferred from each backend request.');
  }

  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_ID === 'dummy_client_id' ||
    process.env.GOOGLE_CLIENT_SECRET === 'dummy_client_secret'
  ) {
    console.warn('[Google OAuth] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for Google sign-in.');
  }
}
