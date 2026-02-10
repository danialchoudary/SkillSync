import React, { useEffect, useState } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaPen, FaCamera, FaEnvelope, FaIndustry } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getMe, updateMe, updateCompanyLogo } from '../services/api';
import { getImageUrl } from '../utils/urlHelper';

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
			companyAddress: user.companyAddress || '', // Added address
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
			const data = res.data;
			setUser(u => ({ ...u, companyLogo: data.companyLogoUrl }));
			setEditForm(f => ({ ...f, companyLogo: data.companyLogoUrl }));
			fetchUser(); // Refresh to ensure sync
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

	if (loading) return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
		</div>
	);

	if (error) return (
		<div className="p-8 text-center bg-red-50 rounded-xl border border-red-100 max-w-2xl mx-auto mt-8">
			<div className="text-red-500 font-semibold mb-2">Error Loading Profile</div>
			<div className="text-gray-600">{error}</div>
		</div>
	);

	if (!user) return null;

	return (
		<div className="h-full overflow-y-auto bg-gray-50 p-6 md:p-8">
			<div className="max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
				>
					{/* Banner Area */}
					<div className="h-48 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
						<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
						<div className="absolute top-6 right-6">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleEditOpen}
								className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/20 transition-all border border-white/20"
							>
								<FaPen size={12} />
								Edit Profile
							</motion.button>
						</div>
					</div>

					{/* Profile Header Content */}
					<div className="px-8 pb-8 relative">
						<div className="flex flex-col md:flex-row gap-6 -mt-16 items-start">
							{/* Company Logo */}
							<div className="relative group">
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="w-32 h-32 rounded-2xl bg-white p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300"
								>
									<div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
										{user.companyLogo ? (
											<img src={getImageUrl(user.companyLogo)} alt="logo" className="w-full h-full object-cover" />
										) : (
											<FaBuilding className="text-gray-300 text-4xl" />
										)}
									</div>
								</motion.div>
							</div>

							{/* Company Info */}
							<div className="flex-1 pt-2 md:pt-16">
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.3 }}
								>
									<h1 className="text-3xl font-bold text-gray-900 mb-2">
										{user.companyName || 'Company Name Not Set'}
									</h1>

									<div className="flex flex-wrap gap-3 mb-4">
										{user.industry && (
											<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
												<FaIndustry />
												{user.industry}
											</span>
										)}
										{user.location && (
											<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
												<FaMapMarkerAlt />
												{user.location}
											</span>
										)}
									</div>
								</motion.div>
							</div>
						</div>

						{/* Content Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
							{/* Main Column (About) */}
							<div className="md:col-span-2 space-y-8">
								<section>
									<h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
										<span className="w-1 h-6 bg-blue-600 rounded-full"></span>
										About the Company
									</h3>
									<div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
										{user.description ? (
											<p className="whitespace-pre-line leading-relaxed">{user.description}</p>
										) : (
											<p className="text-gray-400 italic text-center py-4">Add a description to tell candidates about your mission and culture.</p>
										)}
									</div>
								</section>
							</div>

							{/* Sidebar Column (Contact) */}
							<div className="space-y-6">
								<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
									<h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mt-1">
											<FaGlobe />
										</div>
										<div>
											<div className="text-xs text-gray-500 font-semibold uppercase">Website</div>
											{user.companyWebsite ? (
												<a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
													{user.companyWebsite.replace(/^https?:\/\//, '')}
												</a>
											) : (
												<span className="text-gray-400 text-sm">Not provided</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mt-1">
											<FaEnvelope />
										</div>
										<div>
											<div className="text-xs text-gray-500 font-semibold uppercase">Email</div>
											<div className="text-gray-900 font-medium break-all">{user.email}</div>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mt-1">
											<FaMapMarkerAlt />
										</div>
										<div>
											<div className="text-xs text-gray-500 font-semibold uppercase">Office Address</div>
											{user.companyAddress ? (
												<div className="text-gray-900 font-medium">{user.companyAddress}</div>
											) : (
												<span className="text-gray-400 text-sm">Not provided</span>
											)}
										</div>
									</div>
								</div>

								{/* Status Card */}
								<div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-500/20">
									<h3 className="font-bold text-lg mb-1">Recruiter Account</h3>
									<p className="text-indigo-100 text-sm mb-4">Your profile is visible to job seekers applying to your positions.</p>
									<div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs font-mono">
										ID: {user._id || user.id}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Edit Modal */}
			<AnimatePresence>
				{editOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20 }}
							className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
						>
							<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
								<h3 className="text-xl font-bold text-gray-800">Edit Company Profile</h3>
								<button
									onClick={() => setEditOpen(false)}
									className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
								>
									✕
								</button>
							</div>

							<div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
								<form id="edit-form" onSubmit={handleEditSave} className="space-y-6">
									{/* Logo Upload */}
									<div className="flex items-center gap-6">
										<div className="relative">
											<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
												{editForm.companyLogo ? (
													<img src={getImageUrl(editForm.companyLogo)} alt="preview" className="w-full h-full object-cover" />
												) : (
													<FaBuilding className="text-gray-400 text-2xl" />
												)}
											</div>
											<label
												htmlFor="logo-upload"
												className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 shadow-lg transition-colors border-2 border-white"
											>
												{logoUploading ? <div className="animate-spin w-3 h-3 border-2 border-white rounded-full border-t-transparent" /> : <FaCamera size={12} />}
											</label>
											<input
												id="logo-upload"
												type="file"
												accept="image/*"
												className="hidden"
												onChange={handleLogoUpload}
												disabled={logoUploading}
											/>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">Company Logo</h4>
											<p className="text-sm text-gray-500">Recommended size: 400x400px</p>
											{logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">Company Name</label>
											<input
												name="companyName"
												value={editForm.companyName}
												onChange={handleEditChange}
												className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
												required
											/>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">Industry</label>
											<select
												name="industry"
												value={editForm.industry}
												onChange={handleEditChange}
												className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
											>
												<option value="">Select Industry</option>
												{INDUSTRIES.map(ind => (
													<option key={ind} value={ind}>{ind}</option>
												))}
											</select>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">Location</label>
											<input
												name="location"
												value={editForm.location}
												onChange={handleEditChange}
												placeholder="e.g. San Francisco, CA"
												className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
											/>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-gray-700">Website</label>
											<input
												name="companyWebsite"
												value={editForm.companyWebsite}
												onChange={handleEditChange}
												placeholder="https://..."
												className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-semibold text-gray-700">Office Address</label>
										<input
											name="companyAddress"
											value={editForm.companyAddress}
											onChange={handleEditChange}
											placeholder="Full street address..."
											className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-semibold text-gray-700">Description</label>
										<textarea
											name="description"
											value={editForm.description}
											onChange={handleEditChange}
											rows={4}
											placeholder="Tell us about your company..."
											className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
										/>
									</div>
								</form>
							</div>

							<div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
								<button
									onClick={() => setEditOpen(false)}
									className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									form="edit-form"
									disabled={saving}
									className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
								>
									{saving ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
