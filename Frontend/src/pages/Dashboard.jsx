import React, { useEffect, useState } from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import Topbar from '../components/Topbar';
import JobCard from '../components/JobCard';
import StatsCard from '../components/StatsCard';
import ActivityList from '../components/ActivityList';
import ProfileCompletionCard from '../components/ProfileCompletionCard';
import Footer from '../components/Footer';
import { getMe } from '../services/api';

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar user={user} notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} unreadCount={unreadCount} />
        <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSection === 'dashboard' && (
            <>
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  {user.role === 'recruiter' ? (
                    user.companyLogo ? (
                      <img src={`http://localhost:5000${user.companyLogo}`} alt="company logo" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <FaBuilding size={32} />
                      </span>
                    )
                  ) : (
                    user.profilePicture ? (
                      <img src={`http://localhost:5000${user.profilePicture}`} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <FaUser size={32} />
                      </span>
                    )
                  )}
                  <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileCompletionCard percent={profileCompletion} missingFields={missingFields} />
                  <StatsCard stats={stats} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <ActivityList activities={activities} />
                  <div>
                    <h4 className="font-bold text-md mb-2">Job Recommendations</h4>
                    {recommendedJobs.length > 0 ? (
                      recommendedJobs.map(job => (
                        <JobCard key={job.id} job={job} onApply={() => {}} />
                      ))
                    ) : (
                      <div className="text-gray-400">No recommendations yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Profile section removed from dashboard. */}
          {/* Add other sections: applications, saved, messages, settings, etc. */}
        </main>
      </div>
      <Footer />
    </div>
  );
}
