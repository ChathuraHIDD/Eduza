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
