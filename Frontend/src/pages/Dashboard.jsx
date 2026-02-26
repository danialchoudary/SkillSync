import { useState } from 'react';
import { FaBuilding, FaBookmark, FaBullseye, FaChartLine, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatsCard from '../components/StatsCard';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import ApplicationTrendsChart from '../components/ApplicationTrendsChart';
import JobStatusChart from '../components/JobStatusChart';
import Footer from '../components/Footer';
import useJobseekerDashboardData from '../features/dashboard/hooks/useJobseekerDashboardData';
import { getImageUrl } from '../utils/urlHelper';
import { APPLICATION_STATUS_LABELS } from '../utils/applicationStatus';

const STATUS_BADGES = {
  applied: 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]',
  screening: 'bg-[#EEF7FF] text-[#0B79D0]',
  interview: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  hired: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
};

export default function Dashboard() {
  const unreadCount = useSelector((state) => state.unread.count);
  const [activeSection, setActiveSection] = useState('dashboard');
  const {
    user,
    analytics,
    loading,
    error,
    stats,
    statusChartData,
    hasStatusData,
    progressMetrics,
    profileCompletion,
    missingFields,
  } = useJobseekerDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-8 max-w-md text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
            <span className="text-xl text-[var(--color-danger)]">!</span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            unreadCount={unreadCount}
          />
        </div>

        <main className="flex-1 lg:ml-64 w-full max-w-7xl mx-auto pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="space-y-4">
                  <div className="relative overflow-hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5 sm:p-6">
                    <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[var(--color-accent-bg)]/80 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 left-10 w-52 h-52 rounded-full bg-[var(--color-success-bg)]/70 blur-3xl" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="shrink-0">
                          {user.role === 'recruiter' ? (
                            user.companyLogo ? (
                              <img
                                src={getImageUrl(user.companyLogo)}
                                alt="company logo"
                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                              />
                            ) : (
                              <span className="w-16 h-16 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] ring-1 ring-[var(--color-border)]">
                                <FaBuilding size={24} />
                              </span>
                            )
                          ) : (
                            user.profilePicture ? (
                              <img
                                src={getImageUrl(user.profilePicture)}
                                alt="avatar"
                                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                              />
                            ) : (
                              <span className="w-16 h-16 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] ring-1 ring-[var(--color-border)]">
                                <FaUser size={24} />
                              </span>
                            )
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] truncate">
                              Welcome back, {user.name}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                              Jobseeker Dashboard
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] max-w-2xl">
                            Track your job search with real-time analytics from your applications.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto lg:min-w-[300px]">
                        <div className="rounded-xl border border-[var(--color-border)] bg-white/75 backdrop-blur-sm p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Applications</p>
                          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{analytics.overview.totalApplications}</p>
                        </div>
                        <div className="rounded-xl border border-[var(--color-border)] bg-white/75 backdrop-blur-sm p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Response Rate</p>
                          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{analytics.overview.responseRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileCompletionCard percent={profileCompletion} missingFields={missingFields} />
                    <StatsCard stats={stats} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)] flex items-center justify-center mb-3">
                        <FaBookmark className="text-sm" />
                      </div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Saved Jobs</p>
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">{analytics.overview.savedJobs}</p>
                    </div>

                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-warning-bg)] text-[var(--color-warning)] flex items-center justify-center mb-3">
                        <FaChartLine className="text-sm" />
                      </div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Active Pipeline</p>
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">{analytics.overview.activeApplications}</p>
                    </div>

                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                      <div className="w-9 h-9 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center mb-3">
                        <FaBullseye className="text-sm" />
                      </div>
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Responded</p>
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">{analytics.overview.respondedApplications}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 space-y-4">
                      <ApplicationTrendsChart data={analytics.trends} />

                      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Progress Metrics</h3>
                        <div className="space-y-4">
                          {progressMetrics.map((metric) => {
                            const width = Math.max(0, Math.min(metric.value, 100));
                            return (
                              <div key={metric.key}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{metric.label}</p>
                                  <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{width}%</p>
                                </div>
                                <div className="h-2 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${metric.barClass}`}
                                    style={{ width: `${width}%` }}
                                  />
                                </div>
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5">{metric.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {hasStatusData ? (
                        <JobStatusChart data={statusChartData} />
                      ) : (
                        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Application Pipeline</h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">Apply to jobs to start seeing your pipeline breakdown.</p>
                        </div>
                      )}

                      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-5">
                        <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Recent Applications</h3>
                        {analytics.recentApplications.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.recentApplications.map((application) => (
                              <div
                                key={application.id}
                                className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)]/70"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                      {application.jobTitle}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{application.company}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${STATUS_BADGES[application.status] || 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>
                                    {APPLICATION_STATUS_LABELS[application.status] || application.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
                                  {new Date(application.appliedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--color-text-secondary)]">No recent applications yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
