const YEARLY_HOURS = 2080;
const MONTHS_PER_YEAR = 12;

export const NOT_SPECIFIED_INDUSTRY_VALUE = '__not_specified__';
export const EXPERIENCE_LEVELS = [
  { key: 'entry', label: 'Entry (0-1 yrs)' },
  { key: 'mid', label: 'Mid (2-4 yrs)' },
  { key: 'senior', label: 'Senior (5+ yrs)' },
];

const HOURLY_PATTERNS = ['/hour', 'per hour', '/hr', 'hourly'];
const MONTHLY_PATTERNS = ['/month', 'per month', 'monthly'];

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const cleanNumericToken = (rawToken) => normalizeText(rawToken).replace(/,/g, '');

const parseAmount = (rawNumber, multiplierSuffix = '') => {
  const amount = Number.parseFloat(cleanNumericToken(rawNumber));
  if (!Number.isFinite(amount)) return null;

  const suffix = normalizeText(multiplierSuffix);
  if (suffix === 'k') return amount * 1000;
  if (suffix === 'm') return amount * 1_000_000;
  return amount;
};

const getCadenceMultiplier = (salaryText = '') => {
  const normalized = normalizeText(salaryText);

  if (HOURLY_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return YEARLY_HOURS;
  }

  if (MONTHLY_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return MONTHS_PER_YEAR;
  }

  return 1;
};

export const clampValue = (value, min, max) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return min;
  return Math.min(max, Math.max(min, numericValue));
};

export const parseSalaryRange = (salaryText = '') => {
  if (!salaryText) return null;

  const values = [];
  const matcher = /(\d+(?:[.,]\d+)?)\s*([kKmM]?)/g;
  const multiplier = getCadenceMultiplier(salaryText);
  let match;

  while ((match = matcher.exec(String(salaryText))) !== null) {
    const parsedAmount = parseAmount(match[1], match[2]);
    if (parsedAmount && parsedAmount > 0) {
      values.push(parsedAmount * multiplier);
    }
  }

  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max };
};

export const getSalaryBounds = (jobs = []) => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  jobs.forEach((job) => {
    const range = parseSalaryRange(job?.salary);
    if (!range) return;

    min = Math.min(min, range.min);
    max = Math.max(max, range.max);
  });

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 0, hasSalaryData: false };
  }

  if (min === max) {
    return { min, max: max + 1000, hasSalaryData: true };
  }

  return { min, max, hasSalaryData: true };
};

export const getSalaryStep = (min, max) => {
  const spread = Math.max(0, max - min);
  if (spread >= 500_000) return 10_000;
  if (spread >= 100_000) return 5_000;
  return 1_000;
};

export const formatSalaryValue = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const getJobWorkModeFlags = (jobOrLocation) => {
  const location =
    typeof jobOrLocation === 'string' ? jobOrLocation : jobOrLocation?.location || '';
  const normalized = normalizeText(location);

  const hasRemote = /\bremote\b/.test(normalized);
  const hasHybrid = /\bhybrid\b/.test(normalized);
  const hasOnSite =
    /\bon[\s-]?site\b/.test(normalized) ||
    /\bonsite\b/.test(normalized) ||
    /\bin[\s-]?office\b/.test(normalized) ||
    /\bon[-\s]?premise(s)?\b/.test(normalized);

  if (hasHybrid || (hasRemote && hasOnSite)) {
    return { remote: true, onSite: true };
  }

  if (hasRemote) {
    return { remote: true, onSite: false };
  }

  if (hasOnSite) {
    return { remote: false, onSite: true };
  }

  // Default to on-site when a location is present without explicit mode.
  return { remote: false, onSite: true };
};

export const getJobExperienceLevel = (jobOrExperience) => {
  const rawValue =
    typeof jobOrExperience === 'object' && jobOrExperience !== null
      ? jobOrExperience.experience
      : jobOrExperience;
  const numericValue = Number.parseFloat(rawValue);

  if (!Number.isFinite(numericValue)) return null;
  if (numericValue <= 1) return 'entry';
  if (numericValue <= 4) return 'mid';
  return 'senior';
};

export const getJobIndustryValue = (job = {}) => {
  const directIndustry = typeof job?.industry === 'string' ? job.industry : '';
  const recruiterIndustry = typeof job?.recruiter?.industry === 'string' ? job.recruiter.industry : '';
  return (directIndustry || recruiterIndustry || '').trim();
};

export const getIndustryOptions = (jobs = []) => {
  const optionsMap = new Map();
  let hasNotSpecified = false;

  jobs.forEach((job) => {
    const industry = getJobIndustryValue(job);
    if (industry) {
      const key = normalizeText(industry);
      if (!optionsMap.has(key)) {
        optionsMap.set(key, industry);
      }
      return;
    }

    hasNotSpecified = true;
  });

  const options = Array.from(optionsMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  if (hasNotSpecified) {
    options.push({ value: NOT_SPECIFIED_INDUSTRY_VALUE, label: 'Not specified' });
  }

  return options;
};

export const matchesIndustryFilter = (job, selectedIndustry = '') => {
  if (!selectedIndustry) return true;

  const industry = getJobIndustryValue(job);
  if (selectedIndustry === NOT_SPECIFIED_INDUSTRY_VALUE) {
    return !industry;
  }

  return normalizeText(industry) === normalizeText(selectedIndustry);
};
