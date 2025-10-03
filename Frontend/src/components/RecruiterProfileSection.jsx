
import React, { useEffect, useState } from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { getMe } from '../services/api';

const INDUSTRIES = [
	'IT', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Construction', 'Hospitality', 'Other'
];

export default function RecruiterProfileSection() {
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
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('http://localhost:5000/me/company-logo', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});
			const data = await res.json();
			// Update user and editForm with new logo URL
			setUser(u => ({ ...u, companyLogo: data.companyLogoUrl }));
			setEditForm(f => ({ ...f, companyLogo: data.companyLogoUrl }));
			fetchUser();
		} catch (err) {
			setLogoError('Logo upload failed');
		} finally {
			setLogoUploading(false);
		}
	};

	const handleEditSave = async e => {
		e.preventDefault();
		setSaving(true);
		try {
			await fetch('http://localhost:5000/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(editForm),
			});
			setEditOpen(false);
			fetchUser();
		} catch (err) {
			setError('Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return (
		<div className="flex items-center justify-center min-h-[200px]">
			<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
		</div>
	);
	if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
	if (!user) return null;


		return (
			<div className="max-w-2xl mx-auto mt-8">
				<h2 className="text-2xl font-bold mb-4">Recruiter Profile</h2>
				<div className="bg-white rounded shadow p-6">
					<div className="flex items-center gap-4 mb-4">
									{user.companyLogo ? (
										<img src={`http://localhost:5000${user.companyLogo}`} alt="company logo" className="w-16 h-16 rounded-full object-cover" />
									) : (
										<span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
											<FaBuilding size={32} />
										</span>
									)}
						<div>
							<div className="font-bold text-lg">{user.companyName || <span className="text-gray-400">No company name</span>}</div>
							<div className="text-gray-600">{user.companyWebsite ? <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{user.companyWebsite}</a> : <span className="text-gray-400">No website</span>}</div>
							<div className="text-gray-600">Industry: <span className="font-semibold">{user.industry || <span className="text-gray-400">Not set</span>}</span></div>
							<div className="text-gray-600">Location: <span className="font-semibold">{user.location || <span className="text-gray-400">Not set</span>}</span></div>
						</div>
						<button
							className="ml-auto px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
							onClick={handleEditOpen}
						>
							Edit Profile
						</button>
					</div>
					{/* Description field */}
					<div className="mb-3">
						<span className="font-semibold">Description:</span>
						<div className="mt-1 text-gray-700 whitespace-pre-line">
							{user.description ? user.description : <span className="text-gray-400">No description provided.</span>}
						</div>
					</div>
				</div>
				{editOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-auto">
						<form className="bg-white p-6 rounded shadow w-full max-w-md max-h-screen overflow-y-auto" onSubmit={handleEditSave}>
							<h3 className="text-xl font-bold mb-4">Edit Company Info</h3>
							<div className="mb-3">
								<label className="block mb-1">Company Name</label>
								<input name="companyName" value={editForm.companyName} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" required />
							</div>
							<div className="mb-3">
								<label className="block mb-1">Company Logo</label>
								<div className="flex items-center gap-2">
														{user.companyLogo ? (
															<img src={`http://localhost:5000${user.companyLogo}`} alt="company logo" className="w-16 h-16 rounded-full object-cover" />
														) : (
															<span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
																<FaBuilding size={32} />
															</span>
														)}
									<input
										type="file"
										accept="image/png,image/jpeg,image/jpg"
										style={{ display: 'none' }}
										id="company-logo-upload-input"
										onChange={handleLogoUpload}
									/>
									<button
										type="button"
										onClick={() => document.getElementById('company-logo-upload-input').click()}
										disabled={logoUploading}
										className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
									>
										{logoUploading ? 'Uploading...' : 'Upload Logo'}
									</button>
								</div>
								{logoError && <div className="text-red-500 text-xs mt-1">{logoError}</div>}
							</div>
							<div className="mb-3">
								<label className="block mb-1">Company Website (optional)</label>
								<input name="companyWebsite" value={editForm.companyWebsite} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" placeholder="https://yourcompany.com" />
							</div>
							<div className="mb-3">
								<label className="block mb-1">Industry</label>
								<select name="industry" value={editForm.industry} onChange={handleEditChange} className="w-full border px-2 py-1 rounded">
									<option value="">Select Industry</option>
									{INDUSTRIES.map(ind => (
										<option key={ind} value={ind}>{ind}</option>
									))}
								</select>
							</div>
							<div className="mb-3">
								<label className="block mb-1">Location (City, Country)</label>
								<input name="location" value={editForm.location} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" placeholder="City, Country" />
							</div>
							{/* Description field in modal */}
							<div className="mb-3">
								<label className="block mb-1">Description</label>
								<textarea name="description" value={editForm.description || ''} onChange={handleEditChange} className="w-full border px-2 py-1 rounded" rows={3} maxLength={1000} placeholder="Describe your company..." />
							</div>
							<div className="flex justify-end gap-2 mt-4">
								<button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
								<button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
									{saving ? 'Saving...' : 'Save'}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		);
	}
