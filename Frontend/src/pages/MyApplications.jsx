import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      .then(res => {
        console.log('Applications data:', res.data); // Log the applications data
        setApplications(res.data);
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const statusMap = {
    'Accepted': 'accepted',
    'Rejected': 'rejected',
    'Pending': 'pending',
  };
  
  const filteredApplications = statusFilter === 'All'
    ? applications
    : applications.filter(app => app.status === statusMap[statusFilter]);

  const getStatusStyle = (status) => {
    const styles = {
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'accepted') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (status === 'rejected') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Topbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <div className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 z-20">
          <Sidebar activeSection="applications" onSectionChange={() => {}} />
        </div>
        <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Applications</h2>
            <p className="text-gray-600">Track and manage your job applications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="relative">
              <button
                type="button"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                onClick={() => setFilterOpen(f => !f)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filter by Status</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    {['All', 'Accepted', 'Rejected', 'Pending'].map((option, idx) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150 flex items-center gap-3 ${
                          statusFilter === option ? 'bg-gradient-to-r from-blue-100 to-indigo-100 font-semibold text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setStatusFilter(option);
                          setFilterOpen(false);
                        }}
                      >
                        {statusFilter === option && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={statusFilter === option ? '' : 'ml-8'}>{option}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                {filteredApplications.length} {statusFilter !== 'All' && statusFilter} Application{filteredApplications.length !== 1 && 's'}
              </span>
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Loading your applications...</p>
            </motion.div>
          ) : filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Applications Found</h3>
              <p className="text-gray-500 text-center max-w-md">
                {statusFilter !== 'All' 
                  ? `You don't have any ${statusFilter.toLowerCase()} applications yet.`
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider">Cover Letter</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredApplications.map((app, idx) => (
                        <motion.tr
                          key={app._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {app.jobId?.title || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {app.jobId ? (
                                app.jobId.companyLogo && app.jobId.companyLogo.trim() !== '' ? (
                                  <img
                                    src={app.jobId.companyLogo}
                                    alt={`${app.jobId.company} logo`}
                                    className="w-10 h-10 rounded-lg mr-3 shadow-md"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 shadow-md">
                                    {(app.jobId.company || '?')[0].toUpperCase()}
                                  </div>
                                )
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 font-bold text-sm mr-3 shadow-md">
                                  N/A
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {app.jobId?.company || 'Unknown Company'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(app.status)}`}>
                              {getStatusIcon(app.status)}
                              <span className="capitalize">{app.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs overflow-hidden">
                              <details className="cursor-pointer group/details">
                                <summary className="font-medium text-blue-600 hover:text-blue-700 transition-colors list-none flex items-center gap-1">
                                  <span>View Letter</span>
                                  <svg className="w-4 h-4 transition-transform group-open/details:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs whitespace-pre-line max-h-40 overflow-y-auto">
                                  {app.coverLetter || 'No cover letter provided'}
                                </div>
                              </details>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}