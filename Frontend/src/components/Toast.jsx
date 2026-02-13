import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-[var(--shadow-md)] backdrop-blur-md ${type === 'error'
          ? 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/20 text-[var(--color-danger)]'
          : 'bg-[var(--color-success-bg)] border-[var(--color-success)]/20 text-[var(--color-success)]'
        }`}>
        {type === 'error' ? (
          <AlertCircle size={20} className="flex-shrink-0" />
        ) : (
          <CheckCircle size={20} className="flex-shrink-0" />
        )}
        <p className="text-sm font-bold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
