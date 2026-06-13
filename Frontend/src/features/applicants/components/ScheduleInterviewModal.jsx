import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Link as LinkIcon,
  FileText,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { createInterview } from '../../../services/interviewApi';

const FormField = ({ label, icon: Icon, children, error }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
      {Icon && <Icon className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-[var(--color-danger)] flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

export default function ScheduleInterviewModal({ isOpen, onClose, applicant, onScheduled }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  if (!isOpen || !applicant) return null;

  const inputClasses = (hasError) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
    ${hasError
      ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15'
    }`;

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = 'Interview date is required';
    if (!time) newErrors.time = 'Interview time is required';
    if (!meetingLink.trim()) newErrors.meetingLink = 'Meeting link is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await createInterview({
        jobApplicationId: applicant._id,
        scheduledAt,
        meetingLink,
        notes,
      });

      // Reset form
      setDate('');
      setTime('');
      setMeetingLink('');
      setNotes('');
      setErrors({});

      onScheduled?.();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Schedule Interview</h2>
              <p className="text-xs text-[var(--color-text-tertiary)] truncate max-w-[260px]">
                {applicant.jobSeekerId?.name
                  ? `with ${applicant.jobSeekerId.name} · ${applicant.jobId?.title || 'Job'}`
                  : 'Set the date, time and meeting details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-surface-secondary)] rounded-full transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          {serverError && (
            <div className="mb-5 p-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm rounded-lg border border-[var(--color-danger)]/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {serverError}
            </div>
          )}

          <form id="schedule-interview-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Date" icon={Calendar} error={errors.date}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
                  }}
                  className={inputClasses(errors.date)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label="Time" icon={Clock} error={errors.time}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
                  }}
                  className={inputClasses(errors.time)}
                />
              </FormField>
            </div>

            {/* Meeting Link */}
            <FormField label="Meeting Link" icon={LinkIcon} error={errors.meetingLink}>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => {
                  setMeetingLink(e.target.value);
                  if (errors.meetingLink) setErrors((prev) => ({ ...prev, meetingLink: null }));
                }}
                placeholder="https://meet.google.com/... or https://zoom.us/..."
                className={inputClasses(errors.meetingLink)}
                required
              />
            </FormField>

            {/* Notes */}
            <FormField label="Notes for Candidate (Optional)" icon={FileText}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Topics to cover, what to prepare, dress code, etc."
                rows={3}
                className={`${inputClasses(false)} resize-none`}
              />
            </FormField>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            form="schedule-interview-form"
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Schedule Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
