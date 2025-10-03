import React from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {message}
      <button className="ml-3 text-white font-bold" onClick={onClose}>×</button>
    </div>
  );
}
