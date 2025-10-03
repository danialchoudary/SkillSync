import React, { useEffect, useState } from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import EditProfileModal from './EditProfileModal';
import { getMe } from '../services/api';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

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

		if (loading) return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
			</div>
		);
	if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
	if (!user) return null;

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Topbar user={user} />
			<div className="flex flex-1">
				<Sidebar activeSection="profile" onSectionChange={() => {}} />
				<main className="flex-1 p-6">
					<div className="max-w-2xl mx-auto mt-8">
						<h2 className="text-2xl font-bold mb-4">Profile</h2>
						<div className="bg-white rounded shadow p-6">
							<div className="flex items-center gap-4 mb-4">
												{user.profilePicture ? (
													<img src={`http://localhost:5000${user.profilePicture}`} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
												) : (
													<span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
														<FaUser size={32} />
													</span>
												)}
								<div>
									<div className="font-bold text-lg">{user.name}</div>
									<div className="text-gray-600">{user.email}</div>
								</div>
								<button
									className="ml-auto px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
									onClick={() => setEditOpen(true)}
								>
									Edit Profile
								</button>
							</div>
							<div className="mb-2">
								<span className="font-semibold">Resume:</span>
								<div className="mt-1">
									{user.resumeUrl ? (
										<a
											href={`http://localhost:5000${user.resumeUrl}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 underline"
										>
											View Resume
										</a>
									) : (
										<span className="text-gray-400">No resume uploaded.</span>
									)}
								</div>
							</div>
							<div className="mb-2">
								<span className="font-semibold">Skills:</span>
								<div className="flex flex-wrap gap-2 mt-1">
									{user.skills && user.skills.length > 0
										? user.skills.map((skill, i) => (
											<span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{skill}</span>
										))
										: <span className="text-gray-400">None</span>
									}
								</div>
							</div>
							<div className="mb-2">
								<span className="font-semibold">Experience:</span>
								<div>
									<span>{user.experience?.years || 0} years</span>
									<div className="text-gray-600">{user.experience?.summary}</div>
								</div>
							</div>
						</div>
						<EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={fetchUser} />
					</div>
				</main>
			</div>
			<Footer />
		</div>
	);
}
