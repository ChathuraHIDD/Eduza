import { apiFetch, getAuthToken } from './api'

function authHeaders() {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function getNotifications() {
  return apiFetch('/api/notifications', {
    method: 'GET',
    headers: authHeaders(),
  })
}

export async function createNotification(payload) {
  return apiFetch('/api/notifications', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export async function markNotificationRead(id) {
  return apiFetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
}
