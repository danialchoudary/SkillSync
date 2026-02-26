import {
  buildUserUpdatePayload,
  findCurrentUserProfile,
  setCompanyLogo,
  setProfilePicture,
  setResume,
  toCurrentUserResponse,
  toUpdatedUserResponse,
  updateCurrentUser,
} from '../services/meService.js';

function ensureAuthenticated(req, res) {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export async function uploadProfilePicture(req, res) {
  if (!ensureAuthenticated(req, res)) return;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const publicUrl = req.file.path;
    const savedProfilePictureUrl = await setProfilePicture(req.user.id, publicUrl);
    if (!savedProfilePictureUrl) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ profilePictureUrl: savedProfilePictureUrl });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    return res.status(500).json({ error: 'Failed to upload profile picture. Please try again.' });
  }
}

export async function uploadCompanyLogo(req, res) {
  if (!ensureAuthenticated(req, res)) return;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const publicUrl = req.file.path;
    const savedCompanyLogoUrl = await setCompanyLogo(req.user.id, publicUrl);
    if (!savedCompanyLogoUrl) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ companyLogoUrl: savedCompanyLogoUrl });
  } catch (err) {
    console.error('Upload company logo error:', err);
    return res.status(500).json({ error: 'Failed to upload company logo. Please try again.' });
  }
}

export async function getCurrentUserProfile(req, res) {
  if (!ensureAuthenticated(req, res)) return;

  try {
    const user = await findCurrentUserProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(toCurrentUserResponse(user));
  } catch (err) {
    console.error('Fetch current user error:', err);
    return res.status(500).json({ error: 'Failed to fetch user info. Please try again.' });
  }
}

export async function updateUserProfile(req, res) {
  if (!ensureAuthenticated(req, res)) return;

  const updateObj = buildUserUpdatePayload(req.body);

  try {
    const user = await updateCurrentUser(req.user.id, updateObj);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(toUpdatedUserResponse(user));
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function uploadResume(req, res) {
  if (!ensureAuthenticated(req, res)) return;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const publicUrl = req.file.path;
    const savedResumeUrl = await setResume(req.user.id, publicUrl);
    if (!savedResumeUrl) {
      return res.status(404).json({ error: 'User find error' });
    }

    return res.json({ resumeUrl: savedResumeUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
