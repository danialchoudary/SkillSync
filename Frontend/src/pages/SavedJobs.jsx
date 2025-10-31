import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../features/jobs/components/JobCard';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { getSavedJobs, unsaveJob, applyForJob } from '../features/jobs/services/jobApi';
import api from '../services/api';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  const fetchSavedJobs = async () => {
    setLoading(true);
    await getSavedJobs().then(setSavedJobs).catch(() => setSavedJobs([]));
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedJobs();
    api.get('/me').then(res => setUser(res.data)).catch(() => setUser({}));
    api.get('/applications/mine')
      .then(res => setApplications(res.data))
      .catch(() => setApplications([]));
  }, []);

  const handleUnsave = async (job) => {
    await unsaveJob(job._id || job.id);
    fetchSavedJobs();
  };

  const handleApply = async (job, coverLetter, resumeFile) => {
    try {
      await applyForJob(job._id || job.id, coverLetter, resumeFile);
      alert('Application submitted successfully!');
    } catch (err) {
      alert('Failed to apply for job.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            {/* Inner pulsing circle */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-blue-100"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-600 font-medium"
          >
            Loading your saved jobs...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const appliedJobIds = new Set(applications.map(app => app.jobId?._id || app.jobId?.id || app.jobId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex flex-col">
      <Topbar user={user} />
      
      <div className="flex flex-1">
        <div className="sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 z-20">
          <Sidebar activeSection="saved" onSectionChange={() => {}} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Saved Jobs
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
                </p>
              </div>
              
              {savedJobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {applications.length} Applied
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Empty State */}
          {savedJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center border border-gray-100">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  No Saved Jobs Yet
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-6 leading-relaxed"
                >
                  Start saving jobs you're interested in to keep track of opportunities and apply later.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/jobs'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Jobs
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Jobs Grid */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {savedJobs.map((job, index) => (
                    <motion.div
                      key={job.id || job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        ease: 'easeOut'
                      }}
                      layout
                      className="h-full"
                    >
                      <JobCard
                        job={{ ...job, applied: appliedJobIds.has(job._id || job.id) }}
                        saved={true}
                        onDelete={handleUnsave}
                        onApply={handleApply}
                        user={user}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Bottom Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Pro Tip</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Save jobs to review later and set up job alerts to get notified when similar positions become available. Apply early to increase your chances!
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}