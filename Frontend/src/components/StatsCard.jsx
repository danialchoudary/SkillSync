import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function StatsCard({ stats }) {
  const navigate = useNavigate();

  const statConfig = {
    Applied: { icon: FaBriefcase, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent-bg)]' },
    Accepted: { icon: FaCheckCircle, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]' },
    Rejected: { icon: FaTimesCircle, color: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-danger-bg)]' },
  };

  return (
    <div
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 cursor-pointer hover:border-gray-300 transition-colors"
      onClick={() => navigate('/my-applications')}
      title="Go to My Applications"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
          <FaBriefcase className="text-white text-sm" />
        </div>
        <h4 className="font-semibold text-[var(--color-text-primary)]">
          Applications
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(stats).map(([key, value]) => {
          const config = statConfig[key] || statConfig.Applied;
          const Icon = config.icon;

          return (
            <div key={key} className={`flex flex-col items-center p-3 rounded-lg ${config.bg}`}>
              <Icon className={`text-base ${config.color} mb-2`} />
              <span className={`text-2xl font-bold ${config.color}`}>{value}</span>
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mt-0.5">
                {key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}