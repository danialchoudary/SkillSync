import mongoose from 'mongoose';

/**
 * Stores AI-generated draft applications awaiting user approval.
 */
const agentDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  coverLetter: { type: String, required: true },
  matchScore: { type: Number, required: true },
  matchReason: { type: String }, // e.g. "Applied because: Remote ✅, React 4yrs ✅"
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day TTL
  },
});

// Automatically expire drafts after 7 days
agentDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AgentDraft', agentDraftSchema);
