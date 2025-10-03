import React, { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { getSavedJobs, unsaveJob, applyForJob } from '../services/jobApi';
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  const appliedJobIds = new Set(applications.map(app => app.jobId?._id || app.jobId?.id || app.jobId));
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar user={user} />
      <div className="flex flex-1">
        <Sidebar activeSection="saved" onSectionChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <div className="text-center text-gray-400">No saved jobs yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedJobs.map(job => (
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
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
