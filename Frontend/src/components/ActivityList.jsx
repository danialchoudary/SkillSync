import React from 'react';

const statusColors = {
  applied: 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]',
  'under review': 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  shortlisted: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  interview: 'bg-purple-50 text-purple-600',
};

export default function ActivityList({ activities }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-sm)]">
      <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-4 flex items-center gap-2 uppercase tracking-tight">
        <span className="w-1 h-4 bg-[var(--color-accent)] rounded-full"></span>
        Recent Activity
      </h4>
      <ul className="space-y-3">
        {activities.map((activity, idx) => (
          <li key={idx} className="flex justify-between items-center py-0.5">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">{activity.text}</span>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[activity.status] || 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]'} border-current/10`}>
                {activity.status}
              </span>
              <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium min-w-[60px] text-right">{activity.time}</span>
            </div>
          </li>
        ))}
        {activities.length === 0 && (
          <p className="text-center text-xs text-[var(--color-text-tertiary)] py-4 italic font-medium">No recent activity found.</p>
        )}
      </ul>
    </div>
  );
}
