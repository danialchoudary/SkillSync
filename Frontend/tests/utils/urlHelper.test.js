import test from 'node:test';
import assert from 'node:assert/strict';
import { getImageUrl, getResumeUrl } from '../../src/utils/urlHelper.js';

test('getImageUrl returns null for empty input', () => {
  assert.equal(getImageUrl(null), null);
  assert.equal(getImageUrl(''), null);
});

test('getImageUrl preserves absolute http and blob URLs', () => {
  assert.equal(getImageUrl('https://cdn.example.com/avatar.png'), 'https://cdn.example.com/avatar.png');
  assert.equal(getImageUrl('blob:http://localhost:5173/abcd-1234'), 'blob:http://localhost:5173/abcd-1234');
});

test('getImageUrl prefixes local relative paths with backend host', () => {
  assert.equal(getImageUrl('/uploads/avatar.png'), 'http://localhost:5000/uploads/avatar.png');
  assert.equal(getImageUrl('uploads/avatar.png'), 'http://localhost:5000/uploads/avatar.png');
});

test('getResumeUrl returns null for empty input', () => {
  assert.equal(getResumeUrl(null), null);
  assert.equal(getResumeUrl(''), null);
});

test('getResumeUrl preserves absolute http URLs', () => {
  assert.equal(getResumeUrl('http://files.example.com/resume.pdf'), 'http://files.example.com/resume.pdf');
  assert.equal(getResumeUrl('https://files.example.com/resume.pdf'), 'https://files.example.com/resume.pdf');
});

test('getResumeUrl prefixes local relative paths with backend host', () => {
  assert.equal(getResumeUrl('/uploads/resume.pdf'), 'http://localhost:5000/uploads/resume.pdf');
  assert.equal(getResumeUrl('uploads/resume.pdf'), 'http://localhost:5000/uploads/resume.pdf');
});
