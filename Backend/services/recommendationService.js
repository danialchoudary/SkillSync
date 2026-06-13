import Job from '../models/Job.js';
import User from '../models/User.js';
import JobApplication from '../models/JobApplication.js';
import { buildUserApplicationStatusMap, mapJobsWithLogoAndStatus } from './jobsService.js';

// Helper to extract numeric years from experience strings like "3+ years", "1-3 years"
function parseExperience(expString) {
  if (!expString) return 0;
  if (typeof expString === 'number') return expString;
  const match = expString.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
}

export async function getRecommendationsForUser(userId) {
  // 1. Fetch user data (explicit skills)
  const user = await User.findById(userId).populate('savedJobs');
  if (!user) throw new Error('User not found');

  // Extract explicit skills
  const explicitSkills = user.skills || [];
  
  // 2. Fetch user's applied jobs (implicit skills)
  const applications = await JobApplication.find({ jobSeekerId: userId }).populate('jobId');
  const appliedJobs = applications.map(app => app.jobId).filter(job => job != null);
  
  // Build composite skill profile with weights
  const skillWeights = {};
  
  // Explicit skills get highest weight
  explicitSkills.forEach(skill => {
    const s = skill.toLowerCase();
    skillWeights[s] = (skillWeights[s] || 0) + 3;
  });

  // Saved jobs skills
  const savedJobs = user.savedJobs || [];
  savedJobs.forEach(job => {
    if (job && job.skills) {
      job.skills.forEach(skill => {
        const s = skill.toLowerCase();
        skillWeights[s] = (skillWeights[s] || 0) + 1;
      });
    }
  });

  // Applied jobs skills
  appliedJobs.forEach(job => {
    if (job && job.skills) {
      job.skills.forEach(skill => {
        const s = skill.toLowerCase();
        skillWeights[s] = (skillWeights[s] || 0) + 2;
      });
    }
  });

  // 3. Fetch all open jobs that user hasn't applied to
  const appliedJobIds = new Set(appliedJobs.map(job => job._id.toString()));
  
  // Also optionally filter out jobs created by the user (if recruiter) or jobs with status 'rejected'
  const allOpenJobs = await Job.find({ status: { $ne: 'rejected' } });
  
  const jobsToScore = allOpenJobs.filter(job => !appliedJobIds.has(job._id.toString()));

  const userExpYears = parseExperience(user.experience);

  // 4. Score each job
  const scoredJobs = jobsToScore.map(job => {
    let score = 0;
    
    // Skill match
    if (job.skills && job.skills.length > 0) {
      job.skills.forEach(skill => {
        const s = skill.toLowerCase();
        if (skillWeights[s]) {
          score += skillWeights[s];
        }
      });
    }

    // Experience match (Weight: boost if user meets or exceeds)
    const jobExpReq = typeof job.experience === 'number' ? job.experience : parseExperience(job.experience);
    if (userExpYears >= jobExpReq) {
      score += 5; // Flat boost for having enough experience
    } else {
      score -= Math.abs(jobExpReq - userExpYears) * 2; // Penalty for not having enough experience
    }

    // Add match percentage to job object conceptually
    return { job, score };
  });

  // 5. Sort by score descending and return top matches (score > 0 to ensure relevance)
  const topMatches = scoredJobs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Get top 20
    .map(item => item.job);

  // Include application status map
  let userStatusMap = await buildUserApplicationStatusMap(userId);
  const formattedJobs = mapJobsWithLogoAndStatus(topMatches, userStatusMap);

  return formattedJobs;
}
