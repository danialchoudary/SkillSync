import React from 'react';

const inputClass = "w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm placeholder-[var(--color-text-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] hover:border-gray-300";

export default function RecruiterFields({ form, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Recruiter Name</label>
        <input name="recruiterName" type="text" placeholder="Jane Smith" value={form.recruiterName} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Company Name</label>
        <input name="companyName" type="text" placeholder="Tech Corp Inc." value={form.companyName} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Company Address</label>
        <input name="companyAddress" type="text" placeholder="123 Business St..." value={form.companyAddress} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Company Website</label>
        <input name="companyWebsite" type="url" placeholder="https://www..." value={form.companyWebsite} onChange={handleChange} className={inputClass} />
      </div>
    </div>
  );
}
