
import React from 'react';
import { FaPlusSquare, FaBriefcase, FaUsers, FaUser, FaCog, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

const navItems = [
  { label: 'Post Job', section: 'dashboard', icon: <FaPlusSquare /> },
  { label: 'My Jobs', section: 'myjobs', icon: <FaBriefcase /> },
  { label: 'Applicants', section: 'applicants', icon: <FaUsers /> },
  { label: 'Profile', section: 'profile', icon: <FaUser /> },
  { label: 'Messages', section: 'messages', icon: <FaEnvelope /> },
  { label: 'Settings', section: 'settings', icon: <FaCog /> },
  { label: 'Logout', section: 'logout', icon: <FaSignOutAlt /> },
];

export default function RecruiterSidebar({ activeSection, onSectionChange, unreadCount }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.section === 'logout') {
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } else if (item.section === 'settings') {
      onSectionChange(item.section);
    } else if (item.section === 'messages') {
      navigate('/recruiter/message');
    } else {
      onSectionChange(item.section);
    }
  };

  return (
    <aside className="bg-white shadow h-full w-64 min-w-[200px] flex flex-col p-4">
      <nav className="flex-1">
        {navItems.map(item => (
          <button
            key={item.section}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded mb-2 text-left hover:bg-blue-50 transition-colors ${activeSection === item.section ? 'bg-blue-100 font-semibold' : ''}`}
            onClick={() => handleClick(item)}
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
