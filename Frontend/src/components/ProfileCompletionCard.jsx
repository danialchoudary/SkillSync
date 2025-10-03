import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileCompletionCard({ percent, missingFields = [] }) {
  const navigate = useNavigate();
  return (
    <button
      className="bg-white rounded shadow p-4 flex flex-col gap-2 cursor-pointer hover:bg-blue-50 transition"
      onClick={() => navigate('/profile')}
      type="button"
      aria-label="Go to profile"
    >
      <h4 className="font-bold text-md mb-2">Profile Completion</h4>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
      <span className="text-xs text-gray-500">{percent}% completed</span>
      {missingFields.length > 0 && (
        <div className="mt-2 text-xs text-red-500 text-left">
          <span className="font-semibold">Missing:</span>
          <ul className="list-disc ml-4">
            {missingFields.map((field, idx) => (
              <li key={idx}>{field}</li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}
