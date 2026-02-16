import React, { useState, useRef, useEffect } from 'react';
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

  const currentUserId = currentUser?._id || currentUser?.id;
  const selectedUserId = selectedUser?._id || selectedUser?.id;
  const isSelfConversation = Boolean(currentUserId && selectedUserId && currentUserId === selectedUserId);
  const isDisabled = sending || isUploading || !selectedUser || !currentUserId || isSelfConversation;
  const canSend = !isDisabled && (input?.trim() || selectedFile);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 1500);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="px-5 py-3 bg-[var(--color-surface)] relative">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2.5 p-2 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-between border border-blue-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center shrink-0">
              <FaPaperclip className="text-white" size={12} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-[var(--color-accent)]">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/')[1] || 'File'}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      <div className="relative">
        {/* Emoji Picker */}
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50">
          {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick} />}
        </div>

        <div className={`
          relative flex items-center gap-2.5 bg-[var(--color-surface-secondary)] rounded-xl border transition-colors
          ${isFocused
            ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/15'
            : 'border-[var(--color-border)] hover:border-gray-300'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {/* Emoji */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`ml-3 transition-colors ${showEmojiPicker ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            disabled={isDisabled}
            aria-label="Add emoji"
          >
            <FaSmile size={18} />
          </button>

          {/* Input */}
          <input
            className="flex-1 bg-transparent px-1 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none disabled:cursor-not-allowed"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) handleSendMessage(e);
              }
            }}
            placeholder={`Message ${selectedUser.role === 'recruiter' ? (selectedUser.companyName || 'Company') : (selectedUser.name || selectedUser.email)}`}
            disabled={isDisabled}
          />

          {/* Attach */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            disabled={isDisabled}
            aria-label="Attach file"
          >
            <FaPaperclip size={16} />
          </button>

          {/* Send */}
          <div className="pr-2">
            {sending || isUploading ? (
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={canSend ? handleSendMessage : undefined}
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                  ${canSend
                    ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
                    : 'bg-gray-200 text-[var(--color-text-tertiary)] cursor-not-allowed'
                  }
                `}
                disabled={!canSend}
                aria-label="Send message"
              >
                <FaPaperPlane size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Character Count */}
        {input && input.length > 0 && (
          <div className="absolute -top-5 right-0 text-[10px] text-[var(--color-text-tertiary)]">
            {input.length} character{input.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
