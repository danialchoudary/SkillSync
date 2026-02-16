import test, { after, afterEach, before } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Job from '../../models/Job.js';
import JobApplication from '../../models/JobApplication.js';
import {
  clearMongoDatabase,
  startInMemoryMongo,
  stopInMemoryMongo,
} from './helpers/memoryMongo.js';

let mongod;
let server;
let baseUrl;
let idCounter = 0;

function uniqueEmail(prefix = 'dashboard') {
  idCounter += 1;
  return `${prefix}${Date.now()}_${idCounter}@example.com`;
}

function createBearerToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
}

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const raw = await response.text();

  let body = raw;
  try {
    body = JSON.parse(raw);
  } catch {
    // Keep raw text for non-JSON responses.
  }

  return { response, body };
}

before(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-dashboard-secret';
  process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '8.2.1';
  mongod = await startInMemoryMongo();

  server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
  await clearMongoDatabase();
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  await stopInMemoryMongo(mongod);
});

test('GET /dashboard/jobseeker-analytics returns aggregated dashboard data', async () => {
  const recruiter = await User.create({
    name: 'Recruiter One',
    email: uniqueEmail('recruiter'),
    password: 'secret123',
    role: 'recruiter',
    isVerified: true,
  });

  const jobSeeker = await User.create({
    name: 'Jobseeker One',
    email: uniqueEmail('jobseeker'),
    password: 'secret123',
    role: 'jobseeker',
    isVerified: true,
  });

  const [jobA, jobB] = await Promise.all([
    Job.create({
      title: 'Frontend Engineer',
      company: 'Acme',
      description: 'Build UI',
      location: 'Remote',
      salary: '$90,000',
      recruiter: recruiter._id,
    }),
    Job.create({
      title: 'Backend Engineer',
      company: 'Beta Labs',
      description: 'Build APIs',
      location: 'Remote',
      salary: '$100,000',
      recruiter: recruiter._id,
    }),
  ]);

  jobSeeker.savedJobs = [jobA._id, jobB._id];
  await jobSeeker.save();

  await JobApplication.create([
    { jobId: jobA._id, jobSeekerId: jobSeeker._id, status: 'applied', appliedAt: monthsAgo(0) },
    { jobId: jobA._id, jobSeekerId: jobSeeker._id, status: 'screening', appliedAt: monthsAgo(1) },
    { jobId: jobB._id, jobSeekerId: jobSeeker._id, status: 'interview', appliedAt: monthsAgo(2) },
    { jobId: jobB._id, jobSeekerId: jobSeeker._id, status: 'hired', appliedAt: monthsAgo(3) },
    { jobId: jobB._id, jobSeekerId: jobSeeker._id, status: 'rejected', appliedAt: monthsAgo(4) },
  ]);

  const token = createBearerToken(jobSeeker._id.toString());
  const { response, body } = await request('/dashboard/jobseeker-analytics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200);

  assert.equal(body.overview.totalApplications, 5);
  assert.equal(body.overview.savedJobs, 2);
  assert.equal(body.overview.activeApplications, 3);
  assert.equal(body.overview.respondedApplications, 4);
  assert.equal(body.overview.responseRate, 80);
  assert.equal(body.overview.interviewRate, 40);
  assert.equal(body.overview.successRate, 20);

  assert.deepEqual(body.statusCounts, {
    applied: 1,
    screening: 1,
    interview: 1,
    hired: 1,
    rejected: 1,
  });

  assert.equal(body.trends.labels.length, 6);
  assert.equal(body.trends.data.length, 6);
  assert.equal(body.trends.data.reduce((sum, count) => sum + count, 0), 5);

  assert.equal(body.recentApplications.length, 5);
  assert.equal(body.recentApplications[0].status, 'applied');
});

test('GET /dashboard/jobseeker-analytics returns zeroed analytics for empty history', async () => {
  const jobSeeker = await User.create({
    name: 'Empty Jobseeker',
    email: uniqueEmail('empty'),
    password: 'secret123',
    role: 'jobseeker',
    isVerified: true,
  });

  const token = createBearerToken(jobSeeker._id.toString());
  const { response, body } = await request('/dashboard/jobseeker-analytics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200);

  assert.equal(body.overview.totalApplications, 0);
  assert.equal(body.overview.savedJobs, 0);
  assert.equal(body.overview.activeApplications, 0);
  assert.equal(body.overview.respondedApplications, 0);
  assert.equal(body.overview.responseRate, 0);
  assert.equal(body.overview.interviewRate, 0);
  assert.equal(body.overview.successRate, 0);

  assert.deepEqual(body.statusCounts, {
    applied: 0,
    screening: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  });

  assert.equal(body.trends.labels.length, 6);
  assert.equal(body.trends.data.length, 6);
  assert.equal(body.trends.data.every((count) => count === 0), true);
  assert.equal(body.recentApplications.length, 0);
});

test('GET /dashboard/jobseeker-analytics excludes stale saved jobs and cleans them up', async () => {
  const recruiter = await User.create({
    name: 'Recruiter Two',
    email: uniqueEmail('recruiter2'),
    password: 'secret123',
    role: 'recruiter',
    isVerified: true,
  });

  const existingJob = await Job.create({
    title: 'QA Engineer',
    company: 'Gamma Inc',
    description: 'Test software',
    location: 'Remote',
    salary: '$80,000',
    recruiter: recruiter._id,
  });

  const staleJobId = new mongoose.Types.ObjectId();

  const jobSeeker = await User.create({
    name: 'Stale Saved User',
    email: uniqueEmail('stale'),
    password: 'secret123',
    role: 'jobseeker',
    isVerified: true,
    savedJobs: [existingJob._id, staleJobId],
  });

  const token = createBearerToken(jobSeeker._id.toString());
  const { response, body } = await request('/dashboard/jobseeker-analytics', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200);
  assert.equal(body.overview.savedJobs, 1);

  const updatedUser = await User.findById(jobSeeker._id).select('savedJobs');
  assert.equal(updatedUser.savedJobs.length, 1);
  assert.equal(updatedUser.savedJobs[0].toString(), existingJob._id.toString());
});
