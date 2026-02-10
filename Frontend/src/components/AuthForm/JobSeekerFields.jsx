import React from 'react';

export default function JobSeekerFields({ form, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
        <input
          name="name"
          type="text"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Skills</label>
        <input
          name="skills"
          type="text"
          placeholder="React, Node.js"
          value={form.skills}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Experience</label>
        <input
          name="experience"
          type="text"
          placeholder="5 years in Dev"
          value={form.experience}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Resume Link</label>
        <input
          name="resumeLink"
          type="url"
          placeholder="https://drive..."
          value={form.resumeLink}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white hover:border-gray-400"
        />
      </div>
    </div>
  );
}
