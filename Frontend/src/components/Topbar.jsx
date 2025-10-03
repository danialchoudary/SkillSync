import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding } from 'react-icons/fa';

export default function Topbar({ user = {}, notifications }) {
  const navigate = useNavigate();
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
    <header className="flex items-center justify-between bg-white shadow px-6 py-3">
      <div className="flex-1" />
      <div className="flex items-center gap-2 justify-end">
        <button
          className="font-semibold text-base focus:outline-none hover:underline"
          onClick={handleProfileClick}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
        >
          {name}
        </button>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none"
          onClick={handleProfileClick}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {isRecruiter ? <FaBuilding size={20} /> : <FaUser size={20} />}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
