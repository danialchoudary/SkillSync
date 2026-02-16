import React, { useEffect, useState } from 'react';
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
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  const appliedJobIds = new Set(applications.map(app => app.jobId?._id || app.jobId?.id || app.jobId));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar activeSection="saved" onSectionChange={() => { }} />
        </div>
        <main className="flex-1 lg:ml-64 w-full max-w-7xl mx-auto pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 scroll-smooth">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                  Saved Jobs
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
                </p>
              </div>

              {savedJobs.length > 0 && (
                <div className="flex items-center gap-2 bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                  <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {applications.length} Applied
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {savedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-8 sm:p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No Saved Jobs Yet</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
                  Start saving jobs you're interested in to keep track of opportunities and apply later.
                </p>
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Jobs
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedJobs.map((job) => (
                  <JobCard
                    key={job.id || job._id}
                    job={{ ...job, applied: appliedJobIds.has(job._id || job.id) }}
                    saved={true}
                    onDelete={handleUnsave}
                    onApply={handleApply}
                    user={user}
                  />
                ))}
              </div>

              {/* Pro Tip */}
              <div className="mt-8 bg-[var(--color-accent-bg)] rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[var(--color-accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text-primary)] text-sm mb-0.5">Pro Tip</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      Apply early to increase your chances! Set up job alerts to get notified when similar positions become available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
