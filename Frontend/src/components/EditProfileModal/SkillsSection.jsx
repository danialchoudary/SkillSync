import React from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';

export default function SkillsSection({ form, setForm, errors, handleSkillAdd, handleSkillRemove }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
        Skills <span className="text-[var(--color-text-tertiary)] text-xs font-normal ms-1">(Max 25)</span>
      </label>

      <div className="flex gap-2">
        <input
          value={form.skillInput || ''}
          onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd(form.skillInput))}
          className="flex-1 border border-[var(--color-border)] px-4 py-2.5 rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
          placeholder="Add a skill (e.g., JavaScript)"
          maxLength={30}
        />
        <button
          type="button"
          onClick={() => handleSkillAdd(form.skillInput)}
          className="px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-bold text-sm hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)] flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
        {form.skills.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1.5 bg-[var(--color-accent-bg)] text-[var(--color-accent)] rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100 transition-colors"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleSkillRemove(i)}
              className="text-[var(--color-accent)] hover:text-[var(--color-danger)] transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {form.skills.length === 0 && (
          <p className="text-[11px] text-[var(--color-text-tertiary)] italic py-2">No skills added yet.</p>
        )}
      </div>

      {errors.skills && (
        <p className="text-[var(--color-danger)] text-xs mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle size={14} />
          {errors.skills}
        </p>
      )}
    </div>
  );
}
