import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function PasswordField({ value, onChange, showPassword, setShowPassword }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
      <div className="relative">
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 pr-11 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
