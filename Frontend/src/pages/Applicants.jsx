import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Applicants() {
	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [applicants, setApplicants] = useState({}); // jobId -> applicants array

	useEffect(() => {
		// Fetch recruiter jobs
		api.get('/jobs/my')
			.then(res => {
				setJobs(res.data);
				setError('');
				setLoading(false);
				// For each job, fetch applicants
				res.data.forEach(job => {
					api.get(`/applications/job/${job._id || job.id}`)
						.then(aRes => {
							setApplicants(prev => ({ ...prev, [job._id || job.id]: aRes.data }));
						})
						.catch(() => {
							setApplicants(prev => ({ ...prev, [job._id || job.id]: [] }));
						});
				});
			})
			.catch(err => {
				setError(err.response?.data?.error || 'Failed to load jobs');
				setJobs([]);
				setLoading(false);
			});
	}, []);

	const handleStatusChange = async (appId, status) => {
		await api.patch(`/applications/${appId}/status`, { status });
		// Refresh applicants for all jobs
		jobs.forEach(job => {
			api.get(`/applications/job/${job._id || job.id}`)
				.then(aRes => {
					setApplicants(prev => ({ ...prev, [job._id || job.id]: aRes.data }));
				});
		});
	};

		return (
				<div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
					{/* If you have a Topbar, add it here */}
					<div className="flex flex-1 h-0">
						{/* If you have a Sidebar, add it here */}
						<div className="flex flex-col flex-1 min-h-0">
							<main className="flex-1 p-6 overflow-y-auto min-h-0">
					<h2 className="text-2xl font-bold mb-4">Applicants</h2>
								{loading ? (
									<div className="flex items-center justify-center min-h-[200px]">
										<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
									</div>
								) : error ? (
						<div className="text-red-500">{error}</div>
					) : jobs.length === 0 ? (
						<div>No jobs found.</div>
					) : (
						jobs.map(job => (
							<div key={job._id || job.id} className="mb-8">
								<h3 className="text-lg font-semibold mb-2">{job.title} <span className="text-gray-500">({job.company})</span></h3>
								<div className="overflow-x-auto">
									<table className="min-w-full bg-white border rounded">
										<thead>
											<tr>
												<th className="px-3 py-2 border">Name</th>
												<th className="px-3 py-2 border">Resume</th>
												<th className="px-3 py-2 border">Cover Letter</th>
												<th className="px-3 py-2 border">Applied Date</th>
												<th className="px-3 py-2 border">Status</th>
												<th className="px-3 py-2 border">Action</th>
											</tr>
										</thead>
										<tbody>
											{(applicants[job._id || job.id] || []).length === 0 ? (
												<tr><td colSpan={6} className="text-center text-gray-400">No applicants</td></tr>
											) : (
												applicants[job._id || job.id].map(app => (
													<tr key={app._id || app.id}>
														<td className="px-3 py-2 border">{app.jobSeekerId?.name || '-'}</td>
														<td className="px-3 py-2 border">
															{app.resumeUrl ? (
																<a href={`http://localhost:5000${app.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Resume</a>
															) : app.jobSeekerId?.resumeLink ? (
																<a href={`http://localhost:5000${app.jobSeekerId.resumeLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Resume</a>
															) : '-'}
														</td>
														<td className="px-3 py-2 border">{app.coverLetter}</td>
																		<td className="px-3 py-2 border">{
																			(app.appliedAt && !isNaN(Date.parse(app.appliedAt)))
																				? new Date(app.appliedAt).toLocaleString()
																				: (app.createdAt && !isNaN(Date.parse(app.createdAt)))
																					? new Date(app.createdAt).toLocaleString()
																					: '-'
																		}</td>
														<td className="px-3 py-2 border">{app.status}</td>
														<td className="px-3 py-2 border">
															{app.status === 'pending' ? (
																<>
																	<button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={() => handleStatusChange(app._id || app.id, 'accepted')}>Accept</button>
																	<button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => handleStatusChange(app._id || app.id, 'rejected')}>Reject</button>
																</>
															) : (
																<span className="text-gray-500">-</span>
															)}
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>
						))
					)}
							</main>
							<Footer />
						</div>
					</div>
				</div>
			);
}
