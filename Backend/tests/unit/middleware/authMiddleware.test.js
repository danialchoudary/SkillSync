import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import { authMiddleware } from '../../../middleware/authMiddleware.js';

function createMockResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const JWT_SECRET = 'unit-test-jwt-secret';

test('authMiddleware returns 401 when no token is provided', async () => {
  const req = { headers: {}, cookies: {} };
  const res = createMockResponse();
  let nextCalled = false;

  await authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'No token provided');
});

test('authMiddleware returns 401 for invalid token', async () => {
  const req = {
    headers: { authorization: 'Bearer invalid-token' },
    cookies: {},
  };
  const res = createMockResponse();
  let nextCalled = false;

  await authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Invalid token');
});

test('authMiddleware sets req.user and calls next for a valid bearer token', async () => {
  const originalFindById = User.findById;
  process.env.JWT_SECRET = JWT_SECRET;
  const token = jwt.sign({ id: 'user-123' }, JWT_SECRET);
  const mockUser = { _id: 'user-123', role: 'jobseeker' };

  User.findById = async (id) => {
    assert.equal(id, 'user-123');
    return mockUser;
  };

  const req = {
    headers: { authorization: `Bearer ${token}` },
    cookies: {},
  };
  const res = createMockResponse();
  let nextCalled = false;

  try {
    await authMiddleware(req, res, () => {
      nextCalled = true;
    });
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(nextCalled, true);
  assert.equal(req.user, mockUser);
  assert.equal(res.statusCode, null);
});

test('authMiddleware returns 401 when decoded user does not exist', async () => {
  const originalFindById = User.findById;
  process.env.JWT_SECRET = JWT_SECRET;
  const token = jwt.sign({ id: 'missing-user' }, JWT_SECRET);

  User.findById = async () => null;

  const req = {
    headers: {},
    cookies: { token },
  };
  const res = createMockResponse();
  let nextCalled = false;

  try {
    await authMiddleware(req, res, () => {
      nextCalled = true;
    });
  } finally {
    User.findById = originalFindById;
  }

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'User not found');
});
