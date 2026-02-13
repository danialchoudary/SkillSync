import React from 'react';

export default function SubmitButton({ loading, type }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{type === 'login' ? 'Signing in...' : 'Processing...'}</span>
        </>
      ) : (
        <span>{type === 'login' ? 'Sign in' : 'Create account'}</span>
      )}
    </button>
  );
}
