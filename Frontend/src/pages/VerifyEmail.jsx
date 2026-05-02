import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clearError, resendCode, verifyEmail } from '../features/auth/authSlice';

function getDestinationForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter') return '/recruiter';
  return '/dashboard';
}

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);
  const initialEmail = searchParams.get('email') || '';
  const emailSent = searchParams.get('emailSent') !== 'false';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [notice] = useState(
    emailSent
      ? 'Enter the 6-digit code sent to your email.'
      : null
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const resultAction = await dispatch(verifyEmail({ email, code }));

    if (verifyEmail.fulfilled.match(resultAction)) {
      navigate(getDestinationForRole(resultAction.payload?.role), { replace: true });
    }
  };

  const handleResend = async () => {
    setResendSuccess(false);
    setResendError('');
    const resultAction = await dispatch(resendCode(email));

    if (resendCode.fulfilled.match(resultAction)) {
      setResendSuccess(true);
    } else {
      setResendError(resultAction.payload || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-[100svh] overflow-y-auto flex items-start sm:items-center justify-center bg-[var(--color-bg)] px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[460px]"
      >
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="w-12 h-12 bg-[var(--color-accent-bg)] text-[var(--color-accent)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
              Verify your email
            </h1>
            {notice && (
              <p className="text-sm text-[var(--color-text-secondary)]">{notice}</p>
            )}
          </div>

          {/* Warning banner when email wasn't sent initially */}
          {!emailSent && !resendSuccess && (
            <div className="mx-6 mb-2 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                The verification email could not be delivered automatically. Click <strong>Resend Code</strong> below to try again.
              </p>
            </div>
          )}

          {/* Resend success banner */}
          {resendSuccess && (
            <div className="mx-6 mb-2 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Code sent! Check your inbox (and spam folder) for a new 6-digit code.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-4 focus:ring-[var(--color-accent)]/10 focus:border-[var(--color-accent)] outline-none transition-all text-[var(--color-text-primary)]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                className="w-full px-4 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-4 focus:ring-[var(--color-accent)]/10 focus:border-[var(--color-accent)] text-center text-3xl tracking-[0.25em] font-bold outline-none transition-all placeholder:text-[var(--color-text-tertiary)]/30"
                required
              />
            </div>

            {/* Verify error */}
            {error && (
              <p className="text-xs font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Resend error */}
            {resendError && (
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                {resendError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6 || !email}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Account</span>
              )}
            </button>

            {/* Resend button — prominent (filled) when email wasn't sent, subtle otherwise */}
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || !email}
              className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                !emailSent && !resendSuccess
                  ? 'bg-amber-500 hover:bg-amber-600 text-white text-sm shadow-sm'
                  : 'text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]'
              }`}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Sending...' : 'Resend Code'}
            </button>
          </form>

          <div className="px-6 py-4 bg-[var(--color-surface-secondary)] border-t border-[var(--color-border)]">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              Back to account creation
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
