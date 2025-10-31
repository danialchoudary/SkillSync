import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBuilding } from 'react-icons/fa';

export default function UserListItem({ user, currentUser, selectedUser, unread, onUserSelect }) {
  const isSelected = selectedUser && selectedUser._id === user._id;
  
  let avatar = null;
  if (user.role === 'recruiter') {
    if (user.companyLogo) {
      avatar = (
        <div className="relative">
          <img 
            src={`http://localhost:5000${user.companyLogo}`} 
            alt="logo" 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <FaBuilding className="text-white text-[8px]" />
          </div>
        </div>
      );
    } else {
      avatar = (
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-2 border-blue-300 shadow-sm">
          <FaBuilding className="text-blue-600 text-lg" />
        </div>
      );
    }
  } else {
    if (user.profilePicture) {
      avatar = (
        <div className="relative">
          <img 
            src={`http://localhost:5000${user.profilePicture}`} 
            alt="avatar" 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      );
    } else {
      avatar = (
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-2 border-gray-300 shadow-sm">
          <FaUser className="text-gray-600 text-lg" />
        </div>
      );
    }
  }

  return (
    <motion.li
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <button
        className={`
          flex items-center gap-4 w-full text-left px-4 py-3.5 
          transition-all duration-200 ease-in-out
          ${isSelected 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500' 
            : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200'
          }
        `}
        onClick={() => onUserSelect(user)}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={`
              text-sm font-semibold truncate
              ${isSelected ? 'text-blue-900' : 'text-gray-900'}
            `}>
              {user.role === 'recruiter' 
                ? (user.companyName || 'Unnamed Company') 
                : (user.name || user.email)
              }
            </h3>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-2 shadow-md"
              >
                {unread > 99 ? '99+' : unread}
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`
              text-xs truncate
              ${isSelected ? 'text-blue-700' : 'text-gray-500'}
            `}>
              {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
            </span>
            {user.role === 'recruiter' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                Company
              </span>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
          />
        )}
      </button>

      {/* Hover Effect Gradient */}
      <div className={`
        absolute inset-0 pointer-events-none transition-opacity duration-300
        ${isSelected ? 'opacity-0' : 'opacity-0 hover:opacity-100'}
      `}>
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
      </div>
    </motion.li>
  );
}