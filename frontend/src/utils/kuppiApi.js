import { apiFetch, getAuthToken } from "./api";

export async function submitKuppiConductorApplication(payload) {
  const token = getAuthToken();

  return apiFetch("/api/kuppi-sessions/conductor/apply", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}

export async function getKuppiConductorApplications(status = "") {
  const token = getAuthToken();
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  return apiFetch(`/api/kuppi-sessions/conductor/applications${query}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function updateKuppiConductorApplicationStatus(id, status) {
  const token = getAuthToken();

  return apiFetch(`/api/kuppi-sessions/conductor/applications/${id}/status`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ status }),
  });
}

export async function createKuppiSession(payload) {
  const token = getAuthToken();

  return apiFetch("/api/kuppi-sessions", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  });
}

export async function getKuppiSessions(filters = {}) {
  const token = getAuthToken();
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      params.append(key, value);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : "";

  return apiFetch(`/api/kuppi-sessions${query}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
