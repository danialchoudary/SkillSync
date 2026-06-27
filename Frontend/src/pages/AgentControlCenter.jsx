import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import {
  getAgentStatus,
  updateAgentPreferences,
  triggerAgentRun,
  approveDraft,
  rejectDraft,
} from '../services/agentApi';
import { FaRobot, FaCheckCircle, FaExclamationTriangle, FaToggleOn, FaToggleOff, FaBolt, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import Skeleton from '../components/skeletons/Skeleton';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProfileHealthGate({ health }) {
  if (!health) return <Skeleton className="h-48 rounded-xl" />;
  const { score, checks } = health;
  return (
    <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">Profile Health Gate</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--color-text-secondary)] font-medium">Completeness</span>
        <span className={`text-sm font-bold ${score >= 80 ? 'text-green-500' : 'text-orange-500'}`}>{score}%</span>
      </div>
      <div className="w-full bg-[var(--color-surface-secondary)] rounded-full h-2 mb-4 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${score >= 80 ? 'bg-green-500' : 'bg-orange-400'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            {c.met
              ? <FaCheckCircle className="text-green-500 shrink-0" />
              : <FaExclamationTriangle className="text-orange-400 shrink-0" />}
            {c.label}
          </li>
        ))}
      </ul>
      {score < 80 && (
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-4 font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded-md">
          Complete your profile to {80 - score}% more to activate the AI Agent.
        </p>
      )}
    </div>
  );
}

