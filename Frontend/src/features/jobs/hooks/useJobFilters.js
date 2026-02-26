import { useEffect, useMemo, useState } from 'react';
import {
  EXPERIENCE_LEVELS,
  NOT_SPECIFIED_INDUSTRY_VALUE,
  clampValue,
  getIndustryOptions,
  getJobExperienceLevel,
  getJobWorkModeFlags,
  getSalaryBounds,
  getSalaryStep,
  matchesIndustryFilter,
  parseSalaryRange,
  formatSalaryValue,
} from '../../../utils/jobFilters';

const INITIAL_WORK_MODE_FILTERS = {
  remote: false,
  onSite: false,
};

export default function useJobFilters(jobs) {
  const [search, setSearch] = useState('');
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
          String(value || '').toLowerCase().includes(query),
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

  return {
    search,
    setSearch,
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
    filteredJobs,
    activeFilters,
    handleSalaryMinChange,
    handleSalaryMaxChange,
    toggleWorkMode,
    toggleExperienceLevel,
    clearAllFilters,
  };
}
