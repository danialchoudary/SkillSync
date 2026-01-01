import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  skills: { type: [String], default: [] },
  experience: { type: Number, default: 0 },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // New field
  companyLogo: { type: String, default: '' }, // URL for the company logo
});

export default mongoose.model('Job', jobSchema);
