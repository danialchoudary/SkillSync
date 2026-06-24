import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { getMe } from '../services/api';
import { getMyApplications } from '../services/applicationApi';
import { getInterviews } from '../services/interviewApi';
import { getImageUrl } from '../utils/urlHelper';
import { MessageCircle } from 'lucide-react';
import {
  APPLICATION_STATUS_FILTER_OPTIONS,
  getApplicationStatusLabel,
  normalizeApplicationStatus,
} from '../utils/applicationStatus';
import JobCardSkeleton from '../components/skeletons/JobCardSkeleton';

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const openRecruiterMessage = (application) => {
    const recruiterId = application.jobId?.recruiter?._id || application.jobId?.recruiter;
    if (!recruiterId) return;

    navigate(`${user?.role === 'recruiter' ? '/recruiter/message' : '/messages'}?userId=${recruiterId}`);
  };

  useEffect(() => {
    getMe().then((res) => setUser(res.data)).catch(() => setUser({}));
    getInterviews().then(setInterviews).catch(() => setInterviews([]));
    getMyApplications()
      .then((applicationsData) =>
        setApplications((applicationsData || []).map((app) => ({
          ...app,
          status: normalizeApplicationStatus(app.status),
        })))
      )
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const getInterviewForApplication = (appId) =>
    interviews.find(
      (iv) => String(iv.jobApplicationId?._id || iv.jobApplicationId) === String(appId)
    );

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter);

  const getAppliedDate = (appliedAt) =>
    new Date(appliedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getStatusStyle = (status) => {
    const styles = {
      applied: 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-blue-200',
      screening: 'bg-[#EEF7FF] text-[#0B79D0] border-blue-200',
      interview: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-yellow-200',
      hired: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-green-200',
      rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-red-200',
    };
    return styles[status] || 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]';
  };

  const getStatusIcon = (status) => {
    if (status === 'hired') {
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
    if (status === 'interview') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m4 7H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (status === 'screening') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
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

        <main className="flex-1 lg:ml-64 w-full max-w-7xl mx-auto pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
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
                onClick={() => setFilterOpen((f) => !f)}
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
                  {[{ value: 'all', label: 'All' }, ...APPLICATION_STATUS_FILTER_OPTIONS].map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-secondary)] transition-colors flex items-center gap-2 text-sm ${statusFilter === option.value ? 'bg-[var(--color-surface-secondary)] font-semibold text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setFilterOpen(false);
                      }}
                    >
                      {statusFilter === option.value && (
                        <svg className="w-4 h-4 text-[var(--color-accent)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={statusFilter === option.value ? '' : 'ml-6'}>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-accent)]">{filteredApplications.length}</span>
              {statusFilter !== 'all' && `${getApplicationStatusLabel(statusFilter)} `}
              Application{filteredApplications.length !== 1 && 's'}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
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
                {statusFilter !== 'all'
                  ? `You don't have any ${getApplicationStatusLabel(statusFilter).toLowerCase()} applications yet.`
                  : "You haven't applied to any jobs yet. Start exploring opportunities!"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile List View */}
              <div className="md:hidden space-y-3">
                {filteredApplications.map((app) => {
                  const interview = getInterviewForApplication(app._id);
                  return (
                    <article
                      key={app._id}
                      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {app.jobId?.title || '-'}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 min-w-0">
                            {app.jobId ? (
                              app.jobId.companyLogo && app.jobId.companyLogo.trim() !== '' ? (
                                <img
                                  src={getImageUrl(app.jobId.companyLogo)}
                                  alt={`${app.jobId.company} logo`}
                                  className="w-7 h-7 rounded-lg ring-1 ring-[var(--color-border)] flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                                  {(app.jobId.company || '?')[0].toUpperCase()}
                                </div>
                              )
                            ) : (
                              <div className="w-7 h-7 bg-[var(--color-surface-secondary)] rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] font-semibold text-[10px] flex-shrink-0">
                                N/A
                              </div>
                            )}
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">
                              {app.jobId?.company || 'Unknown Company'}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusStyle(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span>{getApplicationStatusLabel(app.status)}</span>
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                        <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-tertiary)]">Applied</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{getAppliedDate(app.appliedAt)}</p>
                      </div>

                      {app.jobId?.recruiter && (
                        <button
                          type="button"
                          onClick={() => openRecruiterMessage(app)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-accent)]/20 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message Recruiter
                        </button>
                      )}

                      {/* Interview Banner (mobile) */}
                      {app.status === 'interview' && interview && (
                        <div className="mt-3 p-3 bg-[var(--color-accent-bg)] border border-[var(--color-accent)]/20 rounded-xl">
                          <p className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-1">
                            📅 Interview Scheduled
                          </p>
                          <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {new Date(interview.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          {interview.meetingLink && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] hover:underline"
                            >
                              🔗 Join Meeting
                            </a>
                          )}
                          {interview.notes && (
                            <p className="mt-1 text-[10px] text-[var(--color-text-secondary)] italic">{interview.notes}</p>
                          )}
                        </div>
                      )}

                      <details className="mt-3">
                        <summary className="cursor-pointer font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors list-none flex items-center gap-1 text-xs">
                          <span>View Cover Letter</span>
                          <svg className="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-2 p-3 bg-[var(--color-surface-secondary)] rounded-lg border border-[var(--color-border)] text-xs whitespace-pre-line max-h-40 overflow-y-auto text-[var(--color-text-secondary)]">
                          {app.coverLetter || 'No cover letter provided'}
                        </div>
                      </details>
                    </article>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--color-border)]">
                    <thead className="bg-[var(--color-surface-secondary)]">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Job Title</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Company</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Applied Date</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Message</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Cover Letter</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
                      {filteredApplications.map((app) => {
                        const interview = getInterviewForApplication(app._id);
                        return (
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
                                      src={getImageUrl(app.jobId.companyLogo)}
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
                                {getAppliedDate(app.appliedAt)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                                {getStatusIcon(app.status)}
                                <span>{getApplicationStatusLabel(app.status)}</span>
                              </span>
                              {/* Interview Banner (desktop) */}
                              {app.status === 'interview' && interview && (
                                <div className="mt-2 p-2.5 bg-[var(--color-accent-bg)] border border-[var(--color-accent)]/20 rounded-xl">
                                  <p className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider">
                                    📅 {new Date(interview.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </p>
                                  {interview.meetingLink && (
                                    <a
                                      href={interview.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-bold text-[var(--color-accent)] hover:underline"
                                    >
                                      🔗 Join Meeting
                                    </a>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              {app.jobId?.recruiter && (
                                <button
                                  type="button"
                                  onClick={() => openRecruiterMessage(app)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-accent)]/20 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Message
                                </button>
                              )}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
