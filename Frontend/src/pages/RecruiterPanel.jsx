// removed duplicate useSelector import
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, fetchCurrentUser } from '../features/auth/authSlice';
import RecruiterSidebar from '../components/RecruiterSidebar';
import JobForm from '../features/jobs/components/JobForm';
import JobCard from '../features/jobs/components/JobCard';
import { postJob, getMyJobs, deleteJob, updateJob } from '../features/jobs/services/jobApi';
import RecruiterProfileSection from '../components/RecruiterProfileSection';
import Applicants from './Applicants';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

function RecruiterPanel() {
  const unreadCount = useSelector(state => state.unread.count);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  // Determine initial section from URL
  const sectionFromUrl = location.pathname.replace(/^\/recruiter\/?/, '') || 'dashboard';
  const [activeSection, setActiveSection] = useState(sectionFromUrl);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');

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

  useEffect(() => {
    // Update URL when activeSection changes
    if (activeSection) {
      navigate(`/recruiter${activeSection === 'dashboard' ? '' : '/' + activeSection}`);
    }
    if (activeSection === 'myjobs') fetchJobs();
    // eslint-disable-next-line
  }, [activeSection, navigate]);

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

  return (
  <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {toast && <Toast type={toastType} message={toast} onClose={() => setToast(null)} />}
      <Topbar user={user} />
      <div className="flex flex-1 h-0">
        <RecruiterSidebar activeSection={activeSection} onSectionChange={setActiveSection} unreadCount={unreadCount} />
        <div className="flex-1 p-8 relative flex flex-col">
          {activeSection === 'dashboard' && (
            <JobForm onPost={handlePostJob} />
          )}
          {activeSection === 'myjobs' && (
            <div className="flex flex-col flex-1 min-h-0">
              <h2 className="text-xl font-bold mb-4">My Jobs</h2>
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-gray-400">No jobs posted yet.</div>
                ) : (
                  jobs.map(job => (
                    <JobCard
                      key={job._id || job.id}
                      job={{
                        ...job,
                        postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown',
                      }}
                      onEdit={handleEditJob}
                      onDelete={handleDeleteJob}
                    />
                  ))
                )}
              </div>
              {/* Edit Job Modal */}
              {editJob && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white rounded shadow p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">Edit Job</h3>
                    {editError && <div className="text-red-600 mb-2">{editError}</div>}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleUpdateJob({
                          title: e.target.title.value,
                          company: e.target.company.value,
                          description: e.target.description.value,
                          location: e.target.location.value,
                          salary: e.target.salary.value,
                          skills: e.target.skills.value,
                          experience: e.target.experience.value,
                        });
                      }}
                      className="flex flex-col gap-3"
                    >
                      <input name="title" defaultValue={editJob.title} className="border px-3 py-2 rounded" required />
                      <input name="company" defaultValue={editJob.company} className="border px-3 py-2 rounded" required />
                      <textarea name="description" defaultValue={editJob.description} className="border px-3 py-2 rounded" rows={3} required />
                      <div className="flex gap-2">
                        <input name="location" defaultValue={editJob.location} className="border px-3 py-2 rounded w-1/2" required />
                        <input name="salary" defaultValue={editJob.salary} className="border px-3 py-2 rounded w-1/2" required />
                      </div>
                      <div className="flex gap-2">
                        <input name="skills" defaultValue={editJob.skills} className="border px-3 py-2 rounded w-1/2" />
                        <input name="experience" defaultValue={editJob.experience} className="border px-3 py-2 rounded w-1/2" type="number" min="0" />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setEditJob(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeSection === 'applicants' && (
            <Applicants />
          )}
          {activeSection === 'profile' && (
            <RecruiterProfileSection />
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterPanel;
