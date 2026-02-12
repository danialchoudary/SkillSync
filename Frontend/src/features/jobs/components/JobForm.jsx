import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Briefcase } from 'lucide-react';

export default function JobForm({ onPost }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    skills: '',
    experience: '',
  });
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsLoading(true);
    
    if (onPost) {
      Promise.resolve(onPost(form))
        .then(() => {
          setToast('Job posted successfully!');
          setToastType('success');
          setForm({ title: '', company: '', description: '', location: '', salary: '', skills: '', experience: '' });
          setTimeout(() => setToast(null), 3000);
        })
        .catch(() => {
          setToast('Failed to post job. Please try again.');
          setToastType('error');
          setTimeout(() => setToast(null), 3000);
        })
        .finally(() => setIsLoading(false));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" }
    })
  };

  const toastVariants = {
    initial: { opacity: 0, y: -20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center px-4 py-12 overflow-y-auto">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={toastVariants}
          className="fixed top-6 right-6 z-50 max-w-sm"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border ${
            toastType === 'success'
              ? 'bg-green-50/80 border-green-200 text-green-900'
              : 'bg-red-50/80 border-red-200 text-red-900'
          }`}>
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{toast}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Post a Job</h1>
          </div>
          <p className="text-gray-600 text-lg">Share an opportunity with talented professionals</p>
        </motion.div>

        {/* Form Container */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 p-8 border border-gray-100"
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Row 1: Title and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Senior Product Designer"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                required
              />
            </motion.div>

            <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g., TechCorp Inc."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                required
              />
            </motion.div>
          </div>

          {/* Row 2: Description */}
          <motion.div custom={4} variants={itemVariants} initial="hidden" animate="visible" className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none resize-none"
              rows={4}
              required
            />
          </motion.div>

          {/* Row 3: Location and Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div custom={5} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                required
              />
            </motion.div>

            <motion.div custom={6} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Salary Range</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g., $100k - $150k/year"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                required
              />
            </motion.div>
          </div>

          {/* Row 4: Skills and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div custom={7} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Required Skills</label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g., React, TypeScript, Figma"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
              />
            </motion.div>

            <motion.div custom={8} variants={itemVariants} initial="hidden" animate="visible">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Years of Experience</label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g., 5"
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-400 text-gray-900 transition duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
              />
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div custom={9} variants={itemVariants} initial="hidden" animate="visible">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Posting...
                </span>
              ) : (
                'Post Job Opportunity'
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Footer Text */}
        <motion.p
          custom={10}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-center text-gray-500 text-sm mt-6"
        >
          Your job posting will be visible to thousands of qualified candidates
        </motion.p>
      </motion.div>
    </div>
  );
}