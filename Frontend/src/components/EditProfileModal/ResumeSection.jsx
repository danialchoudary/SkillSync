import React from 'react';
import { getResumeUrl } from '../../utils/urlHelper';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResumeSection({ user, resumeUploading, resumeError, handleResumeUpload }) {
  return (
    <div className="pt-5 border-t border-[var(--color-border)]">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        Resume / CV
      </label>

      <div className="bg-[var(--color-surface-secondary)] rounded-xl p-5 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors">
        {user.resumeUrl ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-accent-bg)] rounded-lg flex items-center justify-center text-[var(--color-accent)]">
                <FileText size={20} />
              </div>
              <div>
                <a
                  href={getResumeUrl(user.resumeUrl || user.resumeLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] hover:underline font-semibold text-sm transition-colors"
                >
                  View Current Resume
                </a>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 uppercase tracking-wider font-medium">PDF Document</p>
              </div>
            </div>
            <CheckCircle className="text-[var(--color-success)] w-5 h-5" />
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText size={32} className="mx-auto text-[var(--color-text-tertiary)] opacity-30 mb-2" />
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">No resume uploaded yet</p>
          </div>
        )}

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          id="resume-upload-input"
          onChange={handleResumeUpload}
        />

        <button
          type="button"
          onClick={() => document.getElementById('resume-upload-input').click()}
          disabled={resumeUploading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-bold text-sm hover:bg-[var(--color-surface-secondary)] transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resumeUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>{user.resumeUrl ? 'Upload New Resume' : 'Upload Resume'}</span>
            </>
          )}
        </button>

        {resumeError && (
          <p className="text-[var(--color-danger)] text-xs mt-3 flex items-center gap-1.5 font-medium">
            <AlertCircle size={14} />
            {resumeError}
          </p>
        )}
      </div>
    </div>
  );
}
