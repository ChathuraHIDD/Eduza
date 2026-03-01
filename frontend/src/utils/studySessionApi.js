import { apiFetch } from "./api";

// Start stopwatch session
export function startStudySession(payload) {
  // payload: { user, moduleName, sessionType?, studyPlanId?, moduleId?, notes? }
  return apiFetch("/api/study-sessions/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Stop stopwatch session + optionally create progress log
export function stopStudySession(sessionId, payload) {
  // payload: { progressPercent?, createProgressLog? }
  return apiFetch(`/api/study-sessions/stop/${sessionId}`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
}

// Get sessions (history)
export function getStudySessions(query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/api/study-sessions${qs ? `?${qs}` : ""}`);
}

// Create progress log manually if you want
export function createProgressLog(payload) {
  // payload: { user, moduleName, progressPercent, source?, studyPlanId?, moduleId? }
  return apiFetch("/api/progress-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Read progress logs
export function getProgressLogs(query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/api/progress-logs${qs ? `?${qs}` : ""}`);
}