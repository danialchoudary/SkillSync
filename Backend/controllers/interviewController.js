import Interview from '../models/Interview.js';
import JobApplication from '../models/JobApplication.js';
import { createNotification } from '../services/notificationService.js';

export const createInterview = async (req, res) => {
  try {
    const { jobApplicationId, scheduledAt, meetingLink, notes } = req.body;
    const scheduledDate = new Date(scheduledAt);
    const normalizedMeetingLink = typeof meetingLink === 'string' ? meetingLink.trim() : '';
    
    // Validate request
    if (!jobApplicationId || !scheduledAt) {
      return res.status(400).json({ error: 'jobApplicationId and scheduledAt are required.' });
    }

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'scheduledAt must be a valid date.' });
    }

    if (!normalizedMeetingLink) {
      return res.status(400).json({ error: 'Meeting link is required.' });
    }

    // Verify application exists
    const application = await JobApplication.findById(jobApplicationId).populate('jobId');
    if (!application) {
      return res.status(404).json({ error: 'Job application not found.' });
    }

    if (!application.jobId) {
      return res.status(404).json({ error: 'Job for this application not found.' });
    }

    // Verify the logged-in recruiter owns this job
    if (!application.jobId.recruiter || application.jobId.recruiter.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to schedule an interview for this candidate.' });
    }

    // Create the interview
    const interview = new Interview({
      jobApplicationId: application._id,
      jobId: application.jobId._id,
      recruiterId: req.user.id,
      jobSeekerId: application.jobSeekerId,
      scheduledAt: scheduledDate,
      meetingLink: normalizedMeetingLink,
      notes: notes || '',
      status: 'scheduled'
    });

    await interview.save();

    // Optionally update the application status to interview
    application.status = 'interview';
    await application.save();

    try {
      const companyName = application.jobId.company || 'the company';
      const interviewTime = scheduledDate.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      await createNotification(
        application.jobSeekerId,
        'interview_scheduled',
        'Interview Scheduled',
        `Your interview for ${application.jobId.title} at ${companyName} is scheduled for ${interviewTime}.`,
        '/my-applications',
        application.jobId.companyLogo || ''
      );
    } catch (notificationError) {
      console.error('Failed to create interview notification:', notificationError);
    }

    return res.status(201).json(interview);
  } catch (error) {
    console.error('Error creating interview:', error);
    return res.status(500).json({ error: 'Failed to schedule interview.' });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query = {};
    if (role === 'recruiter') {
      query = { recruiterId: userId };
    } else if (role === 'jobseeker') {
      query = { jobSeekerId: userId };
    } else {
      return res.status(403).json({ error: 'Unauthorized role to view interviews.' });
    }

    const interviews = await Interview.find(query)
      .populate('jobId', 'title company companyLogo')
      .populate('recruiterId', 'name email')
      .populate('jobSeekerId', 'name email profilePicture')
      .sort({ scheduledAt: 1 }); // Sort chronologically

    return res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return res.status(500).json({ error: 'Failed to fetch interviews.' });
  }
};

export const updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    // Only the recruiter or the jobseeker involved can update it (usually just recruiter, but let's allow both for cancelling)
    if (interview.recruiterId.toString() !== req.user.id.toString() && interview.jobSeekerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this interview.' });
    }

    interview.status = status;
    await interview.save();

    return res.json(interview);
  } catch (error) {
    console.error('Error updating interview status:', error);
    return res.status(500).json({ error: 'Failed to update interview status.' });
  }
};
