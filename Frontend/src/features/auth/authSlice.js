import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { disconnectSocket } from '../../services/socketService.js';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    // Store token in localStorage for Socket.IO access
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Registration failed');
  }
});

export const startPasskeyRegistration = createAsyncThunk('auth/startPasskeyRegistration', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/passkey/register/options', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to start passkey registration');
  }
});

export const completePasskeyRegistration = createAsyncThunk('auth/completePasskeyRegistration', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/passkey/register/verify', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to complete passkey registration');
  }
});

export const startPasskeyLogin = createAsyncThunk('auth/startPasskeyLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/passkey/login/options', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to start passkey login');
  }
});

export const completePasskeyLogin = createAsyncThunk('auth/completePasskeyLogin', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/passkey/login/verify', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to complete passkey login');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-otp', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Verification failed');
  }
});

export const verifyOtp = verifyEmail;

export const resendOtp = createAsyncThunk('auth/resendOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-otp', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to resend code');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data || { error: 'Login failed' });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    disconnectSocket();
    localStorage.removeItem('token');
    return null;
  } catch (err) {
    disconnectSocket();
    localStorage.removeItem('token');
    return rejectWithValue('Logout failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(null);
  }
});

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(startPasskeyRegistration.pending, state => { state.loading = true; state.error = null; })
      .addCase(startPasskeyRegistration.fulfilled, state => { state.loading = false; })
      .addCase(startPasskeyRegistration.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(completePasskeyRegistration.pending, state => { state.loading = true; state.error = null; })
      .addCase(completePasskeyRegistration.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(completePasskeyRegistration.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(startPasskeyLogin.pending, state => { state.loading = true; state.error = null; })
      .addCase(startPasskeyLogin.fulfilled, state => { state.loading = false; })
      .addCase(startPasskeyLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(completePasskeyLogin.pending, state => { state.loading = true; state.error = null; })
      .addCase(completePasskeyLogin.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(completePasskeyLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(verifyOtp.pending, state => { state.loading = true; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(resendOtp.pending, state => { state.loading = true; state.error = null; })
      .addCase(resendOtp.fulfilled, state => { state.loading = false; })
      .addCase(resendOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(login.pending, state => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload?.error || action.payload; })
      .addCase(logout.fulfilled, state => { state.user = null; })
      .addCase(fetchCurrentUser.pending, state => { state.loading = !state.user; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(fetchCurrentUser.rejected, state => { state.loading = false; state.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
