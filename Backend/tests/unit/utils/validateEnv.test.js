import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../../../utils/validateEnv.js';

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const baseValidEnv = {
  MONGO_URI: 'mongodb://127.0.0.1:27017/skillsync_test',
  JWT_SECRET: 'supersecretvalue123',
  JWT_REFRESH_SECRET: 'refreshsecretvalue123',
  FRONTEND_URL: 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: 'demo-cloud',
  CLOUDINARY_API_KEY: 'demo-key',
  CLOUDINARY_API_SECRET: 'demo-secret',
};

function withEnv(overrides, fn) {
  const keys = Array.from(new Set([...REQUIRED_VARS, ...Object.keys(overrides)]));
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
    fn();
  } finally {
    for (const key of keys) {
      const prev = previous[key];
      if (typeof prev === 'undefined') {
        delete process.env[key];
      } else {
        process.env[key] = prev;
      }
    }
  }
}

test('validateEnv passes when all required variables are present', () => {
  withEnv(baseValidEnv, () => {
    const originalExit = process.exit;
    const originalWarn = console.warn;
    const originalError = console.error;
    let exitCalled = false;

    process.exit = () => {
      exitCalled = true;
      throw new Error('process.exit should not be called');
    };
    console.warn = () => {};
    console.error = () => {};

    try {
      validateEnv();
      assert.equal(exitCalled, false);
    } finally {
      process.exit = originalExit;
      console.warn = originalWarn;
      console.error = originalError;
    }
  });
});

test('validateEnv exits with code 1 when a required variable is missing', () => {
  withEnv({ ...baseValidEnv, FRONTEND_URL: undefined }, () => {
    const originalExit = process.exit;
    const originalError = console.error;
    const logs = [];
    const exitSignal = new Error('EXIT_SIGNAL');

    process.exit = (code) => {
      exitSignal.code = code;
      throw exitSignal;
    };
    console.error = (...args) => {
      logs.push(args.join(' '));
    };

    try {
      assert.throws(
        () => validateEnv(),
        (err) => err === exitSignal,
      );
      assert.equal(exitSignal.code, 1);
      assert.equal(logs.some((line) => line.includes('FRONTEND_URL')), true);
    } finally {
      process.exit = originalExit;
      console.error = originalError;
    }
  });
});

test('validateEnv warns when JWT secrets are too short', () => {
  withEnv(
    {
      ...baseValidEnv,
      JWT_SECRET: 'short-secret',
      JWT_REFRESH_SECRET: 'short-refresh',
    },
    () => {
      const originalExit = process.exit;
      const originalWarn = console.warn;
      const originalError = console.error;
      const warnings = [];

      process.exit = () => {
        throw new Error('process.exit should not be called');
      };
      console.warn = (...args) => {
        warnings.push(args.join(' '));
      };
      console.error = () => {};

      try {
        validateEnv();
        assert.equal(
          warnings.some((line) => line.includes('JWT_SECRET should be at least 16 characters')),
          true,
        );
        assert.equal(
          warnings.some((line) => line.includes('JWT_REFRESH_SECRET should be at least 16 characters')),
          true,
        );
      } finally {
        process.exit = originalExit;
        console.warn = originalWarn;
        console.error = originalError;
      }
    },
  );
});
