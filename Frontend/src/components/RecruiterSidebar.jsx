import React, { useState } from 'react';
import { FaPlusSquare, FaBriefcase, FaUsers, FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaTachometerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { AnimatePresence, motion } from 'framer-motion';

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
      <aside className="bg-[var(--color-surface)] border-r border-[var(--color-border)] h-full min-h-0 w-64 min-w-[200px] flex flex-col">
        <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`
                relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left
                transition-colors cursor-pointer border-none
                ${activeSection === item.section
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]'
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
              {/* Active indicator */}
              {activeSection === item.section && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--color-accent)] rounded-full" />
              )}

              {/* Icon */}
              <span className={`text-base ${activeSection === item.section ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`}>
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1 text-sm">{item.label}</span>

              {/* Unread badge */}
              {item.section === 'messages' && unreadCount > 0 && (
                <span className="ml-auto bg-[var(--color-danger)] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={cancelLogout}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
                  <FaSignOutAlt className="text-lg text-[var(--color-danger)]" />
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1 text-center">
                  Sign out
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
                  Are you sure you want to sign out?
                </p>

                <div className="flex gap-3">
                  <button
                    className="flex-1 px-4 py-2.5 bg-[var(--color-danger)] text-white rounded-lg font-medium text-sm hover:bg-[#E5342B] transition-colors"
                    onClick={confirmLogout}
                  >
                    Sign out
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-lg font-medium text-sm hover:bg-[var(--color-border)] transition-colors"
                    onClick={cancelLogout}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruiterSidebar;
