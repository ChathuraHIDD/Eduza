import { apiFetch, getAuthToken } from "./api";

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeAssessment = (item) => ({
  ...item,
  id: String(item?._id || item?.id || ""),
});

const normalizeAttempt = (item) => ({
  ...item,
  id: String(item?._id || item?.id || ""),
  quizId: String(item?.quizId || item?.assessmentId || ""),
});

export async function listProgressAssessments(type) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const data = await apiFetch(`/api/progress-assessments${query}`, {
    method: "GET",
    headers: authHeaders(),
  });

  return Array.isArray(data) ? data.map(normalizeAssessment) : [];
}

export async function createProgressAssessment(payload) {
  const data = await apiFetch("/api/progress-assessments", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return normalizeAssessment(data || {});
}

export async function updateProgressAssessment(id, payload) {
  const data = await apiFetch(`/api/progress-assessments/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return normalizeAssessment(data || {});
}

export async function deleteProgressAssessment(id) {
  return apiFetch(`/api/progress-assessments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function listProgressAttempts() {
  const data = await apiFetch("/api/progress-assessments/attempts", {
    method: "GET",
    headers: authHeaders(),
  });

  return Array.isArray(data) ? data.map(normalizeAttempt) : [];
}

export async function createProgressAttempt(payload) {
  const data = await apiFetch("/api/progress-assessments/attempts", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return normalizeAttempt(data || {});
}

export async function updateProgressAttempt(id, payload) {
  const data = await apiFetch(`/api/progress-assessments/attempts/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return normalizeAttempt(data || {});
}
