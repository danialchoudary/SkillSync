import React from 'react';

export default function RecruiterFields({ form, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Recruiter Name</label>
        <input
          name="recruiterName"
          type="text"
          placeholder="Jane Smith"
          value={form.recruiterName}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
        <input
          name="companyName"
          type="text"
          placeholder="Tech Corp Inc."
          value={form.companyName}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Company Address</label>
        <input
          name="companyAddress"
          type="text"
          placeholder="123 Business St..."
          value={form.companyAddress}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Company Website</label>
        <input
          name="companyWebsite"
          type="url"
          placeholder="https://www..."
          value={form.companyWebsite}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
        />
      </div>
    </div>
  );
}
