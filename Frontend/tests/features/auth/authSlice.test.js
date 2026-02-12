import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  clearError,
  fetchCurrentUser,
  login,
  logout,
  register,
  verifyEmail,
} from '../../../src/features/auth/authSlice.js';
import api from '../../../src/services/api.js';

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };
}

function createStore(preloadedAuthState) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: preloadedAuthState
      ? {
          auth: preloadedAuthState,
        }
      : undefined,
  });
}

beforeEach(() => {
  globalThis.localStorage = createLocalStorageMock();
  api.post = async () => {
    throw new Error('api.post mock not set for this test');
  };
  api.get = async () => {
    throw new Error('api.get mock not set for this test');
  };
});

test('auth reducer returns expected initial state', () => {
  const state = authReducer(undefined, { type: '@@INIT' });

  assert.deepEqual(state, {
    user: null,
    loading: false,
    error: null,
  });
});

test('clearError resets auth error field', () => {
  const state = authReducer(
    {
      user: null,
      loading: false,
      error: 'Invalid credentials',
    },
    clearError(),
  );

  assert.equal(state.error, null);
});

test('login success stores token and sets user', async () => {
  const credentials = { email: 'user@example.com', password: 'secret' };
  const user = { id: 'u1', role: 'jobSeeker' };
  let calledUrl = null;
  let calledPayload = null;

  api.post = async (url, payload) => {
    calledUrl = url;
    calledPayload = payload;
    return { data: { user, token: 'login-token' } };
  };

  const store = createStore();
  const action = await store.dispatch(login(credentials));

  assert.equal(action.type, 'auth/login/fulfilled');
  assert.equal(calledUrl, '/auth/login');
  assert.deepEqual(calledPayload, credentials);
  assert.deepEqual(store.getState().auth.user, user);
  assert.equal(store.getState().auth.loading, false);
  assert.equal(store.getState().auth.error, null);
  assert.equal(localStorage.getItem('token'), 'login-token');
});

test('login failure sets error message from API response', async () => {
  api.post = async () => {
    throw { response: { data: { error: 'Invalid credentials' } } };
  };

  const store = createStore();
  const action = await store.dispatch(login({ email: 'bad@example.com', password: 'bad' }));

  assert.equal(action.type, 'auth/login/rejected');
  assert.equal(store.getState().auth.loading, false);
  assert.equal(store.getState().auth.error, 'Invalid credentials');
});

test('register success stores token and user when returned', async () => {
  const payload = { name: 'Dev User', email: 'dev@example.com', password: 'secret' };
  const user = { id: 'u2', email: 'dev@example.com' };

  api.post = async () => ({ data: { user, token: 'register-token' } });

  const store = createStore();
  const action = await store.dispatch(register(payload));

  assert.equal(action.type, 'auth/register/fulfilled');
  assert.deepEqual(store.getState().auth.user, user);
  assert.equal(localStorage.getItem('token'), 'register-token');
});

test('verifyEmail success stores token and sets verified user', async () => {
  const verifiedUser = { id: 'u3', email: 'verified@example.com', isVerified: true };

  api.post = async () => ({ data: { user: verifiedUser, token: 'verify-token' } });

  const store = createStore();
  const action = await store.dispatch(verifyEmail({ email: 'verified@example.com', code: '123456' }));

  assert.equal(action.type, 'auth/verifyEmail/fulfilled');
  assert.deepEqual(store.getState().auth.user, verifiedUser);
  assert.equal(localStorage.getItem('token'), 'verify-token');
});

test('logout success clears token and user state', async () => {
  localStorage.setItem('token', 'persisted-token');
  api.post = async () => ({ data: {} });

  const store = createStore({
    user: { id: 'u4', role: 'recruiter' },
    loading: false,
    error: null,
  });

  const action = await store.dispatch(logout());

  assert.equal(action.type, 'auth/logout/fulfilled');
  assert.equal(store.getState().auth.user, null);
  assert.equal(localStorage.getItem('token'), null);
});

test('fetchCurrentUser success updates authenticated user', async () => {
  const currentUser = { _id: 'u5', email: 'me@example.com', role: 'jobSeeker' };
  api.get = async () => ({ data: currentUser });

  const store = createStore();
  const action = await store.dispatch(fetchCurrentUser());

  assert.equal(action.type, 'auth/me/fulfilled');
  assert.deepEqual(store.getState().auth.user, currentUser);
});

test('fetchCurrentUser failure resets authenticated user to null', async () => {
  api.get = async () => {
    throw new Error('unauthorized');
  };

  const store = createStore({
    user: { _id: 'u6', email: 'old@example.com' },
    loading: false,
    error: null,
  });

  const action = await store.dispatch(fetchCurrentUser());

  assert.equal(action.type, 'auth/me/rejected');
  assert.equal(store.getState().auth.user, null);
});
