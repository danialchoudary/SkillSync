import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 px-4 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      <div className="space-y-1">
        <div>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</div>
        <div>Engineered by Danial Choudary</div>
      </div>
    </footer>
  );
}
