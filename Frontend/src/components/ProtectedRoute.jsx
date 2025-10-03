import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, error } = useSelector(state => state.auth);

  // Show loading spinner while auth status is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error message if there is an auth error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error === null ? 'Unauthorized access.' : error}</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // Redirect to dashboard if role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authorized
  return children;
}