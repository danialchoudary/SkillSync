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
        className={`relative px-4 py-3 rounded-2xl max-w-[75%] md:max-w-md shadow-md ${isMine
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
          }`}
      >
        {/* Message Content */}
        <div className={`text-sm leading-relaxed break-words ${isMine ? 'text-white' : 'text-gray-900'}`}>
          {msg.messageType === 'file' ? (
            <div className="space-y-2">
              {msg.fileType?.startsWith('image/') ? (
                <div className="relative group/img overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`}
                    alt={msg.fileName}
                    className="max-w-full max-h-60 object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMine ? 'bg-blue-400/30 border-blue-300/50' : 'bg-gray-50 border-gray-200'
                  }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMine ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{msg.fileName}</p>
                    <p className={`text-[10px] ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'File'}
                    </p>
                  </div>
                </div>
              )}
              <a
                href={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2 w-full text-xs font-bold rounded-lg transition-all ${isMine
                    ? 'bg-blue-700/50 hover:bg-blue-800/50 text-white border border-blue-400/30'
                    : 'bg-white hover:bg-gray-50 text-blue-600 border border-gray-200 shadow-sm'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          ) : (
            msg.content
          )}
        </div>

        {/* Timestamp */}
        <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-medium ${isMine ? 'justify-end text-blue-100' : 'justify-start text-gray-400'
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
        <div className={`absolute bottom-0 ${isMine
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