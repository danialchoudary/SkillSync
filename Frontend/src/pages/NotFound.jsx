import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">404</h1>
      <p className="text-lg text-gray-500 mb-8">Sorry, the page you are looking for does not exist.</p>
      <a href="/dashboard" className="text-blue-500 hover:underline font-medium">Go to Dashboard</a>
    </div>
  );
}
