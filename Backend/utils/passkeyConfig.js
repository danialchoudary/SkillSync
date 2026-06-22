function getHostname(value, fallback = 'localhost') {
  try {
    return new URL(value).hostname;
  } catch {
    return fallback;
  }
}

export function getPasskeyConfig() {
  const frontendOrigin = String(process.env.WEB_AUTHN_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173').trim();
  const rpId = String(process.env.WEB_AUTHN_RP_ID || getHostname(frontendOrigin)).trim();
  const rpName = String(process.env.WEB_AUTHN_RP_NAME || 'SkillSync').trim();

  return {
    frontendOrigin,
    rpId,
    rpName,
  };
}
