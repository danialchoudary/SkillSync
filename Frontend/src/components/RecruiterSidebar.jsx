
import React, { useState } from 'react';
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

const RecruiterSidebar = ({ activeSection, onSectionChange, unreadCount }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = (item) => {
    if (item.section === 'logout') {
      setShowLogoutModal(true);
    } else if (item.section === 'settings') {
      onSectionChange(item.section);
    } else if (item.section === 'messages') {
      navigate('/recruiter/message');
    } else {
      onSectionChange(item.section);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside
        className="bg-white shadow h-full w-64 min-w-[200px] flex flex-col p-4"
        style={showLogoutModal ? { pointerEvents: 'none', userSelect: 'none', opacity: 0.7 } : {}}
      >
        <nav className="flex-1">
          {navItems.map(item => (
            <button
              key={item.section}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded mb-2 text-left hover:bg-blue-50 transition-colors ${activeSection === item.section ? 'bg-blue-100 font-semibold' : ''}`}
              onClick={() => handleClick(item)}
              disabled={showLogoutModal}
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
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruiterSidebar;

