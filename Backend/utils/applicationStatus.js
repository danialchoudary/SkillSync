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

const ACCEPTED_STATUS_VALUES = new Set([
  ...APPLICATION_STATUSES,
  ...Object.keys(LEGACY_STATUS_MAP),
]);

export function normalizeApplicationStatus(status) {
  if (typeof status !== 'string') {
    return 'applied';
  }

  const normalized = status.trim().toLowerCase();
  return LEGACY_STATUS_MAP[normalized] || normalized;
}

export function isValidApplicationStatus(status) {
  if (typeof status !== 'string') {
    return false;
  }

  return ACCEPTED_STATUS_VALUES.has(status.trim().toLowerCase());
}

