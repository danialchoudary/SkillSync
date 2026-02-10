import React, { useEffect, useState } from 'react';
import { FaUser, FaBuilding, FaEdit, FaFileAlt, FaBriefcase, FaAward, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import EditProfileModal from './EditProfileModal';
import { getMe } from '../services/api';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import RecruiterSidebar from './RecruiterSidebar';
import { getImageUrl, getResumeUrl } from '../utils/urlHelper';

export default function Profile() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [editOpen, setEditOpen] = useState(false);

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

	useEffect(() => {
		if (user && user.role === 'recruiter') {
			window.location.href = '/recruiter/profile';
		}
	}, [user]);

	if (loading) return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				className="text-center"
			>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
				/>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="text-gray-600 font-medium"
				>
					Loading your profile...
				</motion.p>
			</motion.div>
		</div>
	);

	if (error) return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-red-100"
			>
				<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
					<span className="text-3xl">⚠️</span>
				</div>
				<h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
				<p className="text-red-500">{error}</p>
			</motion.div>
		</div>
	);

	if (!user) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
			<Topbar user={user} />
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar fixed, main content scrollable */}
				<div className="relative flex-1 flex">
					<div className="fixed left-0 top-14 h-[calc(100vh-4rem)] min-h-0 w-64 z-20">
						{user.role === 'recruiter' ? (
							<RecruiterSidebar activeSection="profile" />
						) : (
							<Sidebar activeSection="profile" />
						)}
					</div>
					<main className="flex-1 ml-64 overflow-y-auto">
						<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
							{/* Page Header */}
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className="mb-8"
							>
								<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
									My Profile
								</h1>
								<p className="text-gray-600">Manage your personal information and preferences</p>
							</motion.div>

							{/* Profile Card */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.1 }}
								className="bg-white rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden mb-6"
							>
								{/* Header with gradient */}
								<div className="relative h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-purple-600/50"></div>
									<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
								</div>

								{/* Profile Info Section */}
								<div className="relative px-6 sm:px-8 pb-8">
									{/* Avatar & Basic Info */}
									<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
										{/* Avatar */}
										<motion.div
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
											className="relative"
										>
											<div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl"></div>
											{getImageUrl(user.profilePicture) ? (
												<img
													src={getImageUrl(user.profilePicture)}
													alt="avatar"
													className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl ring-2 ring-gray-100"
												/>
											) : (
												<span className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center text-blue-600 border-4 border-white shadow-2xl ring-2 ring-gray-100">
													<FaUser size={48} />
												</span>
											)}
										</motion.div>

										{/* Name & Email */}
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.3 }}
											className="flex-1"
										>
											<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{user.name}</h2>
											<p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
												<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
												{user.email}
											</p>
										</motion.div>

										{/* Edit Button */}
										<motion.button
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.4 }}
											whileHover={{ scale: 1.05, y: -2 }}
											whileTap={{ scale: 0.98 }}
											className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center gap-2"
											onClick={() => setEditOpen(true)}
										>
											<FaEdit />
											<span>Edit Profile</span>
										</motion.button>
									</div>

									<div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

									{/* Details Grid */}
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{/* Resume Section */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.5 }}
											className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
										>
											<div className="flex items-center gap-3 mb-4">
												<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
													<FaFileAlt className="text-white text-xl" />
												</div>
												<h3 className="text-lg font-bold text-gray-900">Resume / CV</h3>
											</div>
											{getResumeUrl(user.resumeUrl || user.resumeLink) ? (
												<motion.a
													whileHover={{ scale: 1.02, x: 2 }}
													href={getResumeUrl(user.resumeUrl || user.resumeLink)}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl hover:bg-blue-100 border border-blue-200 font-medium text-sm transition-all duration-300 group shadow-sm"
												>
													<FaFileAlt />
													<span>View Resume</span>
													<FaExternalLinkAlt className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
												</motion.a>
											) : (
												<div className="flex items-center gap-2 text-gray-500 text-sm">
													<div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
														<FaFileAlt className="text-gray-400" />
													</div>
													<span>No resume uploaded yet</span>
												</div>
											)}
										</motion.div>

										{/* Experience Section */}
										<motion.div
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.6 }}
											className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
										>
											<div className="flex items-center gap-3 mb-4">
												<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
													<FaBriefcase className="text-white text-xl" />
												</div>
												<h3 className="text-lg font-bold text-gray-900">Experience</h3>
											</div>
											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<FaClock className="text-purple-600" />
													<span className="font-semibold text-gray-900">{user.experience?.years || 0} years</span>
												</div>
												{user.experience?.summary && (
													<p className="text-gray-700 text-sm leading-relaxed pl-6">
														{user.experience.summary}
													</p>
												)}
											</div>
										</motion.div>
									</div>

									{/* Skills Section - Full Width */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.7 }}
										className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
									>
										<div className="flex items-center gap-3 mb-4">
											<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
												<FaAward className="text-white text-xl" />
											</div>
											<h3 className="text-lg font-bold text-gray-900">Skills & Expertise</h3>
										</div>
										<div className="flex flex-wrap gap-3">
											{user.skills && user.skills.length > 0 ? (
												user.skills.map((skill, i) => (
													<motion.span
														key={i}
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 1, scale: 1 }}
														transition={{ delay: 0.8 + i * 0.05 }}
														whileHover={{ scale: 1.05, y: -2 }}
														className="px-4 py-2 bg-white text-emerald-700 rounded-xl text-sm font-semibold border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300"
													>
														{skill}
													</motion.span>
												))
											) : (
												<div className="flex items-center gap-2 text-gray-500 text-sm">
													<div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
														<FaAward className="text-gray-400" />
													</div>
													<span>No skills added yet</span>
												</div>
											)}
										</div>
									</motion.div>
								</div>
							</motion.div>
						</div>
					</main>
				</div>
			</div>
			<Footer />
			<EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={fetchUser} />
		</div>
	);
}