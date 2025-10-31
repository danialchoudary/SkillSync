import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaTimes, FaFileUpload, FaFilePdf, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';

export default function ApplyModal({ open, onClose, onSubmit, resumeUrl, onResumeUpload }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      if (onResumeUpload) onResumeUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResume(file);
      if (onResumeUpload) onResumeUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(coverLetter, resume);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full min-w-[600px] max-w-6xl min-h-[520px] flex flex-col justify-center items-center"
            style={{ maxHeight: 'calc(100vh - 32px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient header */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 px-6 sm:px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    <FaBriefcase className="text-white text-xl" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Apply for Job</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Submit your application details</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors shadow-md"
                >
                  <FaTimes className="text-lg" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 sm:p-8 overflow-y-auto">
              {/* Resume Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <label className=" font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaFilePdf className="text-red-500" />
                  Resume / CV
                  <span className="text-red-500">*</span>
                </label>

                {/* Current Resume Link */}
                {resumeUrl && (
                  <motion.a
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 border border-blue-200 font-medium text-sm transition-all duration-300 group"
                  >
                    <FaCheckCircle className="text-green-500" />
                    View Current Resume
                    <FaExternalLinkAlt className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                )}

                {/* File Upload Area */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : resume
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="resume-upload"
                  />
                  
                  <div className="text-center pointer-events-none">
                    {resume ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700">{resume.name}</p>
                          <p className="text-sm text-green-600 mt-1">
                            {(resume.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
                        >
                          <FaFileUpload className="text-white text-2xl" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-gray-700">
                            {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF, DOC, DOCX (Max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {resume && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setResume(null)}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Remove file
                  </motion.button>
                )}
              </motion.div>

              {/* Cover Letter Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <label className=" font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs">
                    ✉️
                  </span>
                  Cover Letter
                  <span className="text-red-500">*</span>
                </label>
                
                <textarea
                  className="w-full border-2 border-gray-300 rounded-2xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none hover:border-gray-400 text-gray-900 placeholder-gray-400"
                  rows={8}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're the perfect fit for this role..."
                  required
                />
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Minimum 50 characters recommended</span>
                  <span className={coverLetter.length >= 50 ? 'text-green-600 font-semibold' : ''}>
                    {coverLetter.length} characters
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300 shadow-md"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-bold shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaBriefcase />
                  Submit Application
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}