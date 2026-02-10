import React, { useState } from 'react';
import ApplyModal from '../features/jobs/components/ApplyModal';
import { applyForJob } from '../services/jobApi';
import Toast from './Toast';
import { FaBuilding, FaUser, FaMapMarkerAlt, FaMoneyBillWave, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/urlHelper';

function StatusBadge({ status }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accepted: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-semibold border ${statusColors[status] || statusColors.pending}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
    </span>
  );
}

export default function JobCard({ job, onApply, onEdit, onDelete, saved, onSave, onUnsave, user }) {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const isJobSeeker = user?.role === 'jobseeker';
  const isSavedSection = saved && onDelete;

  const handleApplyClick = () => {
    if (isJobSeeker) setShowModal(true);
    else if (onApply) onApply(job);
  };

  const handleModalSubmit = async (coverLetter, resumeFile) => {
    setShowModal(false);
    try {
      await applyForJob(job._id || job.id, coverLetter, resumeFile);
      setToast({ type: 'success', message: 'Application submitted successfully!' });
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to apply for job.';
      setToast({ type: 'error', message: errorMsg });
    }
    if (onApply) onApply(job, coverLetter, resumeFile);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded shadow p-4 mb-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          {job.companyLogo ? (
            <img
              src={getImageUrl(job.companyLogo)}
              alt="company logo"
              className="w-10 h-10 rounded-full object-cover border"
              style={{ minWidth: 40, minHeight: 40 }}
            />
          ) : (
            <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border" style={{ minWidth: 40, minHeight: 40 }}>
              <FaBuilding size={20} />
            </span>
          )}
          <div>
            <h4 className="font-bold text-lg">{job.title}</h4>
            <div className="text-gray-600 text-sm flex gap-2 items-center">
              <FaBuilding /> {job.company}
              <FaMapMarkerAlt className="ml-3" /> {job.location}
            </div>
          </div>
        </div>
        <div className="text-blue-600 font-semibold text-md flex items-center gap-1">
          <FaMoneyBillWave /> {job.salary}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Posted: {job.createdAt ? new Date(job.createdAt).toLocaleString() : (job.postedAt || 'Unknown')}
      </div>
      {isSavedSection ? (
        <div className="flex gap-2 mt-2">
          {isJobSeeker && (
            job.applied ? (
              <div className="flex items-center gap-2">
                <StatusBadge status={job.status} />
              </div>
            ) : (
              <button
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm"
                onClick={handleApplyClick}
              >
                Apply Now
              </button>
            )
          )}
          <button
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 border border-red-200 font-semibold"
            onClick={() => onDelete(job)}
          >
            Delete
          </button>
        </div>
      ) : onApply ? (
        <div className="flex gap-2 mt-2">
          {job.applied ? (
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
            </div>
          ) : (
            <button
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm"
              onClick={handleApplyClick}
            >
              Apply Now
            </button>
          )}
          {typeof saved !== 'undefined' && (
            saved ? (
              <button
                className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 font-semibold flex items-center gap-1"
                onClick={() => onUnsave(job)}
                title="Unsave Job"
              >
                <FaBookmark /> Unsave
              </button>
            ) : (
              <button
                className={`px-4 py-1 bg-gray-100 text-gray-700 rounded hover:bg-yellow-100 border border-gray-200 font-semibold flex items-center gap-1 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={async () => {
                  setSaving(true);
                  await onSave(job);
                  setSaving(false);
                }}
                title="Save Job"
                disabled={saving}
              >
                {saving ? (
                  <span className="animate-spin mr-2 w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full inline-block"></span>
                ) : <FaRegBookmark />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )
          )}
        </div>
      ) : ((onEdit || onDelete) && (
        <div className="flex gap-2 mt-2">
          {onEdit && (
            <button
              className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
              onClick={() => onEdit(job)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 border border-red-200 font-semibold"
              onClick={() => onDelete(job)}
            >
              Delete
            </button>
          )}
        </div>
      ))}
      {isJobSeeker && showModal && (
        <ApplyModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          resumeUrl={user?.resumeLink}
        />
      )}
      {toast && <Toast type={toast.type} message={toast.message} />}
    </motion.div>
  );
}