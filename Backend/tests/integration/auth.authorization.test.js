import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import app from '../../app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
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
    // Keep raw text when body is not JSON.
  }

  return { response, body };
}

async function withMockedUser(user, fn) {
  const originalFindById = User.findById;
  User.findById = async () => user;

  try {
    await fn();
  } finally {
    User.findById = originalFindById;
  }
}

function createBearerToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
}

test('POST /auth/login validates payload and rejects malformed request', async () => {
  const { response, body } = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'secret123' }),
  });

  assert.equal(response.status, 400);
  assert.match(body.error, /required/i);
});

test('POST /auth/register rejects invalid recruiter payload', async () => {
  const { response, body } = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recruiterName: 'Alice Recruiter',
      email: 'alice@example.com',
      password: 'secret123',
      role: 'recruiter',
      companyName: 'Acme Inc',
      companyAddress: '123 Main St',
      // Missing confirmPassword on purpose.
    }),
  });

  assert.equal(response.status, 400);
  assert.match(body.error, /confirmPassword|required/i);
});

test('POST /auth/logout clears auth cookie and returns success payload', async () => {
  const { response, body } = await request('/auth/logout', {
    method: 'POST',
  });

  assert.equal(response.status, 200);
  assert.equal(body.message, 'Logged out successfully');
  assert.match(response.headers.get('set-cookie') || '', /token=/i);
});

test('GET /applications/mine blocks recruiter accounts', async () => {
  await withMockedUser(
    { _id: 'recruiter-1', id: 'recruiter-1', role: 'recruiter' },
    async () => {
      const token = createBearerToken('recruiter-1');
      const { response, body } = await request('/applications/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 403);
      assert.equal(body.error, 'Access denied');
    },
  );
});

test('GET /applications/job/:jobId blocks jobseeker accounts', async () => {
  await withMockedUser(
    { _id: 'jobseeker-1', id: 'jobseeker-1', role: 'jobseeker' },
    async () => {
      const token = createBearerToken('jobseeker-1');
      const { response, body } = await request('/applications/job/job-123', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 403);
      assert.equal(body.error, 'Access denied');
    },
  );
});

test('PATCH /applications/:id/status validates status before DB update', async () => {
  await withMockedUser(
    { _id: 'recruiter-2', id: 'recruiter-2', role: 'recruiter' },
    async () => {
      const token = createBearerToken('recruiter-2');
      const { response, body } = await request('/applications/app-123/status', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'not-a-real-status' }),
      });

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Invalid status.');
    },
  );
});

test('GET /dashboard/jobseeker-analytics blocks recruiter accounts', async () => {
  await withMockedUser(
    { _id: 'recruiter-3', id: 'recruiter-3', role: 'recruiter' },
    async () => {
      const token = createBearerToken('recruiter-3');
      const { response, body } = await request('/dashboard/jobseeker-analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assert.equal(response.status, 403);
      assert.equal(body.error, 'Access denied');
    },
  );
});
