import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  jobApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobSeekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  meetingLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
