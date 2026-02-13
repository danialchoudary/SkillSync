import React from 'react';

const inputClass = "w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm placeholder-[var(--color-text-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] hover:border-gray-300";

export default function JobSeekerFields({ form, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
        <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Skills</label>
        <input name="skills" type="text" placeholder="React, Node.js" value={form.skills} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Experience</label>
        <input name="experience" type="text" placeholder="5 years in Dev" value={form.experience} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Resume Link</label>
        <input name="resumeLink" type="url" placeholder="https://drive..." value={form.resumeLink} onChange={handleChange} className={inputClass} />
      </div>
    </div>
  );
}
