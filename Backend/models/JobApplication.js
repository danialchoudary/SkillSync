import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobSeekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ['applied', 'screening', 'interviewing', 'hired', 'rejected'],
    default: 'applied'
  },
  appliedAt: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;
