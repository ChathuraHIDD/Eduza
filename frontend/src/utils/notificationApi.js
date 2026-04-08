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

export async function deleteNotification(id) {
  return apiFetch(`/api/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export async function clearAllNotifications() {
  return apiFetch('/api/notifications', {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
