// ── Module API utility ────────────────────────────────────────────────────
// Base URL matches the backend Express server
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const BASE = `${API_BASE}/api/modules`

const getToken = () => localStorage.getItem('token') || ''

const authHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const parseResponse = async (res) => {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text
  }
}

// GET all modules (optional filters)
export async function fetchModules(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}${qs ? '?' + qs : ''}`, {
    headers: authHeaders(),
  })
  const data = await parseResponse(res)
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch modules')
  return data
}

// GET approved and active modules for lecturer browsing (with optional filters)
export async function fetchAvailableModules(params = {}) {
  const query = {
    approvalStatus: 'approved',
    status: 'active',
    ...params,
  }
  return fetchModules(query)
}

// GET single module by MongoDB id
export async function fetchModuleById(id) {
  const res = await fetch(`${BASE}/${id}`, {
    headers: authHeaders(),
  })
  const data = await parseResponse(res)
  if (!res.ok) throw new Error(data?.message || 'Module not found')
  return data
}

// GET single module by code (e.g. CS401)
export async function fetchModuleByCode(code) {
  const res = await fetch(`${BASE}/code/${encodeURIComponent(code)}`, {
    headers: authHeaders(),
  })
  const data = await parseResponse(res)
  if (!res.ok) throw new Error(data?.message || 'Module not found')
  return data
}

// POST create a new module
export async function createModule(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  const json = await parseResponse(res)
  if (!res.ok) throw new Error(json.message || 'Failed to create module')
  return json
}

// POST upload weekly lecture PDF and get stored file URL metadata
export async function uploadWeeklyModulePdf(file, weekNumber) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('weekNumber', String(weekNumber))

  const res = await fetch(`${BASE}/upload-week-pdf`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  const json = await parseResponse(res)
  if (!res.ok) throw new Error(json?.message || 'Failed to upload weekly PDF')
  return json
}

// PUT update a module by id
export async function updateModule(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  const json = await parseResponse(res)
  if (!res.ok) throw new Error(json.message || 'Failed to update module')
  return json
}

// PATCH update approval status (admin use)
export async function updateModuleApproval(id, approvalStatus, adminNote = '') {
  const res = await fetch(`${BASE}/${id}/approval`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ approvalStatus, adminNote }),
  })
  const json = await parseResponse(res)
  if (!res.ok) throw new Error(json.message || 'Failed to update approval')
  return json
}

// DELETE a module by id
export async function deleteModule(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await parseResponse(res)
  if (!res.ok) throw new Error(json.message || 'Failed to delete module')
  return json
}
