import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaPaperclip } from 'react-icons/fa';

export default function MessageInput({ input, setInput, sending, selectedUser, currentUser, handleSend, onTyping }) {
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef(null);
  // Allow sending messages to yourself: only disable if sending or missing users
  const isDisabled = sending || !selectedUser || !currentUser || (selectedUser._id !== currentUser._id && !selectedUser);
  const canSend = !isDisabled && input && input.trim();

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Emit typing start
    if (onTyping) {
      onTyping(true);
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Set timeout to stop typing indicator after 1.5 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="px-6 py-4 bg-white">
      <div onSubmit={handleSend} className="relative">
        <div className={`
          relative flex items-center gap-3 bg-gray-50 rounded-2xl border-2 transition-all duration-300
          ${isFocused
            ? 'border-blue-500 shadow-lg shadow-blue-100'
            : 'border-gray-200 hover:border-gray-300'
          }
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}>
          {/* Emoji Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isDisabled}
            aria-label="Add emoji"
          >
            <FaSmile size={20} />
          </motion.button>

          {/* Input Field */}
          <input
            className="flex-1 bg-transparent px-2 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) {
                  if (onTyping) onTyping(false); // Stop typing on send
                  handleSend(e);
                }
              }
            }}
            placeholder={`Message ${selectedUser.role === 'recruiter' ? (selectedUser.companyName || 'Company') : (selectedUser.name || selectedUser.email)}`}
            disabled={isDisabled}
          />

          {/* Attachment Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isDisabled}
            aria-label="Attach file"
          >
            <FaPaperclip size={18} />
          </motion.button>

          {/* Send Button */}
          <div className="pr-2">
            <AnimatePresence mode="wait">
              {sending ? (
                <motion.div
                  key="sending"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={canSend ? { scale: 1.05 } : {}}
                  whileTap={canSend ? { scale: 0.95 } : {}}
                  type="button"
                  onClick={canSend ? handleSend : undefined}
                  className={`
                    w-11 h-11 rounded-xl flex items-center justify-center
                    transition-all duration-300 shadow-md
                    ${canSend
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200 hover:shadow-lg hover:shadow-blue-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                  disabled={!canSend}
                  aria-label="Send message"
                >
                  <motion.div
                    animate={canSend ? { x: [0, 2, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaPaperPlane size={16} />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Character Count (optional, shows when typing) */}
        <AnimatePresence>
          {input && input.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute -top-6 right-0 text-xs text-gray-400 font-medium"
            >
              {input.length} character{input.length !== 1 ? 's' : ''}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Text */}
      {/* No warning: allow sending messages to yourself */}
    </div>
  );
}