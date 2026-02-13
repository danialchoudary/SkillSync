import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  // Map Tailwind colors to design system tokens where possible, or use clean fallbacks
  const colorMap = {
    blue: 'text-[var(--color-accent)] bg-[var(--color-accent-bg)]',
    green: 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
    orange: 'text-orange-500 bg-orange-50',
    purple: 'text-purple-500 bg-purple-50',
    red: 'text-[var(--color-danger)] bg-[var(--color-danger-bg)]',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex items-center gap-4 hover:shadow-[var(--shadow-md)] transition-all duration-300">
      <div className={`p-3 rounded-xl ${selectedColor} flex-shrink-0`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">{title}</h3>
        <p className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;