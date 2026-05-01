import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { register, login, verifyEmail, resendCode } from '../features/auth/authSlice';
import RoleToggle from './AuthForm/RoleToggle';
import JobSeekerFields from './AuthForm/JobSeekerFields';
import RecruiterFields from './AuthForm/RecruiterFields';
import EmailField from './AuthForm/EmailField';
import PasswordField from './AuthForm/PasswordField';
import ConfirmPasswordField from './AuthForm/ConfirmPasswordField';
import ErrorMessage from './AuthForm/ErrorMessage';
import SubmitButton from './AuthForm/SubmitButton';
import ForgotPasswordLink from './AuthForm/ForgotPasswordLink';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

export default function AuthForm({ type = 'login', onSubmit, loading, error, onErrorClose }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState('jobseeker');
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    skills: '',
    experience: '',
    resumeLink: '',
    recruiterName: '',
    companyName: '',
    companyAddress: '',
    companyWebsite: '',
    confirmPassword: '',
    email: '',
    password: '',
    rememberMe: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+$/;

  const handleEmailChange = e => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    setEmailValid(value.length === 0 ? null : emailRegex.test(value));
  };

  const handleChange = e => {
    if (e.target.name === 'email') {
      handleEmailChange(e);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setPasswordError('');

    if (step === 2) {
      const resultAction = await dispatch(verifyEmail({ email: registeredEmail, code: verificationCode }));
      if (verifyEmail.fulfilled.match(resultAction)) {
        // Success
      }
      return;
    }

    let data;
    if (type === 'register') {
      if (form.password !== form.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      if (role === 'jobseeker') {
        data = {
          name: form.name,
          email: form.email,
          password: form.password,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          experience: form.experience,
          resumeLink: form.resumeLink,
          role: 'jobseeker',
        };
      } else {
        data = {
          recruiterName: form.recruiterName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          companyName: form.companyName,
          companyAddress: form.companyAddress,
          companyWebsite: form.companyWebsite,
          role: 'recruiter',
        };
      }

      const resultAction = await dispatch(register(data));
      if (register.fulfilled.match(resultAction)) {
        setRegisteredEmail(form.email);
        setStep(2);
        if (resultAction.payload?.emailSent === false) {
          await dispatch(resendCode(form.email));
        }
      }
    } else {
      data = {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      };

      const resultAction = await dispatch(login(data));
      if (login.rejected.match(resultAction) && resultAction.payload?.needsVerification) {
        setRegisteredEmail(form.email);
        setStep(2);
      }
    }
  };

  const handleResendCode = async () => {
    await dispatch(resendCode(registeredEmail));
  };

  if (step === 2) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[var(--color-accent-bg)] text-[var(--color-accent)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Verify your email</h2>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">We've sent a code to {registeredEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000 000"
              className="w-full px-4 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-4 focus:ring-[var(--color-accent)]/10 focus:border-[var(--color-accent)] text-center text-3xl tracking-[0.25em] font-bold outline-none transition-all placeholder:text-[var(--color-text-tertiary)]/30"
              maxLength={6}
              required
            />
          </div>
          <SubmitButton loading={loading} text="Verify Account" />
          <ErrorMessage error={error} onClose={onErrorClose} />
        </form>

        <div className="space-y-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            Resend Code
          </button>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-[var(--color-text-tertiary)]">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to {type === 'login' ? 'Login' : 'Details'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Role Toggle for Register */}
      {type === 'register' && (
        <RoleToggle role={role} setRole={setRole} />
      )}

      {/* Dynamic Fields for Register */}
      {type === 'register' && (
        <div className="space-y-4 py-2 border-y border-[var(--color-border)]/50">
          {role === 'jobseeker' ? (
            <JobSeekerFields form={form} handleChange={handleChange} />
          ) : (
            <RecruiterFields form={form} handleChange={handleChange} />
          )}
        </div>
      )}

      {/* Credentials Section */}
      <div className="space-y-4">
        {type === 'login' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[var(--color-accent)] rounded-full"></div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Account Access</h3>
          </div>
        )}

        <div className="space-y-4">
          <EmailField value={form.email} onChange={handleChange} emailValid={emailValid} />
          <PasswordField value={form.password} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
          {type === 'register' && (
            <ConfirmPasswordField value={form.confirmPassword} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
          )}
        </div>
      </div>

      {/* Logic for errors and keep signed in */}
      <div className="space-y-4">
        <div className="space-y-1">
          <ErrorMessage error={passwordError} />
          <ErrorMessage error={error} onClose={onErrorClose} />
        </div>

        {type === 'login' && (
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={form.rememberMe || false}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/20 transition-all cursor-pointer"
              />
              <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">Keep me signed in</span>
            </label>
            <ForgotPasswordLink />
          </div>
        )}
      </div>

      <SubmitButton loading={loading} type={type} />

      <div className="relative mt-6 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-bold text-[11px] uppercase tracking-wider">Or continue with</span>
        </div>
      </div>

      <a
        href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/auth/google`}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-all hover:shadow-[var(--shadow-sm)]"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </a>
    </form>
  );
}
