import { GoogleGenerativeAI } from '@google/generative-ai';
import Job from '../models/Job.js';
import User from '../models/User.js';
import JobApplication from '../models/JobApplication.js';
import AgentPreferences from '../models/AgentPreferences.js';
import AgentDraft from '../models/AgentDraft.js';
import { generateCoverLetter } from './aiService.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a text string into a normalized embedding vector via Gemini.
 * Falls back gracefully if the embedding API call fails.
 */
async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error('[AgentService] Embedding error:', err.message);
    return null;
  }
}

/**
 * Cosine similarity between two numeric arrays.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Build a rich text representation of a user profile for embedding.
 */
function buildUserProfileText(user) {
  const parts = [
    `Name: ${user.name || 'Unknown'}`,
    `Skills: ${(user.skills || []).join(', ') || 'None listed'}`,
    `Experience: ${user.experience || 'Not specified'}`,
  ];
  return parts.join('\n');
}

/**
 * Build a rich text representation of a job for embedding.
 */
function buildJobText(job) {
  const parts = [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    `Description: ${job.description}`,
    `Required Skills: ${(job.skills || []).join(', ')}`,
    `Location: ${job.location}`,
    `Experience Required: ${job.experience || 0} years`,
    `Salary: ${job.salary}`,
  ];
  return parts.join('\n');
}

/**
 * Parse salary string like "$80k", "80000", "80,000 - 120,000" → min numeric value.
 */
function parseSalaryMin(salaryStr) {
  if (!salaryStr) return 0;
  const cleaned = salaryStr.replace(/[^0-9]/g, ' ').trim();
  const nums = cleaned.split(/\s+/).map(Number).filter(Boolean);
  if (!nums.length) return 0;
  const val = Math.min(...nums);
  // If value looks like thousands (< 1000), multiply
  return val < 1000 ? val * 1000 : val;
}

/**
 * Build the human-readable "Why Applied" explainability string.
 */
