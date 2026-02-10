import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ChevronRight,
    MoreVertical,
    ArrowRight,
    Sparkles,
    Loader2,
    AlertCircle,
    X
} from 'lucide-react';
import { getImageUrl, getResumeUrl } from '../utils/urlHelper';
import { getAIMatch } from '../services/applicationApi';

const COLUMNS = [
    { id: 'applied', title: 'Applied', color: 'bg-blue-500', icon: Clock },
    { id: 'screening', title: 'Screening', color: 'bg-orange-500', icon: Search },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-purple-500', icon: User },
    { id: 'hired', title: 'Hired', color: 'bg-green-500', icon: CheckCircle2 },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500', icon: XCircle }
];

const ApplicantCard = ({ applicant, onStatusChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [aiMatch, setAiMatch] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [errorAI, setErrorAI] = useState(null);

    const handleAIMatch = async () => {
        setLoadingAI(true);
        setErrorAI(null);
        try {
            const result = await getAIMatch(applicant._id);
            setAiMatch(result);
        } catch (err) {
            console.error('Failed to get AI match:', err);
            setErrorAI('Failed to analyze');
        } finally {
            setLoadingAI(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 relative group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 overflow-hidden relative">
                        {getImageUrl(applicant.jobSeekerId?.profilePicture) ? (
                            <img
                                src={getImageUrl(applicant.jobSeekerId?.profilePicture)}
                                alt={applicant.jobSeekerId?.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            (applicant.jobSeekerId?.name?.charAt(0) || 'A')
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 leading-tight truncate max-w-[140px]">
                            {applicant.jobSeekerId?.name || 'Applicant'}
                        </h4>
                        <p className="text-xs text-gray-400 font-medium">Applied {new Date(applicant.appliedAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 group-hover:text-gray-600"
                    >
                        <MoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2"
                                >
                                    <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Move to</p>
                                    {COLUMNS.map(col => (
                                        col.id !== applicant.status && (
                                            <button
                                                key={col.id}
                                                onClick={() => {
                                                    onStatusChange(applicant._id, col.id);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                                            >
                                                {col.title}
                                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        )
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{applicant.jobSeekerId?.email || 'N/A'}</span>
                </div>
                {(applicant.jobSeekerId?.resumeLink || applicant.resumeUrl) && (
                    <a
                        href={getResumeUrl(applicant.jobSeekerId?.resumeLink || applicant.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 font-bold hover:underline"
                    >
                        <FileText size={14} />
                        View Resume
                    </a>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-1">
                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-[10px] font-bold text-gray-400">
                            {applicant.jobId?.title || 'Job'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {aiMatch ? (
                            <div className="flex items-center gap-1">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-extrabold tracking-tight ${getScoreColor(aiMatch.score)}`}
                                >
                                    <Sparkles size={10} className="shrink-0" />
                                    {aiMatch.score}% Match
                                </motion.div>
                                <button
                                    onClick={() => setAiMatch(null)}
                                    className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                                    title="Clear AI analysis"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : loadingAI ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                <Loader2 size={12} className="animate-spin" />
                                Matching...
                            </div>
                        ) : errorAI ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500" title={errorAI}>
                                <AlertCircle size={12} />
                                Error
                            </div>
                        ) : (
                            <button
                                onClick={handleAIMatch}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all text-[10px] font-extrabold tracking-tight group/ai"
                            >
                                <Sparkles size={10} className="group-hover/ai:scale-125 transition-transform" />
                                AI Match
                            </button>
                        )}
                        <button className="text-gray-300 hover:text-blue-600 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* AI Analysis Dropdown */}
                <AnimatePresence>
                    {aiMatch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-600 font-medium border border-gray-100 leading-relaxed italic">
                                "{aiMatch.analysis}"
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const KanbanColumn = ({ column, applicants, onStatusChange }) => {
    return (
        <div className="flex flex-col w-72 min-w-[18rem] bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100/50 h-full max-h-screen">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${column.color} text-white shadow-lg shadow-black/5`}>
                        <column.icon size={14} strokeWidth={3} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm tracking-tight">{column.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-gray-200/50 text-gray-500 font-bold text-xs">
                    {applicants.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence>
                    {applicants.length > 0 ? (
                        applicants.map(app => (
                            <ApplicantCard
                                key={app._id}
                                applicant={app}
                                onStatusChange={onStatusChange}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-32 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-xl"
                        >
                            <FileText size={24} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Candidates</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function KanbanBoard({ applicants, onStatusChange, loading }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredApplicants = applicants.filter(app =>
        app.jobSeekerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAppsByStatus = (status) => filteredApplicants.filter(app => app.status === status);

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Candidate Pipeline</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage and track your hiring progress</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm w-full md:w-64"
                        />
                    </div>
                    <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 text-gray-500">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar-horizontal scroll-smooth">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        applicants={getAppsByStatus(col.id)}
                        onStatusChange={onStatusChange}
                    />
                ))}
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </div>
    );
}
