import { useEffect, useMemo, useState } from 'react';
import { FaBriefcase, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import JobCard from '../features/jobs/components/JobCard';
import api from '../services/api';
import { saveJob, unsaveJob, getSavedJobs } from '../features/jobs/services/jobApi';
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

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

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
    api.get('/jobs')
      .then((res) => {
        setJobs(res.data);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load jobs');
        setJobs([]);
      })
      .finally(() => setLoading(false));

    api.get('/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));

    getSavedJobs().then(setSavedJobs).catch(() => setSavedJobs([]));

    api.get('/applications/mine')
      .then((res) => setApplications(res.data))
      .catch(() => setApplications([]));
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

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const hasWorkModeFilter = workModeFilters.remote || workModeFilters.onSite;
    const hasSalaryFilter =
      salaryBounds.hasSalaryData &&
      salaryMin !== null &&
      salaryMax !== null &&
      (salaryMin > salaryBounds.min || salaryMax < salaryBounds.max);

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [job.title, job.company, job.location].some((value) =>
          String(value || '').toLowerCase().includes(query)
        );
      if (!matchesSearch) return false;

      if (salaryBounds.hasSalaryData && salaryMin !== null && salaryMax !== null) {
        const salaryRange = parseSalaryRange(job.salary);
        if (!salaryRange) return !hasSalaryFilter;
        if (salaryRange.max < salaryMin || salaryRange.min > salaryMax) return false;
      }

      if (hasWorkModeFilter) {
        const workMode = getJobWorkModeFlags(job);
        const matchesRemote = workModeFilters.remote && workMode.remote;
        const matchesOnSite = workModeFilters.onSite && workMode.onSite;
        if (!matchesRemote && !matchesOnSite) return false;
      }

      if (selectedExperienceLevels.length > 0) {
        const experienceLevel = getJobExperienceLevel(job);
        if (!experienceLevel || !selectedExperienceLevels.includes(experienceLevel)) return false;
      }

      return matchesIndustryFilter(job, selectedIndustry);
    });
  }, [
    jobs,
    salaryBounds.hasSalaryData,
    salaryBounds.max,
    salaryBounds.min,
    salaryMax,
    salaryMin,
    search,
    selectedExperienceLevels,
    selectedIndustry,
    workModeFilters.onSite,
    workModeFilters.remote,
  ]);

  const activeFilters = useMemo(() => {
    const filters = [];
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      filters.push({
        key: 'search',
        label: `Search: ${trimmedSearch}`,
        onClear: () => setSearch(''),
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
    search,
    selectedExperienceLevels,
    selectedIndustry,
    workModeFilters.onSite,
    workModeFilters.remote,
  ]);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((app) => app.jobId?._id || app.jobId?.id || app.jobId)),
    [applications]
  );

  const isJobSaved = (jobId) => savedJobs.some((job) => (job._id || job.id) === jobId);

  const handleSave = async (job) => {
    await saveJob(job._id || job.id);
    getSavedJobs().then(setSavedJobs);
  };

  const handleUnsave = async (job) => {
    await unsaveJob(job._id || job.id);
    getSavedJobs().then(setSavedJobs);
  };

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
    setSearch('');
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user || {}} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar activeSection="jobs" onSectionChange={() => { }} />
        </div>

        <main className="flex-1 lg:ml-64 pt-14 flex flex-col">
          <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    Explore Opportunities
                  </h1>
                  <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mt-0.5">
                    <FaBriefcase className="text-[var(--color-accent)]" />
                    <span className="font-medium text-[var(--color-accent)]">{filteredJobs.length}</span>
                    {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                  </p>
                </div>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none">
                  <FaSearch className="text-[var(--color-text-tertiary)] text-sm" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by job title, company, or location..."
                  className="w-full pl-10 pr-10 py-2.5 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] text-sm outline-none hover:border-gray-300"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 w-6 h-6 rounded-full bg-[var(--color-surface-secondary)] hover:bg-gray-200 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-[var(--shadow-sm)]">
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
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

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                  {activeFilters.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        Active Filters
                      </span>
                      {activeFilters.map((filter) => (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={filter.onClear}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)] transition-colors text-xs"
                        >
                          <span>{filter.label}</span>
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
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-[var(--color-text-secondary)]">Loading jobs...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mb-4">
                    <span className="text-xl font-semibold text-[var(--color-danger)]">!</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
                  <p className="text-sm text-[var(--color-danger)] text-center max-w-md">{error}</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center mb-4">
                    <FaBriefcase className="text-3xl text-[var(--color-text-tertiary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No Jobs Found</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-md mb-4">
                    {activeFilters.length > 0
                      ? 'No jobs match your current filters. Try removing one or more filters.'
                      : 'No jobs are currently available. Check back soon!'}
                  </p>
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 pb-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id || job._id}
                      job={{
                        ...job,
                        applied: appliedJobIds.has(job._id || job.id),
                        postedAt: job.createdAt ? new Date(job.createdAt).toLocaleString() : 'Unknown',
                      }}
                      onApply={() => { }}
                      saved={isJobSaved(job._id || job.id)}
                      onSave={handleSave}
                      onUnsave={handleUnsave}
                      user={user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="lg:ml-64">
        <Footer />
      </div>
    </div>
  );
}
