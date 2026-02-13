import React from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { getImageUrl } from '../utils/urlHelper';

export default function ChatWindow({
  selectedUser, messages, loading, currentUser, input, setInput, sending, handleSend, onTyping, typingUsers
}) {
  const isTyping = typingUsers?.[selectedUser?._id];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-bg)] relative overflow-hidden">

      {selectedUser ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                {selectedUser.profilePicture || selectedUser.companyLogo ? (
                  <img
                    src={getImageUrl(selectedUser.profilePicture || selectedUser.companyLogo)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-sm">
                    {(selectedUser.name || selectedUser.companyName || selectedUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {selectedUser.role === 'recruiter'
                    ? (selectedUser.companyName || 'Unnamed Company')
                    : (selectedUser.name || selectedUser.email)
                  }
                </h2>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {selectedUser.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'} • Active now
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-[var(--color-text-tertiary)]">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No messages yet</h3>
                <p className="text-xs text-[var(--color-text-tertiary)] text-center max-w-xs">
                  Start the conversation by sending a message below
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.filter(Boolean).map((msg) => (
                  <MessageBubble key={msg._id} msg={msg} currentUser={currentUser} />
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mt-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span>{selectedUser.name || selectedUser.companyName} is typing...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <MessageInput
              input={input}
              setInput={setInput}
              sending={sending}
              selectedUser={selectedUser}
              currentUser={currentUser}
              handleSend={handleSend}
              onTyping={onTyping}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 py-6 overflow-hidden">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl lg:text-4xl">💭</span>
          </div>
          <h2 className="text-lg lg:text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Welcome to Messages
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md leading-relaxed">
            Select a conversation from the sidebar to start messaging.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <div className="px-3 py-1.5 bg-[var(--color-accent-bg)] rounded-full text-[var(--color-accent)] text-xs font-medium">
              Real-time messaging
            </div>
            <div className="px-3 py-1.5 bg-[var(--color-surface-secondary)] rounded-full text-[var(--color-text-secondary)] text-xs font-medium">
              Instant notifications
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
