import React from 'react';
import { Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PhoneField({ value, onChange, phoneValid }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
        Phone Number
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
          <Smartphone size={16} />
        </div>
        <input
          name="phoneNumber"
          type="tel"
          placeholder="+923001234567"
          value={value}
          onChange={onChange}
          className={`w-full pl-11 pr-10 py-2.5 bg-[var(--color-surface)] border rounded-lg text-[var(--color-text-primary)] text-sm placeholder-[var(--color-text-tertiary)]/50 transition-all focus:outline-none focus:ring-2 outline-none ${
            phoneValid === false
              ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/15'
              : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]/15 focus:border-[var(--color-accent)] hover:border-gray-300'
          }`}
          required
          autoComplete="tel"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {phoneValid === true && <CheckCircle2 size={16} className="text-[var(--color-success)]" />}
          {phoneValid === false && <AlertCircle size={16} className="text-[var(--color-danger)]" />}
        </div>
      </div>
    </div>
  );
}
