import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
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

export default function AuthForm({ type = 'login', onSubmit, loading, error, onErrorClose }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState('jobseeker');
  // Steps: 1 = Register/Login Form, 2 = Verification Code
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
      // Verification Step
      const resultAction = await dispatch(verifyEmail({ email: registeredEmail, code: verificationCode }));
      if (verifyEmail.fulfilled.match(resultAction)) {
        // Verification successful, user is usually logged in by the slice
        // or we can redirect. The parent component usually checks 'user' state.
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

      // Dispatch register manually here to intercept success for verification Flow
      const resultAction = await dispatch(register(data));
      if (register.fulfilled.match(resultAction)) {
        setRegisteredEmail(form.email);
        setStep(2); // Move to verification step
      }
    } else {
      data = {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      };

      const resultAction = await dispatch(login(data));
      // Check if user is unverified
      if (login.rejected.match(resultAction) && resultAction.payload?.needsVerification) {
        setRegisteredEmail(form.email);
        setStep(2);
      }
    }
  };

  const handleResendCode = async () => {
    await dispatch(resendCode(registeredEmail));
    // Optional: show a toast or message that code was sent
  };

  if (step === 2) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Email Verification</h2>
        <p className="mb-4 text-[13px] text-gray-600">Enter the 6-digit code sent to <strong>{registeredEmail}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[0.5em] font-mono"
            maxLength={6}
            required
          />
          <SubmitButton loading={loading} text="Verify Account" />
          <ErrorMessage error={error} onClose={onErrorClose} />
        </form>

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleResendCode}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            disabled={loading}
          >
            Resend Verification Code
          </button>

          <button
            onClick={() => setStep(1)}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      {/* Role Toggle for Register */}
      {type === 'register' && (
        <RoleToggle role={role} setRole={setRole} />
      )}

      {/* Dynamic Fields for Register */}
      <AnimatePresence mode="wait">
        {type === 'register' && (
          <motion.div
            key={role}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {role === 'jobseeker' ? (
              <JobSeekerFields form={form} handleChange={handleChange} />
            ) : (
              <RecruiterFields form={form} handleChange={handleChange} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email and Password Fields centered in a grid or just stacked but tight */}
      <div className={`${type === 'register' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3' : 'space-y-3'}`}>
        <EmailField value={form.email} onChange={handleChange} emailValid={emailValid} />
        <PasswordField value={form.password} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
        {type === 'register' && (
          <ConfirmPasswordField value={form.confirmPassword} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
        )}
      </div>

      {/* Error Messages */}
      <div className="space-y-1">
        <ErrorMessage error={passwordError} />
        <ErrorMessage error={error} onClose={onErrorClose} />
      </div>

      {/* Remember Me Checkbox (Login only) */}
      {type === 'login' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={form.rememberMe || false}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton loading={loading} type={type} />

      {/* Forgot Password Link (Login only) */}
      {type === 'login' && <ForgotPasswordLink />}
    </form>
  );
}
