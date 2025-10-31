import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorMessage({ error, onClose }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg relative"
        >
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-700 font-medium">{error}</span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-lg font-bold px-2 py-0.5 rounded focus:outline-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
