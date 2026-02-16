import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaBriefcase, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function StatsCard({ stats }) {
  const navigate = useNavigate();

  const statConfig = {
    Applied: { icon: FaBriefcase, color: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent-bg)]', border: 'border-[var(--color-accent)]/20' },
    Hired: { icon: FaCheckCircle, color: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-bg)]', border: 'border-[var(--color-success)]/20' },
    Rejected: { icon: FaTimesCircle, color: 'text-[var(--color-danger)]', bg: 'bg-[var(--color-danger-bg)]', border: 'border-[var(--color-danger)]/20' },
  };

  const total = Object.values(stats || {}).reduce((sum, value) => sum + Number(value || 0), 0);

  return (
    <button
      type="button"
      className="group relative overflow-hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 sm:p-6 cursor-pointer hover:border-gray-300 hover:-translate-y-0.5 transition-all text-left w-full"
      onClick={() => navigate('/my-applications')}
      title="Go to My Applications"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[var(--color-accent-bg)]/80 blur-2xl" />

      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <FaBriefcase className="text-white text-sm" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] leading-none">
              Applications
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Total tracked</p>
          </div>
        </div>
        <span className="text-3xl font-bold text-[var(--color-text-primary)]">{total}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {Object.entries(stats).map(([key, value]) => {
          const config = statConfig[key] || statConfig.Applied;
          const Icon = config.icon;
          const count = Number(value || 0);
          const ratio = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className={`p-3 rounded-xl border ${config.border} ${config.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`text-sm ${config.color}`} />
                <span className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{ratio}%</span>
              </div>
              <p className={`text-2xl font-bold leading-none ${config.color}`}>{count}</p>
              <p className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mt-1.5">{key}</p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] group-hover:text-[var(--color-accent-hover)] transition-colors">
          View all applications
          <FaArrowRight className="text-[10px]" />
        </span>
      </div>
    </button>
  );
}
