import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Page Not Found</h1>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/dashboard"
        className="px-6 py-2.5 bg-[var(--color-accent)] text-white font-semibold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)]"
      >
        Back to Dashboard
      </a>
    </div>
  );
}
