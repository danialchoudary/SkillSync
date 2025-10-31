import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [role, setRole] = useState('jobseeker');
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

  const handleSubmit = e => {
    e.preventDefault();
    setPasswordError('');
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
    } else {
      data = {
        email: form.email,
        password: form.password,
      };
    }
    onSubmit(data);
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
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
              className="space-y-4"
            >
              {role === 'jobseeker' ? (
                <JobSeekerFields form={form} handleChange={handleChange} />
              ) : (
                <RecruiterFields form={form} handleChange={handleChange} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <EmailField value={form.email} onChange={handleChange} emailValid={emailValid} />

        {/* Password Field */}
        <PasswordField value={form.password} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />

        {/* Confirm Password Field */}
        {type === 'register' && (
          <ConfirmPasswordField value={form.confirmPassword} onChange={handleChange} showPassword={showPassword} setShowPassword={setShowPassword} />
        )}

  {/* Password Error */}
  <ErrorMessage error={passwordError} />

  {/* General Error (only for login) */}
  {type === 'login' && <ErrorMessage error={error} onClose={onErrorClose} />}

        {/* Submit Button */}
        <SubmitButton loading={loading} type={type} />

        {/* Forgot Password Link (Login only) */}
        {type === 'login' && <ForgotPasswordLink />}
      </form>
    </div>
  </div>
);
}