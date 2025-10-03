import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import unreadReducer from '../features/messages/unreadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    unread: unreadReducer,
  },
});