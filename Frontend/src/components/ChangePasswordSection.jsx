import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { updatePassword } from '../services/api';

const initialForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function getErrorMessage(error) {
  const payload = error.response?.data?.error;
  if (Array.isArray(payload)) return payload.join(' ');
  return payload || 'Failed to update password.';
}

export default function ChangePasswordSection({ onSuccess = () => {} }) {
  const [form, setForm] = useState(initialForm);
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(form);
      setForm(initialForm);
      setMessage('Password updated successfully.');
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)] flex items-center justify-center">
            <LockKeyhole size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Password</h4>
            <p className="text-[11px] text-[var(--color-text-tertiary)] font-medium">Update your account password</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPasswords((value) => !value)}
          className="w-9 h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors"
          aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
        >
          {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            name="currentPassword"
            type={inputType}
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Current password"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
          <input
            name="newPassword"
            type={inputType}
            value={form.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="New password"
            minLength={6}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
          <input
            name="confirmPassword"
            type={inputType}
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Confirm password"
            minLength={6}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
          />
        </div>

        {error && <p className="text-xs font-semibold text-[var(--color-danger)]">{error}</p>}
        {message && <p className="text-xs font-semibold text-[var(--color-success)]">{message}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !form.newPassword || !form.confirmPassword}
            className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </section>
  );
}
