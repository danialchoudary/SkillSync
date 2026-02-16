import mongoose from 'mongoose';
import { APPLICATION_STATUSES, normalizeApplicationStatus } from '../utils/applicationStatus.js';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobSeekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: APPLICATION_STATUSES,
    default: 'applied',
    set: normalizeApplicationStatus,
  },
  appliedAt: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;
