import test, { before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import User from '../../models/User.js';
import app from '../../app.js';
import {
  clearMongoDatabase,
  startInMemoryMongo,
  stopInMemoryMongo,
} from './helpers/memoryMongo.js';

let mongod;
let server;
let baseUrl;
let idCounter = 0;
const emailEnvKeys = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_PORT', 'EMAIL_SECURE'];
const smsEnvKeys = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'];
const smsFallbackKeys = ['SMS_ALLOW_DEV_FALLBACK'];
const previousEmailEnv = {};
const previousSmsEnv = {};
const previousSmsFallbackEnv = {};

function uniqueEmail(prefix = 'user') {
  idCounter += 1;
  return `${prefix}${Date.now()}_${idCounter}@example.com`;
}

function uniquePhone(prefix = '+1555') {
  idCounter += 1;
  return `${prefix}${String(Date.now()).slice(-7)}${String(idCounter).padStart(2, '0')}`;
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-db-secret';
  process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '8.2.1';
  for (const key of emailEnvKeys) {
    previousEmailEnv[key] = process.env[key];
    delete process.env[key];
  }
  for (const key of smsEnvKeys) {
    previousSmsEnv[key] = process.env[key];
    delete process.env[key];
  }
  for (const key of smsFallbackKeys) {
    previousSmsFallbackEnv[key] = process.env[key];
    process.env[key] = 'true';
  }
  mongod = await startInMemoryMongo();

  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
  await clearMongoDatabase();
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  await stopInMemoryMongo(mongod);
  for (const key of emailEnvKeys) {
    if (typeof previousEmailEnv[key] === 'undefined') {
      delete process.env[key];
    } else {
      process.env[key] = previousEmailEnv[key];
    }
  }
  for (const key of smsEnvKeys) {
    if (typeof previousSmsEnv[key] === 'undefined') {
      delete process.env[key];
    } else {
      process.env[key] = previousSmsEnv[key];
    }
  }
  for (const key of smsFallbackKeys) {
    if (typeof previousSmsFallbackEnv[key] === 'undefined') {
      delete process.env[key];
    } else {
      process.env[key] = previousSmsFallbackEnv[key];
    }
  }
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const raw = await response.text();

  let body = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Keep raw response for non-JSON payloads.
  }

  return { response, body };
}

test('register persists unverified user with hashed password and verification code', async () => {
  const email = uniqueEmail('register');
  const phoneNumber = uniquePhone();
  const payload = {
    name: 'DB Test User',
    email,
    phoneNumber,
    password: 'secret123',
    role: 'jobseeker',
  };

  const { response, body } = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 201);
  assert.equal(body.email, email);
  assert.equal(body.phoneNumber, phoneNumber);
  assert.match(body.message, /Registration successful/i);

  const user = await User.findOne({ email });
  assert.ok(user);
  assert.equal(user.isVerified, false);
  assert.equal(typeof user.verificationCode, 'string');
  assert.equal(user.verificationCode.length, 6);
  assert.notEqual(user.password, payload.password);
  assert.equal(await user.comparePassword(payload.password), true);
});

test('login blocks unverified user with needsVerification payload', async () => {
  const email = uniqueEmail('pending');
  const phoneNumber = uniquePhone();
  await User.create({
    name: 'Pending User',
    email,
    phoneNumber,
    password: 'secret123',
    role: 'jobseeker',
    isVerified: false,
    verificationCode: '123456',
    verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  const { response, body } = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'secret123' }),
  });

  assert.equal(response.status, 401);
  assert.equal(body.needsVerification, true);
  assert.equal(body.email, email);
  assert.equal(body.phoneNumber, phoneNumber);
});

test('verify-otp rejects an invalid code', async () => {
  const email = uniqueEmail('verifyfail');
  const phoneNumber = uniquePhone();
  await User.create({
    name: 'Verify Fail',
    email,
    phoneNumber,
    password: 'secret123',
    role: 'jobseeker',
    isVerified: false,
    verificationCode: '654321',
    verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  const { response, body } = await request('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code: '000000' }),
  });

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Invalid verification code');
});

test('verify-otp success marks user verified and clears code', async () => {
  const email = uniqueEmail('verifysuccess');
  const phoneNumber = uniquePhone();
  await User.create({
    name: 'Verify Success',
    email,
    phoneNumber,
    password: 'secret123',
    role: 'jobseeker',
    isVerified: false,
    verificationCode: '222333',
    verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  const { response, body } = await request('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code: '222333' }),
  });

  assert.equal(response.status, 200);
  assert.equal(typeof body.token, 'string');
  assert.equal(body.user.email, email);
  assert.match(response.headers.get('set-cookie') || '', /token=/i);

  const updated = await User.findOne({ email });
  assert.equal(updated.isVerified, true);
  assert.equal(updated.verificationCode, undefined);
  assert.equal(updated.verificationCodeExpires, undefined);
});

test('full auth flow register -> verify -> login -> auth/me', async () => {
  const email = uniqueEmail('flow');
  const phoneNumber = uniquePhone();
  const password = 'secret123';

  const registerRes = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Flow User',
      email,
      phoneNumber,
      password,
      role: 'jobseeker',
    }),
  });
  assert.equal(registerRes.response.status, 201);

  const pendingUser = await User.findOne({ email });
  assert.ok(pendingUser?.verificationCode);

  const verifyRes = await request('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber,
      code: pendingUser.verificationCode,
    }),
  });
  assert.equal(verifyRes.response.status, 200);
  assert.equal(typeof verifyRes.body.token, 'string');

  const loginRes = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(loginRes.response.status, 200);
  assert.equal(loginRes.body.user.email, email);
  assert.equal(typeof loginRes.body.token, 'string');

  const meRes = await request('/auth/me', {
    headers: {
      Authorization: `Bearer ${loginRes.body.token}`,
    },
  });
  assert.equal(meRes.response.status, 200);
  assert.equal(meRes.body.email, email);
  assert.equal(meRes.body.role, 'jobseeker');
  assert.equal('password' in meRes.body, false);
});
