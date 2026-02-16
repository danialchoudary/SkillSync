import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ProfileCompletionCard({ percent, missingFields = [] }) {
  const navigate = useNavigate();
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(percent, 100)) : 0;
  const isComplete = safePercent === 100;
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (safePercent / 100) * ringCircumference;

  return (
    <button
      className="group relative overflow-hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 sm:p-6 flex flex-col gap-4 cursor-pointer hover:border-gray-300 hover:-translate-y-0.5 transition-all text-left w-full"
      onClick={() => navigate('/profile')}
      type="button"
      aria-label="Go to profile"
    >
      <div className="pointer-events-none absolute -top-14 -right-14 w-44 h-44 rounded-full bg-[var(--color-accent-bg)]/80 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <h4 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2.5">
          {isComplete ? (
            <span className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center">
              <FaCheckCircle className="text-sm" />
            </span>
          ) : (
            <span className="w-8 h-8 rounded-lg bg-[var(--color-warning-bg)] text-[var(--color-warning)] flex items-center justify-center">
              <FaExclamationCircle className="text-sm" />
            </span>
          )}
          <span>Profile</span>
        </h4>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isComplete ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'}`}>
          {safePercent}%
        </span>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="relative w-[84px] h-[84px] flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84" role="presentation">
            <circle
              cx="42"
              cy="42"
              r={ringRadius}
              stroke="var(--color-surface-secondary)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="42"
              cy="42"
              r={ringRadius}
              stroke={isComplete ? 'var(--color-success)' : 'var(--color-accent)'}
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 600ms ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">{safePercent}%</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {isComplete ? 'Profile complete' : 'Profile in progress'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {isComplete
              ? 'Your profile is optimized for recruiters.'
              : `${missingFields.length} ${missingFields.length === 1 ? 'section is' : 'sections are'} still missing.`}
          </p>
        </div>
      </div>

      {missingFields.length > 0 && (
        <div className="pt-3 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">Missing sections</p>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-1">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)] transition-colors">
          Update profile
          <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </button>
  );
}
