import React from 'react';
import { motion } from 'framer-motion';

export default function RoleToggle({ role, setRole }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4"
    >
      <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
        <button
          type="button"
          onClick={() => setRole('jobseeker')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
            role === 'jobseeker'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
            role === 'recruiter'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recruiter
        </button>
      </div>
    </motion.div>
  );
}
