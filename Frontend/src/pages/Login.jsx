import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthForm from "../components/AuthForm";
import { clearError } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [localError, setLocalError] = React.useState(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleErrorClose = () => setLocalError(null);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "recruiter") navigate("/recruiter");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[100svh] overflow-y-auto flex items-start sm:items-center justify-center bg-[var(--color-bg)] px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
              Sign in
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Welcome back to SkillSync
            </p>
          </div>

          <div className="px-6 pb-6">
            <AuthForm
              type="login"
              loading={loading}
              error={localError}
              onErrorClose={handleErrorClose}
            />
          </div>

          <div className="px-6 py-4 bg-[var(--color-surface-secondary)] border-t border-[var(--color-border)]">
            <p className="text-center text-sm text-[var(--color-text-secondary)] mt-2">
              New here?{' '}
              <Link
                to="/register"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
