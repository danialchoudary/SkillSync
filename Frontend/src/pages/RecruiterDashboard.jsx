import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentApplicants } from '../services/dashboardApi';
import { getImageUrl } from '../utils/urlHelper';
import Skeleton from '../components/skeletons/Skeleton';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, activity: [] });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, applicantsData] = await Promise.all([
          getDashboardStats(),
          getRecentApplicants()
        ]);
        setStats(statsData);
        setRecentApplicants(applicantsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load dashboard data.';
        setError(`${errorMessage} (Status: ${err.response?.status})`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-3">
             <Skeleton className="h-8 w-48" />
             <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Skeleton className="h-32 w-full rounded-xl" />
             <Skeleton className="h-32 w-full rounded-xl" />
             <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
             <Skeleton className="lg:col-span-2 h-[300px] w-full rounded-xl" />
             <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] max-w-md w-full text-center">
          <div className="w-12 h-12 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 break-all">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            icon={<Briefcase className="w-5 h-5 text-white" />}
            color="bg-[var(--color-accent)]"
            onClick={() => navigate('/recruiter/myjobs')}
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-indigo-500"
            onClick={() => navigate('/recruiter/applicants')}
          />
          <StatCard
            title="Active Listings"
            value={stats.totalJobs}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-[var(--color-success)]"
            label="Active Now"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-[var(--color-text-primary)]">Application Activity</h3>
              <select className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.activity}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071E3" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#AEAEB2', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#AEAEB2', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
                    cursor={{ stroke: '#0071E3', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#0071E3" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Applicants */}
          <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Recent Applicants</h3>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {recentApplicants.length > 0 ? (
                recentApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id || index}
                    className="flex items-center p-3 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-secondary)] shrink-0 mr-3 overflow-hidden">
                      {applicant.profilePicture ? (
                        <img
                          src={getImageUrl(applicant.profilePicture)}
                          alt={applicant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[var(--color-text-secondary)]">
                          {applicant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {applicant.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Briefcase size={11} className="text-[var(--color-text-tertiary)]" />
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">{applicant.jobTitle}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-[var(--color-text-tertiary)]" />
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">
                          {new Date(applicant.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">No new applicants yet</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Check back later or post a new job</p>
                </div>
              )}
            </div>

            {recentApplicants.length > 0 && (
              <button
                className="w-full mt-4 py-2.5 text-sm font-medium text-[var(--color-accent)] bg-[var(--color-accent-bg)] hover:bg-blue-100 rounded-lg transition-colors"
                onClick={() => navigate('/recruiter/applicants')}
              >
                View All Applications
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, label, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] shadow-[var(--shadow-sm)] ${onClick ? 'cursor-pointer hover:border-gray-300' : ''} transition-colors`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        {icon}
      </div>
      {label && (
        <span className="bg-[var(--color-success-bg)] text-[var(--color-success)] text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {label}
        </span>
      )}
    </div>

    <div>
      <h3 className="text-sm text-[var(--color-text-secondary)] font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">{value}</div>
    </div>
  </div>
);

export default RecruiterDashboard;
