import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllUsers } from '../../services/userApi';
import { fetchConversation } from '../../services/messagesApi';
import { getMe } from '../../services/api';

export const fetchUnreadCount = createAsyncThunk('messages/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const meRes = await getMe();
    const currentUser = meRes.data;
    const usersRes = await fetchAllUsers();
    const users = Array.isArray(usersRes.data) ? usersRes.data : [];
    let count = 0;
    for (const user of users) {
      if (!user._id || user._id === currentUser._id) continue;
      const convRes = await fetchConversation(user._id);
      count += convRes.data.filter(m => m.senderId === user._id && !m.seen).length;
    }
    return count;
  } catch (err) {
    return rejectWithValue(0);
  }
});

const unreadSlice = createSlice({
  name: 'unread',
  initialState: { count: 0 },
  reducers: {
    setUnreadCount(state, action) {
      state.count = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.count = action.payload;
    });
  },
});

export const { setUnreadCount } = unreadSlice.actions;
export default unreadSlice.reducer;
