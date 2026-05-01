import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { updateMe, uploadProfilePicture, uploadResume } from '../services/api';
import ProfilePictureSection from './EditProfileModal/ProfilePictureSection';
import SkillsSection from './EditProfileModal/SkillsSection';
import ExperienceSection from './EditProfileModal/ExperienceSection';
import ResumeSection from './EditProfileModal/ResumeSection';
import ChangePasswordSection from './ChangePasswordSection';
import { X, Check, AlertCircle } from 'lucide-react';

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
    errors.summary = 'Summary max 500 characters.';
  }
  return errors;
};

export default function EditProfileModal({ open, onClose, user, onSaved }) {
  if (!open || !user) return null;

  const [form, setForm] = useState({
    name: user.name || '',
    skills: user.skills || [],
    skillInput: '',
    experience: {
      years: user.experience?.years || 0,
      summary: user.experience?.summary || '',
    },
  });

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || '',
        skills: user.skills || [],
        skillInput: '',
        experience: {
          years: user.experience?.years || 0,
          summary: user.experience?.summary || '',
        },
      });
      setErrors({});
    }
  }, [open, user]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [profilePicError, setProfilePicError] = useState('');

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

    setSaving(true);
    try {
      await updateMe(payload);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      onSaved();
      setTimeout(() => {
        setToast({ message: '', type: 'success' });
        onClose();
      }, 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Update failed.', type: 'error' });
      setTimeout(() => setToast({ message: '', type: 'error' }), 3000);
      setErrors({ api: err.response?.data?.error || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const [localResumeUrl, setLocalResumeUrl] = useState(user?.resumeUrl || user?.resumeLink || '');

  useEffect(() => {
    if (user) {
      setLocalResumeUrl(user.resumeUrl || user.resumeLink || '');
    }
  }, [user]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeError('');
    try {
      const res = await uploadResume(file);
      if (res.data?.resumeUrl) {
        setLocalResumeUrl(res.data.resumeUrl);
        user.resumeUrl = res.data.resumeUrl;
      }
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
      const res = await uploadProfilePicture(file);
      if (res.data) {
        const url = res.data.profilePictureUrl || res.data.profilePicture;
        if (url) user.profilePicture = url;
      }
      onSaved();
    } catch (err) {
      setProfilePicError(err.response?.data?.error || 'Profile picture upload failed');
    } finally {
      setProfilePicUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: toast.type })} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-secondary)] flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Edit Profile</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Personal Information</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-surface-secondary)] rounded-full transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto scrollbar-thin">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">

            <ProfilePictureSection
              user={user}
              profilePicUploading={profilePicUploading}
              profilePicError={profilePicError}
              handleProfilePicUpload={handleProfilePicUpload}
            />

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[var(--color-text-secondary)]">
                Full Name <span className="text-[var(--color-danger)] font-normal">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] px-4 py-2.5 rounded-lg focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-[var(--color-danger)] text-xs mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            <SkillsSection
              form={form}
              setForm={setForm}
              errors={errors}
              handleSkillAdd={handleSkillAdd}
              handleSkillRemove={handleSkillRemove}
            />

            <ExperienceSection
              form={form}
              handleChange={handleChange}
              errors={errors}
            />

            <ResumeSection
              user={{ ...user, resumeUrl: localResumeUrl }}
              resumeUploading={resumeUploading}
              resumeError={resumeError}
              handleResumeUpload={handleResumeUpload}
            />

            {/* API Error */}
            {errors.api && (
              <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
                <p className="text-[var(--color-danger)] text-sm font-medium">{errors.api}</p>
              </div>
            )}
          </form>

          <div className="mt-6">
            <ChangePasswordSection />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            form="edit-profile-form"
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
