import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatsCard({ stats }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded shadow p-4 flex flex-col gap-2 cursor-pointer hover:bg-blue-50 transition"
      onClick={() => navigate('/my-applications')}
      title="Go to My Applications"
    >
      <h4 className="font-bold text-md mb-2">Applications Overview</h4>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <span className="text-lg font-semibold">{value}</span>
            <span className="text-xs text-gray-500">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
