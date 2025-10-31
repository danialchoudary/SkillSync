import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBriefcase, FaCheckCircle, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

export default function StatsCard({ stats }) {
  const navigate = useNavigate();
  
  // Icon and color mapping for each stat
  const statConfig = {
    Applied: { 
      icon: FaBriefcase, 
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-600',
      shadowColor: 'shadow-blue-500/20'
    },
    Accepted: { 
      icon: FaCheckCircle, 
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600',
      shadowColor: 'shadow-green-500/20'
    },
    Rejected: { 
      icon: FaTimesCircle, 
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50',
      textColor: 'text-red-600',
      shadowColor: 'shadow-red-500/20'
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group"
      onClick={() => navigate('/my-applications')}
      title="Go to My Applications"
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FaBriefcase className="text-white text-lg" />
          </div>
          <h4 className="font-bold text-lg text-gray-900">
            Applications Overview
          </h4>
        </div>
        
        <motion.div
          className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ x: 4 }}
        >
          <FaArrowRight />
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value], index) => {
          const config = statConfig[key] || statConfig.Applied;
          const Icon = config.icon;
          
          return (
            <motion.div 
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br hover:shadow-md transition-all duration-300 relative overflow-hidden group/stat"
              style={{
                background: `linear-gradient(135deg, ${
                  key === 'Applied' ? '#eff6ff' : 
                  key === 'Accepted' ? '#f0fdf4' : '#fef2f2'
                } 0%, ${
                  key === 'Applied' ? '#e0f2fe' : 
                  key === 'Accepted' ? '#dcfce7' : '#fee2e2'
                } 100%)`
              }}
            >
              {/* Decorative circle */}
              <div className={`absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br ${config.gradient} opacity-5 rounded-full`}></div>
              
              {/* Icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: 'spring', duration: 0.6 }}
                className={`mb-3 p-2 rounded-lg bg-gradient-to-br ${config.gradient} ${config.shadowColor} shadow-md`}
              >
                <Icon className="text-white text-xl" />
              </motion.div>
              
              {/* Value with counter animation */}
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`text-3xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-1`}
              >
                {value}
              </motion.span>
              
              {/* Label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                {key}
              </motion.span>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/stat:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom decoration */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-6 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full opacity-20"
      ></motion.div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-2xl"></div>
    </motion.div>
  );
}