import React, { useState } from 'react';
import { FaBriefcase, FaTimes, FaFileUpload, FaFilePdf, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';

export default function ApplyModal({ open, onClose, onSubmit, resumeUrl, onResumeUpload }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      if (onResumeUpload) onResumeUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResume(file);
      if (onResumeUpload) onResumeUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(coverLetter, resume);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      {/* Backdrop click-to-close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center">
              <FaBriefcase className="text-[var(--color-accent)] text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Apply for Job</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Submit your application details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* Resume Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2.5">
              Resume / CV <span className="text-[var(--color-danger)]">*</span>
            </label>

            {/* Current Resume Link */}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-4 px-3 py-2 bg-[var(--color-accent-bg)] text-[var(--color-accent)] rounded-lg border border-blue-100 font-medium text-xs hover:bg-blue-100 transition-colors group"
              >
                <FaCheckCircle className="text-[var(--color-success)]" />
                View Current Resume
                <FaExternalLinkAlt className="text-[10px] opacity-60" />
              </a>
            )}

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-6 transition-colors text-center ${isDragging
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                  : resume
                    ? 'border-[var(--color-success)] bg-[var(--color-success-bg)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] hover:border-[var(--color-accent)]'
                }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center gap-2">
                {resume ? (
                  <>
                    <FaCheckCircle className="text-[var(--color-success)] text-2xl" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-success)] truncate max-w-xs">{resume.name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                        {(resume.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <FaFileUpload className="text-[var(--color-text-tertiary)] text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {isDragging ? 'Drop file to upload' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {resume && (
              <button
                type="button"
                onClick={() => setResume(null)}
                className="mt-2 text-xs text-[var(--color-danger)] hover:underline font-medium"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Cover Letter Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2.5">
              Cover Letter <span className="text-[var(--color-danger)]">*</span>
            </label>

            <textarea
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/15 focus:border-[var(--color-accent)] transition-colors min-h-[160px] resize-none"
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit for this role..."
              required
            />

            <div className="flex justify-between items-center mt-2 text-[10px] text-[var(--color-text-tertiary)]">
              <span>Minimum 50 characters recommended</span>
              <span className={coverLetter.length >= 50 ? 'text-[var(--color-success)]' : ''}>
                {coverLetter.length} characters
              </span>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)]"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
