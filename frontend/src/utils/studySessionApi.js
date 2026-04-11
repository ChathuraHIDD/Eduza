import { apiFetch } from "./api";

function authHeaders() {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Start stopwatch session
export function startStudySession(payload) {
  // payload: { user, moduleName, sessionType?, studyPlanId?, moduleId?, notes? }
  return apiFetch("/api/study-sessions/start", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// Stop stopwatch session + optionally create progress log
export function stopStudySession(sessionId, payload) {
  // payload: { progressPercent?, createProgressLog? }
  return apiFetch(`/api/study-sessions/stop/${sessionId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload || {}),
  });
}

export function pauseStudySession(sessionId) {
  return apiFetch(`/api/study-sessions/pause/${sessionId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
}

export function resumeStudySession(sessionId) {
  return apiFetch(`/api/study-sessions/resume/${sessionId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
}

// Get sessions (history)
export function getStudySessions(query = {}) {
  const qs = new URLSearchParams(query).toString();
  return apiFetch(`/api/study-sessions${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
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