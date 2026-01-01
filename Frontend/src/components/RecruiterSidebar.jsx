import React, { useState } from 'react';
import { FaPlusSquare, FaBriefcase, FaUsers, FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaTachometerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', section: 'dashboard', icon: <FaTachometerAlt /> },
  { label: 'Post Job', section: 'post-job', icon: <FaPlusSquare /> },
  { label: 'My Jobs', section: 'myjobs', icon: <FaBriefcase /> },
  { label: 'Applicants', section: 'applicants', icon: <FaUsers /> },
  { label: 'Profile', section: 'profile', icon: <FaUser /> },
  { label: 'Messages', section: 'messages', icon: <FaEnvelope /> },
  { label: 'Settings', section: 'settings', icon: <FaCog /> },
  { label: 'Logout', section: 'logout', icon: <FaSignOutAlt /> },
];

const RecruiterSidebar = ({ activeSection, onSectionChange, unreadCount }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-b from-white to-gray-50/50 shadow-xl border-r border-gray-100 h-full min-h-screen w-64 min-w-[200px] flex flex-col "
      >
        {/* Top decorative accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ x: 4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left
                transition-all duration-300 ease-out group overflow-hidden
                ${activeSection === item.section
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 font-semibold'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600'
                }
                ${item.section === 'logout' ? 'mt-4' : ''}
              `}
              onClick={() => {
                if (item.section === 'logout') {
                  handleLogout();
                } else if (item.section === 'messages') {
                  navigate('/recruiter/message');
                } else {
                  onSectionChange(item.section);
                }
              }}
            >
              {/* Active indicator line */}
              {activeSection === item.section && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon with animation */}
              <motion.span
                className={`
                  text-lg transition-all duration-300
                  ${activeSection === item.section ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
                `}
                whileHover={{ rotate: activeSection === item.section ? 0 : 10, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.span>

              {/* Label */}
              <span className="flex-1 text-sm font-medium">{item.label}</span>

              {/* Unread messages badge */}
              {item.section === 'messages' && unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-md"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}

              {/* Hover glow effect */}
              {activeSection !== item.section && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-xl transition-all duration-300" />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-4 mb-4"></div>
      </motion.aside>

      {/* Enhanced Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={cancelLogout}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-t-2xl"></div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center"
                >
                  <FaSignOutAlt className="text-3xl text-red-600" />
                </motion.div>

                {/* Content */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 mb-2 text-center"
                >
                  Confirm Logout
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-gray-600 mb-8 text-center"
                >
                  Are you sure you want to logout from your account?
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-lg shadow-red-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    onClick={confirmLogout}
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300"
                    onClick={cancelLogout}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruiterSidebar;

