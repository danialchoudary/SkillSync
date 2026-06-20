import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../features/auth/authSlice';
import RoleToggle from './AuthForm/RoleToggle';
import JobSeekerFields from './AuthForm/JobSeekerFields';
import RecruiterFields from './AuthForm/RecruiterFields';
import PhoneField from './AuthForm/PhoneField';
import EmailField from './AuthForm/EmailField';
import PasswordField from './AuthForm/PasswordField';
import ConfirmPasswordField from './AuthForm/ConfirmPasswordField';
import ErrorMessage from './AuthForm/ErrorMessage';
import SubmitButton from './AuthForm/SubmitButton';
import ForgotPasswordLink from './AuthForm/ForgotPasswordLink';

export default function AuthForm({ type = 'login', onSubmit, loading, error, onErrorClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    phoneNumber: '',
    confirmPassword: '',
    email: '',
    password: '',
    rememberMe: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [phoneValid, setPhoneValid] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  const handleEmailChange = e => {
    const value = e.target.value;
    setForm({ ...form, email: value });
    setEmailValid(value.length === 0 ? null : emailRegex.test(value));
  };

  const handlePhoneChange = e => {
    const value = e.target.value;
    setForm({ ...form, phoneNumber: value });
    setPhoneValid(value.length === 0 ? null : phoneRegex.test(value.trim()));
  };

  const handleChange = e => {
    if (e.target.name === 'email') {
      handleEmailChange(e);
    } else if (e.target.name === 'phoneNumber') {
      handlePhoneChange(e);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async e => {
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
          phoneNumber: form.phoneNumber,
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
          phoneNumber: form.phoneNumber,
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
        const params = new URLSearchParams({
          phoneNumber: resultAction.payload?.phoneNumber || form.phoneNumber,
          email: resultAction.payload?.email || form.email,
        });
        if (resultAction.payload?.otpSent === false) {
          params.set('otpSent', 'false');
        }
        navigate(`/verify-otp?${params.toString()}`);
      }
    } else {
      data = {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      };

      const resultAction = await dispatch(login(data));
      if (login.rejected.match(resultAction) && resultAction.payload?.needsVerification) {
        const params = new URLSearchParams({
          phoneNumber: resultAction.payload?.phoneNumber || form.phoneNumber,
          email: resultAction.payload?.email || form.email,
        });
        navigate(`/verify-otp?${params.toString()}`);
      }
    }
  };

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
          {type === 'register' && (
            <PhoneField value={form.phoneNumber} onChange={handleChange} phoneValid={phoneValid} />
          )}
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
