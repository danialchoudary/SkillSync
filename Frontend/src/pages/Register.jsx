import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForm from '../components/AuthForm';
import { register } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'recruiter') navigate('/recruiter');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <AuthForm type="register" onSubmit={data => dispatch(register(data))} loading={loading} error={error} />
        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-500 hover:underline font-medium">Login</Link>
        </div>
      </div>
  );
}