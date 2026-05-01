import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getFrontendUrl } from '../utils/oauthUrls.js';
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

import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

export const registerUser = async (req, res) => {
  try {
    console.log('[Auth] Register request body:', req.body);
    let userData;
    let error;
    if (req.body.role === 'recruiter') {
      console.log('[Auth] Validating recruiter data...');
      ({ error } = recruiterSchema.validate(req.body));
      if (error) {
        console.log('[Auth] Recruiter validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      const { recruiterName, email, password, companyName, companyAddress, companyWebsite } = req.body;

      // Check for existing email
      const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (existingUser) {
        console.log('[Auth] Email already exists:', email);
        return res.status(400).json({ error: 'Email already in use' });
      }

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
      console.log('[Auth] Validating jobseeker data...');
      ({ error } = jobseekerSchema.validate(req.body));
      if (error) {
        console.log('[Auth] Jobseeker validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      const { name, email, password, skills, experience, resumeLink } = req.body;

      // Check for existing email
      const existingUser = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      if (existingUser) {
        console.log('[Auth] Email already exists:', email);
        return res.status(400).json({ error: 'Email already in use' });
      }

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

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    userData.verificationCode = verificationCode;
    userData.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    userData.isVerified = false;

    console.log('[Auth] Creating new user...');
    const user = new User(userData);
    await user.save();
    console.log('[Auth] User created successfully:', user._id);

    // Send verification email
    let emailSent = true;
    try {
      await sendEmail({
        email: user.email,
        subject: 'SkillSync Email Verification',
        message: `<h1>Email Verification</h1><p>Your verification code is: <strong>${verificationCode}</strong></p><p>This code expires in 10 minutes.</p>`
      });
      console.log('[Auth] Verification email sent to:', user.email);
    } catch (emailErr) {
      console.error('[Auth] Failed to send email:', emailErr);
      emailSent = false;
    }

    res.status(201).json({
      message: emailSent
        ? 'Registration successful. Please check your email for the verification code.'
        : 'Registration successful, but we could not send the verification email right now. Please click "Resend Verification Code".',
      email: user.email,
      emailSent
    });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.', details: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('[Auth] Verifying email:', email);

    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    console.log('[Auth] Email verified for user:', user._id);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, getAuthCookieOptions());

    res.json({
      message: 'Email verified successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (err) {
    console.error('[Auth] Verification error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[Auth] Resending code to:', email);

    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'SkillSync Verification Code (Resend)',
        message: `<h1>Email Verification</h1><p>Your new verification code is: <strong>${verificationCode}</strong></p><p>This code expires in 10 minutes.</p>`
      });
      console.log('[Auth] Verification email resent to:', user.email);
      res.json({ message: 'Verification code resent successfully' });
    } catch (emailErr) {
      console.error('[Auth] Failed to resend email:', emailErr);
      res.status(500).json({ error: 'Failed to send verification email' });
    }

  } catch (err) {
    console.error('[Auth] Resend code error:', err);
    res.status(500).json({ error: 'Failed to resend code', details: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      console.error('Login validation error:', error.details);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      console.error('Login failed: user not found for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('Login failed: password mismatch for email', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (user.isVerified === false) {
      console.error('Login failed: email not verified for', email);
      return res.status(401).json({
        error: 'Email not verified. Please check your inbox for the code.',
        needsVerification: true,
        email: user.email
      });
    }


    // Token expiration: 30 days if rememberMe is true, else 1 day
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

export const googleAuthCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(getFrontendUrl('/login?error=auth_failed'));
    }

    // Issue JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set cookie
    res.cookie('token', token, getAuthCookieOptions(24 * 60 * 60 * 1000)); // 1 day

    const tokenFragment = `#token=${encodeURIComponent(token)}`;

    // Check if user is fully registered
    if (user.role === 'pending') {
      return res.redirect(getFrontendUrl(`/onboarding${tokenFragment}`));
    }

    // Fully registered
    return res.redirect(getFrontendUrl(`/dashboard${tokenFragment}`));
  } catch (err) {
    console.error('Google Auth Callback Error:', err);
    return res.redirect(getFrontendUrl('/login?error=server_error'));
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const { role } = req.body; // 'jobseeker' or 'recruiter'
    if (!['jobseeker', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'pending') {
      return res.status(400).json({ error: 'User has already completed onboarding' });
    }

    user.role = role;
    await user.save();

    // Re-issue JWT with the correct role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, getAuthCookieOptions(24 * 60 * 60 * 1000));

    res.json({ message: 'Onboarding completed successfully', user: { name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('Complete Onboarding Error:', err);
    res.status(500).json({ error: err.message });
  }
};
