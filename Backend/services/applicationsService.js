import JobApplication from '../models/JobApplication.js';
import { analyzeMatch } from './aiService.js';
import { normalizeApplicationStatus } from '../utils/applicationStatus.js';

function serializeApplication(applicationDoc) {
  const application = applicationDoc.toObject ? applicationDoc.toObject() : applicationDoc;
  return {
    ...application,
    status: normalizeApplicationStatus(application.status),
  };
}

export async function listApplicationsByJob(jobId) {
  const applications = await JobApplication.find({ jobId })
    .populate('jobSeekerId', 'name email resumeLink profilePicture');

  return applications.map(serializeApplication);
}

export async function findApplicationById(applicationId) {
  return JobApplication.findById(applicationId);
}

export async function updateStatus(applicationDoc, status) {
  applicationDoc.status = normalizeApplicationStatus(status);
  await applicationDoc.save();
  return serializeApplication(applicationDoc);
}

export async function findExistingApplication(jobId, jobSeekerId) {
  return JobApplication.findOne({ jobId, jobSeekerId });
}

export async function createApplication({ jobId, jobSeekerId, resumeUrl, coverLetter }) {
  const application = new JobApplication({
    jobId,
    jobSeekerId,
    resumeUrl,
    coverLetter,
  });

  await application.save();
  return application;
}

export async function listApplicationsByJobSeeker(jobSeekerId) {
  const applications = await JobApplication.find({ jobSeekerId })
    .populate({
      path: 'jobId',
      select: 'title company companyLogo recruiter',
      populate: {
        path: 'recruiter',
        select: 'name email companyName companyLogo profilePicture',
      },
    });

  return applications.map(serializeApplication);
}

export async function findApplicationWithDetails(applicationId) {
  return JobApplication.findById(applicationId)
    .populate('jobId')
    .populate('jobSeekerId');
}

export async function analyzeApplicationMatch(application) {
  return analyzeMatch(
    {
      title: application.jobId.title,
      description: application.jobId.description,
      skills: application.jobId.skills,
    },
    {
      name: application.jobSeekerId.name,
      skills: application.jobSeekerId.skills,
      experience: application.jobSeekerId.experience,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
    },
  );
}
