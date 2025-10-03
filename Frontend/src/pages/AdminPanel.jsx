import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function AdminPanel() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="mb-4">Welcome, {user?.name}!</div>
      <button className="btn" onClick={() => dispatch(logout())}>Logout</button>
    </div>
  );
}