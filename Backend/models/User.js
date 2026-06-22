import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Common fields
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'recruiter', 'jobseeker', 'pending'], required: true },
  // Jobseeker fields
  skills: [{ type: String }],
  experience: { type: String },
  resumeLink: { type: String },
  profilePicture: { type: String },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  // Recruiter fields
  companyName: { type: String },
  companyAddress: { type: String },
  companyWebsite: { type: String },
  /**
   * Path to uploaded company logo image (e.g. /uploads/profile-pictures/xxx.png)
   */
  companyLogo: { type: String },
  /**
   * Industry type (e.g. IT, Healthcare, Finance, etc.)
   */
  industry: { type: String },
  /**
   * Location (City, Country)
   */
  location: { type: String },
  /**
   * Company description (for recruiter profile)
   */
  description: { type: String },

});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
