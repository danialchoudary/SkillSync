

import express from 'express';
import User from '../models/User.js';
import { profilePictureUploadMiddleware, companyLogoUploadMiddleware } from '../middleware/profilePictureUpload.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateUserUpdate } from '../middleware/validateUserUpdate.js';
import { resumeUploadMiddleware } from '../middleware/resumeUpload.js';
import { userUpdateLimiter } from '../middleware/rateLimiter.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// POST /me/profile-picture - upload profile picture
router.post('/profile-picture', userUpdateLimiter, authMiddleware, profilePictureUploadMiddleware, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Set new profile picture URL
    const publicUrl = req.file.path;
    user.profilePicture = publicUrl;
    await user.save();
    res.json({ profilePictureUrl: publicUrl });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture. Please try again.' });
  }
});

// POST /me/company-logo - upload company logo
router.post('/company-logo', userUpdateLimiter, authMiddleware, companyLogoUploadMiddleware, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Set new company logo URL
    const publicUrl = req.file.path;
    user.companyLogo = publicUrl;
    await user.save();
    res.json({ companyLogoUrl: publicUrl });
  } catch (err) {
    console.error('Upload company logo error:', err);
    res.status(500).json({ error: 'Failed to upload company logo. Please try again.' });
  }
});

// GET /me - returns current user info
router.get('/', authMiddleware, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await User.findById(req.user.id).select('name email skills experience resumeLink profilePicture role updatedAt companyName companyAddress companyWebsite companyLogo industry location description');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Parse experience string before sending to frontend
    let parsedExperience = {};
    try {
      parsedExperience = JSON.parse(user.experience);
    } catch {
      parsedExperience = { years: 0, summary: '' };
    }
    // Check if resume file exists
    let resumeUrl = user.resumeLink;
    // We don't check for existence on Cloudinary for every request to save performance
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      experience: parsedExperience,
      resumeUrl,
      profilePicture: user.profilePicture,
      role: user.role,
      updatedAt: user.updatedAt,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyWebsite: user.companyWebsite,
      companyLogo: user.companyLogo,
      industry: user.industry,
      location: user.location,
      description: user.description
    });
  } catch (err) {
    console.error('Fetch current user error:', err);
    res.status(500).json({ error: 'Failed to fetch user info. Please try again.' });
  }
});

// PATCH /me - update current user
router.patch('/', userUpdateLimiter, authMiddleware, validateUserUpdate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Accept recruiter fields
  const {
    name,
    companyName,
    companyAddress,
    companyWebsite,
    companyLogo,
    industry,
    location,
    description,
    skills,
    experience
  } = req.body;
  // Prepare update object
  const updateObj = {};
  if (typeof name === 'string') updateObj.name = name.trim();
  if (typeof companyName === 'string') updateObj.companyName = companyName.trim();
  if (typeof companyAddress === 'string') updateObj.companyAddress = companyAddress.trim();
  if (typeof companyWebsite === 'string') updateObj.companyWebsite = companyWebsite.trim();
  if (typeof companyLogo === 'string') updateObj.companyLogo = companyLogo;
  if (typeof industry === 'string') updateObj.industry = industry.trim();
  if (typeof location === 'string') updateObj.location = location.trim();
  if (typeof description === 'string') updateObj.description = description.trim();
  if (Array.isArray(skills)) updateObj.skills = [...new Set(skills.map(s => typeof s === 'string' ? s.trim().toLowerCase() : ''))];
  // Convert experience object to string for User model
  if (experience && typeof experience === 'object') {
    const years = typeof experience.years === 'number' ? experience.years : Number(experience.years);
    const summary = typeof experience.summary === 'string' ? experience.summary.trim() : '';
    updateObj.experience = JSON.stringify({ years, summary });
  } else if (typeof experience === 'string') {
    updateObj.experience = experience;
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateObj,
      { new: true, runValidators: true }
    ).select('name email skills experience resumeLink role updatedAt companyName companyAddress companyWebsite companyLogo industry location');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Parse experience string before sending to frontend
    let parsedExperience = {};
    try {
      parsedExperience = JSON.parse(user.experience);
    } catch {
      parsedExperience = { years: 0, summary: '' };
    }
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
      experience: parsedExperience,
      resumeUrl: user.resumeLink,
      profilePicture: user.profilePicture,
      role: user.role,
      updatedAt: user.updatedAt,
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyWebsite: user.companyWebsite,
      companyLogo: user.companyLogo,
      industry: user.industry,
      location: user.location
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /me/resume - upload resume
router.post('/resume', userUpdateLimiter, authMiddleware, resumeUploadMiddleware, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User find error' });
    }
    // Set new resume URL (Cloudinary path)
    const publicUrl = req.file.path;
    user.resumeLink = publicUrl;
    user.resumeUrl = publicUrl;
    await user.save();
    res.json({ resumeUrl: publicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
