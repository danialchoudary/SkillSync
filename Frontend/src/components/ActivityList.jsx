import React from 'react';
import { motion } from 'framer-motion';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  'under review': 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  shortlisted: 'bg-green-100 text-green-700',
  interview: 'bg-purple-100 text-purple-700',
};

export default function ActivityList({ activities }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h4 className="font-bold text-md mb-2">Recent Activity</h4>
      <ul className="space-y-2">
        {activities.map((activity, idx) => (
          <motion.li key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center">
            <span>{activity.text}</span>
            <span className={`px-2 py-1 rounded text-xs ml-2 ${statusColors[activity.status] || 'bg-gray-100 text-gray-700'}`}>{activity.status}</span>
            <span className="text-xs text-gray-400 ml-2">{activity.time}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
