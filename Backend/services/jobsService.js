import jwt from 'jsonwebtoken';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import User from '../models/User.js';
import { normalizeApplicationStatus } from '../utils/applicationStatus.js';

export function getOptionalUserIdFromRequest(req, jwtSecret) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export async function updateJobForRecruiter(jobId, recruiterId, updates) {
  return Job.findOneAndUpdate(
    { _id: jobId, recruiter: recruiterId },
    updates,
    { new: true, runValidators: true },
  );
}

export async function saveJobForUser(user, jobId) {
  const jobObjectId = Job.schema.path('_id').cast(jobId);
  if (user.savedJobs && user.savedJobs.some((savedJobId) => savedJobId.toString() === jobObjectId.toString())) {
    return { alreadySaved: true };
  }

  user.savedJobs = user.savedJobs ? user.savedJobs.map((savedJobId) => Job.schema.path('_id').cast(savedJobId)) : [];
  user.savedJobs.push(jobObjectId);
  await user.save();

  return { alreadySaved: false };
}

export async function unsaveJobForUser(user, jobId) {
  const jobObjectId = Job.schema.path('_id').cast(jobId);
  user.savedJobs = user.savedJobs ? user.savedJobs.map((savedJobId) => Job.schema.path('_id').cast(savedJobId)) : [];
  user.savedJobs = user.savedJobs.filter((savedJobId) => savedJobId.toString() !== jobObjectId.toString());
  await user.save();
}

export async function findUserWithSavedJobs(userId) {
  return User.findById(userId).populate({
    path: 'savedJobs',
    populate: { path: 'recruiter', select: 'companyLogo industry' },
  });
}

export async function buildUserApplicationStatusMap(jobSeekerId) {
  const userStatusMap = {};
  const userApplications = await JobApplication.find({ jobSeekerId });

  userApplications.forEach((application) => {
    if (application.jobId) {
      userStatusMap[application.jobId.toString()] = normalizeApplicationStatus(application.status);
    }
  });

  return userStatusMap;
}

export function mapJobsWithLogoAndStatus(jobs, userStatusMap) {
  return jobs.map((job) => {
    if (!job) return null;
    const jobObj = job.toObject ? job.toObject() : job;
    const id = jobObj._id || jobObj.id;

    return {
      ...jobObj,
      companyLogo: jobObj.recruiter?.companyLogo || '',
      industry: jobObj.industry || jobObj.recruiter?.industry || '',
      applied: !!userStatusMap[id.toString()],
      status: userStatusMap[id.toString()] || null,
    };
  }).filter(Boolean);
}

export function mapRecruiterJobsWithLogo(jobs) {
  return jobs.map((job) => ({
    ...job.toObject(),
    companyLogo: job.recruiter?.companyLogo || '',
    industry: job.industry || job.recruiter?.industry || '',
  }));
}

export async function createJobForRecruiter({ title, company, description, location, salary, skills, experience, recruiterId }) {
  const job = new Job({
    title,
    company,
    description,
    location,
    salary,
    skills: Array.isArray(skills) ? skills : skills.split(',').map((value) => value.trim()),
    experience: Number(experience),
    recruiter: recruiterId,
  });

  await job.save();
  return job;
}

export async function findAllJobsWithRecruiter() {
  return Job.find()
    .sort({ createdAt: -1 })
    .populate('recruiter', 'companyLogo industry');
}

export async function findJobsByRecruiter(recruiterId) {
  return Job.find({ recruiter: recruiterId })
    .sort({ createdAt: -1 })
    .populate('recruiter', 'companyLogo industry');
}

export async function deleteJobForRecruiter(jobId, recruiterId) {
  return Job.findOneAndDelete({ _id: jobId, recruiter: recruiterId });
}
