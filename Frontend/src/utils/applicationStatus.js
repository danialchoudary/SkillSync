export const APPLICATION_STATUSES = [
  'applied',
  'screening',
  'interview',
  'hired',
  'rejected',
];

const LEGACY_STATUS_MAP = {
  pending: 'applied',
  accepted: 'hired',
  interviewing: 'interview',
};

export const APPLICATION_STATUS_LABELS = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  hired: 'Hired',
  rejected: 'Rejected',
};

export function normalizeApplicationStatus(status) {
  if (typeof status !== 'string') {
    return 'applied';
  }

  const normalized = status.trim().toLowerCase();
  return LEGACY_STATUS_MAP[normalized] || normalized;
}

export function getApplicationStatusLabel(status) {
  const normalized = normalizeApplicationStatus(status);
  return APPLICATION_STATUS_LABELS[normalized] || 'Applied';
}

export const APPLICATION_STATUS_FILTER_OPTIONS = APPLICATION_STATUSES.map((status) => ({
  value: status,
  label: APPLICATION_STATUS_LABELS[status],
}));

