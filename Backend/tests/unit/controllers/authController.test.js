import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../../../models/User.js';
import { loginUser } from '../../../controllers/authController.js';

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    cookieArgs: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookieArgs = { name, value, options };
      return this;
    },
  };
}

test('loginUser returns 400 for invalid payload', async () => {
  const req = { body: { password: 'secret123' } };
  const res = createMockResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    await loginUser(req, res);
  } finally {
    console.error = originalError;
  }

  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /required/i);
});

test('loginUser returns 400 when user is not found', async () => {
  const originalFindOne = User.findOne;
  const originalError = console.error;
  console.error = () => {};
  User.findOne = async () => null;

  const req = { body: { email: 'missing@example.com', password: 'secret123' } };
  const res = createMockResponse();

  try {
    await loginUser(req, res);
  } finally {
    User.findOne = originalFindOne;
    console.error = originalError;
  }

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Invalid credentials');
});

test('loginUser returns 400 when password does not match', async () => {
  const originalFindOne = User.findOne;
  const originalError = console.error;
  console.error = () => {};

  User.findOne = async () => ({
    email: 'user@example.com',
    comparePassword: async () => false,
  });

  const req = { body: { email: 'user@example.com', password: 'wrongpass' } };
  const res = createMockResponse();

  try {
    await loginUser(req, res);
  } finally {
    User.findOne = originalFindOne;
    console.error = originalError;
  }

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Invalid credentials');
});

test('loginUser returns 401 when email is not verified', async () => {
  const originalFindOne = User.findOne;
  const originalError = console.error;
  console.error = () => {};

  User.findOne = async () => ({
    email: 'pending@example.com',
    isVerified: false,
    comparePassword: async () => true,
  });

  const req = { body: { email: 'pending@example.com', password: 'secret123' } };
  const res = createMockResponse();

  try {
    await loginUser(req, res);
  } finally {
    User.findOne = originalFindOne;
    console.error = originalError;
  }

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.needsVerification, true);
  assert.equal(res.body.email, 'pending@example.com');
});

test('loginUser returns user + token and sets remember-me cookie options', async () => {
  const originalFindOne = User.findOne;
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.JWT_SECRET = 'auth-controller-test-secret';
  process.env.NODE_ENV = 'test';

  User.findOne = async () => ({
    _id: 'u-login-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'recruiter',
    isVerified: true,
    comparePassword: async () => true,
  });

  const req = {
    body: {
      email: 'test@example.com',
      password: 'secret123',
      rememberMe: true,
    },
  };
  const res = createMockResponse();

  try {
    await loginUser(req, res);
  } finally {
    User.findOne = originalFindOne;
    if (typeof originalNodeEnv === 'undefined') {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }

  assert.equal(res.statusCode, 200);
  assert.equal(typeof res.body.token, 'string');
  assert.deepEqual(res.body.user, {
    name: 'Test User',
    email: 'test@example.com',
    role: 'recruiter',
  });
  assert.equal(res.cookieArgs.name, 'token');
  assert.equal(res.cookieArgs.options.httpOnly, true);
  assert.equal(res.cookieArgs.options.sameSite, 'lax');
  assert.equal(res.cookieArgs.options.secure, false);
  assert.equal(res.cookieArgs.options.maxAge, 30 * 24 * 60 * 60 * 1000);
});
