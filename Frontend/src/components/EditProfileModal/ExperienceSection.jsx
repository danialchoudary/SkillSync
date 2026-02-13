import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ExperienceSection({ form, handleChange, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          Years of Experience
        </label>
        <input
          name="years"
          type="number"
          min={0}
          max={50}
          value={form.experience.years}
          onChange={handleChange}
          className="w-full border border-[var(--color-border)] px-4 py-2.5 rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          placeholder="0"
        />
        {errors.years && (
          <p className="text-[var(--color-danger)] text-xs mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.years}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          Experience Summary <span className="text-[var(--color-text-tertiary)] text-xs font-normal">(Max 500 characters)</span>
        </label>
        <textarea
          name="summary"
          value={form.experience.summary}
          onChange={handleChange}
          className="w-full border border-[var(--color-border)] px-4 py-2.5 rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors outline-none resize-none bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          rows={4}
          maxLength={500}
          placeholder="Describe your professional experience and achievements..."
        />
        <div className="flex justify-between items-center mt-1.5">
          <div className="flex-1">
            {errors.summary && (
              <p className="text-[var(--color-danger)] text-xs flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.summary}
              </p>
            )}
          </div>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">
            {form.experience.summary.length}/500
          </span>
        </div>
      </div>
    </div>
  );
}
