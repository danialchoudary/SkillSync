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
import { getImageUrl } from '../utils/urlHelper';

export default function Dashboard() {
  const unreadCount = useSelector(state => state.unread.count);
  const [user, setUser] = useState(null);
  const [appStats, setAppStats] = useState({ applied: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

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
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-8 max-w-md text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
          <span className="text-xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      </div>
    </div>
  );

  if (!user) return null;

  const stats = {
    Applied: appStats.applied,
    Accepted: appStats.accepted,
    Rejected: appStats.rejected,
  };

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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user} notifications={notifications} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            unreadCount={unreadCount}
          />
        </div>

        <main className="flex-1 lg:ml-64 pt-14 flex flex-col">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col justify-center items-center"
                >
                  {/* Welcome Header */}
                  <div className="mb-6 w-full">
                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 sm:p-6 w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Avatar */}
                        <div className="shrink-0">
                          {user.role === 'recruiter' ? (
                            user.companyLogo ? (
                              <img
                                src={getImageUrl(user.companyLogo)}
                                alt="company logo"
                                className="w-14 h-14 rounded-full object-cover ring-1 ring-[var(--color-border)]"
                              />
                            ) : (
                              <span className="w-14 h-14 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                                <FaBuilding size={22} />
                              </span>
                            )
                          ) : (
                            user.profilePicture ? (
                              <img
                                src={getImageUrl(user.profilePicture)}
                                alt="avatar"
                                className="w-14 h-14 rounded-full object-cover ring-1 ring-[var(--color-border)]"
                              />
                            ) : (
                              <span className="w-14 h-14 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                                <FaUser size={22} />
                              </span>
                            )
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-0.5 truncate">
                            Welcome back, {user.name}
                          </h1>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Here's what's happening with your job search today
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                    {/* Left Column */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileCompletionCard percent={profileCompletion} missingFields={missingFields} />
                        <StatsCard stats={stats} />
                      </div>

                      {/* Activity */}
                      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                        <ActivityList activities={activities} />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-[var(--color-text-primary)]">
                            Recommended for You
                          </h4>
                          <span className="text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-bg)] px-2 py-0.5 rounded-full">
                            {recommendedJobs.length} Jobs
                          </span>
                        </div>

                        <div className="space-y-2 flex-1 min-h-0 overflow-auto pr-1">
                          {recommendedJobs.length > 0 ? (
                            recommendedJobs.map((job) => (
                              <JobCard key={job.id} job={job} onApply={() => { }} />
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center">
                                <span className="text-lg">🔍</span>
                              </div>
                              <p className="text-sm text-[var(--color-text-secondary)]">No recommendations yet</p>
                              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Complete your profile to get personalized matches</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
