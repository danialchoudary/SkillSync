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
    </form>
  );
}
