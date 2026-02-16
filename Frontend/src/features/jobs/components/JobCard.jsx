import React, { useState } from 'react';
import ApplyModal from './ApplyModal';
import { createPortal } from 'react-dom';
import { applyForJob } from '../services/jobApi';
import Toast from '../../../components/Toast';
import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaRegBookmark, FaBookmark, FaClock, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { getImageUrl } from '../../../utils/urlHelper';
import { getApplicationStatusLabel, normalizeApplicationStatus } from '../../../utils/applicationStatus';

export default function JobCard({ job, onApply, onEdit, onDelete, saved, onSave, onUnsave, user }) {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(job.applied);
  const isApplied = typeof job.applied !== 'undefined' ? job.applied || applied : applied;
  const normalizedJobStatus = normalizeApplicationStatus(job.status);
  const isJobSeeker = user?.role === 'jobseeker';
  const isSavedSection = saved && onDelete;

  const handleApplyClick = () => {
    if (isJobSeeker && !isApplied) setShowModal(true);
    else if (onApply && !isApplied) onApply(job);
  };

  const handleModalSubmit = async (coverLetter, resumeFile) => {
    setShowModal(false);
    try {
      await applyForJob(job._id || job.id, coverLetter, resumeFile);
      setToast({ type: 'success', message: 'Application submitted successfully!' });
      setApplied(true);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to apply for job.';
      setToast({ type: 'error', message: errorMsg });
    }
    if (onApply) onApply(job, coverLetter, resumeFile);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      applied: 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]',
      screening: 'bg-[#EEF7FF] text-[#0B79D0]',
      interview: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
      hired: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    };
    return styles[status] || 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]';
  };

  return (
    <div className="ui-card-hover relative bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 h-full flex flex-col">

      {/* Status Badge */}
      {isApplied && (
        <div className="flex justify-end mb-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(normalizedJobStatus)}`}>
            {normalizedJobStatus === 'hired' && <FaCheckCircle className="text-[10px]" />}
            {normalizedJobStatus === 'screening' && <FaSearch className="text-[10px]" />}
            {(normalizedJobStatus === 'applied' || normalizedJobStatus === 'interview') && <FaClock className="text-[10px]" />}
            {getApplicationStatusLabel(normalizedJobStatus)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Logo */}
          {job.companyLogo ? (
            <img
              src={getImageUrl(job.companyLogo)}
              alt="company logo"
              className="w-11 h-11 rounded-full object-cover ring-1 ring-[var(--color-border)] flex-shrink-0"
            />
          ) : (
            <span className="w-11 h-11 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] flex-shrink-0">
              <FaBuilding size={18} />
            </span>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base text-[var(--color-text-primary)] mb-1.5 truncate">
              {job.title}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1">
                <FaBuilding className="text-[var(--color-accent)] text-[10px]" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-[var(--color-text-tertiary)] text-[10px]" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        {!isApplied && (
          <div className="flex-shrink-0 px-3 py-1.5 bg-[var(--color-accent-bg)] border border-blue-100 rounded-lg">
            <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-semibold text-xs whitespace-nowrap">
              <FaMoneyBillWave className="text-[var(--color-success)]" />
              {job.salary}
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-tertiary)] mb-3">
        <FaClock />
        <span>Posted: {job.createdAt ? new Date(job.createdAt).toLocaleString() : (job.postedAt || 'Unknown')}</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--color-border)] mb-3"></div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {isSavedSection ? (
          <>
            {isJobSeeker && (
              isApplied ? (
                <button
                  className="px-4 py-2 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-lg font-medium text-sm cursor-default flex items-center gap-1.5"
                  disabled
                >
                  <FaCheckCircle /> Applied
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </button>
              )
            )}
            <button
              className="px-4 py-2 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
              onClick={() => onDelete(job)}
            >
              Remove
            </button>
          </>
        ) : onApply ? (
          <>
            {isJobSeeker && (
              isApplied ? (
                <button
                  className="px-4 py-2 bg-[var(--color-success-bg)] text-[var(--color-success)] rounded-lg font-medium text-sm cursor-default flex items-center gap-1.5"
                  disabled
                >
                  <FaCheckCircle /> Applied
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </button>
              )
            )}
            {typeof saved !== 'undefined' && (
              saved ? (
                <button
                  className="px-4 py-2 bg-[var(--color-warning-bg)] text-[var(--color-warning)] rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-yellow-100 transition-colors"
                  onClick={() => onUnsave(job)}
                  title="Unsave Job"
                >
                  <FaBookmark /> Saved
                </button>
              ) : (
                <button
                  className={`px-4 py-2 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-gray-200 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={async () => {
                    setSaving(true);
                    await onSave(job);
                    setSaving(false);
                  }}
                  title="Save Job"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                  ) : <FaRegBookmark />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )
            )}
          </>
        ) : ((onEdit || onDelete) ? (
          <>
            {onEdit && (
              <button
                className="px-4 py-2 bg-[var(--color-warning-bg)] text-[var(--color-warning)] rounded-lg font-medium text-sm hover:bg-yellow-100 transition-colors"
                onClick={() => onEdit(job)}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                className="px-4 py-2 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                onClick={() => onDelete(job)}
              >
                Delete
              </button>
            )}
          </>
        ) : null)}
      </div>

      {isJobSeeker && showModal &&
        createPortal(
          <ApplyModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleModalSubmit}
            resumeUrl={user?.resumeLink}
          />,
          document.body
        )
      }
      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}
