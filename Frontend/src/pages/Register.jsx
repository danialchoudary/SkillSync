import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForm from '../components/AuthForm';
import { clearError } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const [localError, setLocalError] = React.useState(null);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleErrorClose = () => setLocalError(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'recruiter') navigate('/recruiter');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[100svh] overflow-y-auto flex items-start sm:items-center justify-center bg-[var(--color-bg)] px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[520px]"
      >
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
              Create account
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Join SkillSync and start your journey
            </p>
          </div>

          <div className="px-6 pb-6">
            <AuthForm
              type="register"
              loading={loading}
              error={localError}
              onErrorClose={handleErrorClose}
            />
          </div>

          <div className="px-6 py-4 bg-[var(--color-surface-secondary)] border-t border-[var(--color-border)]">
            <p className="text-center text-sm text-[var(--color-text-secondary)] mt-2">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
