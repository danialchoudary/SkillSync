import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar';
import JobForm from '../features/jobs/components/JobForm';
import JobCard from '../features/jobs/components/JobCard';
import useRecruiterJobsPanel from '../features/recruiter/hooks/useRecruiterJobsPanel';
import RecruiterProfileSection from '../components/RecruiterProfileSection';
import Applicants from './Applicants';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import EditJobModal from '../components/EditJobModal';
import RecruiterDashboard from './RecruiterDashboard';
import { Briefcase, Search, Calendar, Filter, Plus, ChevronDown } from 'lucide-react';

function RecruiterPanel() {
  const unreadCount = useSelector(state => state.unread.count);
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = location.pathname.replace(/^\/recruiter\/?/, '') || 'dashboard';

  const {
    jobs,
    loading,
    editJob,
    editLoading,
    toast,
    setToast,
    searchQuery,
    setSearchQuery,
    dateSort,
    setDateSort,
    filteredAndSortedJobs,
    handleClearFilters,
    handlePostJob,
    handleDeleteJob,
    handleEditJob,
    closeEditJob,
    handleUpdateJob,
    showToast,
  } = useRecruiterJobsPanel(activeSection);

  const handleSectionChange = (section) => {
    navigate(`/recruiter${section === 'dashboard' ? '' : '/' + section}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col overflow-x-hidden">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <Topbar user={user} />

      <div className="relative flex-1 flex min-w-0 overflow-x-hidden">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <RecruiterSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            unreadCount={unreadCount}
          />
        </div>

        <main className="flex-1 lg:flex-none lg:w-[calc(100%-16rem)] lg:ml-64 pt-14 flex flex-col min-w-0 overflow-x-hidden">
          <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
            {activeSection === 'dashboard' && <RecruiterDashboard />}
            {activeSection === 'post-job' && <JobForm onPost={handlePostJob} />}
            {activeSection === 'myjobs' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Job Postings</h2>
                      <p className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Manage your active listings</p>
                    </div>
                  </div>

                  {!loading && jobs.length > 0 && (
                    <div className="px-4 py-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex items-center gap-3">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-[var(--color-accent)]">{jobs.length}</div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest">Total Jobs</div>
                      </div>
                      <div className="w-px h-8 bg-[var(--color-border)]"></div>
                      <button
                        onClick={() => handleSectionChange('post-job')}
                        className="p-1.5 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
                        title="Post New Job"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Filters */}
                {!loading && jobs.length > 0 && (
                  <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-sm)]">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Search */}
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Search Listings</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find by title..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-bg)]"
                          />
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="lg:w-48 space-y-1.5">
                        <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Sort By</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                          <select
                            value={dateSort}
                            onChange={(e) => setDateSort(e.target.value)}
                            className="w-full pl-9 pr-8 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] outline-none transition-all bg-[var(--color-bg)] appearance-none cursor-pointer font-medium text-[var(--color-text-primary)]"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {searchQuery && (
                      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter size={14} className="text-[var(--color-accent)]" />
                          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                            Showing {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                          </span>
                        </div>
                        <button
                          onClick={handleClearFilters}
                          className="text-xs font-bold text-[var(--color-danger)] hover:underline"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="min-h-[400px]">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)] animate-pulse space-y-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-[var(--color-surface-secondary)] rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-[var(--color-surface-secondary)] rounded w-3/4"></div>
                              <div className="h-3 bg-[var(--color-surface-secondary)] rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="h-20 bg-[var(--color-surface-secondary)] rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-6">
                        <Briefcase size={32} className="text-[var(--color-text-tertiary)]" />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No jobs posted yet</h3>
                      <p className="text-[var(--color-text-secondary)] mb-8 max-w-sm font-medium">
                        Start your hiring journey by creating your first job posting today.
                      </p>
                      <button
                        onClick={() => handleSectionChange('post-job')}
                        className="px-8 py-3 bg-[var(--color-accent)] text-white rounded-xl font-bold shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-hover)] transition-all flex items-center gap-2"
                      >
                        <Plus size={20} />
                        <span>Post Your First Job</span>
                      </button>
                    </div>
                  ) : filteredAndSortedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Search size={48} className="text-[var(--color-text-tertiary)] mb-4" />
                      <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No matching jobs</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAndSortedJobs.map((job) => (
                        <JobCard
                          key={job._id || job.id}
                          job={{
                            ...job,
                            postedAt: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown',
                          }}
                          onEdit={handleEditJob}
                          onDelete={handleDeleteJob}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === 'applicants' && (
              <Applicants setToast={(m) => showToast(m, 'success')} setToastType={(t) => t} />
            )}
            {activeSection === 'profile' && (
              <RecruiterProfileSection setToast={(m) => showToast(m, 'success')} setToastType={(t) => t} />
            )}
          </div>
        </main>
      </div>
      <div className="lg:ml-64">
        <Footer />
      </div>
      {/* Edit Job Modal */}
      <EditJobModal
        open={!!editJob}
        job={editJob}
        onClose={closeEditJob}
        onUpdate={handleUpdateJob}
        loading={editLoading}
      />
    </div>
  );
}

export default RecruiterPanel;
