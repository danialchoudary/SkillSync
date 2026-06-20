function shouldUseSecureCookies() {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.FRONTEND_URL?.startsWith('https://') ||
    process.env.BACKEND_URL?.startsWith('https://')
  );
}

export function getAuthCookieOptions(maxAge) {
  const secure = shouldUseSecureCookies();
  const options = {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  };

  if (maxAge) {
    options.maxAge = maxAge;
  }

  return options;
}
