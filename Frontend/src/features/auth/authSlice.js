import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    // Store token in localStorage for Socket.IO access
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    // Return user or message; for verification flow, we might not get a user immediately if we wait for verification code
    // But duplicate email check happens here.
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/verify-email', data);
    // Store token in localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Verification failed');
  }

});

export const resendCode = createAsyncThunk('auth/resendCode', async (email, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-verification-code', { email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to resend code');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    // Store token in localStorage for Socket.IO access
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    // Clear token from localStorage
    localStorage.removeItem('token');
    return null;
  } catch (err) {
    localStorage.removeItem('token'); // Clear even on error
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
        // If registration returns a user directly (old flow), set it. 
        // If it returns a message (verification flow), we might not set user yet, or set a partial state.
        // For now, let's assume we handle the "verification needed" state in the component using the returned message/email.
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(verifyEmail.pending, state => { state.loading = true; state.error = null; })
      .addCase(verifyEmail.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })

      .addCase(verifyEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resendCode.pending, state => { state.loading = true; state.error = null; })
      .addCase(resendCode.fulfilled, state => { state.loading = false; })
      .addCase(resendCode.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(login.pending, state => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logout.fulfilled, state => { state.user = null; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(fetchCurrentUser.rejected, state => { state.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;