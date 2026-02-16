import React, { useState, useEffect } from 'react';
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
    AlertCircle
} from 'lucide-react';

const FormField = ({ label, icon: Icon, children, error }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
            {Icon && <Icon className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
            {label}
        </label>
        {children}
        {error && (
            <p className="text-[11px] text-[var(--color-danger)] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {error}
            </p>
        )}
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
    const [submitState, setSubmitState] = useState('');

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
            setSubmitState('');
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
        if (Object.keys(newErrors).length > 0) {
            setSubmitState('error');
            setTimeout(() => setSubmitState(''), 350);
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setSubmitState('success');
            onUpdate(formData);
        }
    };

    if (!open) return null;

    const inputClasses = (error) => `
        w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
        ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]' : 'border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15'}
    `;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-[var(--color-accent)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Edit Job Posting</h2>
                            <p className="text-xs text-[var(--color-text-tertiary)]">Modify the details of your listing</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[var(--color-surface-secondary)] rounded-full transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                    <form
                        id="edit-job-form"
                        onSubmit={handleSubmit}
                        className={`space-y-5 ${submitState === 'success' ? 'ui-success-flash' : submitState === 'error' ? 'ui-error-shake' : ''}`}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Job Title" icon={Briefcase} error={errors.title}>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className={inputClasses(errors.title)}
                                />
                            </FormField>
                            <FormField label="Company" icon={Building2} error={errors.company}>
                                <input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Your Company Name"
                                    className={inputClasses(errors.company)}
                                />
                            </FormField>
                        </div>

                        <FormField label="Job Description" icon={FileText} error={errors.description}>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                className={`${inputClasses(errors.description)} resize-none`}
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Location" icon={MapPin} error={errors.location}>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. New York, NY (Remote)"
                                    className={inputClasses(errors.location)}
                                />
                            </FormField>
                            <FormField label="Salary Range" icon={DollarSign} error={errors.salary}>
                                <input
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. $120k - $150k"
                                    className={inputClasses(errors.salary)}
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Required Skills" icon={Code}>
                                <input
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Node.js, AWS"
                                    className={inputClasses()}
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
                                    className={inputClasses()}
                                />
                            </FormField>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="edit-job-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-sm)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
