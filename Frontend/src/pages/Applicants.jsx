import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
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
			const jobsRes = await api.get('/jobs/my');
			setJobs(jobsRes.data);
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
				<div className="w-12 h-12 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded-xl flex items-center justify-center mb-4">
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
				<p className="text-sm text-[var(--color-text-secondary)] mb-4">{error}</p>
				<button
					onClick={fetchData}
					className="px-5 py-2 bg-[var(--color-accent)] text-white font-medium rounded-lg text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-[var(--color-bg)]">
			<div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col">
				<div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col min-h-0">

					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">Applicant Management</h1>
							<p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Track and manage candidates through your recruitment funnel</p>
						</div>

						<div className="flex items-center gap-3 w-full md:w-auto">
							<div className="flex flex-col w-full md:w-auto">
								<label className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 ml-0.5">Filter by Job</label>
								<select
									value={selectedJobId}
									onChange={(e) => setSelectedJobId(e.target.value)}
									className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-medium rounded-lg px-4 py-2.5 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-colors outline-none w-full md:min-w-[220px]"
								>
									<option value="all">All Job Postings</option>
									{jobs.map(job => (
										<option key={job._id || job.id} value={job._id || job.id}>
											{job.title}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Kanban Board */}
					{loading ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
								<p className="text-sm text-[var(--color-text-secondary)]">Loading applicants...</p>
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
