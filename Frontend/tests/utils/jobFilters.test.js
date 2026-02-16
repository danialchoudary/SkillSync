import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NOT_SPECIFIED_INDUSTRY_VALUE,
  getIndustryOptions,
  getJobExperienceLevel,
  getJobWorkModeFlags,
  getSalaryBounds,
  matchesIndustryFilter,
  parseSalaryRange,
} from '../../src/utils/jobFilters.js';

test('parseSalaryRange parses annual salary strings', () => {
  const range = parseSalaryRange('$90k - $120k/year');
  assert.deepEqual(range, { min: 90000, max: 120000 });
});

test('parseSalaryRange normalizes hourly salary to yearly estimate', () => {
  const range = parseSalaryRange('$40 - $55/hr');
  assert.deepEqual(range, { min: 83200, max: 114400 });
});

test('getSalaryBounds returns min and max across jobs', () => {
  const bounds = getSalaryBounds([
    { salary: '$80k - $100k' },
    { salary: '$120k' },
    { salary: 'Not disclosed' },
  ]);
  assert.deepEqual(bounds, { min: 80000, max: 120000, hasSalaryData: true });
});

test('getJobWorkModeFlags identifies remote, hybrid and default on-site', () => {
  assert.deepEqual(getJobWorkModeFlags({ location: 'Remote - US' }), { remote: true, onSite: false });
  assert.deepEqual(getJobWorkModeFlags({ location: 'Hybrid, New York' }), { remote: true, onSite: true });
  assert.deepEqual(getJobWorkModeFlags({ location: 'Austin, TX' }), { remote: false, onSite: true });
});

test('getJobExperienceLevel maps numeric experience to chips', () => {
  assert.equal(getJobExperienceLevel({ experience: 1 }), 'entry');
  assert.equal(getJobExperienceLevel({ experience: 3 }), 'mid');
  assert.equal(getJobExperienceLevel({ experience: 6 }), 'senior');
  assert.equal(getJobExperienceLevel({ experience: 'not provided' }), null);
});

test('industry helpers build options and support unspecified filter', () => {
  const jobs = [
    { industry: 'Finance' },
    { recruiter: { industry: 'Technology' } },
    { title: 'No industry set' },
  ];

  const options = getIndustryOptions(jobs);
  assert.deepEqual(options, [
    { value: 'finance', label: 'Finance' },
    { value: 'technology', label: 'Technology' },
    { value: NOT_SPECIFIED_INDUSTRY_VALUE, label: 'Not specified' },
  ]);

  assert.equal(matchesIndustryFilter({ industry: 'Finance' }, 'finance'), true);
  assert.equal(matchesIndustryFilter({ title: 'No industry' }, NOT_SPECIFIED_INDUSTRY_VALUE), true);
});
