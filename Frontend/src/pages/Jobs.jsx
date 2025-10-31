import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import JobCard from '../features/jobs/components/JobCard';
import api from '../services/api';
import { saveJob, unsaveJob, getSavedJobs } from '../features/jobs/services/jobApi';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBriefcase, FaFilter, FaTimes } from 'react-icons/fa';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch jobs from backend
    api.get('/jobs')
      .then(res => {
        setJobs(res.data);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load jobs');
        setJobs([]);
      })
      .finally(() => setLoading(false));
    // Fetch user for Topbar
    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
    // Fetch saved jobs
    getSavedJobs().then(setSavedJobs).catch(() => setSavedJobs([]));
    // Fetch user's applications
    api.get('/applications/mine')
      .then(res => setApplications(res.data))
      .catch(() => setApplications([]));
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to check if job is saved
  const isJobSaved = (jobId) => savedJobs.some(j => (j._id || j.id) === jobId);

  const handleSave = async (job) => {
    await saveJob(job._id || job.id);
    getSavedJobs().then(setSavedJobs);
  };

  const handleUnsave = async (job) => {
    await unsaveJob(job._id || job.id);
    getSavedJobs().then(setSavedJobs);
  };

  const appliedJobIds = new Set(applications.map(app => app.jobId?._id || app.jobId?.id || app.jobId));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      <Topbar user={user || {}} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection="jobs" onSectionChange={() => {}} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              {/* Title & Stats */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-1">
                    Explore Opportunities
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 text-sm">
                    <FaBriefcase className="text-blue-600" />
                    <span className="font-semibold text-blue-600">{filteredJobs.length}</span>
                    {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                  </p>
                </div>

                {/* Filter Toggle - Mobile */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg text-sm"
                >
                  <FaFilter />
                  Filters
                </motion.button>
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="relative flex items-center">
                  <div className="absolute left-4 pointer-events-none">
                    <FaSearch className="text-gray-400 text-base" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by job title, company, or location..."
                    className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-sm hover:border-gray-300 text-sm"
                  />
                  {search && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearch('')}
                      className="absolute right-2 w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors text-base"
                    >
                      <FaTimes />
                    </motion.button>
                  )}
                </div>

                {/* Search suggestions hint */}
                {search && filteredJobs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10"
                  >
                    <p className="text-xs text-gray-600">
                      Found <span className="font-bold text-blue-600">{filteredJobs.length}</span> matching {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Jobs Grid Section */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
                    />
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 font-medium"
                    >
                      Loading amazing opportunities...
                    </motion.p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mb-4">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-red-500 text-center max-w-md">{error}</p>
                  </motion.div>
                ) : filteredJobs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                      <FaBriefcase className="text-5xl text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                    <p className="text-gray-500 text-center max-w-md mb-6">
                      {search 
                        ? `We couldn't find any jobs matching "${search}". Try different keywords.`
                        : "No jobs are currently available. Check back soon!"
                      }
                    </p>
                    {search && (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSearch('')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Clear Search
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="jobs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6"
                  >
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id || job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <JobCard
                          job={{
                            ...job,
                            applied: appliedJobIds.has(job._id || job.id),
                            postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown',
                          }}
                          onApply={() => {}}
                          saved={isJobSaved(job._id || job.id)}
                          onSave={handleSave}
                          onUnsave={handleUnsave}
                          user={user}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}