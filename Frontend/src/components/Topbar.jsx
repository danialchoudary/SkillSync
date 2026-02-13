import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { getImageUrl } from '../utils/urlHelper';

export default function Topbar({ user = {}, notifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleMobileNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
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

        {/* Right: User profile */}
        <div className="flex items-center gap-3">
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
    </>
  );
}
