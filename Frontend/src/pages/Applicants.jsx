import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from '../components/KanbanBoard';
import { updateApplicationStatus } from '../services/applicationApi';

export default function Applicants({ setToast = () => { }, setToastType = () => { } }) {
	const [jobs, setJobs] = useState([]);
	const [allApplicants, setAllApplicants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedJobId, setSelectedJobId] = useState('all');

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch all jobs for the header filter
			const jobsRes = await api.get('/jobs/my');
			setJobs(jobsRes.data);

			// Fetch all applicants for all jobs initially
			const appPromises = jobsRes.data.map(job =>
				api.get(`/applications/job/${job._id || job.id}`)
					.then(res => res.data.map(app => ({ ...app, jobTitle: job.title })))
					.catch(() => [])
			);

			const appResults = await Promise.all(appPromises);
			setAllApplicants(appResults.flat());
			setError('');
		} catch (err) {
			setError('Failed to load applicants. Please try again.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (appId, newStatus) => {
		// Optimistic Update
		const previousApplicants = [...allApplicants];
		setAllApplicants(prev => prev.map(app =>
			(app._id || app.id) === appId ? { ...app, status: newStatus } : app
		));

		try {
			await updateApplicationStatus(appId, newStatus);
			setToast(`Applicant moved to ${newStatus}`);
			setToastType('success');
		} catch (err) {
			setAllApplicants(previousApplicants);
			setToast('Failed to update status');
			setToastType('error');
		}
	};

	const filteredApplicants = useMemo(() => {
		if (selectedJobId === 'all') return allApplicants;
		return allApplicants.filter(app => (app.jobId?._id || app.jobId) === selectedJobId);
	}, [allApplicants, selectedJobId]);

	if (error) {
		return (
			<div className="h-full flex flex-col items-center justify-center p-8 text-center">
				<div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
					<AnimatePresence>
						<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</motion.div>
					</AnimatePresence>
				</div>
				<h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
				<p className="text-gray-500 mb-6">{error}</p>
				<button
					onClick={fetchData}
					className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-gray-50/30">
			<div className="flex-1 p-8 overflow-hidden flex flex-col">
				<div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col min-h-0">

					{/* Header with Job Filter */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
						<div>
							<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Applicant Management</h1>
							<p className="text-gray-500 font-medium mt-1">Track and manage candidates through your recruitment funnel</p>
						</div>

						<div className="flex items-center gap-4">
							<div className="flex flex-col">
								<label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Filter by Job Posting</label>
								<select
									value={selectedJobId}
									onChange={(e) => setSelectedJobId(e.target.value)}
									className="bg-white border-2 border-gray-100 text-gray-700 text-sm font-bold rounded-2xl px-5 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-w-[240px] shadow-sm"
								>
									<option value="all">🎯 All Job Postings</option>
									{jobs.map(job => (
										<option key={job._id || job.id} value={job._id || job.id}>
											{job.title}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Kanban Board Container */}
					{loading ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="flex flex-col items-center gap-4">
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
									className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full"
								/>
								<p className="text-gray-400 font-bold text-sm animate-pulse">Initializing pipeline...</p>
							</div>
						</div>
					) : (
						<div className="flex-1 min-h-0">
							<KanbanBoard
								applicants={filteredApplicants}
								onStatusChange={handleStatusChange}
								loading={loading}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

