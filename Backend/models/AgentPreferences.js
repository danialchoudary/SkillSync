import mongoose from 'mongoose';

/**
 * Stores the AI Auto-Apply Agent preferences and state for a jobseeker.
 */
const agentPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  isEnabled: { type: Boolean, default: false },
  mode: { type: String, enum: ['draft', 'auto'], default: 'draft' },

  // Filtering preferences
  remoteOnly: { type: Boolean, default: false },
  minSalary: { type: Number, default: 0 },
  jobTitles: { type: [String], default: [] }, // e.g. ["Frontend Developer", "React Developer"]

  // Rate limiting
  dailyLimit: { type: Number, default: 3 },

  // Activity log entries
  activityLog: [
    {
      action: { type: String, enum: ['applied', 'drafted', 'ignored', 'rejected'] },
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      jobTitle: { type: String },
      company: { type: String },
      matchScore: { type: Number },
      reason: { type: String }, // Explainability string
      timestamp: { type: Date, default: Date.now },
    },
  ],

  // Cooldown: companies the agent should not re-apply to
  companyCooldowns: [
    {
      company: { type: String },
      cooldownUntil: { type: Date },
    },
  ],

  updatedAt: { type: Date, default: Date.now },
});

agentPreferencesSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('AgentPreferences', agentPreferencesSchema);
