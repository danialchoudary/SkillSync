import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../../app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const raw = await response.text();

  let body = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Keep raw text for non-JSON responses.
  }

  return { response, body };
}

async function withEnv(overrides, fn) {
  const keys = Object.keys(overrides);
  const previous = {};

  for (const key of keys) {
    previous[key] = process.env[key];
    const next = overrides[key];
    if (typeof next === 'undefined') {
      delete process.env[key];
    } else {
      process.env[key] = next;
    }
  }

  try {
    await fn();
  } finally {
    for (const key of keys) {
      if (typeof previous[key] === 'undefined') {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

test('GET / returns API health text', async () => {
  const { response, body } = await request('/');

  assert.equal(response.status, 200);
  assert.equal(body, 'API is running');
});

test('GET /api/hello returns 401 when token is missing', async () => {
  const { response, body } = await request('/api/hello');

  assert.equal(response.status, 401);
  assert.equal(body.error, 'No token provided');
});

test('GET /api/hello returns 401 when bearer token is invalid', async () => {
  const { response, body } = await request('/api/hello', {
    headers: {
      Authorization: 'Bearer definitely-not-a-valid-jwt',
    },
  });

  assert.equal(response.status, 401);
  assert.equal(body.error, 'Invalid token');
});

test('GET /health/sms returns 503 when SMS transport is not configured', async () => {
  await withEnv(
    {
      TWILIO_ACCOUNT_SID: undefined,
      TWILIO_AUTH_TOKEN: undefined,
      TWILIO_FROM_NUMBER: undefined,
      NODE_ENV: 'production',
    },
    async () => {
      const { response, body } = await request('/health/sms');

      assert.equal(response.status, 503);
      assert.equal(body.ok, false);
      assert.match(body.error, /TWILIO_ACCOUNT_SID|TWILIO_AUTH_TOKEN|TWILIO_FROM_NUMBER/);
    },
  );
});

test('Unknown routes return JSON 404 payload', async () => {
  const { response, body } = await request('/this-route-does-not-exist');

  assert.equal(response.status, 404);
  assert.equal(body.error, 'Resource not found');
  assert.equal(typeof body.timestamp, 'string');
});
