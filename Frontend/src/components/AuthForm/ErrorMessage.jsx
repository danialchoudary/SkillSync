import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-lg relative animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle size={16} className="text-[var(--color-danger)] flex-shrink-0" />
      <span className="text-sm text-[var(--color-danger)] font-bold">{error}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--color-danger)]/50 hover:text-[var(--color-danger)] transition-colors p-1"
          aria-label="Dismiss error"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
}
