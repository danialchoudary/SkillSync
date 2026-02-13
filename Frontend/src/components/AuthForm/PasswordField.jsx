import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ value, onChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Password</label>
      <div className="relative">
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 pr-11 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm placeholder-[var(--color-text-tertiary)]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/15 focus:border-[var(--color-accent)] hover:border-gray-300"
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors p-1.5 rounded-md hover:bg-[var(--color-bg)]"
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
