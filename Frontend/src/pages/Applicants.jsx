import { FaFilter, FaTimes } from 'react-icons/fa';
import { KanbanBoard, RecruiterAIChat } from '../features/applicants/components';
import useApplicantsData from '../features/applicants/hooks/useApplicantsData';
import useApplicantFilters from '../features/applicants/hooks/useApplicantFilters';
import {
  EXPERIENCE_LEVELS,
  formatSalaryValue,
} from '../utils/jobFilters';
import Skeleton from '../components/skeletons/Skeleton';

export default function Applicants({ setToast = () => { }, setToastType = () => { } }) {
  const {
    jobs,
    allApplicants,
    loading,
    error,
    fetchData,
    handleStatusChange,
  } = useApplicantsData({ setToast, setToastType });

  const {
    selectedJobId,
    setSelectedJobId,
    salaryMin,
    salaryMax,
    workModeFilters,
    selectedExperienceLevels,
    selectedIndustry,
    setSelectedIndustry,
    showMobileFilters,
    setShowMobileFilters,
    salaryBounds,
    industryOptions,
    salaryStep,
    filteredApplicants,
    activeFilters,
    handleSalaryMinChange,
    handleSalaryMaxChange,
    toggleWorkMode,
    toggleExperienceLevel,
    clearAllFilters,
  } = useApplicantFilters(jobs, allApplicants);

  const handleRetry = () => {
    fetchData();
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="px-5 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full min-w-0 bg-[var(--color-bg)] overflow-x-hidden">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-w-0">
        <div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">Applicant Management</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                Track and manage candidates through your recruitment funnel
              </p>
            </div>

            <div className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-sm)] text-sm text-[var(--color-text-secondary)]">
              Showing <span className="font-semibold text-[var(--color-accent)]">{filteredApplicants.length}</span>{' '}
              {filteredApplicants.length === 1 ? 'candidate' : 'candidates'}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] p-4 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2 md:mb-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-[var(--color-accent)] text-sm" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Advanced Filters</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters((prev) => !prev)}
                className="md:hidden px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                {showMobileFilters ? 'Hide' : `Show${activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}`}
              </button>
            </div>

            {!showMobileFilters && activeFilters.length > 0 && (
              <div className="md:hidden mt-2 mb-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {activeFilters.length} active filter{activeFilters.length > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-[var(--color-danger)] hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Filter by Job
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(event) => setSelectedJobId(event.target.value)}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors text-[var(--color-text-primary)] text-sm outline-none bg-[var(--color-bg)]"
                  >
                    <option value="all">All Job Postings</option>
                    {jobs.map((job) => (
                      <option key={job._id || job.id} value={String(job._id || job.id)}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Salary Range
                  </label>
                  {salaryBounds.hasSalaryData ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                        <span>{formatSalaryValue(salaryMin ?? salaryBounds.min)}</span>
                        <span>{formatSalaryValue(salaryMax ?? salaryBounds.max)}</span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={salaryBounds.min}
                          max={salaryBounds.max}
                          step={salaryStep}
                          value={salaryMin ?? salaryBounds.min}
                          onChange={(event) => handleSalaryMinChange(event.target.value)}
                          className="w-full accent-[var(--color-accent)] cursor-pointer"
                        />
                        <input
                          type="range"
                          min={salaryBounds.min}
                          max={salaryBounds.max}
                          step={salaryStep}
                          value={salaryMax ?? salaryBounds.max}
                          onChange={(event) => handleSalaryMaxChange(event.target.value)}
                          className="w-full accent-[var(--color-accent)] cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Salary data is unavailable for filtering.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Work Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleWorkMode('remote')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${workModeFilters.remote
                          ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                          : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'
                        }`}
                    >
                      Remote
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWorkMode('onSite')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${workModeFilters.onSite
                          ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                          : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'
                        }`}
                    >
                      On-site
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(event) => setSelectedIndustry(event.target.value)}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors text-[var(--color-text-primary)] text-sm outline-none bg-[var(--color-bg)]"
                  >
                    <option value="">All industries</option>
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const isActive = selectedExperienceLevels.includes(level.key);
                    return (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() => toggleExperienceLevel(level.key)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${isActive
                            ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                            : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'
                          }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Active Filters</span>
                  {activeFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={filter.onClear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)] transition-colors text-xs min-w-0 max-w-full"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-[260px]">{filter.label}</span>
                      <FaTimes className="text-[10px]" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-[var(--color-danger)] hover:underline ml-auto"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex gap-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col w-72 sm:w-80 shrink-0 bg-[var(--color-surface-secondary)]/50 rounded-xl p-3 border border-[var(--color-border)] h-full overflow-hidden">
                     <Skeleton className="h-6 w-32 mb-4" />
                     <div className="space-y-3">
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                     </div>
                  </div>
               ))}
            </div>
          ) : (
            <div className="flex-1 min-h-0 min-w-0 overflow-x-hidden">
              <KanbanBoard
                applicants={filteredApplicants}
                onStatusChange={handleStatusChange}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
      <RecruiterAIChat />
    </div>
  );
}
