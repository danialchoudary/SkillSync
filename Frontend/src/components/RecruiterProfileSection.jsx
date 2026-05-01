import React, { useEffect, useState } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaPen, FaCamera, FaEnvelope, FaIndustry } from 'react-icons/fa';
import { getMe, updateMe, updateCompanyLogo } from '../services/api';
import { getImageUrl } from '../utils/urlHelper';
import ChangePasswordSection from './ChangePasswordSection';

const INDUSTRIES = [
	'IT', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Construction', 'Hospitality', 'Other'
];

export default function RecruiterProfileSection({ setToast = () => { }, setToastType = () => { } }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [editOpen, setEditOpen] = useState(false);
	const [editForm, setEditForm] = useState(null);
	const [saving, setSaving] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const [logoError, setLogoError] = useState('');

	const fetchUser = () => {
		setLoading(true);
		getMe()
			.then(res => {
				setUser(res.data);
				setError('');
			})
			.catch(err => {
				setError(err.response?.data?.error || 'Failed to load user');
				setUser(null);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchUser();
	}, []);

	const handleEditOpen = () => {
		setEditForm({
			companyName: user.companyName || '',
			companyLogo: user.companyLogo || '',
			companyWebsite: user.companyWebsite || '',
			industry: user.industry || '',
			location: user.location || '',
			description: user.description || '',
			companyAddress: user.companyAddress || '',
		});
		setEditOpen(true);
	};

	const handleEditChange = e => {
		const { name, value } = e.target;
		setEditForm(f => ({ ...f, [name]: value }));
	};

	const handleLogoUpload = async e => {
		const file = e.target.files[0];
		if (!file) return;
		setLogoUploading(true);
		setLogoError('');
		try {
			const res = await updateCompanyLogo(file);
			setUser(u => ({ ...u, companyLogo: res.data.companyLogoUrl }));
			setEditForm(f => ({ ...f, companyLogo: res.data.companyLogoUrl }));
			fetchUser();
			setToast('Company logo updated successfully');
			setToastType('success');
		} catch (err) {
			setLogoError('Logo upload failed');
			setToast('Failed to upload logo');
			setToastType('error');
		} finally {
			setLogoUploading(false);
		}
	};

	const handleEditSave = async e => {
		e.preventDefault();
		setSaving(true);
		try {
			await updateMe(editForm);
			setEditOpen(false);
			fetchUser();
			setToast('Profile updated successfully');
			setToastType('success');
		} catch (err) {
			setError('Failed to update profile');
			setToast('Failed to update profile');
			setToastType('error');
		} finally {
			setSaving(false);
		}
	};

	const handlePasswordUpdated = () => {
		setToast('Password updated successfully');
		setToastType('success');
	};

	if (loading) return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-accent)] border-t-transparent"></div>
		</div>
	);

	if (error) return (
		<div className="p-8 text-center bg-[var(--color-danger-bg)] rounded-xl border border-[var(--color-danger)]/10 max-w-2xl mx-auto mt-8">
			<div className="text-[var(--color-danger)] font-bold mb-1">Error Loading Profile</div>
			<div className="text-[var(--color-text-secondary)] text-sm">{error}</div>
		</div>
	);

	if (!user) return null;

	return (
		<div className="h-full overflow-y-auto bg-[var(--color-bg)] p-6 md:p-8 scrollbar-thin">
			<div className="max-w-4xl mx-auto">
				<div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden border border-[var(--color-border)]">
					{/* Banner Area */}
					<div className="h-40 bg-[var(--color-surface-secondary)] relative border-b border-[var(--color-border)]">
						<div className="absolute top-6 right-6">
							<button
								onClick={handleEditOpen}
								className="flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-primary)] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-surface-secondary)] transition-all border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
							>
								<FaPen size={12} />
								Edit Profile
							</button>
						</div>
					</div>

					{/* Profile Header Content */}
					<div className="px-8 pb-8 relative">
						<div className="flex flex-col md:flex-row gap-6 -mt-12 items-start">
							{/* Company Logo */}
							<div className="relative group">
								<div className="w-28 h-28 rounded-2xl bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-lg)] border border-[var(--color-border)]">
									<div className="w-full h-full rounded-xl overflow-hidden bg-[var(--color-surface-secondary)] flex items-center justify-center">
										{user.companyLogo ? (
											<img src={getImageUrl(user.companyLogo)} alt="logo" className="w-full h-full object-cover" />
										) : (
											<FaBuilding className="text-[var(--color-text-tertiary)] text-3xl" />
										)}
									</div>
								</div>
							</div>

							{/* Company Info */}
							<div className="flex-1 pt-2 md:pt-14">
								<h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
									{user.companyName || 'Company Name Not Set'}
								</h1>

								<div className="flex flex-wrap gap-2.5 mb-4">
									{user.industry && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-[11px] font-bold border border-blue-100">
											<FaIndustry size={10} />
											{user.industry}
										</span>
									)}
									{user.location && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-[11px] font-bold border border-[var(--color-border)]">
											<FaMapMarkerAlt size={10} />
											{user.location}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Content Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
							{/* About Section */}
							<div className="md:col-span-2 space-y-8">
								<section>
									<h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 uppercase tracking-tight">
										<span className="w-1 h-5 bg-[var(--color-accent)] rounded-full"></span>
										About the Company
									</h3>
									<div className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] p-5 rounded-xl border border-[var(--color-border)] leading-relaxed">
										{user.description ? (
											<p className="whitespace-pre-line">{user.description}</p>
										) : (
											<p className="text-[var(--color-text-tertiary)] italic text-center py-4 text-xs font-medium">Add a description to tell candidates about your mission and culture.</p>
										)}
									</div>
								</section>
							</div>

							{/* Sidebar Column */}
							<div className="space-y-6">
								<div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-6">
									<h3 className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Contact Details</h3>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)] mt-0.5">
											<FaGlobe size={14} />
										</div>
										<div className="min-w-0">
											<div className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase mb-0.5">Website</div>
											{user.companyWebsite ? (
												<a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline font-semibold text-xs truncate block">
													{user.companyWebsite.replace(/^https?:\/\//, '')}
												</a>
											) : (
												<span className="text-[var(--color-text-tertiary)] text-xs">Not provided</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success)] mt-0.5">
											<FaEnvelope size={14} />
										</div>
										<div className="min-w-0">
											<div className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase mb-0.5">Email</div>
											<div className="text-[var(--color-text-primary)] font-semibold text-xs truncate block">{user.email}</div>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 mt-0.5">
											<FaMapMarkerAlt size={14} />
										</div>
										<div className="min-w-0">
											<div className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase mb-0.5">Office Address</div>
											{user.companyAddress ? (
												<div className="text-[var(--color-text-primary)] font-semibold text-xs leading-tight">{user.companyAddress}</div>
											) : (
												<span className="text-[var(--color-text-tertiary)] text-xs">Not provided</span>
											)}
										</div>
									</div>
								</div>

								{/* Account Status */}
								<div className="bg-[var(--color-accent)] rounded-xl p-5 text-white text-center shadow-[var(--shadow-sm)]">
									<h3 className="font-bold text-sm mb-1">Recruiter Account</h3>
									<p className="text-white/80 text-xs mb-3 font-medium">Profile visible to job seekers</p>
									<div className="inline-block bg-white/10 backdrop-blur-md rounded-lg px-2.5 py-1 text-[9px] font-mono">
										ID: {user._id || user.id}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			{editOpen && (
				<div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
					<div className="fixed inset-0" onClick={() => setEditOpen(false)} />
					<div className="relative bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
						<div className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
							<h3 className="text-lg font-bold text-[var(--color-text-primary)]">Edit Company Profile</h3>
							<button
								onClick={() => setEditOpen(false)}
								className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] flex items-center justify-center transition-colors"
							>
								✕
							</button>
						</div>

						<div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
							<form id="edit-form" onSubmit={handleEditSave} className="space-y-6">
								{/* Logo Upload */}
								<div className="flex items-center gap-6">
									<div className="relative" onClick={() => document.getElementById('logo-upload').click()}>
										<div className="w-20 h-20 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center overflow-hidden border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-accent)] transition-colors">
											{editForm.companyLogo ? (
												<img src={getImageUrl(editForm.companyLogo)} alt="preview" className="w-full h-full object-cover" />
											) : (
												<FaBuilding className="text-[var(--color-text-tertiary)] text-2xl opacity-40" />
											)}
										</div>
										<div className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center shadow-md border-2 border-[var(--color-surface)]">
											{logoUploading ? <div className="animate-spin w-3 h-3 border-2 border-white rounded-full border-t-transparent" /> : <FaCamera size={10} />}
										</div>
										<input
											id="logo-upload"
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleLogoUpload}
											disabled={logoUploading}
										/>
									</div>
									<div className="flex-1">
										<h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-0.5">Company Logo</h4>
										<p className="text-[11px] text-[var(--color-text-tertiary)] font-medium">Square images (400x400) look best</p>
										{logoError && <p className="text-[11px] text-[var(--color-danger)] mt-1 font-bold">{logoError}</p>}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div className="space-y-1.5">
										<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Company Name</label>
										<input
											name="companyName"
											value={editForm.companyName}
											onChange={handleEditChange}
											className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)]"
											required
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Industry</label>
										<select
											name="industry"
											value={editForm.industry}
											onChange={handleEditChange}
											className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)]"
										>
											<option value="">Select Industry</option>
											{INDUSTRIES.map(ind => (
												<option key={ind} value={ind}>{ind}</option>
											))}
										</select>
									</div>

									<div className="space-y-1.5">
										<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Location</label>
										<input
											name="location"
											value={editForm.location}
											onChange={handleEditChange}
											placeholder="e.g. San Francisco, CA"
											className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)]"
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Website</label>
										<input
											name="companyWebsite"
											value={editForm.companyWebsite}
											onChange={handleEditChange}
											placeholder="https://..."
											className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)]"
										/>
									</div>
								</div>

								<div className="space-y-1.5">
									<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Office Address</label>
									<input
										name="companyAddress"
										value={editForm.companyAddress}
										onChange={handleEditChange}
										placeholder="Full street address..."
										className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)]"
									/>
								</div>

								<div className="space-y-1.5">
									<label className="text-[13px] font-semibold text-[var(--color-text-secondary)]">Description</label>
									<textarea
										name="description"
										value={editForm.description}
										onChange={handleEditChange}
										rows={4}
										placeholder="Tell us about your company culture and mission..."
										className="w-full px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 outline-none transition-all bg-[var(--color-surface)] resize-none"
									/>
								</div>

							</form>

							<div className="mt-6">
								<ChangePasswordSection onSuccess={handlePasswordUpdated} />
							</div>
						</div>

						<div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex justify-end gap-3">
							<button
								onClick={() => setEditOpen(false)}
								className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="edit-form"
								disabled={saving}
								className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm disabled:opacity-50"
							>
								{saving ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
