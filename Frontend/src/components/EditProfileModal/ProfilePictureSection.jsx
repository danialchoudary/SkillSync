import React from 'react';
import { getImageUrl } from '../../utils/urlHelper';
import { Camera, Upload, AlertCircle } from 'lucide-react';

export default function ProfilePictureSection({ user, profilePicUploading, profilePicError, handleProfilePicUpload }) {
  return (
    <div className="flex items-center gap-6 pb-6 border-b border-[var(--color-border)]">
      <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-pic-upload-input').click()}>
        <img
          src={getImageUrl(user.profilePicture) || '/default-avatar.png'}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover ring-2 ring-[var(--color-border)] transition-all duration-300 group-hover:ring-[var(--color-accent)] bg-[var(--color-surface-secondary)]"
          onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
        />
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">Profile Picture</h4>
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3">JPG or PNG. Max size of 800K.</p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          id="profile-pic-upload-input"
          onChange={handleProfilePicUpload}
        />

        <button
          type="button"
          onClick={() => document.getElementById('profile-pic-upload-input').click()}
          disabled={profilePicUploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--color-border)]"
        >
          {profilePicUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Change Picture</span>
            </>
          )}
        </button>

        {profilePicError && (
          <p className="text-[var(--color-danger)] text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {profilePicError}
          </p>
        )}
      </div>
    </div>
  );
}
