import dotenv from 'dotenv';

dotenv.config();

const SMS_SEND_TIMEOUT_MS = Number(process.env.SMS_SEND_TIMEOUT_MS || 10000);

function getSmsSettings() {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const fromNumber = String(process.env.TWILIO_FROM_NUMBER || '').trim();

  return { accountSid, authToken, fromNumber };
}

function buildSmsBody(code) {
  return `Your SkillSync verification code is ${code}. It expires in 10 minutes.`;
}

function isSmsConfigured() {
  const { accountSid, authToken, fromNumber } = getSmsSettings();
  return Boolean(accountSid && authToken && fromNumber);
}

export async function sendVerificationSms({ phoneNumber, code }) {
  const { accountSid, authToken, fromNumber } = getSmsSettings();
  const messageBody = buildSmsBody(code);
  const allowDevFallback = String(process.env.SMS_ALLOW_DEV_FALLBACK || '').trim().toLowerCase() === 'true';

  if (!phoneNumber) {
    throw new Error('phoneNumber is required');
  }

  if (!isSmsConfigured()) {
    if (process.env.NODE_ENV === 'test' || allowDevFallback) {
      console.log(`[SMS] Dev fallback: would send to ${phoneNumber} -> ${messageBody}`);
      return { skipped: true };
    }

    throw new Error('TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER not set');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SMS_SEND_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: phoneNumber,
        Body: messageBody,
      }),
      signal: controller.signal,
    });

    const raw = await response.text();
    if (!response.ok) {
      const error = new Error(raw || `Twilio SMS error (${response.status})`);
      error.code = response.status === 401 ? 'EAUTH' : 'ETWILIO';
      throw error;
    }

    return { skipped: false, response: raw };
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Verification SMS timed out after ${SMS_SEND_TIMEOUT_MS}ms`);
      timeoutError.code = 'ETIMEOUT';
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
