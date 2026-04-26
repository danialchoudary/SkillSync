import React from 'react';
import UserListItem from './UserListItem';

export default function UserList({
  users, selectedUser, unread, isUserOnline, search, setSearch, onUserSelect, onDeleteUser, userError, onRetryLoadUsers
}) {
  return (
    <div className="w-full lg:w-[360px] xl:w-[400px] 2xl:w-[430px] lg:flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-0.5">Messages</h2>
        <p className="text-xs text-[var(--color-text-tertiary)]">{users.length} conversation{users.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <div className="relative">
          <input
            className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 pl-10 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/15 focus:border-[var(--color-accent)] transition-colors"
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] text-sm">
            🔍
          </span>
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-hidden">
        {userError ? (
          <div className="px-5 py-4">
            <div className="bg-[var(--color-danger-bg)] border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-[var(--color-danger)] text-lg flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="text-[var(--color-danger)] text-sm font-medium mb-2">{userError}</p>
                  <button
                    className="bg-[var(--color-danger)] hover:opacity-90 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    onClick={onRetryLoadUsers}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6">
                <div className="w-14 h-14 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] text-center">No conversations found</p>
                <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-1">Start a new chat to get connected</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {users.map((user, idx) => (
                  <li key={user._id || user.email || idx}>
                    <UserListItem
                      user={user}
                      selectedUser={selectedUser}
                      unread={unread[user._id]}
                      isOnline={isUserOnline?.(user._id)}
                      onUserSelect={onUserSelect}
                      onDeleteUser={onDeleteUser}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
