import { useEffect, useMemo, useState } from 'react'
import { fetchModules, updateModuleApproval } from '../utils/moduleApi'

const cardStyle = {
  background: '#ffffff',
  border: '1.5px solid #e8ecf4',
  borderRadius: 14,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}

const FILTERS = ['all', 'pending', 'approved', 'rejected']

function StatusBadge({ status }) {
  const cfg = {
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)', label: 'Pending' },
    approved: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', border: 'rgba(34,197,94,0.3)', label: 'Approved' },
    rejected: { bg: 'rgba(239,68,68,0.10)', color: '#dc2626', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
  }
  const c = cfg[status] || cfg.pending

  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 999,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  )
}

function AdminModuleRequests() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

  const loadModules = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchModules({ limit: 500 })
      setModules(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load module requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return modules.filter((m) => {
      const approvalStatus = m.approvalStatus || 'pending'
      const matchesStatus = filter === 'all' ? true : approvalStatus === filter
      const createdAt = new Date(m.createdAt)
      const matchesStart = startDate ? createdAt >= new Date(`${startDate}T00:00:00`) : true
      const matchesEnd = endDate ? createdAt <= new Date(`${endDate}T23:59:59`) : true
      const haystack = [
        m.code,
        m.name,
        m.department,
        m.semester,
        m.academicYear,
        m.lecturerName,
        m.lecturerEmail,
        m.description,
        m.adminNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = q ? haystack.includes(q) : true
      return matchesStatus && matchesQuery && matchesStart && matchesEnd
    })
  }, [modules, filter, query, startDate, endDate])

  const toCsvValue = (value) => {
    const str = value == null ? '' : String(value)
    return `"${str.replace(/"/g, '""')}"`
  }

  const exportCsv = () => {
    if (visible.length === 0) {
      alert('No module records to export for the current filters.')
      return
    }

    const headers = [
      'Module ID',
      'Module Code',
      'Module Name',
      'Lecturer Name',
      'Lecturer Email',
      'Department',
      'Semester',
      'Academic Year',
      'Approval Status',
      'Module Status',
      'Admin Note',
      'Submitted At',
      'Reviewed At',
    ]

    const rows = visible.map((m) => [
      m._id,
      m.code,
      m.name,
      m.lecturerName,
      m.lecturerEmail,
      m.department,
      m.semester,
      m.academicYear,
      m.approvalStatus || 'pending',
      m.status || 'draft',
      m.adminNote || '',
      m.createdAt ? new Date(m.createdAt).toISOString() : '',
      m.approvalStatus === 'pending' ? '' : (m.updatedAt ? new Date(m.updatedAt).toISOString() : ''),
    ])

    const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const datePart = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `admin-module-requests-${datePart}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const counts = useMemo(() => ({
    all: modules.length,
    pending: modules.filter((m) => (m.approvalStatus || 'pending') === 'pending').length,
    approved: modules.filter((m) => m.approvalStatus === 'approved').length,
    rejected: modules.filter((m) => m.approvalStatus === 'rejected').length,
  }), [modules])

  const onDecide = async (approvalStatus) => {
    if (!selected) return
    try {
      setProcessing(true)
      await updateModuleApproval(selected._id, approvalStatus, adminNote || '')
      setSelected(null)
      setAdminNote('')
      await loadModules()
    } catch (err) {
      alert(err.message || `Failed to ${approvalStatus} module`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        borderRadius: 18,
        padding: '1.5rem 1.75rem',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Module Audit</div>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 26, fontWeight: 800 }}>All Module Requests</h1>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          Audit pending, approved, and rejected module creation requests from the database.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: filter === f ? '1px solid #f97316' : '1.5px solid #e8ecf4',
              borderRadius: 12,
              background: filter === f ? 'rgba(249,115,22,0.12)' : '#ffffff',
              color: filter === f ? '#ea580c' : '#374151',
              padding: '12px 14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{f}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{counts[f]}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, lecturer, department, semester, or details..."
          style={{
            flex: 1,
            borderRadius: 10,
            border: '1.5px solid #e8ecf4',
            background: '#f8faff',
            color: '#1a1a2e',
            padding: '10px 12px',
            outline: 'none',
          }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            borderRadius: 10,
            border: '1.5px solid #e8ecf4',
            background: '#f8faff',
            color: '#1a1a2e',
            padding: '10px 12px',
            outline: 'none',
          }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            borderRadius: 10,
            border: '1.5px solid #e8ecf4',
            background: '#f8faff',
            color: '#1a1a2e',
            padding: '10px 12px',
            outline: 'none',
          }}
        />
        <button
          onClick={exportCsv}
          style={{
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 10,
            background: '#f0fdf4',
            color: '#16a34a',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Export CSV
        </button>
        <button
          onClick={loadModules}
          style={{
            border: '1.5px solid #e8ecf4',
            borderRadius: 10,
            background: '#f8faff',
            color: '#374151',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: '0.75rem',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: '0.75rem' }}>
        Showing {visible.length} module request{visible.length !== 1 ? 's' : ''} for the current filters.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        <div style={{
          ...cardStyle,
          padding: '0.75rem',
          minHeight: 420,
        }}>
          {loading ? (
            <div style={{ color: '#9ca3af', padding: '1rem', fontSize: 13 }}>Loading module requests...</div>
          ) : visible.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: '1rem', fontSize: 13 }}>No module requests found for this filter.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {visible.map((m) => (
                <button
                  key={m._id}
                  onClick={() => {
                    setSelected(m)
                    setAdminNote(m.adminNote || '')
                  }}
                  style={{
                    background: selected?._id === m._id ? '#fff7ed' : '#f8faff',
                    border: selected?._id === m._id ? '1px solid #f97316' : '1.5px solid #e8ecf4',
                    borderRadius: 10,
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700 }}>{m.code} · {m.name}</div>
                    <StatusBadge status={m.approvalStatus || 'pending'} />
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 5 }}>{m.lecturerName} · {m.lecturerEmail}</div>
                  <div style={{ color: '#374151', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.department} · {m.semester} · {m.academicYear}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 7 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div style={{
            ...cardStyle,
            padding: '1rem',
          }}>
            <h3 style={{ margin: '0 0 10px', color: '#1a1a2e', fontSize: 18 }}>Module Request Details</h3>
            <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>{selected.lecturerName} · {selected.lecturerEmail}</div>
            <div style={{ marginBottom: 12 }}><StatusBadge status={selected.approvalStatus || 'pending'} /></div>

            <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Module</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
              {selected.code} — {selected.name}
            </div>

            <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Academic Details</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
              {selected.department} · Faculty {selected.faculty || '-'} · {selected.semester} · {selected.academicYear} · Level {selected.level} · {selected.credits} credits
            </div>

            <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Description</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{selected.description || '-'}</div>

            {Array.isArray(selected.weeklySyllabus) && selected.weeklySyllabus.length > 0 && (
              <>
                <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>12 Week Syllabus</div>
                <div style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 12,
                  maxHeight: 230,
                  overflow: 'auto',
                }}>
                  {selected.weeklySyllabus.map((week) => (
                    <div key={week.weekNumber} style={{ borderBottom: '1px solid #e8ecf4', padding: '8px 0' }}>
                      <div style={{ color: '#f97316', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Week {week.weekNumber}: {week.topic || 'Untitled Topic'}</div>
                      <div style={{ color: '#374151', fontSize: 12, lineHeight: 1.5 }}>{week.instructionText || '-'}</div>
                      {week.pdfFileName && (
                        <div style={{ color: '#6b7280', fontSize: 11, marginTop: 3 }}>
                          PDF: {week.pdfFileUrl
                            ? <a href={`${apiBase}${week.pdfFileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{week.pdfFileName}</a>
                            : week.pdfFileName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <label style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Admin Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1.5px solid #e8ecf4',
                background: '#f8faff',
                color: '#1a1a2e',
                padding: '10px 12px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: 12 }}>
              <button
                onClick={() => onDecide('approved')}
                disabled={processing || selected.approvalStatus === 'approved'}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '9px 14px',
                  fontWeight: 700,
                  cursor: processing || selected.approvalStatus === 'approved' ? 'not-allowed' : 'pointer',
                  opacity: processing || selected.approvalStatus === 'approved' ? 0.6 : 1,
                }}
              >
                Approve
              </button>
              <button
                onClick={() => onDecide('rejected')}
                disabled={processing || selected.approvalStatus === 'rejected'}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '9px 14px',
                  fontWeight: 700,
                  cursor: processing || selected.approvalStatus === 'rejected' ? 'not-allowed' : 'pointer',
                  opacity: processing || selected.approvalStatus === 'rejected' ? 0.6 : 1,
                }}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminModuleRequests