import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    MoreVertical,
    ArrowRight,
    Sparkles,
    Loader2,
    AlertCircle,
    X,
    Calendar,
    MessageCircle
} from 'lucide-react';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import { getImageUrl, getResumeUrl } from '../../../utils/urlHelper';
import { getAIMatch } from '../../../services/applicationApi';
import { getApplicationStatusLabel, normalizeApplicationStatus } from '../../../utils/applicationStatus';

const COLUMNS = [
    { id: 'applied', title: 'Applied', color: 'bg-gray-100 text-gray-600', icon: Clock },
    { id: 'screening', title: 'Screening', color: 'bg-orange-50 text-orange-600', icon: Search },
    { id: 'interview', title: 'Interview', color: 'bg-indigo-50 text-indigo-600', icon: User },
    { id: 'hired', title: 'Hired', color: 'bg-[var(--color-success-bg)] text-[var(--color-success)]', icon: CheckCircle2 },
    { id: 'rejected', title: 'Rejected', color: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]', icon: XCircle }
];

// onSchedule is passed down so the modal can be rendered at the KanbanBoard level
const ApplicantCard = ({ applicant, onStatusChange, onSchedule, onMessage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [aiMatch, setAiMatch] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [errorAI, setErrorAI] = useState(null);
    const applicantStatus = normalizeApplicationStatus(applicant.status);

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
        if (score >= 80) return 'text-[var(--color-success)] bg-[var(--color-success-bg)] border-[var(--color-success)]/20';
        if (score >= 50) return 'text-[var(--color-warning)] bg-[var(--color-warning-bg)] border-[var(--color-warning)]/20';
        return 'text-[var(--color-danger)] bg-[var(--color-danger-bg)] border-[var(--color-danger)]/20';
    };

    return (
        <div className="ui-card-hover bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 mb-3 relative group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold border border-[var(--color-border)] overflow-hidden relative text-xs flex-shrink-0">
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
                    <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[var(--color-text-primary)] leading-tight truncate max-w-[130px]">
                            {applicant.jobSeekerId?.name || 'Applicant'}
                        </h4>
                        <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mt-0.5">
                            Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 hover:bg-[var(--color-surface-secondary)] rounded-lg transition-colors text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                    >
                        <MoreVertical size={14} />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-md)] z-20 py-1.5 backdrop-blur-md">
                                <p className="px-3 py-2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest border-b border-[var(--color-border)] mb-1">
                                    Update Status
                                </p>
                                {COLUMNS.map((col) => (
                                    col.id !== applicantStatus && (
                                        <button
                                            key={col.id}
                                            onClick={() => {
                                                onStatusChange(applicant._id, col.id);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)] transition-all flex items-center justify-between"
                                        >
                                            {getApplicationStatusLabel(col.id)}
                                            <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    )
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)] min-w-0">
                    <Mail size={13} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
                    <span className="truncate">{applicant.jobSeekerId?.email || 'N/A'}</span>
                </div>
                {(applicant.jobSeekerId?.resumeLink || applicant.resumeUrl) && (
                    <a
                        href={getResumeUrl(applicant.jobSeekerId?.resumeLink || applicant.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-[var(--color-accent)] font-bold hover:underline"
                    >
                        <FileText size={13} />
                        View Resume
                    </a>
                )}
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 max-w-[120px] truncate px-2.5 py-1 rounded-lg bg-[var(--color-surface-secondary)] text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                        {applicant.jobId?.title || 'Job'}
                    </span>

                    <div className="grid flex-1 grid-cols-2 gap-1.5 min-w-0">
                        <button
                            onClick={() => onMessage(applicant)}
                            className="flex w-full min-w-0 items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all text-[10px] font-bold whitespace-nowrap"
                        >
                            <MessageCircle size={10} className="shrink-0" />
                            Message
                        </button>
                        {/* Schedule button — only visible in Interview column */}
                        {applicantStatus === 'interview' && (
                            <button
                                onClick={() => onSchedule(applicant)}
                                className="flex w-full min-w-0 items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all text-[10px] font-bold whitespace-nowrap"
                            >
                                <Calendar size={10} className="shrink-0" />
                                Schedule
                            </button>
                        )}
                        {aiMatch ? (
                            <div className="col-span-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] min-w-0">
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-bold ${getScoreColor(aiMatch.score)} shrink-0`}>
                                    <Sparkles size={10} className="text-current" />
                                    {aiMatch.score}%
                                </div>
                                <button
                                    onClick={() => setAiMatch(null)}
                                    className="p-1 hover:bg-[var(--color-surface)] rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors shrink-0"
                                    title="Clear AI analysis"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : loadingAI ? (
                            <div className="col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-accent-bg)] text-[10px] font-bold text-[var(--color-accent)] min-w-0">
                                <Loader2 size={12} className="animate-spin shrink-0" />
                                <span className="truncate">Analyzing...</span>
                            </div>
                        ) : errorAI ? (
                            <div className="col-span-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-danger-bg)] text-[10px] font-bold text-[var(--color-danger)] min-w-0" title={errorAI}>
                                <AlertCircle size={12} className="shrink-0" />
                                <span className="truncate">Error</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleAIMatch}
                                className="col-span-2 flex w-full min-w-0 items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)] hover:bg-indigo-100 hover:text-indigo-700 border border-[var(--color-accent)]/10 transition-all text-[10px] font-bold group/ai whitespace-nowrap"
                            >
                                <Sparkles size={10} className="group-hover/ai:animate-pulse shrink-0" />
                                <span className="truncate">Match</span>
                            </button>
                        )}
                    </div>
                </div>

                {aiMatch && (
                    <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium border border-gray-100 italic break-words">
                        "{aiMatch.analysis}"
                    </div>
                )}
            </div>
        </div>
    );
};

const KanbanColumn = ({ column, applicants, onStatusChange, onSchedule, onMessage }) => {
    return (
        <div className="flex flex-col w-80 min-w-80 max-w-80 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] h-full max-h-[85vh] snap-start shadow-[var(--shadow-sm)]">
            <div className="p-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-2xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${column.color} shadow-sm`}>
                        <column.icon size={16} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm tracking-tight">{column.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] font-bold text-[10px] border border-[var(--color-border)]">
                    {applicants.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                {applicants.length > 0 ? (
                    applicants.map((app) => (
                        <ApplicantCard
                            key={app._id}
                            applicant={app}
                            onStatusChange={onStatusChange}
                            onSchedule={onSchedule}
                            onMessage={onMessage}
                        />
                    ))
                ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-secondary)]/50">
                        <FileText size={24} className="mb-2 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Candidates</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function KanbanBoard({ applicants, onStatusChange }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileStatus, setMobileStatus] = useState(COLUMNS[0].id);
    // Modal state lives here — outside all overflow containers
    const [schedulingApplicant, setSchedulingApplicant] = useState(null);

    const filteredApplicants = applicants.filter((app) => {
        const search = searchTerm.toLowerCase();
        const applicantName = String(app.jobSeekerId?.name || '').toLowerCase();
        const jobTitle = String(app.jobId?.title || '').toLowerCase();

        return applicantName.includes(search) || jobTitle.includes(search);
    });

    const appsByStatus = useMemo(() => {
        const grouped = COLUMNS.reduce((acc, column) => {
            acc[column.id] = [];
            return acc;
        }, {});

        filteredApplicants.forEach((applicant) => {
            const normalizedStatus = normalizeApplicationStatus(applicant.status);
            if (grouped[normalizedStatus]) {
                grouped[normalizedStatus].push(applicant);
            }
        });

        return grouped;
    }, [filteredApplicants]);

    const getAppsByStatus = (status) => appsByStatus[status] || [];
    const mobileApplicants = getAppsByStatus(mobileStatus);

    const handleMessageApplicant = (applicant) => {
        const receiverId = applicant.jobSeekerId?._id || applicant.jobSeekerId?.id || applicant.jobSeekerId;
        if (!receiverId) return;
        navigate(`/recruiter/message?userId=${receiverId}`);
    };

    return (
        <div className="flex flex-col h-full min-h-0 w-full min-w-0 space-y-6 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Candidate Pipeline</h2>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Manage and track your hiring progress across stages</p>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative group min-w-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-accent)] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find candidates..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all outline-none text-sm w-full md:w-72 bg-[var(--color-bg)] font-medium"
                        />
                    </div>
                    <button
                        type="button"
                        className="hidden md:inline-flex p-2.5 hover:bg-[var(--color-surface-secondary)] rounded-xl transition-all border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-sm hover:shadow-md"
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Pipeline View */}
            <div className="md:hidden space-y-4 min-w-0">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {COLUMNS.map((column) => {
                        const count = getAppsByStatus(column.id).length;
                        const isActive = mobileStatus === column.id;

                        return (
                            <button
                                key={column.id}
                                type="button"
                                onClick={() => setMobileStatus(column.id)}
                                className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                                }`}
                            >
                                <column.icon size={13} />
                                <span>{column.title}</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[10px] border border-[var(--color-border)]">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                    {mobileApplicants.length > 0 ? (
                        mobileApplicants.map((applicant) => (
                        <ApplicantCard
                            key={applicant._id}
                            applicant={applicant}
                            onStatusChange={onStatusChange}
                            onSchedule={setSchedulingApplicant}
                            onMessage={handleMessageApplicant}
                        />
                        ))
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-secondary)]/50">
                            <FileText size={24} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Candidates</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Kanban View */}
            <div className="hidden md:block min-w-0 w-full">
                <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth scrollbar-thin">
                    <div className="flex w-max min-w-full gap-6 pb-6 pr-2 snap-x snap-mandatory">
                        {COLUMNS.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                applicants={getAppsByStatus(col.id)}
                                onStatusChange={onStatusChange}
                                onSchedule={setSchedulingApplicant}
                                onMessage={handleMessageApplicant}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal rendered at KanbanBoard level — fully escapes all overflow/scroll containers */}
            <ScheduleInterviewModal
                isOpen={!!schedulingApplicant}
                onClose={() => setSchedulingApplicant(null)}
                applicant={schedulingApplicant}
                onScheduled={() => setSchedulingApplicant(null)}
            />
        </div>
    );
}