function PreferencesForm({ prefs, onSave, saving }) {
  const [local, setLocal] = useState(prefs);
  useEffect(() => setLocal(prefs), [prefs]);
  if (!local) return <Skeleton className="h-48 rounded-xl" />;

  return (
    <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-2">Agent Preferences</h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Agent Mode</label>
          <select
            value={local.mode || 'draft'}
            onChange={(e) => setLocal({ ...local, mode: e.target.value })}
            className="w-full mt-1.5 p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 outline-none transition-all"
          >
            <option value="draft">Draft Mode</option>
            <option value="auto">Auto Apply Mode</option>
          </select>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1.5">
            Draft mode creates approvals. Auto mode submits applications right away.
          </p>
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Target Job Titles (comma-separated)</label>
          <input
            type="text"
            value={(local.jobTitles || []).join(', ')}
            onChange={(e) => setLocal({ ...local, jobTitles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="e.g. Frontend Developer, React Engineer"
            className="w-full mt-1.5 p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Minimum Salary (USD / year)</label>
          <input
            type="number"
            value={local.minSalary || 0}
            onChange={(e) => setLocal({ ...local, minSalary: Number(e.target.value) })}
            className="w-full mt-1.5 p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg text-sm focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Remote Only</label>
          <button
            onClick={() => setLocal({ ...local, remoteOnly: !local.remoteOnly })}
            className={`text-2xl transition-colors ${local.remoteOnly ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
          >
            {local.remoteOnly ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
        <button
          onClick={() => onSave(local)}
          disabled={saving}
          className="w-full py-2.5 bg-[var(--color-accent)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <FaSpinner className="animate-spin" /> : null}
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function MatchBadge({ score }) {
  const color = score >= 90 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    : score >= 80 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>{score}% Match</span>
  );
}

function DraftCard({ draft, onApprove, onReject, processing }) {
  const [expanded, setExpanded] = useState(false);
  const job = draft.jobId;
  if (!job) return null;

  return (
    <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] hover:border-[var(--color-accent)]/50 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">{job.title} @ {job.company}</h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <MatchBadge score={draft.matchScore} />
            <span className="text-xs text-[var(--color-text-tertiary)]">• {job.location}</span>
            {job.salary && <span className="text-xs text-[var(--color-text-tertiary)]">• {job.salary}</span>}
          </div>
          {draft.matchReason && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 italic">{draft.matchReason}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            {expanded ? 'Hide Draft' : 'View Draft'}
          </button>
          <button
            onClick={() => onReject(draft._id)}
            disabled={processing === draft._id}
            className="text-xs font-semibold bg-[var(--color-danger-bg)] text-[var(--color-danger)] px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <FaTimesCircle />
          </button>
          <button
            onClick={() => onApprove(draft._id)}
            disabled={processing === draft._id}
            className="text-xs font-semibold bg-[var(--color-accent)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
          >
            {processing === draft._id ? <FaSpinner className="animate-spin" /> : null}
            Approve
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 p-3 bg-[var(--color-surface-secondary)] rounded-lg">
          <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1.5">AI-Generated Cover Letter</p>
          <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{draft.coverLetter}</p>
        </div>
      )}
    </div>
  );
}

function ActivityLogEntry({ entry }) {
  const isPositive = ['applied', 'drafted'].includes(entry.action);
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5 shrink-0">
        {isPositive
          ? <FaCheckCircle className="text-green-500 text-base" />
          : <FaExclamationTriangle className="text-[var(--color-text-tertiary)] text-base" />}
      </div>
      <div>
        <p className={`font-medium text-sm ${isPositive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] line-through decoration-[var(--color-text-tertiary)]'}`}>
          {entry.action === 'applied' && 'Applied to '}
          {entry.action === 'drafted' && 'Draft created for '}
          {entry.action === 'ignored' && 'Ignored '}
          {entry.action === 'rejected' && 'Rejected draft for '}
          <span className="font-bold">{entry.jobTitle || 'Unknown Job'}</span>
          {entry.company && ` @ ${entry.company}`}
        </p>
        {entry.reason && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{entry.reason}</p>}
        {entry.matchScore && <span className="inline-block mt-1"><MatchBadge score={entry.matchScore} /></span>}
        <p className="text-[10px] text-[var(--color-text-tertiary)] font-medium mt-1.5 uppercase tracking-wider">
          {new Date(entry.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function RunLogEntry({ entry }) {
  const color =
    entry.action === 'applied'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : entry.action === 'drafted'
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        : entry.action === 'skipped'
          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
          : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]';

  return (
    <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${color}`}>
              {entry.action || 'info'}
            </span>
            <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
              {entry.jobTitle || 'Unknown Job'}
              {entry.company ? ` @ ${entry.company}` : ''}
            </p>
          </div>
          {typeof entry.score === 'number' && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Score: {entry.score}%</p>
          )}
          {entry.reason && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{entry.reason}</p>
          )}
        </div>
        {entry.timestamp && (
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium whitespace-nowrap">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AgentControlCenter() {
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.unread.count);
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [running, setRunning] = useState(false);
  const [processingDraft, setProcessingDraft] = useState(null); // draftId
  const [lastRunLog, setLastRunLog] = useState([]);
  const [lastRunSummary, setLastRunSummary] = useState('');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  const loadStatus = useCallback(async () => {
    try {
      const data = await getAgentStatus();
      setStatus(data);
    } catch {
      setError('Failed to load agent status. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleToggle = async () => {
    if (!status) return;
    setToggling(true);
    try {
      await updateAgentPreferences({ isEnabled: !status.isEnabled });
      setStatus((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
      showToast(status.isEnabled ? 'Agent disabled' : 'Agent activated!');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Could not toggle agent', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleSavePrefs = async (newPrefs) => {
    setSavingPrefs(true);
    try {
      await updateAgentPreferences(newPrefs);
      setStatus((prev) => ({
        ...prev,
        mode: newPrefs.mode ?? prev?.mode,
        preferences: { ...(prev?.preferences || {}), ...newPrefs },
      }));
      showToast('Preferences saved!');
    } catch {
      showToast('Failed to save preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const result = await triggerAgentRun();
      const appliedText = result.applied ? `${result.applied} applied, ` : '';
      const summary = `Agent finished: ${appliedText}${result.drafted || 0} draft(s), ${result.ignored || 0} ignored.`;
      setLastRunLog(Array.isArray(result.runLog) ? result.runLog : []);
      setLastRunSummary(result.reason ? `${summary} ${result.reason}` : summary);
      showToast(result.reason ? `${summary} ${result.reason}` : summary);
      await loadStatus();
    } catch {
      showToast('Agent run failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleApprove = async (draftId) => {
    setProcessingDraft(draftId);
    try {
      await approveDraft(draftId);
      showToast('Application submitted! 🎉');
      setStatus((prev) => ({
        ...prev,
        pendingDrafts: prev.pendingDrafts.filter((d) => d._id !== draftId),
      }));
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to approve', 'error');
    } finally {
      setProcessingDraft(null);
    }
  };

  const handleReject = async (draftId) => {
    setProcessingDraft(draftId);
    try {
      await rejectDraft(draftId);
      showToast('Draft rejected. 90-day company cooldown applied.');
      setStatus((prev) => ({
        ...prev,
        pendingDrafts: prev.pendingDrafts.filter((d) => d._id !== draftId),
      }));
    } catch {
      showToast('Failed to reject draft', 'error');
    } finally {
      setProcessingDraft(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
          ${toastType === 'error' ? 'bg-red-500 text-white' : 'bg-[var(--color-accent)] text-white'}`}>
          {toast}
        </div>
      )}

      <Topbar user={user} />

      <div className="relative flex-1 flex">
        <div className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 z-20 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
          <Sidebar activeSection="agent" unreadCount={unreadCount} />
        </div>

        <main className="flex-1 lg:ml-64 pt-14 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-gradient-to-r from-[var(--color-accent)]/10 to-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2.5 text-[var(--color-text-primary)]">
                  <FaRobot className="text-[var(--color-accent)]" />
                  AI Auto-Apply Agent
                </h1>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                  {status?.isEnabled
                    ? `🟢 Agent is active in ${status?.mode === 'auto' ? 'Auto Apply' : 'Draft'} Mode`
                    : '⚪ Agent is paused. Activate it to start finding jobs.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunNow}
                  disabled={running || !status?.isEnabled}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] text-sm font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-40"
                >
                  {running ? <FaSpinner className="animate-spin" /> : <FaBolt />}
                  {status?.mode === 'auto' ? 'Run Sweep' : 'Scan Now'}
                </button>
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className={`text-5xl transition-colors ${toggling ? 'opacity-50' : ''} ${status?.isEnabled ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  {status?.isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: Health + Preferences */}
              <div className="lg:col-span-1 space-y-5">
                <ProfileHealthGate health={status?.profileHealth} />
                <PreferencesForm
                  prefs={status?.preferences}
                  onSave={handleSavePrefs}
                  saving={savingPrefs}
                />
              </div>

              {/* Right: Drafts + Log */}
              <div className="lg:col-span-2 space-y-5">

                {/* Last Run Log */}
                <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)] pb-3">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Last Run Log</h3>
                    {lastRunLog?.length > 0 && (
                      <span className="bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold">
                        {lastRunLog.length} Entries
                      </span>
                    )}
                  </div>

                  {lastRunSummary && (
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">{lastRunSummary}</p>
                  )}

                  {lastRunLog?.length > 0 ? (
                    <div className="space-y-3">
                      {lastRunLog.map((entry, index) => (
                        <RunLogEntry key={`${entry.timestamp || index}-${index}`} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-[var(--color-text-secondary)]">No run log yet</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        Click "Scan Now" or "Run Sweep" to see per-job decisions here
                      </p>
                    </div>
                  )}
                </div>

                {/* Awaiting Approval */}
                <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                  <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)] pb-3">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">Awaiting Your Approval</h3>
                    {status?.pendingDrafts?.length > 0 && (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold">
                        {status.pendingDrafts.length} Pending
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-24 rounded-lg" />
                      <Skeleton className="h-24 rounded-lg" />
                    </div>
                  ) : status?.pendingDrafts?.length > 0 ? (
                    <div className="space-y-3">
                      {status.pendingDrafts.map((draft) => (
                        <DraftCard
                          key={draft._id}
                          draft={draft}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          processing={processingDraft}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FaRobot className="text-4xl text-[var(--color-text-tertiary)] mb-3" />
                      <p className="text-sm font-medium text-[var(--color-text-secondary)]">No drafts waiting for review</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                        {status?.isEnabled
                          ? status?.mode === 'auto'
                            ? 'The agent will apply matching jobs automatically as it scans'
                            : 'Click "Scan Now" to find matches'
                          : 'Activate the agent to start receiving drafts'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Activity Log */}
                <div className="bg-[var(--color-surface)] p-5 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border)] pb-3">Activity Log</h3>

                  {loading ? (
                    <div className="space-y-5">
                      <Skeleton className="h-12 rounded" />
                      <Skeleton className="h-12 rounded" />
                      <Skeleton className="h-12 rounded" />
                    </div>
                  ) : status?.activityLog?.length > 0 ? (
                    <div className="space-y-5">
                      {status.activityLog.map((entry, i) => (
                        <ActivityLogEntry key={i} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-[var(--color-text-secondary)]">No activity yet</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">The agent's actions will appear here</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
