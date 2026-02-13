import React from 'react';

export default function RoleToggle({ role, setRole }) {
  return (
    <div className="mb-6">
      <div className="bg-[var(--color-surface-secondary)] p-1 rounded-xl flex gap-1 border border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setRole('jobseeker')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${role === 'jobseeker'
            ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${role === 'recruiter'
            ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          Recruiter
        </button>
      </div>
    </div>
  );
}
