import React from 'react';
import { motion } from 'framer-motion';

export default function ExperienceSection({ form, handleChange, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Years of Experience
        </label>
        <input
          name="years"
          type="number"
          min={0}
          max={50}
          value={form.experience.years}
          onChange={handleChange}
          className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
          placeholder="0"
        />
        {errors.years && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.years}
          </motion.p>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Experience Summary <span className="text-gray-400 text-xs font-normal">(Max 500 characters)</span>
        </label>
        <textarea
          name="summary"
          value={form.experience.summary}
          onChange={handleChange}
          className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
          rows={4}
          maxLength={500}
          placeholder="Describe your professional experience and achievements..."
        />
        <div className="flex justify-between items-center mt-1.5">
          <div>
            {errors.summary && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.summary}
              </motion.p>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {form.experience.summary.length}/500
          </span>
        </div>
      </div>
    </motion.div>
  );
}
