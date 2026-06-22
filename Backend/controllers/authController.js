import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getAuthCookieOptions } from '../utils/authCookies.js';
import { sendVerificationSms } from '../utils/smsService.js';
import crypto from 'crypto';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { getPasskeyConfig } from '../utils/passkeyConfig.js';

const jobseekerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().trim().pattern(/^\+[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('jobseeker').required(),
  skills: Joi.array().items(Joi.string()),
  experience: Joi.string().allow(''),
  resumeLink: Joi.string().uri().allow('')
});

const recruiterSchema = Joi.object({
  recruiterName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().trim().pattern(/^\+[1-9]\d{1,14}$/).required(),
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

const passkeyRegisterJobseekerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('jobseeker').required(),
  skills: Joi.array().items(Joi.string()).default([]),
  experience: Joi.string().allow('').default(''),
  resumeLink: Joi.string().uri().allow('').default(''),
});

const passkeyRegisterRecruiterSchema = Joi.object({
  recruiterName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('recruiter').required(),
  companyName: Joi.string().min(2).max(100).required(),
  companyAddress: Joi.string().min(2).max(200).required(),
  companyWebsite: Joi.string().uri().allow('').default(''),
});

const passkeyRegisterBaseSchema = Joi.object({
  role: Joi.string().valid('jobseeker', 'recruiter').required(),
  email: Joi.string().email().required(),
});

const passkeyLoginSchema = Joi.object({
  email: Joi.string().email().required(),
});

function getDisplayNameForUser(user) {
  return user.role === 'recruiter' ? user.companyName || user.name || user.email : user.name || user.email;
}

function getUserEntityForPasskey(user) {
  return {
    id: String(user._id),
    name: user.email,
    displayName: getDisplayNameForUser(user),
  };
}

function getPasskeyCredentials(user) {
  return Array.isArray(user.passkeys)
    ? user.passkeys
        .filter((credential) => credential?.credentialID && credential?.publicKey)
        .map((credential) => ({
          id: credential.credentialID,
          transports: credential.transports || [],
        }))
    : [];
}

function getPasskeyAuthConfig() {
  const { frontendOrigin, rpId, rpName } = getPasskeyConfig();
  return { frontendOrigin, rpId, rpName };
}

export const registerUser = async (req, res) => {
  try {
    console.log('[Auth] Register request body:', req.body);
    let userData;
    let error;
    const rawEmail = String(req.body.email || '').trim();
    const normalizedEmail = rawEmail.toLowerCase();
    const phoneNumber = String(req.body.phoneNumber || '').trim();
    if (req.body.role === 'recruiter') {
      console.log('[Auth] Validating recruiter data...');
      ({ error } = recruiterSchema.validate(req.body));
      if (error) {
        console.log('[Auth] Recruiter validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      const { recruiterName, password, companyName, companyAddress, companyWebsite } = req.body;

      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { phoneNumber },
        ],
      });
      if (existingUser) {
        console.log('[Auth] Email or phone already exists in db:', normalizedEmail, phoneNumber, 'db=', existingUser?.constructor?.db?.name || 'unknown');
        return res.status(400).json({ error: 'Email or phone number already in use' });
      }

      userData = {
        name: recruiterName,
        email: normalizedEmail,
        phoneNumber,
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
      const { name, password, skills, experience, resumeLink } = req.body;

      // Check for existing email or phone
      const existingUser = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { phoneNumber },
        ],
      });
      if (existingUser) {
        console.log('[Auth] Email or phone already exists in db:', normalizedEmail, phoneNumber, 'db=', existingUser?.constructor?.db?.name || 'unknown');
        return res.status(400).json({ error: 'Email or phone number already in use' });
      }

      userData = {
        name,
        email: normalizedEmail,
        phoneNumber,
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

    try {
      const smsResult = await sendVerificationSms({
        phoneNumber: user.phoneNumber,
        code: verificationCode,
      });

      if (smsResult?.skipped) {
        console.log('[Auth] Verification SMS skipped in non-production mode for:', user.phoneNumber);
      } else {
        console.log('[Auth] Verification SMS sent to:', user.phoneNumber);
      }
    } catch (smsError) {
      const smsErrorMessage = smsError?.message || String(smsError);
      console.error('[Auth] Verification SMS failed for:', user.phoneNumber, smsErrorMessage);
      await User.deleteOne({ _id: user._id });
      return res.status(502).json({
        error: 'We could not send the verification code right now. Please try again in a moment.',
        details: smsErrorMessage,
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your phone for the verification code.',
      email: user.email,
      phoneNumber: user.phoneNumber,
      otpSent: true
    });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.', details: err.message });
  }
};

