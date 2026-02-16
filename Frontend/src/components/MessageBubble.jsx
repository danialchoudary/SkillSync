import React from 'react';

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (value.id) return String(value.id);
  }
  return String(value);
}

export default function MessageBubble({ msg, currentUser }) {
  if (!msg || typeof msg !== 'object' || !('senderId' in msg)) return null;

  const currentUserId = getId(currentUser?._id || currentUser?.id);
  const messageSenderId = getId(msg.senderId);
  const isMine = Boolean(currentUserId && messageSenderId && currentUserId === messageSenderId);

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
    <div className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative px-4 py-2.5 rounded-2xl max-w-[75%] md:max-w-md ${isMine
          ? 'bg-[var(--color-accent)] text-white rounded-br-md'
          : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-bl-md border border-[var(--color-border)]'
          }`}
      >
        {/* Content */}
        <div className={`text-sm leading-relaxed break-words ${isMine ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
          {msg.messageType === 'file' ? (
            <div className="space-y-2">
              {msg.fileType?.startsWith('image/') ? (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`}
                    alt={msg.fileName}
                    className="max-w-full max-h-60 object-contain"
                  />
                </div>
              ) : (
                <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${isMine ? 'bg-white/10 border-white/20' : 'bg-[var(--color-surface-secondary)] border-[var(--color-border)]'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20 text-white' : 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{msg.fileName}</p>
                    <p className={`text-[10px] ${isMine ? 'text-white/60' : 'text-[var(--color-text-tertiary)]'}`}>
                      {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'File'}
                    </p>
                  </div>
                </div>
              )}
              <a
                href={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `http://localhost:5000${msg.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1.5 py-1.5 w-full text-xs font-medium rounded-lg transition-colors ${isMine
                  ? 'bg-white/15 hover:bg-white/25 text-white'
                  : 'bg-[var(--color-surface-secondary)] hover:bg-gray-200 text-[var(--color-accent)]'
                  }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className={`flex items-center gap-1 mt-1.5 text-[10px] ${isMine ? 'justify-end text-white/60' : 'justify-start text-[var(--color-text-tertiary)]'}`}>
          <span>{formatTime()}</span>
          {isMine && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