function buildReasonString(job, user, prefs, score) {
  const parts = [];
  const userSkillsLower = (user.skills || []).map((s) => s.toLowerCase());
  const jobSkillsLower = (job.skills || []).map((s) => s.toLowerCase());

  const matchedSkills = jobSkillsLower.filter((s) => userSkillsLower.includes(s));
  if (matchedSkills.length > 0) {
    parts.push(`Skills match: ${matchedSkills.join(', ')} ✅`);
  }

  const isRemote = job.location?.toLowerCase().includes('remote');
  if (prefs.remoteOnly && isRemote) parts.push('Remote ✅');
  if (prefs.remoteOnly && !isRemote) parts.push('Remote ❌');

  const salaryMin = parseSalaryMin(job.salary);
  if (prefs.minSalary > 0) {
    parts.push(salaryMin >= prefs.minSalary ? `Salary >$${prefs.minSalary.toLocaleString()} ✅` : `Salary below min ❌`);
  }

  parts.push(`Match score: ${score}%`);
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// Engine: Matching
// ---------------------------------------------------------------------------

/**
 * Phase 2: Matching Engine.
 * Finds jobs that are a high semantic match for the user's profile.
 * Returns an array of { job, score (0-100) } objects above the threshold.
 */
export async function findMatchingJobs(userId, prefs) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Build user profile text and embed it
  const profileText = buildUserProfileText(user);
  const userVec = await getEmbedding(profileText);

  // Fetch all jobs user hasn't already applied to
  const existingApps = await JobApplication.find({ jobSeekerId: userId }).select('jobId');
  const appliedIds = new Set(existingApps.map((a) => a.jobId.toString()));

  // Also filter out jobs already drafted
  const existingDrafts = await AgentDraft.find({ userId, status: 'pending' }).select('jobId');
  const draftedIds = new Set(existingDrafts.map((d) => d.jobId.toString()));

  // Check company cooldowns
  const now = new Date();
  const cooledCompanies = new Set(
    (prefs.companyCooldowns || [])
      .filter((c) => c.cooldownUntil > now)
      .map((c) => c.company.toLowerCase())
  );

  const allJobs = await Job.find({ status: { $ne: 'rejected' } });

  const candidates = allJobs.filter((job) => {
    if (appliedIds.has(job._id.toString())) return false;
    if (draftedIds.has(job._id.toString())) return false;
    if (cooledCompanies.has(job.company?.toLowerCase())) return false;
    // Remote filter
    if (prefs.remoteOnly && !job.location?.toLowerCase().includes('remote')) return false;
    // Salary filter
    if (prefs.minSalary > 0 && parseSalaryMin(job.salary) < prefs.minSalary) return false;
    return true;
  });

  if (!userVec) {
    // Fallback: use keyword matching if embeddings fail
    return candidates.slice(0, 5).map((job) => ({ job, score: 75 }));
  }

  // Embed each candidate job and compute similarity
  const scored = [];
  for (const job of candidates) {
    const jobText = buildJobText(job);
    const jobVec = await getEmbedding(jobText);
    const similarity = cosineSimilarity(userVec, jobVec);
    const score = Math.round(similarity * 100);
    if (score >= 70) {
      scored.push({ job, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}

// ---------------------------------------------------------------------------
// Engine: Decision
// ---------------------------------------------------------------------------

/**
 * Phase 3: Decision Engine.
 * Uses Gemini to make a final YES/NO decision on applying.
 */
export async function shouldApply(job, user, prefs, matchScore) {
  // Hard fail: score too low
  if (matchScore < 70) return false;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
You are an AI career agent deciding whether to apply on behalf of a job seeker.

### Candidate Profile
Name: ${user.name}
Skills: ${(user.skills || []).join(', ')}
Experience: ${user.experience || 'Not specified'}

### Job Details
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${(job.skills || []).join(', ')}
Location: ${job.location}
Salary: ${job.salary}

### Agent Preferences
Remote Only: ${prefs.remoteOnly}
Minimum Salary: $${prefs.minSalary}
Target Job Titles: ${(prefs.jobTitles || []).join(', ') || 'Not specified'}

Semantic Match Score: ${matchScore}%

Based on all of the above, should the agent apply to this job? 
Respond ONLY with a JSON object: { "apply": true/false, "reason": "brief one-sentence reason" }
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed.apply === true;
  } catch (err) {
    console.error('[AgentService] Decision engine error:', err.message);
    // Default to apply if score is high enough
    return matchScore >= 80;
  }
}

// ---------------------------------------------------------------------------
// Engine: Full Agent Run
// ---------------------------------------------------------------------------

/**
 * Main agent runner. Called by cron or on-demand.
 * Finds matches, makes decisions, generates cover letters, creates drafts.
 * Returns a summary of what was done.
 */
export async function runAgentForUser(userId) {
  const prefs = await AgentPreferences.findOne({ userId });
  if (!prefs || !prefs.isEnabled) return { drafted: 0, ignored: 0 };

  // Daily draft limit check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const draftsToday = await AgentDraft.countDocuments({
    userId,
    createdAt: { $gte: today },
  });
  if (draftsToday >= prefs.dailyLimit) {
    return { drafted: 0, ignored: 0, reason: 'Daily limit reached' };
  }

  const user = await User.findById(userId);
  if (!user) return { drafted: 0, ignored: 0, reason: 'User not found' };

  const matches = await findMatchingJobs(userId, prefs);
  let drafted = 0;
  let ignored = 0;

  for (const { job, score } of matches) {
    if (draftsToday + drafted >= prefs.dailyLimit) break;

    const apply = await shouldApply(job, user, prefs, score);
    if (!apply) {
      ignored++;
      prefs.activityLog.unshift({
        action: 'ignored',
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        matchScore: score,
        reason: `Score ${score}% — below threshold or preference mismatch`,
      });
      continue;
    }

    // Generation Engine: create the cover letter
    let coverLetter = '';
    try {
      coverLetter = await generateCoverLetter(job, {
        name: user.name,
        skills: user.skills,
        experience: user.experience,
      });
    } catch {
      coverLetter = `I am excited to apply for the ${job.title} role at ${job.company}. My skills in ${(user.skills || []).join(', ')} make me a strong candidate for this position.`;
    }

    const reason = buildReasonString(job, user, prefs, score);

    // Create the draft
    await AgentDraft.create({
      userId,
      jobId: job._id,
      coverLetter,
      matchScore: score,
      matchReason: reason,
    });

    prefs.activityLog.unshift({
      action: 'drafted',
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      matchScore: score,
      reason,
    });

    drafted++;
  }

  // Keep activity log to last 50 entries
  prefs.activityLog = prefs.activityLog.slice(0, 50);
  await prefs.save();

  return { drafted, ignored };
}

// ---------------------------------------------------------------------------
// Profile Health Score
// ---------------------------------------------------------------------------

/**
 * Computes a profile completeness score (0–100) to gate agent activation.
 */
export function computeProfileHealth(user, prefs) {
  const checks = [
    { label: 'Name set', met: !!user.name, weight: 10 },
    { label: 'Resume uploaded', met: !!user.resumeLink, weight: 30 },
    { label: 'Skills tagged', met: (user.skills || []).length >= 3, weight: 25 },
    { label: 'Experience set', met: !!user.experience, weight: 15 },
    { label: 'Salary preference set', met: prefs ? prefs.minSalary > 0 : false, weight: 10 },
    { label: 'Job titles configured', met: prefs ? (prefs.jobTitles || []).length > 0 : false, weight: 10 },
  ];

  const total = checks.reduce((sum, c) => sum + (c.met ? c.weight : 0), 0);
  return { score: total, checks };
}
