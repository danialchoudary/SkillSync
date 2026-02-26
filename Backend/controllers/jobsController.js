import {
  buildUserApplicationStatusMap,
  createJobForRecruiter,
  deleteJobForRecruiter,
  findAllJobsWithRecruiter,
  findJobsByRecruiter,
  findUserWithSavedJobs,
  getOptionalUserIdFromRequest,
  mapJobsWithLogoAndStatus,
  mapRecruiterJobsWithLogo,
  saveJobForUser,
  unsaveJobForUser,
  updateJobForRecruiter,
} from '../services/jobsService.js';

export async function updateJob(req, res) {
  try {
    const job = await updateJobForRecruiter(req.params.id, req.user.id, req.body);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.json(job);
  } catch (err) {
    console.error('Update job error:', err);
    return res.status(500).json({ error: 'Failed to update job. Please try again.' });
  }
}

export async function saveJob(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await saveJobForUser(user, req.params.id);
    if (result.alreadySaved) {
      return res.status(400).json({ error: 'Job already saved.' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Save job error:', err);
    return res.status(500).json({ error: 'Failed to save job. Please try again.' });
  }
}

export async function unsaveJob(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    await unsaveJobForUser(user, req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Unsave job error:', err);
    return res.status(500).json({ error: 'Failed to unsave job. Please try again.' });
  }
}

export async function getSavedJobs(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const user = await findUserWithSavedJobs(req.user._id);
    console.log('Populated savedJobs:', user.savedJobs);

    let userStatusMap = {};
    if (req.user) {
      userStatusMap = await buildUserApplicationStatusMap(req.user._id);
    }

    const jobsWithStatus = mapJobsWithLogoAndStatus(user.savedJobs || [], userStatusMap);
    return res.json(jobsWithStatus);
  } catch (err) {
    console.error('Fetch saved jobs error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved jobs. Please try again.' });
  }
}

export async function createJob(req, res) {
  try {
    const { title, company, description, location, salary, skills, experience } = req.body;
    const job = await createJobForRecruiter({
      title,
      company,
      description,
      location,
      salary,
      skills,
      experience,
      recruiterId: req.user.id,
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    return res.status(500).json({ error: 'Failed to create job. Please try again.' });
  }
}

export async function listJobs(req, res) {
  try {
    const userId = getOptionalUserIdFromRequest(req, process.env.JWT_SECRET);
    const jobs = await findAllJobsWithRecruiter();

    let userStatusMap = {};
    if (userId) {
      userStatusMap = await buildUserApplicationStatusMap(userId);
    }

    const jobsWithLogo = mapJobsWithLogoAndStatus(jobs, userStatusMap);
    return res.json(jobsWithLogo);
  } catch (err) {
    console.error('Fetch jobs error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs. Please try again.' });
  }
}

export async function getRecruiterJobs(req, res) {
  try {
    const jobs = await findJobsByRecruiter(req.user.id);
    const jobsWithLogo = mapRecruiterJobsWithLogo(jobs);
    return res.json(jobsWithLogo);
  } catch (err) {
    console.error('Fetch recruiter jobs error:', err);
    return res.status(500).json({ error: 'Failed to fetch recruiter jobs. Please try again.' });
  }
}

export async function deleteJob(req, res) {
  try {
    const job = await deleteJobForRecruiter(req.params.id, req.user.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.json({ message: 'Job deleted.' });
  } catch (err) {
    console.error('Delete job error:', err);
    return res.status(500).json({ error: 'Failed to delete job. Please try again.' });
  }
}
