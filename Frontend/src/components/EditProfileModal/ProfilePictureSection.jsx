import React from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/urlHelper';

export default function ProfilePictureSection({ user, profilePicUploading, profilePicError, handleProfilePicUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-6 pb-6 border-b border-gray-100"
    >
      <div className="relative group">
        <img
          src={getImageUrl(user.profilePicture) || '/default-avatar.png'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 transition-all duration-300 group-hover:ring-blue-300 bg-gray-100"
          onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
        />
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Profile Picture</h4>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: 'none' }}
          id="profile-pic-upload-input"
          onChange={handleProfilePicUpload}
        />
        <button
          type="button"
          onClick={() => document.getElementById('profile-pic-upload-input').click()}
          disabled={profilePicUploading}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {profilePicUploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Change Picture'}
        </button>
        {profilePicError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-2"
          >
            {profilePicError}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
