import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ProfileCompletionCard({ percent, missingFields = [] }) {
  const navigate = useNavigate();
  const isComplete = percent === 100;

  return (
    <button
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 flex flex-col gap-3 cursor-pointer hover:border-gray-300 transition-colors text-left w-full"
      onClick={() => navigate('/profile')}
      type="button"
      aria-label="Go to profile"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          {isComplete ? (
            <FaCheckCircle className="text-[var(--color-success)]" />
          ) : (
            <FaExclamationCircle className="text-[var(--color-warning)]" />
          )}
          Profile
        </h4>
        <span className={`text-sm font-semibold ${isComplete ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]'}`}>
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--color-surface-secondary)] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)]'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">
            Complete your profile:
          </span>
          <ul className="space-y-1">
            {missingFields.map((field, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <span className="w-1 h-1 rounded-full bg-[var(--color-warning)]" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete state */}
      {isComplete && (
        <div className="flex items-center gap-2 text-[var(--color-success)] pt-2 border-t border-[var(--color-border-subtle)]">
          <FaCheckCircle className="text-sm" />
          <span className="text-xs font-medium">Profile complete</span>
        </div>
      )}
    </button>
  );
}