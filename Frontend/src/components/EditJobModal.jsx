import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Code,
    Calendar,
    FileText,
    Save,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const FormField = ({ label, icon: Icon, children, error }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            {Icon && <Icon className="w-4 h-4 text-blue-500" />}
            {label}
        </label>
        {children}
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 flex items-center gap-1 mt-1"
                >
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

export default function EditJobModal({ job, open, onClose, onUpdate, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        location: '',
        salary: '',
        skills: '',
        experience: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (job && open) {
            setFormData({
                title: job.title || '',
                company: job.company || '',
                description: job.description || '',
                location: job.location || '',
                salary: job.salary || '',
                skills: job.skills || '',
                experience: job.experience || ''
            });
            setErrors({});
        }
    }, [job, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.salary.trim()) newErrors.salary = 'Salary range is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onUpdate(formData);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit Job Posting</h2>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Modify the details of your listing</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white rounded-full transition-colors group"
                            >
                                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            <form id="edit-job-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Job Title" icon={Briefcase} error={errors.title}>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Senior Frontend Engineer"
                                            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none ${errors.title ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                                }`}
                                        />
                                    </FormField>
                                    <FormField label="Company" icon={Building2} error={errors.company}>
                                        <input
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="Your Company Name"
                                            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none ${errors.company ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                                }`}
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Job Description" icon={FileText} error={errors.description}>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe the role, responsibilities, and requirements..."
                                        className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none resize-none ${errors.description ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                            }`}
                                    />
                                </FormField>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Location" icon={MapPin} error={errors.location}>
                                        <input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. New York, NY (Remote)"
                                            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none ${errors.location ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                                }`}
                                        />
                                    </FormField>
                                    <FormField label="Salary Range" icon={DollarSign} error={errors.salary}>
                                        <input
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            placeholder="e.g. $120k - $150k"
                                            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none ${errors.salary ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
                                                }`}
                                        />
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Required Skills" icon={Code}>
                                        <input
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            placeholder="e.g. React, Node.js, AWS"
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                        />
                                    </FormField>
                                    <FormField label="Experience (Years)" icon={Calendar}>
                                        <input
                                            name="experience"
                                            type="number"
                                            min="0"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            placeholder="e.g. 5"
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                        />
                                    </FormField>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                form="edit-job-form"
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #cbd5e1;
            }
          `}</style>
                </div>
            )}
        </AnimatePresence>
    );
}
