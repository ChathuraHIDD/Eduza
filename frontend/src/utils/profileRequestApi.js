import { getAuthToken, apiFetch } from "./api";

// Submit profile update request
export async function submitProfileUpdateRequest(payload) {
  const token = getAuthToken();
  return apiFetch("/api/profile-requests", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// Get pending requests (admin only)
export async function getPendingProfileRequests() {
  const token = getAuthToken();
  return apiFetch("/api/profile-requests/pending", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Get all requests (admin only)
export async function getAllProfileRequests() {
  const token = getAuthToken();
  return apiFetch("/api/profile-requests/all", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Get requests by lecturer
export async function getProfileRequestsByLecturer(lecturerId) {
  const token = getAuthToken();
  return apiFetch(`/api/profile-requests/lecturer/${lecturerId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Get single request
export async function getProfileRequestById(id) {
  const token = getAuthToken();
  return apiFetch(`/api/profile-requests/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Update request status (approve/reject)
export async function updateProfileRequestStatus(id, status, adminNote = "", approvedBy = null) {
  const token = getAuthToken();
  return apiFetch(`/api/profile-requests/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, adminNote, approvedBy }),
  });
}
