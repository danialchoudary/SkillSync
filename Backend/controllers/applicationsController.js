import { isValidApplicationStatus } from '../utils/applicationStatus.js';
import {
  analyzeApplicationMatch,
  createApplication,
  findApplicationById,
  findApplicationWithDetails,
  findExistingApplication,
  listApplicationsByJob,
  listApplicationsByJobSeeker,
  updateStatus,
} from '../services/applicationsService.js';
import { createNotification } from '../services/notificationService.js';
import { generateCoverLetter } from '../services/aiService.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export async function getApplicantsForJob(req, res) {
  try {
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await listApplicationsByJob(req.params.jobId);
    return res.json(applications);
  } catch (err) {
    console.error('Fetch applicants error:', err);
    return res.status(500).json({ error: 'Failed to fetch applicants. Please try again.' });
  }
}

export async function updateApplicationStatus(req, res) {
  try {
    if (!req.user || req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    if (!isValidApplicationStatus(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const application = await findApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const updatedApplication = await updateStatus(application, status);
    
    // Notify job seeker with job and company details
    const job = await Job.findById(application.jobId).populate('recruiter', 'companyName');
    const jobTitle = job ? job.title : 'a job';
    const companyName = job?.recruiter?.companyName ? ` at ${job.recruiter.companyName}` : '';

    await createNotification(
      application.jobSeekerId,
      'application_status_update',
      'Application Status Updated',
      `Your application for ${jobTitle}${companyName} has been updated to ${status}.`,
      `/my-applications`
    );

    return res.json(updatedApplication);
  } catch (err) {
    console.error('Update application status error:', err);
    return res.status(500).json({ error: 'Failed to update application status. Please try again.' });
  }
}

export async function applyForJob(req, res) {
  try {
    const { jobId, coverLetter } = req.body;
    const jobSeekerId = req.user._id;
    let resumeUrl = req.user.resumeLink || '';

    if (req.file) {
      resumeUrl = req.file.path;
    }

    if (!jobId) {
      return res.status(400).json({ error: 'Missing jobId.' });
    }

    if (!coverLetter) {
      return res.status(400).json({ error: 'Missing cover letter.' });
    }

    const existing = await findExistingApplication(jobId, jobSeekerId);
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this job.' });
    }

    const application = await createApplication({
      jobId,
      jobSeekerId,
      resumeUrl,
      coverLetter,
    });

    // Fetch job to get recruiter ID
    const job = await Job.findById(jobId);
    if (job) {
      await createNotification(
        job.recruiter,
        'new_application',
        'New Application Received',
        `A new candidate applied for ${job.title}.`,
        `/recruiter/applicants`,
        req.user.profilePicture || ''
      );
    }

    return res.status(201).json(application);
  } catch (err) {
    console.error('Apply for job error:', err);
    return res.status(500).json({ error: 'Failed to apply for job. Please try again.' });
  }
}

export async function getMyApplications(req, res) {
  try {
    const applications = await listApplicationsByJobSeeker(req.user._id);
    return res.json(applications);
  } catch (err) {
    console.error('Fetch applications error:', err);
    return res.status(500).json({ error: 'Failed to fetch applications. Please try again.' });
  }
}

export async function getApplicationAiMatch(req, res) {
  try {
    const application = await findApplicationWithDetails(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.jobId.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const matchResult = await analyzeApplicationMatch(application);
    return res.json(matchResult);
  } catch (err) {
    console.error('AI Match error:', err);
    return res.status(500).json({ error: 'Failed to analyze match' });
  }
}

export async function generateAiCoverLetter(req, res) {
  try {
    const { jobId } = req.body;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Missing jobId' });
    }

    const job = await Job.findById(jobId).populate('recruiter', 'companyName');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Construct job object
    const jobData = {
      title: job.title,
      description: job.description,
      skills: job.skills,
      company: job.company || job.recruiter?.companyName,
    };

    // Construct candidate object
    const candidateData = {
      name: user.name,
      skills: user.skills,
      experience: user.experience,
      resumeUrl: user.resumeLink,
    };

    const coverLetter = await generateCoverLetter(jobData, candidateData);
    
    return res.json({ coverLetter });
  } catch (err) {
    console.error('Generate cover letter error:', err);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
}
