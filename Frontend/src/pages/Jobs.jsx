import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import api from '../services/api';
import { saveJob, unsaveJob, getSavedJobs } from '../services/jobApi';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar user={user || {}} />
      <div className="flex flex-1">
        <Sidebar activeSection="jobs" onSectionChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Browse Jobs</h2>
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs by title, company, location..."
              className="border px-3 py-2 rounded w-full max-w-md"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center text-gray-400">No jobs found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <JobCard
                  key={job.id || job._id}
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
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
