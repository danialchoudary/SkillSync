import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import api from '../services/api';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    api.get('/me').then(res => setUser(res.data)).catch(() => setUser({}));
    api.get('/applications/mine')
      .then(res => setApplications(res.data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter applications by status
  // Map filter options to backend status values
  const statusMap = {
    'Accepted': 'accepted',
    'Rejected': 'rejected',
    'Pending': 'pending',
  };
  const filteredApplications = statusFilter === 'All'
    ? applications
    : applications.filter(app => app.status === statusMap[statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar user={user} />
      <div className="flex flex-1">
        <Sidebar activeSection="applications" onSectionChange={() => {}} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">My Applications</h2>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                className="px-5 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 hover:from-purple-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2"
                onClick={() => setFilterOpen(f => !f)}
              >
                {/* Modern funnel filter icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 16v-2.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                <span className="drop-shadow"> Filter</span>
              </button>
              {filterOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow z-10">
                  {['All', 'Accepted', 'Rejected', 'Pending'].map(option => (
                    <button
                      key={option}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${statusFilter === option ? 'bg-blue-100 font-bold' : ''}`}
                      onClick={() => {
                        setStatusFilter(option);
                        setFilterOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="ml-2 text-gray-600">{statusFilter} Applications</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center text-gray-400">No applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Job Title</th>
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Applied Date</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Cover Letter</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app._id} className="border-b">
                      <td className="px-4 py-2">{app.jobId?.title || '-'}</td>
                      <td className="px-4 py-2">{app.jobId?.company || '-'}</td>
                      <td className="px-4 py-2">{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{app.status}</td>
                      <td className="px-4 py-2 whitespace-pre-line max-w-xs overflow-auto">{app.coverLetter || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
