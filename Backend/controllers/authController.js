import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const jobseekerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('jobseeker').required(),
  skills: Joi.array().items(Joi.string()),
  experience: Joi.string().allow(''),
  resumeLink: Joi.string().uri().allow('')
});

const recruiterSchema = Joi.object({
  recruiterName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  role: Joi.string().valid('recruiter').required(),
  companyName: Joi.string().min(2).max(100).required(),
  companyAddress: Joi.string().min(2).max(200).required(),
  companyWebsite: Joi.string().uri().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

export const registerUser = async (req, res) => {
  try {
    let userData;
    let error;
      if (req.body.role === 'recruiter') {
      ({ error } = recruiterSchema.validate(req.body));
      if (error) return res.status(400).json({ error: error.details[0].message });
      const { recruiterName, email, password, companyName, companyAddress, companyWebsite } = req.body;
      // Check for existing email
      const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
      userData = {
        name: recruiterName,
        email,
        password,
        role: 'recruiter',
        companyName,
        companyAddress,
        companyWebsite
      };
    } else {
      ({ error } = jobseekerSchema.validate(req.body));
      if (error) return res.status(400).json({ error: error.details[0].message });
      const { name, email, password, skills, experience, resumeLink } = req.body;
      // Check for existing email
      const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
      userData = {
        name,
        email,
        password,
        role: 'jobseeker',
        skills,
        experience,
        resumeLink
      };
    }
    const user = new User(userData);
    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      token 
    });
  } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      console.error('Login validation error:', error.details);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.error('Login failed: user not found for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('Login failed: password mismatch for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ user: { name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};
