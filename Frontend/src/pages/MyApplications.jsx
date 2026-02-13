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
      accepted: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-green-200',
      rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-red-200',
      pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-yellow-200',
    };
    return styles[status] || 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]';
  };

  const getStatusIcon = (status) => {
    if (status === 'accepted') {
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (status === 'rejected') {
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar activeSection="applications" onSectionChange={() => { }} />
        </div>

        <main className="flex-1 lg:ml-64 pt-14 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1">My Applications</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Track and manage your job applications</p>
          </div>

          {/* Filter Bar */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="relative">
              <button
                type="button"
                className="px-4 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg text-sm hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-2"
                onClick={() => setFilterOpen(f => !f)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filter by Status</span>
                <svg className={`w-3.5 h-3.5 transition-transform ${filterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {filterOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-[var(--shadow-md)] z-20 overflow-hidden">
                  {['All', 'Accepted', 'Rejected', 'Pending'].map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-secondary)] transition-colors flex items-center gap-2 text-sm ${statusFilter === option ? 'bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                        }`}
                      onClick={() => {
                        setStatusFilter(option);
                        setFilterOpen(false);
                      }}
                    >
                      {statusFilter === option && (
                        <svg className="w-4 h-4 text-[var(--color-accent)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={statusFilter === option ? '' : 'ml-6'}>{option}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-accent)]">{filteredApplications.length}</span>
              {statusFilter !== 'All' && statusFilter} Application{filteredApplications.length !== 1 && 's'}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[var(--color-text-secondary)]">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No Applications Found</h3>
              <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md">
                {statusFilter !== 'All'
                  ? `You don't have any ${statusFilter.toLowerCase()} applications yet.`
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border)]">
                  <thead className="bg-[var(--color-surface-secondary)]">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Job Title</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Company</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Applied Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Cover Letter</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-[var(--color-surface-secondary)] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {app.jobId?.title || '-'}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {app.jobId ? (
                              app.jobId.companyLogo && app.jobId.companyLogo.trim() !== '' ? (
                                <img
                                  src={app.jobId.companyLogo}
                                  alt={`${app.jobId.company} logo`}
                                  className="w-8 h-8 rounded-lg mr-3 ring-1 ring-[var(--color-border)]"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white font-semibold text-xs mr-3">
                                  {(app.jobId.company || '?')[0].toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="w-8 h-8 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] font-semibold text-xs mr-3">
                                N/A
                              </div>
                            )}
                            <div className="text-sm text-[var(--color-text-primary)]">
                              {app.jobId?.company || 'Unknown Company'}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {new Date(app.appliedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm max-w-xs overflow-hidden">
                            <details className="cursor-pointer">
                              <summary className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors list-none flex items-center gap-1 text-xs">
                                <span>View Letter</span>
                                <svg className="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="mt-2 p-3 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border)] text-xs whitespace-pre-line max-h-40 overflow-y-auto text-[var(--color-text-secondary)]">
                                {app.coverLetter || 'No cover letter provided'}
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
