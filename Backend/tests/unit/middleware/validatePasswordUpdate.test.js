import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordUpdate } from '../../../middleware/validatePasswordUpdate.js';

function createResponse() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('validatePasswordUpdate accepts a valid password update payload', () => {
  const req = {
    body: {
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
      confirmPassword: 'new-secret',
    },
  };
  const res = createResponse();
  let nextCalled = false;

  validatePasswordUpdate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('validatePasswordUpdate rejects mismatched confirmation', () => {
  const req = {
    body: {
      currentPassword: 'old-secret',
      newPassword: 'new-secret',
      confirmPassword: 'different-secret',
    },
  };
  const res = createResponse();

  validatePasswordUpdate(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(Array.isArray(res.payload.error), true);
  assert.equal(res.payload.error.some((message) => message.includes('confirmPassword')), true);
});

test('validatePasswordUpdate rejects short new passwords', () => {
  const req = {
    body: {
      currentPassword: 'old-secret',
      newPassword: 'short',
      confirmPassword: 'short',
    },
  };
  const res = createResponse();

  validatePasswordUpdate(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(Array.isArray(res.payload.error), true);
});
