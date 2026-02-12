import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler, notFoundHandler, asyncHandler } from '../../../middleware/errorHandler.js';

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

function withNodeEnv(value, fn) {
  const previous = process.env.NODE_ENV;
  if (typeof value === 'undefined') {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = value;
  }

  try {
    fn();
  } finally {
    if (typeof previous === 'undefined') {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previous;
    }
  }
}

test('errorHandler returns 409 for Mongo duplicate key errors', () => {
  withNodeEnv('production', () => {
    const req = { url: '/users', method: 'POST', ip: '127.0.0.1', id: 'req-409' };
    const res = createMockResponse();
    const err = { name: 'MongoServerError', code: 11000, message: 'duplicate key' };
    const originalError = console.error;
    console.error = () => {};

    try {
      errorHandler(err, req, res, () => {});
    } finally {
      console.error = originalError;
    }

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.error, 'Duplicate entry');
    assert.equal(res.body.details, 'This data already exists.');
    assert.equal(typeof res.body.timestamp, 'string');
    assert.equal(res.body.requestId, 'req-409');
    assert.equal('stack' in res.body, false);
  });
});

test('errorHandler includes validation details and stack in development', () => {
  withNodeEnv('development', () => {
    const req = { url: '/jobs', method: 'POST', ip: '127.0.0.1', id: 'req-400' };
    const res = createMockResponse();
    const err = {
      name: 'ValidationError',
      details: 'title is required',
      message: 'invalid payload',
      stack: 'validation-stack',
    };
    const originalError = console.error;
    console.error = () => {};

    try {
      errorHandler(err, req, res, () => {});
    } finally {
      console.error = originalError;
    }

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Validation failed');
    assert.equal(res.body.details, 'title is required');
    assert.equal(res.body.stack, 'validation-stack');
    assert.equal(res.body.requestId, 'req-400');
  });
});

test('errorHandler hides internal details in production for generic errors', () => {
  withNodeEnv('production', () => {
    const req = { url: '/jobs', method: 'GET', ip: '127.0.0.1', id: 'req-500' };
    const res = createMockResponse();
    const err = new Error('database connection failed');
    const originalError = console.error;
    console.error = () => {};

    try {
      errorHandler(err, req, res, () => {});
    } finally {
      console.error = originalError;
    }

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, 'Internal Server Error');
    assert.equal('details' in res.body, false);
    assert.equal('stack' in res.body, false);
    assert.equal(res.body.requestId, 'req-500');
  });
});

test('notFoundHandler returns 404 response payload', () => {
  const req = { id: 'req-404' };
  const res = createMockResponse();

  notFoundHandler(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error, 'Resource not found');
  assert.equal(typeof res.body.timestamp, 'string');
  assert.equal(res.body.requestId, 'req-404');
});

test('asyncHandler forwards rejected errors to next', async () => {
  const expected = new Error('boom');
  const wrapped = asyncHandler(async () => {
    throw expected;
  });

  let received = null;
  await new Promise((resolve) => {
    wrapped({}, {}, (err) => {
      received = err;
      resolve();
    });
  });

  assert.equal(received, expected);
});
