import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPendingProfileRequests, updateProfileRequestStatus } from '../utils/profileRequestApi'

const cardStyle = {
  background: '#ffffff',
  border: '1.5px solid #e8ecf4',
  borderRadius: 14,
  padding: '1.25rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin'

  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // Fetch pending requests on component mount
  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPendingProfileRequests()
      setPendingRequests(data.requests || [])
    } catch (err) {
      setError('Failed to load pending requests')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      setProcessing(true)
      const adminId = user._id || user.id
      await updateProfileRequestStatus(requestId, 'approved', adminNote, adminId)
      setPendingRequests(prev => prev.filter(r => r._id !== requestId))
      setSelectedRequest(null)
      setAdminNote('')
      alert('Request approved successfully!')
    } catch (err) {
      alert('Failed to approve request: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (requestId) => {
    try {
      setProcessing(true)
      const adminId = user._id || user.id
      await updateProfileRequestStatus(requestId, 'rejected', adminNote, adminId)
      setPendingRequests(prev => prev.filter(r => r._id !== requestId))
      setSelectedRequest(null)
      setAdminNote('')
      alert('Request rejected successfully!')
    } catch (err) {
      alert('Failed to reject request: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const stats = [
    { label: 'Pending Requests', value: pendingRequests.length.toString(), icon: '⏳', note: 'Awaiting approval' },
    { label: 'Total Users', value: '1,284', icon: '👥', note: '+24 this month' },
    { label: 'Lecturers', value: '48', icon: '🎓', note: 'Active staff' },
    { label: 'System Health', value: '99%', icon: '🛡️', note: 'Stable' },
  ]

  const recent = [
    'New lecturer account created',
    'Coordinator role assigned',
    'Support ticket escalated',
    'System backup completed',
  ]

  const actions = [
    'Manage users',
    'Assign roles',
    'Review reports',
    'Monitor platform status',
  ]

  if (selectedRequest) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <button 
          onClick={() => { setSelectedRequest(null); setAdminNote('') }}
          style={{
            background: '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          ← Back to Requests
        </button>

        <div style={{
          ...cardStyle,
          borderRadius: 14,
          padding: '1.75rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem', color: '#1a1a2e', fontSize: 22 }}>Review Profile Update Request</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Lecturer Name</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{selectedRequest.lecturerName}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Email</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{selectedRequest.lecturerEmail}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Request Type</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{selectedRequest.requestType}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Submitted At</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Request Details</div>
            <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>{selectedRequest.detail}</div>
          </div>

          {selectedRequest.changes && Object.keys(selectedRequest.changes).length > 0 && (
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Changes Made</div>
              <div style={{ color: '#374151', fontSize: 14 }}>
                {Object.entries(selectedRequest.changes).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #e8ecf4' }}>
                    <strong>{key}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Admin Note (Optional)</label>
            <textarea 
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Add a note for the lecturer..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #e8ecf4',
                background: '#f8faff',
                color: '#1a1a2e',
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '100px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => handleApprove(selectedRequest._id)}
              disabled={processing}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 13,
                opacity: processing ? 0.6 : 1,
              }}
            >
              ✅ Approve
            </button>
            <button 
              onClick={() => handleReject(selectedRequest._id)}
              disabled={processing}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 13,
                opacity: processing ? 0.6 : 1,
              }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
          borderRadius: 18,
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
        }}
      >
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Admin Dashboard
        </div>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 28, fontWeight: 800 }}>
          Hello, {firstName} 👋
        </h1>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
          Oversee users, permissions, profile requests, and system administration.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              ...cardStyle,
              borderRadius: 14,
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#9ca3af', fontSize: 13 }}>{item.label}</span>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
            </div>
            <div style={{ color: '#1a1a2e', fontSize: 30, fontWeight: 800 }}>{item.value}</div>
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>{item.note}</div>
          </div>
        ))}
      </div>

      {/* Pending Profile Requests Section */}
      <div style={{
        ...cardStyle,
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: 18 }}>
            📋 Pending Profile Update Requests ({pendingRequests.length})
          </h3>
          <Link
            to="/admin/requests"
            style={{
              color: '#f97316',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid rgba(249,115,22,0.35)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            View Full History
          </Link>
        </div>
        
        {loading && <div style={{ color: '#9ca3af' }}>Loading requests...</div>}
        {error && <div style={{ color: '#ef4444' }}>{error}</div>}
        
        {!loading && pendingRequests.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 40, marginBottom: '0.5rem' }}>✅</div>
            <p>No pending requests. All lecturer profiles are up to date!</p>
          </div>
        )}

        {!loading && pendingRequests.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                onClick={() => setSelectedRequest(req)}
                style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 12,
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.border = '1.5px solid rgba(249,115,22,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8faff'
                  e.currentTarget.style.border = '1.5px solid #e8ecf4'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ color: '#f97316', fontSize: 14, fontWeight: 700 }}>{req.lecturerName}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{req.lecturerEmail}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: 'rgba(249, 115, 22, 0.2)',
                    color: '#f97316',
                  }}>
                    ⏳ {req.requestType}
                  </span>
                </div>
                <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5, marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.detail}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: '0.5rem' }}>
                  {new Date(req.createdAt).toLocaleString()}
                </div>
                <button 
                  style={{
                    background: '#f97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    marginTop: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  Review Request →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div
          style={{
            ...cardStyle,
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#1a1a2e' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recent.map((item) => (
              <div
                key={item}
                style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 10,
                  padding: '0.95rem 1rem',
                  color: '#374151',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            borderRadius: 14,
            padding: '1.25rem',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#1a1a2e' }}>Admin Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {actions.map((item) => (
              <div
                key={item}
                style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 12,
                  padding: '1rem',
                  color: '#374151',
                  fontWeight: 600,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard