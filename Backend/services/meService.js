import User from '../models/User.js';

const profileSelectFields = 'name email skills experience resumeLink profilePicture role updatedAt companyName companyAddress companyWebsite companyLogo industry location description';
const profileUpdateSelectFields = 'name email skills experience resumeLink role updatedAt companyName companyAddress companyWebsite companyLogo industry location';

function parseExperienceValue(experience) {
  let parsedExperience = {};
  try {
    parsedExperience = JSON.parse(experience);
  } catch {
    parsedExperience = { years: 0, summary: '' };
  }
  return parsedExperience;
}

export async function setProfilePicture(userId, profilePictureUrl) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.profilePicture = profilePictureUrl;
  await user.save();
  return profilePictureUrl;
}

export async function setCompanyLogo(userId, companyLogoUrl) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.companyLogo = companyLogoUrl;
  await user.save();
  return companyLogoUrl;
}

export async function findCurrentUserProfile(userId) {
  return User.findById(userId).select(profileSelectFields);
}

export function toCurrentUserResponse(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    skills: user.skills,
    experience: parseExperienceValue(user.experience),
    resumeUrl: user.resumeLink,
    profilePicture: user.profilePicture,
    role: user.role,
    updatedAt: user.updatedAt,
    companyName: user.companyName,
    companyAddress: user.companyAddress,
    companyWebsite: user.companyWebsite,
    companyLogo: user.companyLogo,
    industry: user.industry,
    location: user.location,
    description: user.description,
  };
}

export function buildUserUpdatePayload(body) {
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
    experience,
  } = body;

  const updateObj = {};

  if (typeof name === 'string') updateObj.name = name.trim();
  if (typeof companyName === 'string') updateObj.companyName = companyName.trim();
  if (typeof companyAddress === 'string') updateObj.companyAddress = companyAddress.trim();
  if (typeof companyWebsite === 'string') updateObj.companyWebsite = companyWebsite.trim();
  if (typeof companyLogo === 'string') updateObj.companyLogo = companyLogo;
  if (typeof industry === 'string') updateObj.industry = industry.trim();
  if (typeof location === 'string') updateObj.location = location.trim();
  if (typeof description === 'string') updateObj.description = description.trim();

  if (Array.isArray(skills)) {
    updateObj.skills = [...new Set(skills.map((skill) => (typeof skill === 'string' ? skill.trim().toLowerCase() : '')))];
  }

  if (experience && typeof experience === 'object') {
    const years = typeof experience.years === 'number' ? experience.years : Number(experience.years);
    const summary = typeof experience.summary === 'string' ? experience.summary.trim() : '';
    updateObj.experience = JSON.stringify({ years, summary });
  } else if (typeof experience === 'string') {
    updateObj.experience = experience;
  }

  return updateObj;
}

export async function updateCurrentUser(userId, updateObj) {
  return User.findByIdAndUpdate(
    userId,
    updateObj,
    { new: true, runValidators: true },
  ).select(profileUpdateSelectFields);
}

export function toUpdatedUserResponse(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    skills: user.skills,
    experience: parseExperienceValue(user.experience),
    resumeUrl: user.resumeLink,
    profilePicture: user.profilePicture,
    role: user.role,
    updatedAt: user.updatedAt,
    companyName: user.companyName,
    companyAddress: user.companyAddress,
    companyWebsite: user.companyWebsite,
    companyLogo: user.companyLogo,
    industry: user.industry,
    location: user.location,
  };
}

export async function setResume(userId, resumeUrl) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.resumeLink = resumeUrl;
  user.resumeUrl = resumeUrl;
  await user.save();
  return resumeUrl;
}