export const beginPasskeyRegistration = async (req, res) => {
  try {
    console.log('[Passkey] Registration request body:', req.body);
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const role = String(req.body.role || '').trim();
    const config = getPasskeyAuthConfig();

    const baseResult = passkeyRegisterBaseSchema.validate({ email: normalizedEmail, role });
    if (baseResult.error) {
      return res.status(400).json({ error: baseResult.error.details[0].message });
    }

    let userData;
    if (role === 'recruiter') {
      const { error } = passkeyRegisterRecruiterSchema.validate({
        ...req.body,
        email: normalizedEmail,
        role,
      });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      userData = {
        name: req.body.recruiterName,
        email: normalizedEmail,
        role: 'recruiter',
        companyName: req.body.companyName,
        companyAddress: req.body.companyAddress,
        companyWebsite: req.body.companyWebsite || '',
        isVerified: false,
        passkeyEnabled: false,
        passkeys: [],
      };
    } else {
      const { error } = passkeyRegisterJobseekerSchema.validate({
        ...req.body,
        email: normalizedEmail,
        role,
      });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      userData = {
        name: req.body.name,
        email: normalizedEmail,
        role: 'jobseeker',
        skills: req.body.skills || [],
        experience: req.body.experience || '',
        resumeLink: req.body.resumeLink || '',
        isVerified: false,
        passkeyEnabled: false,
        passkeys: [],
      };
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (user && (user.isVerified || user.passkeyEnabled || (Array.isArray(user.passkeys) && user.passkeys.length > 0))) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    if (!user) {
      user = new User(userData);
    } else {
      user.name = userData.name;
      user.role = userData.role;
      user.companyName = userData.companyName;
      user.companyAddress = userData.companyAddress;
      user.companyWebsite = userData.companyWebsite;
      user.skills = userData.skills;
      user.experience = userData.experience;
      user.resumeLink = userData.resumeLink;
      user.passkeys = user.passkeys || [];
      user.isVerified = false;
      user.passkeyEnabled = false;
    }
    await user.save();

    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      rpID: config.rpId,
      userName: user.email,
      userID: Buffer.from(String(user._id)),
      userDisplayName: getDisplayNameForUser(user),
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      excludeCredentials: getPasskeyCredentials(user),
    });

    user.passkeyRegistrationChallenge = options.challenge;
    await user.save();

    res.status(201).json({
      message: 'Passkey registration options created',
      userId: String(user._id),
      email: user.email,
      role: user.role,
      options,
    });
  } catch (err) {
    console.error('[Passkey] Registration options error:', err);
    res.status(500).json({ error: 'Failed to start passkey registration', details: err.message });
  }
};

