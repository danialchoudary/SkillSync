import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillsSection({ form, setForm, errors, handleSkillAdd, handleSkillRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Skills <span className="text-gray-400 text-xs font-normal">(Max 25)</span>
      </label>
      <div className="flex gap-2 mb-3">
        <input
          value={form.skillInput || ''}
          onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd(form.skillInput))}
          className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
          placeholder="Add a skill (e.g., JavaScript)"
          maxLength={30}
        />
        <button
          type="button"
          onClick={() => handleSkillAdd(form.skillInput)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        <AnimatePresence>
          {form.skills.map((skill, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(i)}
                className="text-blue-600 hover:text-red-500 hover:bg-white rounded-full p-0.5 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {errors.skills && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.skills}
        </motion.p>
      )}
    </motion.div>
  );
}
