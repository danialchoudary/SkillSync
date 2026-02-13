import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import JobCard from '../features/jobs/components/JobCard';
import api from '../services/api';
import { saveJob, unsaveJob, getSavedJobs } from '../features/jobs/services/jobApi';
import { FaSearch, FaBriefcase, FaTimes } from 'react-icons/fa';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/jobs')
      .then(res => { setJobs(res.data); setError(''); })
      .catch(err => { setError(err.response?.data?.error || 'Failed to load jobs'); setJobs([]); })
      .finally(() => setLoading(false));
    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
    getSavedJobs().then(setSavedJobs).catch(() => setSavedJobs([]));
    api.get('/applications/mine')
      .then(res => setApplications(res.data))
      .catch(() => setApplications([]));
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user || {}} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar activeSection="jobs" onSectionChange={() => { }} />
        </div>

        <main className="flex-1 lg:ml-64 pt-14 flex flex-col">
          {/* Header */}
          <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {/* Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    Explore Opportunities
                  </h1>
                  <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mt-0.5">
                    <FaBriefcase className="text-[var(--color-accent)]" />
                    <span className="font-medium text-[var(--color-accent)]">{filteredJobs.length}</span>
                    {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none">
                  <FaSearch className="text-[var(--color-text-tertiary)] text-sm" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by job title, company, or location..."
                  className="w-full pl-10 pr-10 py-2.5 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] text-sm outline-none hover:border-gray-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 w-6 h-6 rounded-full bg-[var(--color-surface-secondary)] hover:bg-gray-200 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">Loading jobs...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mb-4">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
                  <p className="text-sm text-[var(--color-danger)] text-center max-w-md">{error}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center mb-4">
                    <FaBriefcase className="text-3xl text-[var(--color-text-tertiary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No Jobs Found</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md mb-4">
                    {search
                      ? `We couldn't find any jobs matching "${search}". Try different keywords.`
                      : "No jobs are currently available. Check back soon!"
                    }
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 pb-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id || job._id}
                      job={{
                        ...job,
                        applied: appliedJobIds.has(job._id || job.id),
                        postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown',
                      }}
                      onApply={() => { }}
                      saved={isJobSaved(job._id || job.id)}
                      onSave={handleSave}
                      onUnsave={handleUnsave}
                      user={user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
