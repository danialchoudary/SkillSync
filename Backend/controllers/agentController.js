import AgentPreferences from '../models/AgentPreferences.js';
import AgentDraft from '../models/AgentDraft.js';
import JobApplication from '../models/JobApplication.js';
import { runAgentForUser, computeProfileHealth } from '../services/agentService.js';
import User from '../models/User.js';

// ---------------------------------------------------------------------------
// GET /agent/status
// Returns the current agent preferences, profile health, and pending drafts
// ---------------------------------------------------------------------------
export async function getAgentStatus(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let prefs = await AgentPreferences.findOne({ userId });
    if (!prefs) {
      // Create default prefs for new users
      prefs = await AgentPreferences.create({ userId });
    }

    const { score: healthScore, checks: healthChecks } = computeProfileHealth(user, prefs);

    const pendingDrafts = await AgentDraft.find({ userId, status: 'pending' })
      .populate('jobId', 'title company location salary')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      isEnabled: prefs.isEnabled,
      mode: prefs.mode,
      dailyLimit: prefs.dailyLimit,
      preferences: {
        remoteOnly: prefs.remoteOnly,
        minSalary: prefs.minSalary,
        jobTitles: prefs.jobTitles,
      },
      profileHealth: { score: healthScore, checks: healthChecks },
      pendingDrafts,
      activityLog: prefs.activityLog.slice(0, 20),
    });
  } catch (err) {
    console.error('[AgentController] getAgentStatus error:', err);
    return res.status(500).json({ error: 'Failed to fetch agent status' });
  }
}

// ---------------------------------------------------------------------------
// PATCH /agent/preferences
// Update the agent's preferences and enable/disable state
// ---------------------------------------------------------------------------
export async function updateAgentPreferences(req, res) {
  try {
    const userId = req.user.id;
    const { isEnabled, remoteOnly, minSalary, jobTitles, mode } = req.body;

    const user = await User.findById(userId);
    let prefs = await AgentPreferences.findOne({ userId });
    if (!prefs) {
      prefs = new AgentPreferences({ userId });
    }

    // Health gate: cannot enable if profile < 80%
    if (isEnabled === true) {
      const { score } = computeProfileHealth(user, prefs);
      if (score < 80) {
        return res.status(400).json({
          error: 'Profile completeness must be at least 80% to activate the agent.',
          healthScore: score,
        });
      }
    }

    if (isEnabled !== undefined) prefs.isEnabled = isEnabled;
    if (mode !== undefined) prefs.mode = mode;
    if (remoteOnly !== undefined) prefs.remoteOnly = remoteOnly;
    if (minSalary !== undefined) prefs.minSalary = Number(minSalary);
    if (jobTitles !== undefined) prefs.jobTitles = jobTitles;

    await prefs.save();

    return res.json({ success: true, prefs });
  } catch (err) {
    console.error('[AgentController] updateAgentPreferences error:', err);
    return res.status(500).json({ error: 'Failed to update agent preferences' });
  }
}

// ---------------------------------------------------------------------------
// POST /agent/run
// Manually trigger the agent to scan for matching jobs right now
// ---------------------------------------------------------------------------
export async function triggerAgentRun(req, res) {
  try {
    const userId = req.user.id;
    const result = await runAgentForUser(userId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AgentController] triggerAgentRun error:', err);
    return res.status(500).json({ error: 'Agent run failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /agent/drafts/:draftId/approve
// User approves a draft → creates a real JobApplication
// ---------------------------------------------------------------------------
export async function approveDraft(req, res) {
  try {
    const userId = req.user.id;
    const { draftId } = req.params;

    const draft = await AgentDraft.findOne({ _id: draftId, userId });
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    if (draft.status !== 'pending') return res.status(400).json({ error: 'Draft already processed' });

    // Check not already applied
    const existing = await JobApplication.findOne({ jobId: draft.jobId, jobSeekerId: userId });
    if (existing) {
      draft.status = 'rejected';
      await draft.save();
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Create the real application
    const application = await JobApplication.create({
      jobId: draft.jobId,
      jobSeekerId: userId,
      coverLetter: draft.coverLetter,
      status: 'applied',
    });

    draft.status = 'approved';
    await draft.save();

    // Log in activity
    const prefs = await AgentPreferences.findOne({ userId });
    if (prefs) {
      prefs.activityLog.unshift({
        action: 'applied',
        jobId: draft.jobId,
        jobTitle: draft.jobId?.title || 'Unknown',
        matchScore: draft.matchScore,
        reason: draft.matchReason,
      });
      prefs.activityLog = prefs.activityLog.slice(0, 50);
      await prefs.save();
    }

    return res.json({ success: true, application });
  } catch (err) {
    console.error('[AgentController] approveDraft error:', err);
    return res.status(500).json({ error: 'Failed to approve draft' });
  }
}

// ---------------------------------------------------------------------------
// POST /agent/drafts/:draftId/reject
// User rejects a draft → marks it rejected, adds company cooldown
// ---------------------------------------------------------------------------
export async function rejectDraft(req, res) {
  try {
    const userId = req.user.id;
    const { draftId } = req.params;

    const draft = await AgentDraft.findOne({ _id: draftId, userId }).populate('jobId', 'company');
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    draft.status = 'rejected';
    await draft.save();

    // Add 90-day company cooldown
    const prefs = await AgentPreferences.findOne({ userId });
    if (prefs && draft.jobId?.company) {
      const cooldownUntil = new Date();
      cooldownUntil.setDate(cooldownUntil.getDate() + 90);

      const existing = prefs.companyCooldowns.find(
        (c) => c.company.toLowerCase() === draft.jobId.company.toLowerCase()
      );
      if (existing) {
        existing.cooldownUntil = cooldownUntil;
      } else {
        prefs.companyCooldowns.push({ company: draft.jobId.company, cooldownUntil });
      }

      prefs.activityLog.unshift({
        action: 'rejected',
        jobId: draft.jobId._id,
        jobTitle: draft.jobId?.title,
        company: draft.jobId?.company,
        matchScore: draft.matchScore,
        reason: 'Rejected by user — 90-day company cooldown applied',
      });
      prefs.activityLog = prefs.activityLog.slice(0, 50);
      await prefs.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[AgentController] rejectDraft error:', err);
    return res.status(500).json({ error: 'Failed to reject draft' });
  }
}
