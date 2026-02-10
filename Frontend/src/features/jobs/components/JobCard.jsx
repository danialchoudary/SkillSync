import React, { useState } from 'react';
import ApplyModal from './ApplyModal';
import { createPortal } from 'react-dom';
import { applyForJob } from '../services/jobApi';
import Toast from '../../../components/Toast';
import { FaBuilding, FaUser, FaMapMarkerAlt, FaMoneyBillWave, FaRegBookmark, FaBookmark, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../../utils/urlHelper';

export default function JobCard({ job, onApply, onEdit, onDelete, saved, onSave, onUnsave, user }) {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(job.applied);
  const isApplied = typeof job.applied !== 'undefined' ? job.applied || applied : applied;
  const isJobSeeker = user?.role === 'jobseeker';
  const isSavedSection = saved && onDelete;

  const handleApplyClick = () => {
    if (isJobSeeker && !isApplied) setShowModal(true);
    else if (onApply && !isApplied) onApply(job);
  };

  const handleModalSubmit = async (coverLetter, resumeFile) => {
    setShowModal(false);
    try {
      await applyForJob(job._id || job.id, coverLetter, resumeFile);
      setToast({ type: 'success', message: 'Application submitted successfully!' });
      setApplied(true);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to apply for job.';
      setToast({ type: 'error', message: errorMsg });
    }
    if (onApply) onApply(job, coverLetter, resumeFile);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group h-full flex flex-col"
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>

      {/* Job Status Badge */}
      {isApplied && (
        <div className="flex justify-end mb-2">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="z-10"
          >
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-white text-xs font-bold rounded-full shadow-lg ${job.status === 'accepted' ? 'bg-green-500 shadow-green-500/30' :
              job.status === 'rejected' ? 'bg-red-500 shadow-red-500/30' :
                job.status === 'pending' ? 'bg-yellow-500 shadow-yellow-500/30' :
                  'bg-gray-500 shadow-gray-500/30' // Default styling for unknown status
              }`}>
              {job.status === 'accepted' && <FaCheckCircle />} {/* Accepted Icon */}
              {job.status === 'rejected' && <FaRegBookmark />} {/* Rejected Icon */}
              {job.status === 'pending' && <FaClock />} {/* Pending Icon */}
              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
            </span>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Company Logo */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              {job.companyLogo ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-md"></div>
                  <img
                    src={getImageUrl(job.companyLogo)}
                    alt="company logo"
                    className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                </div>
              ) : (
                <span className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border-2 border-white shadow-lg">
                  <FaBuilding size={24} />
                </span>
              )}
            </motion.div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <motion.h4
                className="font-bold text-xl text-gray-900 mb-2 truncate"
                whileHover={{ x: 2 }}
              >
                {job.title}
              </motion.h4>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                <motion.div
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <FaBuilding className="text-blue-500" />
                  <span className="font-medium">{job.company}</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <FaMapMarkerAlt className="text-red-500" />
                  <span>{job.location}</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Salary Badge - hide if applied */}
          {!isApplied && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm whitespace-nowrap">
                  <FaMoneyBillWave className="text-green-600" />
                  {job.salary}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Posted Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-xs text-gray-500"
        >
          <FaClock className="text-gray-400" />
          <span>Posted: {job.createdAt ? new Date(job.createdAt).toLocaleString() : (job.postedAt || 'Unknown')}</span>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          {isSavedSection ? (
            <>
              {isJobSeeker && (
                isApplied ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md shadow-green-500/30 cursor-default flex items-center gap-2"
                    disabled
                  >
                    <FaCheckCircle /> Applied
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300"
                    onClick={handleApplyClick}
                  >
                    Apply Now
                  </motion.button>
                )
              )}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-semibold shadow-lg shadow-red-500/30 transition-all duration-300"
                onClick={() => onDelete(job)}
              >
                Delete
              </motion.button>
            </>
          ) : onApply ? (
            <>
              {isJobSeeker && (
                isApplied ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md shadow-green-500/30 cursor-default flex items-center gap-2"
                    disabled
                  >
                    <FaCheckCircle /> Applied
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300"
                    onClick={handleApplyClick}
                  >
                    Apply Now
                  </motion.button>
                )
              )}
              {typeof saved !== 'undefined' && (
                saved ? (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-xl hover:from-amber-200 hover:to-yellow-200 border border-amber-300 font-semibold shadow-md flex items-center gap-2 transition-all duration-300"
                    onClick={() => onUnsave(job)}
                    title="Unsave Job"
                  >
                    <FaBookmark className="text-amber-600" /> Saved
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-amber-50 hover:to-yellow-50 hover:text-amber-800 border border-gray-200 hover:border-amber-300 font-semibold shadow-md flex items-center gap-2 transition-all duration-300 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={async () => {
                      setSaving(true);
                      await onSave(job);
                      setSaving(false);
                    }}
                    title="Save Job"
                    disabled={saving}
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    ) : <FaRegBookmark />}
                    {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                )
              )}
            </>
          ) : ((onEdit || onDelete) ? (
            <>
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300"
                  onClick={() => onEdit(job)}
                >
                  Edit
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-semibold shadow-lg shadow-red-500/30 transition-all duration-300"
                  onClick={() => onDelete(job)}
                >
                  Delete
                </motion.button>
              )}
            </>
          ) : null)}
        </motion.div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/3 group-hover:to-indigo-500/3 transition-all duration-300 rounded-2xl pointer-events-none"></div>

      {isJobSeeker && showModal &&
        createPortal(
          <ApplyModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleModalSubmit}
            resumeUrl={user?.resumeLink}
          />,
          document.body
        )
      }
      {toast && <Toast type={toast.type} message={toast.message} />}
    </motion.div>
  );
}