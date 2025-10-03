import React from 'react';
import { FaTachometerAlt, FaUser, FaBriefcase, FaBookmark, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, section: 'dashboard' },
  { label: 'Jobs', icon: <FaBriefcase />, section: 'jobs' },
  { label: 'Profile', icon: <FaUser />, section: 'profile' },
  { label: 'My Applications', icon: <FaBriefcase />, section: 'applications' },
  { label: 'Saved Jobs', icon: <FaBookmark />, section: 'saved' },
  { label: 'Messages', icon: <FaEnvelope />, section: 'messages' },
  { label: 'Settings', icon: <FaCog />, section: 'settings' },
  { label: 'Logout', icon: <FaSignOutAlt />, section: 'logout' },
];

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Sidebar({ activeSection, onSectionChange, unreadCount }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="bg-white shadow h-full w-64 min-w-[200px] flex flex-col p-4">
      <nav className="flex-1">
        {navItems.map(item => (
          <button
            key={item.label}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded mb-2 text-left hover:bg-blue-50 transition-colors ${activeSection === item.section ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => {
              if (item.section === 'logout') {
                handleLogout();
              } else if (item.section === 'profile') {
                navigate('/profile');
              } else if (item.section === 'jobs') {
                navigate('/jobs');
              } else if (item.section === 'dashboard') {
                navigate('/dashboard');
              } else if (item.section === 'saved') {
                navigate('/saved-jobs');
              } else if (item.section === 'applications') {
                navigate('/my-applications');
              } else if (item.section === 'applicants') {
                navigate('/applicants');
              } else if (item.section === 'messages') {
                navigate('/messages');
              } else {
                onSectionChange(item.section);
              }
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.section === 'messages' && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
