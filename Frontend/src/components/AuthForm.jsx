import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function AuthForm({ type = 'login', onSubmit, loading, error }) {
  const [role, setRole] = useState('jobseeker');
  const [form, setForm] = useState({
    // Jobseeker fields
    name: '',
    skills: '',
    experience: '',
    resumeLink: '',
    // Recruiter fields
    recruiterName: '',
    companyName: '',
    companyAddress: '',
    companyWebsite: '',
    confirmPassword: '',
    // Common
    email: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(null); // null: untouched, true: valid, false: invalid

  // Simple email regex
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
      // Password match validation for both roles
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
      // Only send email and password for login
      data = {
        email: form.email,
        password: form.password,
      };
    }
    onSubmit(data);
  };

  return (
    <form className="max-w-md mx-auto bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
      {type === 'register' && (
        <>
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-l ${role === 'jobseeker' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setRole('jobseeker')}
            >
              Register as Job Seeker
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r ${role === 'recruiter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setRole('recruiter')}
            >
              Register as Recruiter
            </button>
          </div>
          {role === 'jobseeker' ? (
            <>
              <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} className="input" required />
              <input name="skills" type="text" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} className="input" />
              <input name="experience" type="text" placeholder="Experience" value={form.experience} onChange={handleChange} className="input" />
              <input name="resumeLink" type="url" placeholder="Resume Link" value={form.resumeLink} onChange={handleChange} className="input" />
            </>
          ) : (
            <>
              <input name="recruiterName" type="text" placeholder="Recruiter Name" value={form.recruiterName} onChange={handleChange} className="input" required />
              <input name="companyName" type="text" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="input" required />
              <input name="companyAddress" type="text" placeholder="Company Address" value={form.companyAddress} onChange={handleChange} className="input" required />
              <input name="companyWebsite" type="url" placeholder="Company Website (optional)" value={form.companyWebsite} onChange={handleChange} className="input" />
            </>
          )}
        </>
      )}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" required autoComplete="username" />
      {emailValid === true && (
        <div className="text-green-600 text-sm mt-1">Valid email</div>
      )}
      {emailValid === false && (
        <div className="text-red-500 text-sm mt-1">Invalid email format</div>
      )}
      <div className="relative">
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="input pr-10"
          required
          autoComplete="current-password"
        />
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowPassword(prev => !prev)}
          tabIndex={0}
          role="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </span>
      </div>
      {type === 'register' && role === 'jobseeker' && (
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input pr-10"
            required
            autoComplete="new-password"
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(prev => !prev)}
            tabIndex={0}
            role="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
      )}
  {/* // ...existing code... */}
      {type === 'register' && role === 'recruiter' && (
        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input pr-10"
            required
            autoComplete="new-password"
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(prev => !prev)}
            tabIndex={0}
            role="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
      )}
      {passwordError && (
        <div className="text-red-500 mt-2">{passwordError}</div>
      )}
      <button type="submit" className="btn w-full mt-4" disabled={loading}>
        {loading ? 'Loading...' : type === 'login' ? 'Login' : 'Register'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
  // No changes needed if AuthForm already supports both login and register via the 'type' prop and is styled with TailwindCSS.
