import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      &copy; {new Date().getFullYear()} SkillSync. All rights reserved.
    </footer>
  );
}
