import { apiFetch, getAuthToken } from './api'

function authHeaders() {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function createStudyPlan(payload) {
  return apiFetch('/api/study-plans', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export async function getStudyPlans(userId) {
  const query = userId ? `?user=${encodeURIComponent(userId)}` : ''
  return apiFetch(`/api/study-plans${query}`, {
    method: 'GET',
    headers: authHeaders(),
  })
}

export async function getStudyPlanById(id) {
  return apiFetch(`/api/study-plans/${id}`, {
    method: 'GET',
    headers: authHeaders(),
  })
}

export async function deleteStudyPlanById(id) {
  return apiFetch(`/api/study-plans/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}
