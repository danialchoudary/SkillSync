// removed duplicate useSelector import
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, fetchCurrentUser } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import RecruiterSidebar from '../components/RecruiterSidebar';
import JobForm from '../features/jobs/components/JobForm';
import JobCard from '../features/jobs/components/JobCard';
import { postJob, getMyJobs, deleteJob, updateJob } from '../features/jobs/services/jobApi';
import RecruiterProfileSection from '../components/RecruiterProfileSection';
import Applicants from './Applicants';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import EditJobModal from '../components/EditJobModal';
import RecruiterDashboard from './RecruiterDashboard';

function RecruiterPanel() {
  const unreadCount = useSelector(state => state.unread.count);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  // Determine initial section from URL
  const activeSection = location.pathname.replace(/^\/recruiter\/?/, '') || 'dashboard';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [dateSort, setDateSort] = useState('newest'); // 'newest' | 'oldest'

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch current user on mount (for up-to-date company logo/name)
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Handle section changes via navigation
  const handleSectionChange = (section) => {
    navigate(`/recruiter${section === 'dashboard' ? '' : '/' + section}`);
  };

  useEffect(() => {
    // Trigger side effects when the URL section changes
    if (activeSection === 'myjobs') fetchJobs();
  }, [activeSection]);

  const handlePostJob = async job => {
    try {
      await postJob(job);
      setToast('Job posted successfully!');
      setToastType('success');
      fetchJobs();
    } catch {
      setToast('Failed to post job. Please try again.');
      setToastType('error');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteJob = async job => {
    await deleteJob(job._id || job.id);
    fetchJobs();
  };

  const handleEditJob = job => {
    setEditJob(job);
  };

  const handleUpdateJob = async updated => {
    setEditLoading(true);
    setEditError('');
    try {
      await updateJob(editJob._id || editJob.id, updated);
      setEditJob(null);
      fetchJobs();
    } catch (err) {
      setEditError('Failed to update job. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter and sort jobs (memoized for performance)
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Filter by search query (job title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [jobs, searchQuery, dateSort]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDateSort('newest');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {toast && <Toast type={toastType} message={toast} onClose={() => setToast(null)} />}
      <Topbar user={user} />
      <div className="flex flex-1 h-0">
        <RecruiterSidebar activeSection={activeSection} onSectionChange={handleSectionChange} unreadCount={unreadCount} />
        <div className="flex-1 p-8 relative flex flex-col overflow-y-auto">
          {activeSection === 'dashboard' && <RecruiterDashboard />}
          {activeSection === 'post-job' && <JobForm onPost={handlePostJob} />}
          {activeSection === 'myjobs' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Enhanced Header Section - Ultra Compact */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                        My Job Postings
                      </h2>
                      <p className="text-gray-600 text-[10px]">Manage your listings</p>
                    </div>
                  </div>

                  {/* Stats Card - Ultra Compact */}
                  {!loading && jobs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-3 py-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm"
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{jobs.length}</div>
                        <div className="text-[10px] text-gray-600 font-medium">Total {jobs.length === 1 ? 'Job' : 'Jobs'}</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
              </motion.div>

              {/* Filters Section - Ultra Compact */}
              {!loading && jobs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mb-2"
                >
                  <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-2">
                      {/* Search Input */}
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Search by Job Title
                        </label>
                        <div className="relative">
                          <svg
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g., Senior Developer..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-200"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Date Sort */}
                      <div className="lg:w-48">
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Sort
                        </label>
                        <div className="relative">
                          <svg
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                          </select>
                          <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Filter Summary & Clear Button */}
                    {searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <span className="font-semibold">Filter:</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                            "{searchQuery}"
                          </span>
                          <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
                            {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? 'result' : 'results'}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleClearFilters}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Clear
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {loading ? (
                  /* Enhanced Loading State */
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md"
                      >
                        <div className="animate-pulse flex gap-4">
                          <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  /* Enhanced Empty State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center min-h-[400px] text-center px-4"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-6"
                    >
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-xl">
                        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Posted Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Start building your team by posting your first job opportunity. Reach thousands of qualified candidates!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSectionChange('post-job')}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Your First Job
                    </motion.button>
                  </motion.div>
                ) : filteredAndSortedJobs.length === 0 ? (
                  /* No Results State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center min-h-[300px] text-center px-4"
                  >
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                    <p className="text-gray-600 mb-4">
                      No jobs match your current filters. Try adjusting your search criteria.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearFilters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Job Cards Grid - Multi Column */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredAndSortedJobs.map((job, index) => (
                      <motion.div
                        key={job._id || job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="h-full"
                      >
                        <JobCard
                          job={{
                            ...job,
                            postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown',
                          }}
                          onEdit={handleEditJob}
                          onDelete={handleDeleteJob}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
              {/* Edit Job Modal */}
              <EditJobModal
                open={!!editJob}
                job={editJob}
                onClose={() => setEditJob(null)}
                onUpdate={handleUpdateJob}
                loading={editLoading}
              />
            </div>
          )}
          {activeSection === 'applicants' && (
            <Applicants setToast={setToast} setToastType={setToastType} />
          )}
          {activeSection === 'profile' && (
            <RecruiterProfileSection setToast={setToast} setToastType={setToastType} />
          )}
        </div>
      </div>
    </div >
  );
}

export default RecruiterPanel;
