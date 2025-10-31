import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({
  selectedUser, messages, loading, currentUser, input, setInput, sending, handleSend
}) {
  console.log('Selected user data:', selectedUser); // Debug log to verify selectedUser object

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.div
            key="chat-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* Chat Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {selectedUser.profilePicture || selectedUser.companyLogo ? (
                    <img
                      src={`http://localhost:5000${selectedUser.profilePicture || selectedUser.companyLogo || '/default-logo.png'}`}
                      alt="avatar"
                      className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                      {(selectedUser.name || selectedUser.companyName || selectedUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {selectedUser.role === 'recruiter' 
                      ? (selectedUser.companyName || 'Unnamed Company')
                      : (selectedUser.name || selectedUser.email)
                    }
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {selectedUser.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'} • Active now
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Messages Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mt-4">Loading messages...</p>
                  </motion.div>
                ) : messages.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
                      <span className="text-5xl">💬</span>
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-gray-400 text-sm text-center max-w-xs">
                      Start the conversation by sending a message below
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {messages.filter(Boolean).map((msg, idx) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <MessageBubble msg={msg} currentUser={currentUser} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Message Input */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="border-t border-gray-200 bg-white shadow-lg"
            >
              <MessageInput
                input={input}
                setInput={setInput}
                sending={sending}
                selectedUser={selectedUser}
                currentUser={currentUser}
                handleSend={handleSend}
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="no-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center relative z-10 px-6"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <span className="text-6xl relative z-10">💭</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-3"
            >
              Welcome to Messages
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-center max-w-md text-sm leading-relaxed"
            >
              Select a conversation from the sidebar to start messaging. Connect with recruiters and job seekers instantly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex gap-2"
            >
              <div className="px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-xs font-medium">
                Real-time messaging
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-xs font-medium">
                Instant notifications
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}