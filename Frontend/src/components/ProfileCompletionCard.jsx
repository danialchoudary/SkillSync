import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';

export default function ProfileCompletionCard({ percent, missingFields = [] }) {
  const navigate = useNavigate();
  const isComplete = percent === 100;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-3 cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group text-left w-full"
      onClick={() => navigate('/profile')}
      type="button"
      aria-label="Go to profile"
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-1">
        <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          {isComplete ? (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <FaCheckCircle className="text-green-500 text-xl" />
            </motion.span>
          ) : (
            <FaExclamationCircle className="text-amber-500 text-xl" />
          )}
          Profile Completion
        </h4>
        
        <motion.div
          className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ x: 4 }}
        >
          <FaArrowRight />
        </motion.div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative z-10">
        <div className="relative w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className={`h-full rounded-full relative ${
              isComplete 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
            }`}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </div>
        
        {/* Percentage Display */}
        <div className="flex items-center justify-between">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm font-bold ${
              isComplete ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {percent}% completed
          </motion.span>
          
          {!isComplete && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-gray-500 font-medium"
            >
              {100 - percent}% remaining
            </motion.span>
          )}
        </div>
      </div>

      {/* Missing Fields Section */}
      {missingFields.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative z-10 mt-2 pt-4 border-t border-gray-100"
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                {missingFields.length}
              </span>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-sm text-gray-700 block mb-2">
                Complete your profile:
              </span>
              <ul className="space-y-1.5">
                {missingFields.map((field, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-2 text-xs text-gray-600 group/item"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover/item:bg-amber-500 transition-colors"></span>
                    <span className="group-hover/item:text-gray-900 transition-colors">{field}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Complete Badge */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="relative z-10 mt-2 pt-4 border-t border-gray-100"
        >
          <div className="flex items-center gap-2 text-green-600">
            <FaCheckCircle className="text-lg" />
            <span className="text-sm font-semibold">
              Your profile is complete! 🎉
            </span>
          </div>
        </motion.div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-2xl"></div>
    </motion.button>
  );
}