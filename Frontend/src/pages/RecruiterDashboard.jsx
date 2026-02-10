import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentApplicants } from '../services/dashboardApi';
import { getImageUrl } from '../utils/urlHelper';

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
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load dashboard data. Please try again.';
        setError(`${errorMessage} (Status: ${err.response?.status})`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-500 mb-6 text-sm font-mono break-all">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6 sm:p-8 lg:p-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 tracking-tight"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 mt-1"
            >
              Welcome back! Here's what's happening today.
            </motion.p>
          </div>
          {/* Add Action Buttons if needed */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            icon={<Briefcase className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            delay={0.1}
            onClick={() => navigate('/recruiter/myjobs')}
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-indigo-500"
            delay={0.2}
            onClick={() => navigate('/recruiter/applicants')}
          />
          {/* Placeholder for future stat, e.g., Interviews Scheduled */}
          <StatCard
            title="Active Listings"
            value={stats.totalJobs} // Using totalJobs for now as placeholder for 'Active'
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-emerald-500"
            delay={0.3}
            label="Active Now"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Chart Section (Placeholder for now, can be real data later) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Application Activity</h3>
              <select className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.activity}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Applicants List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Applicants</h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {recentApplicants.length > 0 ? (
                recentApplicants.map((applicant, index) => (
                  <div
                    key={applicant.id || index}
                    className="group flex p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 mr-4 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative">
                      {applicant.profilePicture ? (
                        <img
                          src={getImageUrl(applicant.profilePicture)}
                          alt={applicant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-600">
                          {applicant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {applicant.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Briefcase size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500 truncate">{applicant.jobTitle}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-gray-400" />
                        <p className="text-[10px] text-gray-400">
                          {new Date(applicant.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">No new applicants yet.</p>
                  <p className="text-xs mt-1">Check back later or post a new job!</p>
                </div>
              )}
            </div>

            {recentApplicants.length > 0 && (
              <button className="w-full mt-4 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                View All Applications
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, delay, label, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -5, scale: onClick ? 1.02 : 1 }}
    onClick={onClick}
    className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group ${onClick ? 'cursor-pointer active:scale-95 transition-all' : ''}`}
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <div className={`w-24 h-24 rounded-full ${color.replace('bg-', 'bg-gradient-to-br from-')}-100 to-transparent blur-2xl`}></div>
    </div>

    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-blue-500/20`}>
        {icon}
      </div>
      {label && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">{label}</span>}
    </div>

    <div>
      <h3 className="text-gray-500 text-sm font-medium mb-1 pl-1">{title}</h3>
      <div className="text-4xl font-bold text-gray-900 tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default RecruiterDashboard;