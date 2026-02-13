import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Briefcase } from 'lucide-react';

export default function JobForm({ onPost }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    skills: '',
    experience: '',
  });
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);

    if (onPost) {
      Promise.resolve(onPost(form))
        .then(() => {
          setToast('Job posted successfully!');
          setToastType('success');
          setForm({ title: '', company: '', description: '', location: '', salary: '', skills: '', experience: '' });
          setTimeout(() => setToast(null), 3000);
        })
        .catch(() => {
          setToast('Failed to post job. Please try again.');
          setToastType('error');
          setTimeout(() => setToast(null), 3000);
        })
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="w-full bg-[var(--color-bg)] px-4 py-8 sm:py-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${toastType === 'success'
              ? 'bg-[var(--color-success-bg)] border-[var(--color-success)]/10 text-[var(--color-success)]'
              : 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/10 text-[var(--color-danger)]'
            }`}>
            {toastType === 'success' ? (
              <CheckCircle size={18} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="flex-shrink-0" />
            )}
            <p className="text-sm font-bold">{toast}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Post a Job</h1>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base font-medium">Share an opportunity with talented professionals</p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-sm)] p-6 sm:p-10 border border-[var(--color-border)] space-y-6"
        >
          {/* Row 1: Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Job Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Senior Product Designer"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Company Name</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g., TechCorp Inc."
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
                required
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none resize-none"
              rows={5}
              required
            />
          </div>

          {/* Row 3: Location and Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Salary Range</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g., $100k - $150k/year"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
                required
              />
            </div>
          </div>

          {/* Row 4: Skills and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Required Skills</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g., React, TypeScript, Figma"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Years of Experience</label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g., 5"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] text-sm transition-colors focus:bg-[var(--color-surface)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-[var(--color-accent)] text-white font-bold text-sm rounded-lg hover:bg-[var(--color-accent-hover)] transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Posting Opportunity...</span>
                </>
              ) : (
                'Post Job Opportunity'
              )}
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <p className="text-center text-[var(--color-text-tertiary)] text-xs mt-8 font-medium">
          Your posting will be visible to thousands of qualified candidates
        </p>
      </div>
    </div>
  );
}
