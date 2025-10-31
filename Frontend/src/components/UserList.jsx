import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserListItem from './UserListItem';

export default function UserList({
  users, currentUser, selectedUser, unread, search, setSearch, onUserSelect, userError, onRetryLoadUsers
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white flex flex-col h-full shadow-sm"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Messages</h2>
        <p className="text-xs text-gray-500 font-medium">{users.length} conversation{users.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="relative">
          <input
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200 text-lg"
            type="button"
            aria-label="Search"
            onClick={() => {}}
          >
            🔍
          </button>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </motion.button>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {userError ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 py-4"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium mb-2">{userError}</p>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
                      onClick={onRetryLoadUsers}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              {users.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-16 px-6"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">💬</span>
                  </div>
                  <p className="text-gray-400 text-center text-sm font-medium">No conversations found</p>
                  <p className="text-gray-300 text-center text-xs mt-1">Start a new chat to get connected</p>
                </motion.div>
              ) : (
                <motion.ul 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, staggerChildren: 0.05 }}
                  className="divide-y divide-gray-100"
                >
                  {users.map((user, idx) => (
                    <motion.li
                      key={user._id || user.email || idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <UserListItem
                        user={user}
                        currentUser={currentUser}
                        selectedUser={selectedUser}
                        unread={unread[user._id]}
                        onUserSelect={onUserSelect}
                      />
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}