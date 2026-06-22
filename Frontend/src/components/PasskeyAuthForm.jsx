import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { startPasskeyRegistration, completePasskeyRegistration, startPasskeyLogin, completePasskeyLogin } from '../features/auth/authSlice';
import RoleToggle from './AuthForm/RoleToggle';
import JobSeekerFields from './AuthForm/JobSeekerFields';
import RecruiterFields from './AuthForm/RecruiterFields';
import EmailField from './AuthForm/EmailField';
import ErrorMessage from './AuthForm/ErrorMessage';
import SubmitButton from './AuthForm/SubmitButton';

function getDestinationForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'recruiter') return '/recruiter';
  return '/dashboard';
}

export default function PasskeyAuthForm({ type = 'login', loading, error, onErrorClose }) {
  const dispatch = useDispatch();
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
    email: '',
  });
  const [emailValid, setEmailValid] = useState(null);
  const [localError, setLocalError] = useState('');
  const [busy, setBusy] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isLoading = loading || busy;

  const rolePayload = useMemo(() => {
    if (type !== 'register') return null;
    if (role === 'jobseeker') {
      return {
        name: form.name,
        email: form.email,
        role: 'jobseeker',
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: form.experience,
        resumeLink: form.resumeLink,
      };
    }

    return {
      recruiterName: form.recruiterName,
      email: form.email,
      role: 'recruiter',
      companyName: form.companyName,
      companyAddress: form.companyAddress,
      companyWebsite: form.companyWebsite,
    };
  }, [type, role, form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'email') {
      setEmailValid(value.length === 0 ? null : emailRegex.test(value));
    }
    setLocalError('');
  };

  const submitLogin = async () => {
    const startAction = await dispatch(startPasskeyLogin({ email: form.email }));
    if (!startPasskeyLogin.fulfilled.match(startAction)) {
      const payload = startAction.payload;
      throw new Error(typeof payload === 'string' ? payload : (payload?.error || 'Failed to start passkey login'));
    }

    const assertion = await startAuthentication({ optionsJSON: startAction.payload.options });
    const verifyAction = await dispatch(completePasskeyLogin({ email: form.email, response: assertion }));
    if (!completePasskeyLogin.fulfilled.match(verifyAction)) {
      const payload = verifyAction.payload;
      throw new Error(typeof payload === 'string' ? payload : (payload?.error || 'Failed to complete passkey login'));
    }
    return verifyAction.payload;
  };

  const submitRegister = async () => {
    const startAction = await dispatch(startPasskeyRegistration(rolePayload));
    if (!startPasskeyRegistration.fulfilled.match(startAction)) {
      const payload = startAction.payload;
      throw new Error(typeof payload === 'string' ? payload : (payload?.error || 'Failed to start passkey registration'));
    }

    const credential = await startRegistration({ optionsJSON: startAction.payload.options });
    const verifyAction = await dispatch(completePasskeyRegistration({
      userId: startAction.payload.userId,
      response: credential,
    }));
    if (!completePasskeyRegistration.fulfilled.match(verifyAction)) {
      const payload = verifyAction.payload;
      throw new Error(typeof payload === 'string' ? payload : (payload?.error || 'Failed to complete passkey registration'));
    }
    return verifyAction.payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setBusy(true);
    try {
      const user = type === 'register' ? await submitRegister() : await submitLogin();
      const destination = getDestinationForRole(user?.role);
      window.location.assign(destination);
    } catch (err) {
      setLocalError(err?.message || 'Passkey sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full animate-in fade-in duration-500">
      {type === 'register' && (
        <RoleToggle role={role} setRole={setRole} />
      )}

      {type === 'register' && (
        <div className="space-y-4 py-2 border-y border-[var(--color-border)]/50">
          {role === 'jobseeker' ? (
            <JobSeekerFields form={form} handleChange={handleChange} />
          ) : (
            <RecruiterFields form={form} handleChange={handleChange} />
          )}
        </div>
      )}

      <div className="space-y-4">
        {type === 'login' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[var(--color-accent)] rounded-full" />
            <h3 className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Passkey Access
            </h3>
          </div>
        )}

        <EmailField value={form.email} onChange={handleChange} emailValid={emailValid} />
      </div>

      <div className="space-y-2">
        <ErrorMessage error={localError} onClose={() => setLocalError('')} />
        <ErrorMessage error={error} onClose={onErrorClose} />
      </div>

      <SubmitButton loading={isLoading} type={type === 'login' ? 'passkey-login' : 'passkey-register'} />
    </form>
  );
}
