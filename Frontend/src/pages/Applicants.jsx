import { useEffect, useMemo, useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import { updateApplicationStatus } from '../services/applicationApi';
import {
  EXPERIENCE_LEVELS,
  NOT_SPECIFIED_INDUSTRY_VALUE,
  clampValue,
  formatSalaryValue,
  getIndustryOptions,
  getJobExperienceLevel,
  getJobWorkModeFlags,
  getSalaryBounds,
  getSalaryStep,
  matchesIndustryFilter,
  parseSalaryRange,
} from '../utils/jobFilters';

const INITIAL_WORK_MODE_FILTERS = {
  remote: false,
  onSite: false,
};

export default function Applicants({ setToast = () => { }, setToastType = () => { } }) {
  const [jobs, setJobs] = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('all');

  const [salaryMin, setSalaryMin] = useState(null);
  const [salaryMax, setSalaryMax] = useState(null);
  const [workModeFilters, setWorkModeFilters] = useState(INITIAL_WORK_MODE_FILTERS);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const salaryBounds = useMemo(() => getSalaryBounds(jobs), [jobs]);
  const industryOptions = useMemo(() => getIndustryOptions(jobs), [jobs]);
  const salaryStep = useMemo(
    () => getSalaryStep(salaryBounds.min, salaryBounds.max),
    [salaryBounds.max, salaryBounds.min]
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!salaryBounds.hasSalaryData) {
      setSalaryMin(null);
      setSalaryMax(null);
      return;
    }

    setSalaryMin((currentValue) => {
      if (currentValue === null) return salaryBounds.min;
      return clampValue(currentValue, salaryBounds.min, salaryBounds.max);
    });

    setSalaryMax((currentValue) => {
      if (currentValue === null) return salaryBounds.max;
      return clampValue(currentValue, salaryBounds.min, salaryBounds.max);
    });
  }, [salaryBounds.hasSalaryData, salaryBounds.max, salaryBounds.min]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get('/jobs/my');
      const recruiterJobs = jobsRes.data || [];
      setJobs(recruiterJobs);

      const appPromises = recruiterJobs.map((job) =>
        api
          .get(`/applications/job/${job._id || job.id}`)
          .then((res) =>
            res.data.map((app) => {
              const currentJob = typeof app.jobId === 'object' && app.jobId !== null ? app.jobId : {};
              const jobId = String(job._id || job.id);
              return {
                ...app,
                jobTitle: job.title,
                jobId: {
                  ...currentJob,
                  _id: jobId,
                  id: jobId,
                  title: job.title,
                  salary: job.salary,
                  location: job.location,
                  experience: job.experience,
                  industry: job.industry || job.recruiter?.industry || '',
                },
              };
            })
          )
          .catch(() => [])
      );

      const appResults = await Promise.all(appPromises);
      setAllApplicants(appResults.flat());
      setError('');
    } catch (fetchError) {
      setError('Failed to load applicants. Please try again.');
      console.error(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    const previousApplicants = [...allApplicants];
    setAllApplicants((prev) =>
      prev.map((app) => ((app._id || app.id) === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await updateApplicationStatus(appId, newStatus);
      setToast(`Applicant moved to ${newStatus}`);
      setToastType('success');
    } catch {
      setAllApplicants(previousApplicants);
      setToast('Failed to update status');
      setToastType('error');
    }
  };

  const filteredApplicants = useMemo(() => {
    const hasWorkModeFilter = workModeFilters.remote || workModeFilters.onSite;
    const hasSalaryFilter =
      salaryBounds.hasSalaryData &&
      salaryMin !== null &&
      salaryMax !== null &&
      (salaryMin > salaryBounds.min || salaryMax < salaryBounds.max);

    return allApplicants.filter((applicant) => {
      const applicantJob = typeof applicant.jobId === 'object' && applicant.jobId !== null ? applicant.jobId : {};
      const applicantJobId = String(applicantJob._id || applicantJob.id || applicant.jobId || '');

      if (selectedJobId !== 'all' && applicantJobId !== selectedJobId) {
        return false;
      }

      if (salaryBounds.hasSalaryData && salaryMin !== null && salaryMax !== null) {
        const salaryRange = parseSalaryRange(applicantJob.salary);
        if (!salaryRange) return !hasSalaryFilter;
        if (salaryRange.max < salaryMin || salaryRange.min > salaryMax) return false;
      }

      if (hasWorkModeFilter) {
        const workMode = getJobWorkModeFlags(applicantJob);
        const matchesRemote = workModeFilters.remote && workMode.remote;
        const matchesOnSite = workModeFilters.onSite && workMode.onSite;
        if (!matchesRemote && !matchesOnSite) return false;
      }

      if (selectedExperienceLevels.length > 0) {
        const experienceLevel = getJobExperienceLevel(applicantJob);
        if (!experienceLevel || !selectedExperienceLevels.includes(experienceLevel)) return false;
      }

      return matchesIndustryFilter(applicantJob, selectedIndustry);
    });
  }, [
    allApplicants,
    salaryBounds.hasSalaryData,
    salaryBounds.max,
    salaryBounds.min,
    salaryMax,
    salaryMin,
    selectedExperienceLevels,
    selectedIndustry,
    selectedJobId,
    workModeFilters.onSite,
    workModeFilters.remote,
  ]);

  const selectedJobLabel = useMemo(() => {
    if (selectedJobId === 'all') return 'All Job Postings';

    const selectedJob = jobs.find((job) => String(job._id || job.id) === selectedJobId);
    return selectedJob?.title || 'Selected job';
  }, [jobs, selectedJobId]);

  const activeFilters = useMemo(() => {
    const filters = [];

    if (selectedJobId !== 'all') {
      filters.push({
        key: 'job',
        label: `Job: ${selectedJobLabel}`,
        onClear: () => setSelectedJobId('all'),
      });
    }

    if (salaryBounds.hasSalaryData && salaryMin !== null && salaryMin > salaryBounds.min) {
      filters.push({
        key: 'salary-min',
        label: `Min ${formatSalaryValue(salaryMin)}`,
        onClear: () => setSalaryMin(salaryBounds.min),
      });
    }

    if (salaryBounds.hasSalaryData && salaryMax !== null && salaryMax < salaryBounds.max) {
      filters.push({
        key: 'salary-max',
        label: `Max ${formatSalaryValue(salaryMax)}`,
        onClear: () => setSalaryMax(salaryBounds.max),
      });
    }

    if (workModeFilters.remote) {
      filters.push({
        key: 'work-remote',
        label: 'Remote',
        onClear: () => setWorkModeFilters((prev) => ({ ...prev, remote: false })),
      });
    }

    if (workModeFilters.onSite) {
      filters.push({
        key: 'work-onsite',
        label: 'On-site',
        onClear: () => setWorkModeFilters((prev) => ({ ...prev, onSite: false })),
      });
    }

    selectedExperienceLevels.forEach((level) => {
      const label = EXPERIENCE_LEVELS.find((item) => item.key === level)?.label || level;
      filters.push({
        key: `experience-${level}`,
        label,
        onClear: () =>
          setSelectedExperienceLevels((prev) => prev.filter((currentLevel) => currentLevel !== level)),
      });
    });

    if (selectedIndustry) {
      const selectedIndustryLabel =
        industryOptions.find((option) => option.value === selectedIndustry)?.label ||
        (selectedIndustry === NOT_SPECIFIED_INDUSTRY_VALUE ? 'Not specified' : selectedIndustry);
      filters.push({
        key: 'industry',
        label: `Industry: ${selectedIndustryLabel}`,
        onClear: () => setSelectedIndustry(''),
      });
    }

    return filters;
  }, [
    industryOptions,
    salaryBounds.hasSalaryData,
    salaryBounds.max,
    salaryBounds.min,
    salaryMax,
    salaryMin,
    selectedExperienceLevels,
    selectedIndustry,
    selectedJobId,
    selectedJobLabel,
    workModeFilters.onSite,
    workModeFilters.remote,
  ]);

  const handleSalaryMinChange = (value) => {
    if (!salaryBounds.hasSalaryData) return;

    const nextMin = clampValue(value, salaryBounds.min, salaryBounds.max);
    setSalaryMin(nextMin);
    setSalaryMax((currentValue) => {
      if (currentValue === null) return salaryBounds.max;
      return Math.max(nextMin, currentValue);
    });
  };

  const handleSalaryMaxChange = (value) => {
    if (!salaryBounds.hasSalaryData) return;

    const nextMax = clampValue(value, salaryBounds.min, salaryBounds.max);
    setSalaryMax(nextMax);
    setSalaryMin((currentValue) => {
      if (currentValue === null) return salaryBounds.min;
      return Math.min(currentValue, nextMax);
    });
  };

  const toggleWorkMode = (modeKey) => {
    setWorkModeFilters((prev) => ({ ...prev, [modeKey]: !prev[modeKey] }));
  };

  const toggleExperienceLevel = (levelKey) => {
    setSelectedExperienceLevels((prev) =>
      prev.includes(levelKey)
        ? prev.filter((currentLevel) => currentLevel !== levelKey)
        : [...prev, levelKey]
    );
  };

  const clearAllFilters = () => {
    setSelectedJobId('all');
    setWorkModeFilters(INITIAL_WORK_MODE_FILTERS);
    setSelectedExperienceLevels([]);
    setSelectedIndustry('');

    if (salaryBounds.hasSalaryData) {
      setSalaryMin(salaryBounds.min);
      setSalaryMax(salaryBounds.max);
      return;
    }

    setSalaryMin(null);
    setSalaryMax(null);
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
          onClick={fetchData}
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        workModeFilters.remote
                          ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                          : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]'
                      }`}
                    >
                      Remote
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWorkMode('onSite')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        workModeFilters.onSite
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                          isActive
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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--color-text-secondary)]">Loading applicants...</p>
              </div>
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
    </div>
  );
}