export const verifyPasskeyRegistration = async (req, res) => {
  try {
    const userId = String(req.body.userId || '').trim();
    const response = req.body.response;
    const config = getPasskeyAuthConfig();
    if (!userId || !response) {
      return res.status(400).json({ error: 'Missing passkey registration data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.passkeyRegistrationChallenge) {
      return res.status(400).json({ error: 'Passkey registration has not been started' });
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.passkeyRegistrationChallenge,
      expectedOrigin: config.frontendOrigin,
      expectedRPID: config.rpId,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Unable to verify passkey registration' });
    }

    const credential = verification.registrationInfo.credential;
    const existingCredential = user.passkeys.find((item) => item.credentialID === credential.id);
    if (existingCredential) {
      return res.status(400).json({ error: 'Passkey already registered' });
    }

    user.passkeys.push({
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: response?.response?.transports || [],
      backedUp: verification.registrationInfo.credentialBackedUp || false,
    });
    user.passkeyRegistrationChallenge = undefined;
    user.passkeyEnabled = true;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, getAuthCookieOptions());

    res.json({
      message: 'Passkey registered successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('[Passkey] Registration verify error:', err);
    res.status(500).json({ error: 'Passkey registration failed', details: err.message });
  }
};

export const beginPasskeyLogin = async (req, res) => {
  try {
    const { error } = passkeyLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const credentials = getPasskeyCredentials(user);
    if (credentials.length === 0) {
      return res.status(400).json({ error: 'No passkey registered for this account' });
    }

    const config = getPasskeyAuthConfig();
    const options = await generateAuthenticationOptions({
      rpID: config.rpId,
      allowCredentials: credentials,
      userVerification: 'preferred',
    });

    user.passkeyAuthenticationChallenge = options.challenge;
    await user.save();

    res.json({
      message: 'Passkey login options created',
      email: user.email,
      role: user.role,
      options,
    });
  } catch (err) {
    console.error('[Passkey] Login options error:', err);
    res.status(500).json({ error: 'Failed to start passkey login', details: err.message });
  }
};

export const verifyPasskeyLogin = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const response = req.body.response;
    if (!email || !response) {
      return res.status(400).json({ error: 'Missing passkey login data' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!user.passkeyAuthenticationChallenge) {
      return res.status(400).json({ error: 'Passkey login has not been started' });
    }

    const credential = user.passkeys.find((item) => item.credentialID === response.id);
    if (!credential) {
      return res.status(400).json({ error: 'Unknown passkey' });
    }

    const config = getPasskeyAuthConfig();
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.passkeyAuthenticationChallenge,
      expectedOrigin: config.frontendOrigin,
      expectedRPID: config.rpId,
      credential: {
        id: credential.credentialID,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports || [],
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: 'Passkey verification failed' });
    }

    credential.counter = verification.authenticationInfo.newCounter;
    user.passkeyAuthenticationChallenge = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, getAuthCookieOptions());

    res.json({
      message: 'Passkey login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('[Passkey] Login verify error:', err);
    res.status(500).json({ error: 'Passkey login failed', details: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const phoneNumber = String(req.body.phoneNumber || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const { code } = req.body;
    console.log('[Auth] Verifying phone number:', phoneNumber || email);

    let user = null;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account already verified' });
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
    console.log('[Auth] Phone verified for user:', user._id);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, getAuthCookieOptions());

    res.json({
      message: 'Phone verified successfully',
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

export const resendOtp = async (req, res) => {
  try {
    const phoneNumber = String(req.body.phoneNumber || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    console.log('[Auth] Resending code to phone number:', phoneNumber || email);

    let user = null;
    if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account already verified' });
    }

    // Generate new code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      const smsResult = await sendVerificationSms({
        phoneNumber: user.phoneNumber,
        code: verificationCode,
      });

      if (smsResult?.skipped) {
        console.log('[Auth] Verification SMS resend skipped in non-production mode for:', user.phoneNumber);
      } else {
        console.log('[Auth] Verification SMS resent to:', user.phoneNumber);
      }
    } catch (smsError) {
      const smsErrorMessage = smsError?.message || String(smsError);
      console.error('[Auth] Verification SMS resend failed for:', user.phoneNumber, smsErrorMessage);
      return res.status(502).json({
        error: 'We could not send the verification code right now. Please try again in a moment.',
        details: smsErrorMessage,
      });
    }

    res.json({ message: 'Verification code resent successfully', otpSent: true });

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
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error('Login failed: user not found for email', normalizedEmail);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('Login failed: password mismatch for email', normalizedEmail);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (user.isVerified === false) {
      console.error('Login failed: account not verified for', normalizedEmail);
      return res.status(401).json({
        error: 'Account not verified. Please check your phone for the code.',
        needsVerification: true,
        email: user.email,
        phoneNumber: user.phoneNumber
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

