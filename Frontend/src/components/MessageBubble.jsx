import React from 'react';
import { motion } from 'framer-motion';

export default function MessageBubble({ msg, currentUser }) {
  if (!msg || typeof msg !== 'object' || !('senderId' in msg)) return null;
  
  const isMine = currentUser && (
    msg.senderId === currentUser._id || 
    msg.senderId === currentUser.id || 
    (msg.senderId && msg.senderId.toString && msg.senderId.toString() === currentUser._id)
  );

  const formatTime = () => {
    if (!msg.createdAt) return '';
    const dateObj = new Date(msg.createdAt);
    const now = new Date();
    const msgDate = dateObj.toLocaleDateString();
    const today = now.toLocaleDateString();
    const yesterday = new Date(now.getTime() - 86400000).toLocaleDateString();
    
    let label = msgDate;
    if (msgDate === today) label = 'Today';
    else if (msgDate === yesterday) label = 'Yesterday';
    
    return `${label}, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'} group`}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={`relative px-4 py-3 rounded-2xl max-w-[75%] md:max-w-md shadow-md ${
          isMine
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
        }`}
      >
        {/* Message Content */}
        <div className={`text-sm leading-relaxed break-words ${isMine ? 'text-white' : 'text-gray-900'}`}>
          {msg.content}
        </div>

        {/* Timestamp */}
        <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-medium ${
          isMine ? 'justify-end text-blue-100' : 'justify-start text-gray-400'
        }`}>
          <span className="opacity-90">{formatTime()}</span>
          {isMine && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              className="w-3.5 h-3.5 text-blue-100"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </motion.svg>
          )}
        </div>

        {/* Message Tail */}
        <div className={`absolute bottom-0 ${
          isMine 
            ? 'right-0 translate-x-0.5' 
            : 'left-0 -translate-x-0.5'
        }`}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={isMine ? 'text-blue-600' : 'text-white'}
          >
            {isMine ? (
              <path
                d="M0 0 L12 0 L0 12 Z"
                fill="currentColor"
              />
            ) : (
              <path
                d="M12 0 L0 0 L12 12 Z"
                fill="currentColor"
              />
            )}
          </svg>
          {!isMine && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className="absolute top-0 left-0 text-gray-200"
            >
              <path
                d="M12 0 L0 0 L12 12 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          )}
        </div>

        {/* Hover Glow Effect */}
        <div className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          ${isMine 
            ? 'bg-gradient-to-br from-blue-400 to-blue-500 blur-md -z-10' 
            : 'bg-gray-100 blur-md -z-10'
          }
        `}></div>
      </motion.div>
    </motion.div>
  );
}