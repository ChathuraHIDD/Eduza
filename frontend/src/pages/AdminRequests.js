import { useEffect, useMemo, useState } from 'react'
import { getAllProfileRequests, updateProfileRequestStatus } from '../utils/profileRequestApi'

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

function AdminRequests() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllProfileRequests()
      setRequests(data?.requests || [])
    } catch (err) {
      setError(err.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return requests.filter((r) => {
      const matchesStatus = filter === 'all' ? true : r.status === filter
      const createdAt = new Date(r.createdAt)
      const matchesStart = startDate ? createdAt >= new Date(`${startDate}T00:00:00`) : true
      const matchesEnd = endDate ? createdAt <= new Date(`${endDate}T23:59:59`) : true
      const haystack = [r.lecturerName, r.lecturerEmail, r.requestType, r.detail, r.adminNote]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = q ? haystack.includes(q) : true
      return matchesStatus && matchesQuery && matchesStart && matchesEnd
    })
  }, [requests, filter, query, startDate, endDate])

  const toCsvValue = (value) => {
    const str = value == null ? '' : String(value)
    return `"${str.replace(/"/g, '""')}"`
  }

  const exportCsv = () => {
    if (visible.length === 0) {
      alert('No records to export for the current filters.')
      return
    }

    const headers = [
      'Request ID',
      'Lecturer Name',
      'Lecturer Email',
      'Request Type',
      'Status',
      'Detail',
      'Admin Note',
      'Submitted At',
      'Reviewed At',
    ]

    const rows = visible.map((r) => [
      r._id,
      r.lecturerName,
      r.lecturerEmail,
      r.requestType,
      r.status,
      r.detail,
      r.adminNote || '',
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
      r.approvedAt ? new Date(r.approvedAt).toISOString() : '',
    ])

    const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const datePart = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `admin-requests-${datePart}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests])

  const onDecide = async (status) => {
    if (!selected) return
    try {
      setProcessing(true)
      await updateProfileRequestStatus(selected._id, status, adminNote || '', user?.id || user?._id || null)
      setSelected(null)
      setAdminNote('')
      await loadRequests()
    } catch (err) {
      alert(err.message || `Failed to ${status} request`)
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
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Audit</div>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 26, fontWeight: 800 }}>All Requests History</h1>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          Audit pending, approved, and rejected requests from the database.
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
          placeholder="Search by lecturer, type, details..."
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
          onClick={loadRequests}
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
        Showing {visible.length} request{visible.length !== 1 ? 's' : ''} for the current filters.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        <div style={{
          ...cardStyle,
          padding: '0.75rem',
          minHeight: 420,
        }}>
          {loading ? (
            <div style={{ color: '#9ca3af', padding: '1rem', fontSize: 13 }}>Loading requests...</div>
          ) : visible.length === 0 ? (
            <div style={{ color: '#9ca3af', padding: '1rem', fontSize: 13 }}>No requests found for this filter.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {visible.map((r) => (
                <button
                  key={r._id}
                  onClick={() => {
                    setSelected(r)
                    setAdminNote(r.adminNote || '')
                  }}
                  style={{
                    background: selected?._id === r._id ? '#fff7ed' : '#f8faff',
                    border: selected?._id === r._id ? '1px solid #f97316' : '1.5px solid #e8ecf4',
                    borderRadius: 10,
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700 }}>{r.lecturerName}</div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 5 }}>{r.requestType}</div>
                  <div style={{ color: '#374151', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.detail}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 7 }}>{new Date(r.createdAt).toLocaleString()}</div>
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
            <h3 style={{ margin: '0 0 10px', color: '#1a1a2e', fontSize: 18 }}>Request Details</h3>
            <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>{selected.lecturerEmail}</div>
            <div style={{ marginBottom: 12 }}><StatusBadge status={selected.status} /></div>

            <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Detail</div>
            <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{selected.detail}</div>

            {selected.changes && Object.keys(selected.changes).length > 0 && (
              <>
                <div style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Changes</div>
                <div style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 12,
                }}>
                  {Object.entries(selected.changes).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: '1px solid #e8ecf4' }}>
                      <span style={{ color: '#9ca3af', fontSize: 12, textTransform: 'capitalize' }}>{k}</span>
                      <span style={{ color: '#374151', fontSize: 12, textAlign: 'right' }}>{String(v)}</span>
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
                disabled={processing || selected.status === 'approved'}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '9px 14px',
                  fontWeight: 700,
                  cursor: processing || selected.status === 'approved' ? 'not-allowed' : 'pointer',
                  opacity: processing || selected.status === 'approved' ? 0.6 : 1,
                }}
              >
                Approve
              </button>
              <button
                onClick={() => onDecide('rejected')}
                disabled={processing || selected.status === 'rejected'}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '9px 14px',
                  fontWeight: 700,
                  cursor: processing || selected.status === 'rejected' ? 'not-allowed' : 'pointer',
                  opacity: processing || selected.status === 'rejected' ? 0.6 : 1,
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

export default AdminRequests