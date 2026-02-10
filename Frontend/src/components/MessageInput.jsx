import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaPaperclip, FaTimes } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { uploadMessageFile } from '../services/messagesApi';

export default function MessageInput({ input, setInput, sending, selectedUser, currentUser, handleSend, onTyping }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Allow sending messages to yourself: only disable if sending or missing users
  const isDisabled = sending || isUploading || !selectedUser || !currentUser || (selectedUser._id !== currentUser._id && !selectedUser);
  const canSend = !isDisabled && (input?.trim() || selectedFile);

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

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!canSend) return;

    let messageOptions = {};

    if (selectedFile) {
      setIsUploading(true);
      try {
        const fileRes = await uploadMessageFile(selectedFile);
        messageOptions = {
          messageType: 'file',
          fileUrl: fileRes.fileUrl,
          fileName: fileRes.fileName,
          fileType: fileRes.fileType,
          fileSize: fileRes.fileSize
        };
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('File upload failed:', err);
        alert('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    if (onTyping) onTyping(false);
    handleSend(e, messageOptions);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="px-6 py-4 bg-white relative">
      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 p-2 bg-blue-50 rounded-xl flex items-center justify-between border border-blue-100"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <FaPaperclip className="text-white" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-blue-600 font-medium uppercase">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/')[1] || 'File'}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Emoji Picker */}
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50">
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </motion.div>
          )}
        </div>

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
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`ml-4 transition-colors duration-200 ${showEmojiPicker ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                  handleSendMessage(e);
                }
              }
            }}
            placeholder={`Message ${selectedUser.role === 'recruiter' ? (selectedUser.companyName || 'Company') : (selectedUser.name || selectedUser.email)}`}
            disabled={isDisabled}
          />

          {/* Attachment Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isDisabled}
            aria-label="Attach file"
          >
            <FaPaperclip size={18} />
          </motion.button>

          {/* Send Button */}
          <div className="pr-2">
            <AnimatePresence mode="wait">
              {sending || isUploading ? (
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
                  onClick={canSend ? handleSendMessage : undefined}
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

        {/* Character Count */}
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
    </div>
  );
}