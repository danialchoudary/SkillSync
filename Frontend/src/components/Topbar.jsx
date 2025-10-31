import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Topbar({ user = {}, notifications }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isRecruiter = user?.role === 'recruiter';
  
  let imageUrl, name;
  if (isRecruiter) {
    imageUrl = user?.companyLogo ? `http://localhost:5000${user.companyLogo}` : null;
    name = user?.companyName || 'Company';
  } else {
    imageUrl = user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : null;
    name = user?.name || 'User';
  }
  
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
  className="sticky top-0 z-50 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-2"
    >
      <div className="flex-1" />
      
      <motion.div 
        className="flex items-center gap-3 justify-end"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <motion.button
          className="relative font-semibold text-sm text-gray-700 focus:outline-none transition-all duration-300 ease-out hover:text-blue-600 px-2 py-1 rounded-md group"
          onClick={handleProfileClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {name}
          <motion.span 
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </motion.button>
        
        <motion.button
          className="relative w-10 h-10 rounded-full flex items-center justify-center focus:outline-none group overflow-hidden ring-2 ring-transparent hover:ring-blue-500/30 transition-all duration-300"
          onClick={handleProfileClick}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {imageUrl ? (
            <motion.div
              className="relative w-full h-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={imageUrl} 
                alt="avatar" 
                className="w-full h-full rounded-full object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300" 
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10 transition-all duration-300" />
            </motion.div>
          ) : (
            <motion.span 
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 transition-all duration-300 shadow-sm group-hover:shadow-md"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {isRecruiter ? <FaBuilding size={18} /> : <FaUser size={18} />}
            </motion.span>
          )}
          
          {/* Pulse effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400/20"
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{ scale: 1.4, opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>
      </motion.div>
    </motion.header>
  );
}