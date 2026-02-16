import React from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { getImageUrl } from '../utils/urlHelper';

export default function UserListItem({ user, selectedUser, unread, isOnline, onUserSelect }) {
  const isSelected = selectedUser && selectedUser._id === user._id;

  let avatar = null;
  if (user.role === 'recruiter') {
    if (user.companyLogo) {
      avatar = (
        <div className="relative">
          <img
            src={getImageUrl(user.companyLogo)}
            alt="logo"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--color-border)]"
          />
          {isOnline && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]"></div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center">
            <FaBuilding className="text-white text-[6px]" />
          </div>
        </div>
      );
    } else {
      avatar = (
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-accent-bg)] rounded-full">
            <FaBuilding className="text-[var(--color-accent)] text-sm" />
          </div>
          {isOnline && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]"></div>
          )}
        </div>
      );
    }
  } else {
    if (user.profilePicture) {
      avatar = (
        <div className="relative">
          <img
            src={getImageUrl(user.profilePicture)}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--color-border)]"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]"></div>
          )}
        </div>
      );
    } else {
      avatar = (
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-surface-secondary)] rounded-full">
            <FaUser className="text-[var(--color-text-tertiary)] text-sm" />
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]"></div>
          )}
        </div>
      );
    }
  }

  return (
    <li className="relative">
      <button
        className={`
          flex items-center gap-3 w-full text-left px-4 py-3
          transition-colors
          ${isSelected
            ? 'bg-[var(--color-accent-bg)] border-l-2 border-[var(--color-accent)]'
            : 'hover:bg-[var(--color-surface-secondary)] border-l-2 border-transparent'
          }
        `}
        onClick={() => onUserSelect(user)}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={`
              text-sm font-medium truncate
              ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}
            `}>
              {user.role === 'recruiter'
                ? (user.companyName || 'Unnamed Company')
                : (user.name || user.email)
              }
            </h3>
            {unread > 0 && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-danger)] text-white text-[10px] font-semibold rounded-full px-1.5">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`
              text-xs truncate
              ${isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}
            `}>
              {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
            </span>
            {user.role === 'recruiter' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                Company
              </span>
            )}
            {isOnline && (
              <span className="text-[10px] font-medium text-[var(--color-success)]">Active now</span>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex-shrink-0 w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full" />
        )}
      </button>
    </li>
  );
}
