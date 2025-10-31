import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';
import { updateMe, uploadResume } from '../services/api';
import api from '../services/api';
import ProfilePictureSection from './EditProfileModal/ProfilePictureSection';
import SkillsSection from './EditProfileModal/SkillsSection';
import ExperienceSection from './EditProfileModal/ExperienceSection';
import ResumeSection from './EditProfileModal/ResumeSection';

const validate = ({ name, skills, experience }) => {
  const errors = {};
  if (!name || name.trim().length < 2 || name.trim().length > 60) {
    errors.name = 'Name must be 2-60 characters.';
  }
  if (!Array.isArray(skills) || skills.some(s => s.length < 1 || s.length > 30) || skills.length > 25) {
    errors.skills = 'Skills: 1-30 chars each, max 25.';
  }
  if (!experience || isNaN(experience.years) || experience.years < 0 || experience.years > 50) {
    errors.years = 'Years: 0-50.';
  }
  if (experience.summary && experience.summary.length > 500) {
    errors.summary = 'Summary max 500 chars.';
  }
  return errors;
};

export default function EditProfileModal({ open, onClose, user, onSaved }) {
  if (!open || !user) return null;

  const [form, setForm] = useState({
    name: user.name,
    skills: user.skills,
    skillInput: '',
    experience: {
      years: user.experience?.years || 0,
      summary: user.experience?.summary || '',
    },
  });

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name,
        skills: user.skills,
        skillInput: '',
        experience: {
          years: user.experience?.years || 0,
          summary: user.experience?.summary || '',
        },
      });
    }
  }, [open, user]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [prevForm, setPrevForm] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');

  // Modularized handlers for child components
  const handleSkillAdd = (skill) => {
    if (skill && !form.skills.includes(skill) && form.skills.length < 25 && skill.length <= 30) {
      setForm(f => ({ ...f, skills: [...f.skills, skill], skillInput: '' }));
    }
  };

  const handleSkillRemove = idx => {
    setForm(f => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') setForm(f => ({ ...f, name: value }));
    if (name === 'years') setForm(f => ({ ...f, experience: { ...f.experience, years: Number(value) } }));
    if (name === 'summary') setForm(f => ({ ...f, experience: { ...f.experience, summary: value } }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      skills: Array.from(new Set(form.skills.map(s => s.trim().toLowerCase()))),
      experience: {
        years: Number(form.experience.years),
        summary: form.experience.summary.trim(),
      },
    };
    const errs = validate(payload);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPrevForm(form);
    setSaving(true);
    setForm(payload);
    try {
      await updateMe(payload);
      setToast({ message: 'Profile updated!', type: 'success' });
      onSaved();
      setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
      onClose();
    } catch (err) {
      setForm(prevForm);
      setToast({ message: err.response?.data?.error || 'Update failed.', type: 'error' });
      setTimeout(() => setToast({ message: '', type: 'error' }), 2500);
      setErrors({ api: err.response?.data?.error || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError('');
    try {
      await uploadResume(file);
      onSaved();
    } catch (err) {
      setResumeError(err.response?.data?.error || 'Resume upload failed');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicUploading(true);
    setProfilePicError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/me/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Update user object locally so modal shows new image immediately
      if (res.data && res.data.profilePicture) {
        user.profilePicture = res.data.profilePicture;
      }
      onSaved();
    } catch (err) {
      setProfilePicError(err.response?.data?.error || 'Profile picture upload failed');
    } finally {
      setProfilePicUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50  overflow-y-auto">
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-md"
            onClick={onClose}
          />

          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: toast.type })} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl"
          >
            <form 
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              onSubmit={handleSubmit}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="px-8 py-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <ProfilePictureSection
                    user={user}
                    profilePicUploading={profilePicUploading}
                    profilePicError={profilePicError}
                    handleProfilePicUpload={handleProfilePicUpload}
                  />

                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Skills Section */}
                  <SkillsSection
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    handleSkillAdd={handleSkillAdd}
                    handleSkillRemove={handleSkillRemove}
                  />

                  {/* Experience Section */}
                  <ExperienceSection
                    form={form}
                    handleChange={handleChange}
                    errors={errors}
                  />

                  {/* Resume Section */}
                  <ResumeSection
                    user={user}
                    resumeUploading={resumeUploading}
                    resumeError={resumeError}
                    handleResumeUpload={handleResumeUpload}
                  />

                  {/* API Error */}
                  {errors.api && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-red-700 text-sm font-medium">{errors.api}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}