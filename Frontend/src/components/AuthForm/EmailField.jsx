import React from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EmailField({ value, onChange, emailValid }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Email Address</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
          <Mail size={16} />
        </div>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={value}
          onChange={onChange}
          className={`w-full pl-11 pr-10 py-2.5 bg-[var(--color-surface)] border rounded-lg text-[var(--color-text-primary)] text-sm placeholder-[var(--color-text-tertiary)]/50 transition-all focus:outline-none focus:ring-2 outline-none ${emailValid === false
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15'
              : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]/15 focus:border-[var(--color-accent)] hover:border-gray-300'
            }`}
          required
          autoComplete="username"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {emailValid === true && <CheckCircle2 size={16} className="text-[var(--color-success)]" />}
          {emailValid === false && <AlertCircle size={16} className="text-[var(--color-danger)]" />}
        </div>
      </div>
    </div>
  );
}
