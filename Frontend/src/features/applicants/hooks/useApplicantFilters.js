import { useEffect, useMemo, useState } from 'react';
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
} from '../../../utils/jobFilters';

const INITIAL_WORK_MODE_FILTERS = {
  remote: false,
  onSite: false,
};

export default function useApplicantFilters(jobs, allApplicants) {
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
    [salaryBounds.max, salaryBounds.min],
  );

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
        : [...prev, levelKey],
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

  return {
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
  };
}
