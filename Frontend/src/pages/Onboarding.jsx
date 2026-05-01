import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, UserRound, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!role) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/auth/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Success, reload page to trigger auth state update
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-[var(--color-bg)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-3">Welcome to SkillSync</h1>
          <p className="text-[var(--color-text-secondary)] text-lg">How do you want to use the platform?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {/* Job Seeker Card */}
          <button
            onClick={() => setRole('jobseeker')}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              role === 'jobseeker'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50 hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              role === 'jobseeker' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]'
            }`}>
              <UserRound size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">I want to get hired</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">Find jobs, track applications, and build your professional profile.</p>
          </button>

          {/* Recruiter Card */}
          <button
            onClick={() => setRole('recruiter')}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              role === 'recruiter'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/50 hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              role === 'recruiter' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]'
            }`}>
              <Briefcase size={24} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">I want to hire</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">Post jobs, review applicants, and find the perfect candidates.</p>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!role || loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white rounded-xl font-bold hover:bg-[var(--color-accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[200px]"
          >
            {loading ? 'Setting up...' : 'Continue'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
