import React, { useEffect, useState } from 'react';
import { User, Mail, Edit2, FileText, Briefcase, Award, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import { getMe } from '../services/api';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
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
		<div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
			<div className="text-center">
				<div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
				<p className="text-[var(--color-text-secondary)] font-medium">Loading your profile...</p>
			</div>
		</div>
	);

	if (error) return (
		<div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
			<div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-sm)] p-8 max-w-md text-center border border-[var(--color-border)]">
				<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center">
					<AlertCircle className="text-[var(--color-danger)] w-8 h-8" />
				</div>
				<h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
				<p className="text-[var(--color-danger)] text-sm mb-6">{error}</p>
				<button onClick={fetchUser} className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-bold hover:bg-[var(--color-accent-hover)] transition-colors">
					Try Again
				</button>
			</div>
		</div>
	);

	if (!user) return null;

	return (
		<div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
			<Topbar user={user} />

			<div className="relative flex-1 flex">
				<div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
					{user.role === 'recruiter' ? (
						<RecruiterSidebar activeSection="profile" />
					) : (
						<Sidebar activeSection="profile" />
					)}
				</div>

				<main className="flex-1 lg:ml-64 pt-14 flex flex-col">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
						{/* Page Header */}
						<div className="mb-10">
							<h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">My Profile</h1>
							<p className="text-[var(--color-text-secondary)] font-medium">Manage your personal information and preferences</p>
						</div>

						{/* Profile Card */}
						<div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-sm)] border border-[var(--color-border)] overflow-hidden mb-8">
							{/* Cover Area */}
							<div className="h-32 bg-[var(--color-surface-secondary)] relative border-b border-[var(--color-border)]">
								<div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
							</div>

							{/* Profile Info Section */}
							<div className="relative px-6 sm:px-10 pb-10">
								{/* Avatar & Basic Info */}
								<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-8">
									{/* Avatar */}
									<div className="relative">
										{getImageUrl(user.profilePicture) ? (
											<img
												src={getImageUrl(user.profilePicture)}
												alt="avatar"
												className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-surface)] shadow-[var(--shadow-md)] bg-[var(--color-surface-secondary)]"
											/>
										) : (
											<div className="w-32 h-32 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] border-4 border-[var(--color-surface)] shadow-[var(--shadow-md)]">
												<User size={48} />
											</div>
										)}
									</div>

									{/* Name & Email */}
									<div className="flex-1 pt-2">
										<h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{user.name}</h2>
										<p className="text-[var(--color-text-secondary)] text-sm font-medium flex items-center gap-2">
											<Mail size={14} className="text-[var(--color-text-tertiary)]" />
											{user.email}
										</p>
									</div>

									{/* Edit Button */}
									<button
										className="px-6 py-2.5 bg-[var(--color-accent)] text-white rounded-lg font-bold hover:bg-[var(--color-accent-hover)] transition-all shadow-[var(--shadow-sm)] flex items-center gap-2"
										onClick={() => setEditOpen(true)}
									>
										<Edit2 size={16} />
										<span>Edit Profile</span>
									</button>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
									{/* Resume Section */}
									<div className="bg-[var(--color-surface-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
										<div className="flex items-center gap-3 mb-5">
											<div className="w-10 h-10 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)]">
												<FileText size={20} />
											</div>
											<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Resume / CV</h3>
										</div>
										{getResumeUrl(user.resumeUrl || user.resumeLink) ? (
											<a
												href={getResumeUrl(user.resumeUrl || user.resumeLink)}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] text-[var(--color-accent)] rounded-lg border border-[var(--color-border)] font-bold text-xs hover:bg-[var(--color-surface-secondary)] transition-all group"
											>
												<FileText size={14} />
												<span>View Current Resume</span>
												<ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
											</a>
										) : (
											<div className="flex items-center gap-3 text-[var(--color-text-tertiary)] py-2">
												<FileText size={16} />
												<span className="text-xs font-medium">No resume uploaded yet</span>
											</div>
										)}
									</div>

									{/* Experience Section */}
									<div className="bg-[var(--color-surface-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
										<div className="flex items-center gap-3 mb-5">
											<div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
												<Briefcase size={20} />
											</div>
											<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Experience</h3>
										</div>
										<div className="space-y-4">
											<div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
												<Clock size={16} className="text-[var(--color-text-tertiary)]" />
												<span>{user.experience?.years || 0} years professional experience</span>
											</div>
											{user.experience?.summary && (
												<p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
													{user.experience.summary}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Skills Section */}
								<div className="mt-8 bg-[var(--color-surface-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-10 h-10 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success)]">
											<Award size={20} />
										</div>
										<h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Skills & Expertise</h3>
									</div>
									<div className="flex flex-wrap gap-2.5">
										{user.skills && user.skills.length > 0 ? (
											user.skills.map((skill, i) => (
												<span
													key={i}
													className="px-4 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-secondary)] rounded-full text-xs font-bold border border-[var(--color-border)] shadow-sm"
												>
													{skill}
												</span>
											))
										) : (
											<div className="flex items-center gap-2 text-[var(--color-text-tertiary)] py-2">
												<Award size={16} />
												<span className="text-xs font-medium">No skills added yet</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
			<div className="lg:ml-64">
				<Footer />
			</div>
			<EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={fetchUser} />
		</div>
	);
}
