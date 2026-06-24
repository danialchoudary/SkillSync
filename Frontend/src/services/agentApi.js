import api from './api';

export function getAgentStatus() {
  return api.get('/agent/status').then((r) => r.data);
}

export function updateAgentPreferences(prefs) {
  return api.patch('/agent/preferences', prefs).then((r) => r.data);
}

export function triggerAgentRun() {
  return api.post('/agent/run').then((r) => r.data);
}

export function approveDraft(draftId) {
  return api.post(`/agent/drafts/${draftId}/approve`).then((r) => r.data);
}

export function rejectDraft(draftId) {
  return api.post(`/agent/drafts/${draftId}/reject`).then((r) => r.data);
}
