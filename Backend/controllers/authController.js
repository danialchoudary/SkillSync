import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getAuthCookieOptions } from '../utils/authCookies.js';

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
  password: Joi.string().min(6).max(128).required(),
  rememberMe: Joi.boolean().optional()
});

export const registerUser = async (req, res) => {
  try {
    let userData;
    let error;
    const rawEmail = String(req.body.email || '').trim();
    const normalizedEmail = rawEmail.toLowerCase();
    
    if (req.body.role === 'recruiter') {
      ({ error } = recruiterSchema.validate(req.body));
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const { recruiterName, password, companyName, companyAddress, companyWebsite } = req.body;

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      userData = {
        name: recruiterName,
        email: normalizedEmail,
        password,
        role: 'recruiter',
        companyName,
        companyAddress,
        companyWebsite
      };
    } else {
      ({ error } = jobseekerSchema.validate(req.body));
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const { name, password, skills, experience, resumeLink } = req.body;

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      userData = {
        name,
        email: normalizedEmail,
        password,
        role: 'jobseeker',
        skills,
        experience,
        resumeLink
      };
    }

    const user = new User(userData);
    await user.save();

    const expiresIn = '1d';
    const cookieMaxAge = 24 * 60 * 60 * 1000;
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn });
    res.cookie('token', token, getAuthCookieOptions(cookieMaxAge));

    res.status(201).json({
      message: 'Registration successful',
      user: { name: user.name, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.', details: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, rememberMe } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const expiresIn = rememberMe ? '30d' : '1d';
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn });

    res.cookie('token', token, getAuthCookieOptions(cookieMaxAge));

    res.json({ user: { name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie('token', getAuthCookieOptions());
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};
