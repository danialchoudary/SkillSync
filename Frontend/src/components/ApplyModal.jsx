import React, { useState } from 'react';

export default function ApplyModal({ open, onClose, onSubmit, resumeUrl, onResumeUpload }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
    if (onResumeUpload) onResumeUpload(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(coverLetter, resume);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Apply for Job</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Resume</label>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mr-2">View Current Resume</a>
            )}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="mt-2" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Cover Letter</label>
            <textarea
              className="w-full border rounded p-2"
              rows={5}
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Write your cover letter here..."
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
