import React, { useEffect, useState } from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import Topbar from '../components/Topbar';
import JobCard from '../features/jobs/components/JobCard';
import StatsCard from '../components/StatsCard';
import ActivityList from '../components/ActivityList';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import Footer from '../components/Footer';
import { getMe } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const unreadCount = useSelector(state => state.unread.count);
  const [user, setUser] = useState(null);
  const [appStats, setAppStats] = useState({ applied: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editOpen, setEditOpen] = useState(false);

  const fetchUser = () => {
    setLoading(true);
    getMe()
      .then(res => {
        setUser(res.data);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
    // Fetch application stats for job seeker
    async function fetchApplicationStats() {
      try {
        const res = await import('../services/api').then(m => m.default.get('/applications/mine'));
        const applications = res.data || [];
        const applied = applications.length;
        const accepted = applications.filter(app => app.status === 'accepted').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;
        setAppStats({ applied, accepted, rejected });
      } catch {
        setAppStats({ applied: 0, accepted: 0, rejected: 0 });
      }
    }
    fetchApplicationStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 font-medium"
        >
          Loading your dashboard...
        </motion.p>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-red-100"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
        <p className="text-red-500">{error}</p>
      </motion.div>
    </div>
  );

  if (!user) return null;

  // Real application stats from backend
  const stats = {
    Applied: appStats.applied,
    Accepted: appStats.accepted,
    Rejected: appStats.rejected,
  };

  // Calculate profile completion percentage and missing fields
  function getProfileCompletionAndMissing(user) {
    if (!user) return { percent: 0, missingFields: [] };
    let total = 5;
    let filled = 0;
    let missingFields = [];
    if (user.name && user.name.trim().length > 1) filled++; else missingFields.push('Name');
    if (user.email && user.email.includes('@')) filled++; else missingFields.push('Email');
    if (Array.isArray(user.skills) && user.skills.length > 0) filled++; else missingFields.push('Skills');
    if (user.experience && (user.experience.years > 0 || (user.experience.summary && user.experience.summary.length > 0))) filled++; else missingFields.push('Experience');
    if (user.resumeUrl) filled++; else missingFields.push('Resume');
    const percent = Math.round((filled / total) * 100);
    return { percent, missingFields };
  }

  const activities = user?.activities || [];
  const recommendedJobs = user?.recommendedJobs || [];
  const { percent: profileCompletion, missingFields } = getProfileCompletionAndMissing(user);
  const notifications = user?.notifications || [];


  // Allow dashboard to scroll vertically
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
      <Topbar user={user} notifications={notifications} />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-20 w-64">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} unreadCount={unreadCount} />
        </div>
        {/* Main Content with left margin for sidebar */}
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col justify-center items-center"
                >
                  {/* Welcome Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 w-full"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 relative overflow-hidden w-full">
                      {/* Decorative gradient background */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl -z-0"></div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10">
                        {/* Avatar with gradient border */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-md opacity-30"></div>
                          {user.role === 'recruiter' ? (
                            user.companyLogo ? (
                              <img
                                src={user.companyLogo.startsWith('http') ? user.companyLogo : `http://localhost:5000${user.companyLogo}`}
                                alt="company logo"
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-xl"
                              />
                            ) : (
                              <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 border-4 border-white shadow-xl">
                                <FaBuilding size={32} />
                              </span>
                            )
                          ) : (
                            user.profilePicture ? (
                              <img
                                src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                                alt="avatar"
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-xl"
                              />
                            ) : (
                              <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border-4 border-white shadow-xl">
                                <FaUser size={32} />
                              </span>
                            )
                          )}
                        </motion.div>
                        {/* Welcome text */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex-1"
                        >
                          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-1">
                            Welcome back, {user.name}!
                          </h1>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Here's what's happening with your job search today
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main Grid Layout - scrollable */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                    {/* Left Column - Stats & Profile */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="lg:col-span-2 flex flex-col gap-4"
                    >
                      {/* Profile Completion & Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ProfileCompletionCard percent={profileCompletion} missingFields={missingFields} />
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StatsCard stats={stats} />
                        </motion.div>
                      </div>
                      {/* Activity Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -1 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 transition-all duration-300"
                      >
                        <ActivityList activities={activities} />
                      </motion.div>
                    </motion.div>
                    {/* Right Column - Job Recommendations */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-base text-gray-900">
                            Recommended for You
                          </h4>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-sm">
                            {recommendedJobs.length} Jobs
                          </span>
                        </div>
                        <div className="space-y-2 flex-1 min-h-0 overflow-auto custom-scrollbar pr-1">
                          {recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job, index) => (
                              <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ x: 2, transition: { duration: 0.2 } }}
                              >
                                <JobCard job={job} onApply={() => { }} />
                              </motion.div>
                            ))
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-6"
                            >
                              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <span className="text-xl">🔍</span>
                              </div>
                              <p className="text-gray-400 text-xs">No recommendations yet.</p>
                              <p className="text-gray-300 text-xs mt-1">Complete your profile to get personalized matches</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full z-30">
        <Footer />
      </div>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}