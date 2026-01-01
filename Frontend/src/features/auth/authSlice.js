import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    // Store token in localStorage for Socket.IO access
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
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
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(login.pending, state => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logout.fulfilled, state => { state.user = null; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; })
      .addCase(fetchCurrentUser.rejected, state => { state.user = null; });
  },
});

export default authSlice.reducer;