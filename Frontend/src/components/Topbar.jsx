import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaBuilding, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { getImageUrl } from '../utils/urlHelper';
import { getNotifications, markAsRead } from '../services/notificationApi';
import { onEvent, offEvent } from '../services/socketService';

export default function Topbar({ user = {}, notifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';

  let imageUrl, name;
  if (isRecruiter) {
    imageUrl = getImageUrl(user?.companyLogo);
    name = user?.companyName || 'Company';
  } else {
    imageUrl = getImageUrl(user?.profilePicture);
    name = user?.name || 'User';
  }

  const handleProfileClick = () => {
    navigate(isRecruiter ? '/recruiter/profile' : '/profile');
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications();
        setNotificationsList(data);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    if (user?._id || user?.id) {
      fetchNotifs();
    }

    // Socket listener for real-time notifications
    const handleNewNotification = (notification) => {
      setNotificationsList((prev) => [notification, ...prev]);
    };

    onEvent('new_notification', handleNewNotification);

    return () => {
      offEvent('new_notification', handleNewNotification);
    };
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        setNotificationsList((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const unreadCount = notificationsList.filter(n => !n.isRead).length;

  const handleMobileNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
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

  const mobileLinks = isRecruiter
    ? [
      { label: 'Dashboard', path: '/recruiter' },
      { label: 'Post Job', path: '/recruiter/post-job' },
      { label: 'My Jobs', path: '/recruiter/myjobs' },
      { label: 'Applicants', path: '/recruiter/applicants' },
      { label: 'Messages', path: '/recruiter/message' },
      { label: 'Profile', path: '/recruiter/profile' },
    ]
    : isAdmin
      ? [
        { label: 'Admin Panel', path: '/admin' },
        { label: 'Jobs', path: '/jobs' },
        { label: 'Messages', path: '/messages' },
        { label: 'Profile', path: '/profile' },
      ]
      : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Jobs', path: '/jobs' },
        { label: 'Saved Jobs', path: '/saved-jobs' },
        { label: 'My Applications', path: '/my-applications' },
        { label: 'Messages', path: '/messages' },
        { label: 'Profile', path: '/profile' },
      ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 sm:px-6 h-14">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
            SkillSync
          </span>
        </div>

        {/* Right: Notifications + User profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] rounded-full transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--color-surface)]"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] rounded-xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-secondary)]/50">
                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {notificationsList.length === 0 ? (
                        <div className="px-4 py-8 text-center flex flex-col items-center">
                          <div className="w-12 h-12 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-3">
                            <FaBell className="text-[var(--color-text-tertiary)] text-lg" />
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] font-medium">No notifications yet</p>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">We'll let you know when something arrives</p>
                        </div>
                      ) : (
                        notificationsList.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 cursor-pointer transition-colors hover:bg-[var(--color-surface-secondary)] ${
                              !notif.isRead ? 'bg-[var(--color-accent-bg)]/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-[var(--color-border)]">
                                {notif.image ? (
                                  <img
                                    src={getImageUrl(notif.image)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaBell className="text-[var(--color-text-tertiary)] text-sm" />
                                )}
                              </div>
                              {!notif.isRead && (
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)] flex-shrink-0"></div>
                              )}
                              <div>
                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] mt-2 block font-medium uppercase tracking-wider">
                                  {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block"></div>
          <button
            className="hidden sm:block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent border-none"
            onClick={handleProfileClick}
          >
            {name}
          </button>

          <button
            className="relative w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-transparent border-none cursor-pointer ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)] transition-all"
            onClick={handleProfileClick}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="w-full h-full rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                {isRecruiter ? <FaBuilding size={15} /> : <FaUser size={15} />}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 z-[60] w-72 max-w-[85vw] bg-[var(--color-surface)] border-r border-[var(--color-border)] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)]">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">SkillSync</span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-2 px-3">
                {mobileLinks.map((link) => {
                  const active = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => handleMobileNavigate(link.path)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${active
                        ? 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] font-semibold'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-red-100 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
              onClick={cancelLogout}
            />

            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] p-6 w-full max-w-sm"
                onClick={(event) => event.stopPropagation()}
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
                    type="button"
                    className="flex-1 px-4 py-2.5 bg-[var(--color-danger)] text-white rounded-lg font-medium text-sm hover:bg-[#E5342B] transition-colors"
                    onClick={confirmLogout}
                  >
                    Sign out
                  </button>
                  <button
                    type="button"
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
}
