import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { updateMe, uploadResume } from '../services/api';
import api from '../services/api';

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

  // Reset form when modal opens or user changes
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

  const handleSkillAdd = () => {
    const skill = form.skillInput.trim();
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
    setPrevForm(form); // Save previous form for revert
    setSaving(true);
    setForm(payload); // Optimistically update UI
    try {
      await updateMe(payload);
      setToast({ message: 'Profile updated!', type: 'success' });
      onSaved();
      setTimeout(() => setToast({ message: '', type: 'success' }), 2500);
      onClose();
    } catch (err) {
      setForm(prevForm); // Revert on error
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
      await api.post('/me/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSaved();
    } catch (err) {
      setProfilePicError(err.response?.data?.error || 'Profile picture upload failed');
    } finally {
      setProfilePicUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: toast.type })} />
      <form className="bg-white p-6 rounded shadow w-full max-w-md max-h-screen overflow-y-auto" onSubmit={handleSubmit}>
        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
        <div className="mb-3">
          <label className="block mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
          {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="block mb-1">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              value={form.skillInput}
              onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
              className="border px-2 py-1 rounded flex-1"
              placeholder="Add skill"
              maxLength={30}
            />
            <button type="button" onClick={handleSkillAdd} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                {skill}
                <button type="button" onClick={() => handleSkillRemove(i)} className="ml-2 text-xs text-red-500">×</button>
              </span>
            ))}
          </div>
          {errors.skills && <div className="text-red-500 text-sm">{errors.skills}</div>}
        </div>
        <div className="mb-3">
          <label className="block mb-1">Experience Years</label>
          <input
            name="years"
            type="number"
            min={0}
            max={50}
            value={form.experience.years}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          />
          {errors.years && <div className="text-red-500 text-sm">{errors.years}</div>}
        </div>
        <div className="mb-3">
          <label className="block mb-1">Experience Summary</label>
          <textarea
            name="summary"
            value={form.experience.summary}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            maxLength={500}
          />
          {errors.summary && <div className="text-red-500 text-sm">{errors.summary}</div>}
        </div>
        <div className="mb-3">
          <label className="block mb-1">Resume</label>
          {user.resumeUrl ? (
            <div className="flex items-center gap-2">
              <a href={`http://localhost:5000${user.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
            </div>
          ) : (
            <span className="text-gray-400">No resume uploaded.</span>
          )}
          <input
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            id="resume-upload-input"
            onChange={handleResumeUpload}
          />
          <button
            type="button"
            onClick={() => document.getElementById('resume-upload-input').click()}
            disabled={resumeUploading}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs mt-2"
          >
            {resumeUploading ? 'Uploading...' : 'Upload Resume'}
          </button>
          {resumeError && <div className="text-red-500 text-xs mt-1">{resumeError}</div>}
        </div>
        <div className="mb-3">
          <label className="block mb-1">Profile Picture</label>
          <div className="flex items-center gap-2">
            <img src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : '/default-avatar.png'} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              style={{ display: 'none' }}
              id="profile-pic-upload-input"
              onChange={handleProfilePicUpload}
            />
            <button
              type="button"
              onClick={() => document.getElementById('profile-pic-upload-input').click()}
              disabled={profilePicUploading}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              {profilePicUploading ? 'Uploading...' : 'Upload Picture'}
            </button>
          </div>
          {profilePicError && <div className="text-red-500 text-xs mt-1">{profilePicError}</div>}
        </div>
        {errors.api && <div className="text-red-500 text-sm mb-2">{errors.api}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
