// ── Module API utility ────────────────────────────────────────────────────
// Base URL matches the backend Express server
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/modules'

// GET all modules (optional filters)
export async function fetchModules(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}${qs ? '?' + qs : ''}`)
  if (!res.ok) throw new Error('Failed to fetch modules')
  return res.json()
}

// GET single module by MongoDB id
export async function fetchModuleById(id) {
  const res = await fetch(`${BASE}/${id}`)
  if (!res.ok) throw new Error('Module not found')
  return res.json()
}

// GET single module by code (e.g. CS401)
export async function fetchModuleByCode(code) {
  const res = await fetch(`${BASE}/code/${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error('Module not found')
  return res.json()
}

// POST create a new module
export async function createModule(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to create module')
  return json
}

// PUT update a module by id
export async function updateModule(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update module')
  return json
}

// PATCH update approval status (admin use)
export async function updateModuleApproval(id, approvalStatus, adminNote = '') {
  const res = await fetch(`${BASE}/${id}/approval`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvalStatus, adminNote }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update approval')
  return json
}

// DELETE a module by id
export async function deleteModule(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to delete module')
  return json
}
