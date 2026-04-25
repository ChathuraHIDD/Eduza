import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPendingProfileRequests, updateProfileRequestStatus } from '../utils/profileRequestApi'
import { fetchModules, updateModuleApproval } from '../utils/moduleApi'
import { acknowledgeStressAlert, getStressAdminSummary, getStressAlerts } from '../utils/stressHubApi'
import socket from '../utils/socket'
import { getKuppiConductorApplications, updateKuppiConductorApplicationStatus } from '../utils/kuppiApi'

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
  const [selectedModuleRequest, setSelectedModuleRequest] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [moduleAdminNote, setModuleAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [pendingModuleRequests, setPendingModuleRequests] = useState([])
  const [modulesLoading, setModulesLoading] = useState(true)
  const [modulesError, setModulesError] = useState('')
  const [moduleProcessing, setModuleProcessing] = useState(false)
  const [stressAlerts, setStressAlerts] = useState([])
  const [stressAlertsLoading, setStressAlertsLoading] = useState(true)
  const [stressAlertsError, setStressAlertsError] = useState('')
  const [stressSummary, setStressSummary] = useState(null)
  const [stressSummaryLoading, setStressSummaryLoading] = useState(true)
  const [stressSummaryError, setStressSummaryError] = useState('')
  const [pendingKuppiRequests, setPendingKuppiRequests] = useState([])
  const [kuppiProcessingId, setKuppiProcessingId] = useState('')

  // Fetch pending requests on component mount
  useEffect(() => {
    fetchPendingRequests()
    fetchPendingModuleRequests()
    fetchOpenStressAlerts()
    fetchStressSummary()
    loadPendingKuppiRequests()

    const handleKuppiCreated = (application) => {
      if (application?.status === 'pending') {
        setPendingKuppiRequests((prev) => [application, ...prev.filter((item) => item._id !== application._id)])
      }
    }

    const handleKuppiUpdated = (application) => {
      setPendingKuppiRequests((prev) => {
        const withoutCurrent = prev.filter((item) => item._id !== application?._id)
        return application?.status === 'pending' ? [application, ...withoutCurrent] : withoutCurrent
      })
    }

    socket.on('kuppi_application_created', handleKuppiCreated)
    socket.on('kuppi_application_updated', handleKuppiUpdated)

    return () => {
      socket.off('kuppi_application_created', handleKuppiCreated)
      socket.off('kuppi_application_updated', handleKuppiUpdated)
    }
  }, [])

  const loadPendingKuppiRequests = async () => {
    try {
      const response = await getKuppiConductorApplications('pending')
      setPendingKuppiRequests(response?.data || [])
    } catch (err) {
      console.error('Failed to load pending Kuppi requests', err)
    }
  }

  const fetchStressSummary = async () => {
    try {
      setStressSummaryLoading(true)
      setStressSummaryError('')
      const data = await getStressAdminSummary(30, 12)
      setStressSummary(data)
    } catch (err) {
      setStressSummaryError('Failed to load stress summary')
      console.error(err)
    } finally {
      setStressSummaryLoading(false)
    }
  }

  const fetchOpenStressAlerts = async () => {
    try {
      setStressAlertsLoading(true)
      setStressAlertsError('')
      const data = await getStressAlerts(undefined, 'OPEN')
      setStressAlerts(Array.isArray(data) ? data : [])
    } catch (err) {
      setStressAlertsError('Failed to load stress alerts')
      console.error(err)
    } finally {
      setStressAlertsLoading(false)
    }
  }

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

  const fetchPendingModuleRequests = async () => {
    try {
      setModulesLoading(true)
      setModulesError('')
      const data = await fetchModules({ approvalStatus: 'pending', limit: 200 })
      setPendingModuleRequests(data || [])
    } catch (err) {
      setModulesError('Failed to load pending module requests')
      console.error(err)
    } finally {
      setModulesLoading(false)
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

  const handleModuleApprove = async (moduleId) => {
    try {
      setModuleProcessing(true)
      await updateModuleApproval(moduleId, 'approved', moduleAdminNote)
      setPendingModuleRequests(prev => prev.filter(m => m._id !== moduleId))
      setSelectedModuleRequest(null)
      setModuleAdminNote('')
      alert('Module request approved successfully!')
    } catch (err) {
      alert('Failed to approve module request: ' + err.message)
    } finally {
      setModuleProcessing(false)
    }
  }

  const handleModuleReject = async (moduleId) => {
    try {
      setModuleProcessing(true)
      await updateModuleApproval(moduleId, 'rejected', moduleAdminNote)
      setPendingModuleRequests(prev => prev.filter(m => m._id !== moduleId))
      setSelectedModuleRequest(null)
      setModuleAdminNote('')
      alert('Module request rejected successfully!')
    } catch (err) {
      alert('Failed to reject module request: ' + err.message)
    } finally {
      setModuleProcessing(false)
    }
  }

  const handleKuppiDecision = async (requestId, status) => {
    try {
      setKuppiProcessingId(requestId)
      await updateKuppiConductorApplicationStatus(requestId, status)
      alert(`Kuppi request ${status} successfully!`)
    } catch (err) {
      alert('Failed to update Kuppi request: ' + err.message)
    } finally {
      setKuppiProcessingId('')
    }
  }

  const stats = [
    { label: 'Pending Requests', value: pendingRequests.length.toString(), icon: '⏳', note: 'Awaiting approval' },
    { label: 'Pending Modules', value: pendingModuleRequests.length.toString(), icon: '📚', note: 'New module submissions' },
    { label: 'Open Stress Alerts', value: stressAlerts.length.toString(), icon: '🚨', note: 'Student follow-up needed' },
    { label: 'Total Users', value: '1,284', icon: '👥', note: '+24 this month' },
  ]

  const handleAcknowledgeStressAlert = async (alertId) => {
    try {
      await acknowledgeStressAlert(alertId)
      await fetchOpenStressAlerts()
      alert('Stress alert acknowledged')
    } catch (err) {
      alert('Failed to acknowledge stress alert: ' + err.message)
    }
  }

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

  if (selectedModuleRequest) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <button
          onClick={() => { setSelectedModuleRequest(null); setModuleAdminNote('') }}
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
          ← Back to Module Requests
        </button>

        <div style={{
          ...cardStyle,
          borderRadius: 14,
          padding: '1.75rem',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem', color: '#1a1a2e', fontSize: 22 }}>Review Module Creation Request</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Module Code</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{selectedModuleRequest.code}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Module Name</div>
              <div style={{ color: '#1a1a2e', fontSize: 16, fontWeight: 700 }}>{selectedModuleRequest.name}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Lecturer</div>
              <div style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700 }}>{selectedModuleRequest.lecturerName}</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{selectedModuleRequest.lecturerEmail}</div>
            </div>
            <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Academic Info</div>
              <div style={{ color: '#1a1a2e', fontSize: 14, fontWeight: 700 }}>
                {selectedModuleRequest.department} · {selectedModuleRequest.semester}
              </div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                Year: {selectedModuleRequest.academicYear} · Credits: {selectedModuleRequest.credits}
              </div>
            </div>
          </div>

          <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Description</div>
            <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
              {selectedModuleRequest.description || 'No description provided.'}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Admin Note (Optional)</label>
            <textarea
              value={moduleAdminNote}
              onChange={(e) => setModuleAdminNote(e.target.value)}
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
              onClick={() => handleModuleApprove(selectedModuleRequest._id)}
              disabled={moduleProcessing}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                cursor: moduleProcessing ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 13,
                opacity: moduleProcessing ? 0.6 : 1,
              }}
            >
              ✅ Approve Module
            </button>
            <button
              onClick={() => handleModuleReject(selectedModuleRequest._id)}
              disabled={moduleProcessing}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                cursor: moduleProcessing ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 13,
                opacity: moduleProcessing ? 0.6 : 1,
              }}
            >
              ❌ Reject Module
            </button>
          </div>
        </div>
      </div>
    )
  }

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

      <div style={{
        ...cardStyle,
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: 18 }}>
            Pending Kuppi Conductor Requests ({pendingKuppiRequests.length})
          </h3>
          <Link
            to="/admin/kuppi-details"
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
            View Kuppi Details
          </Link>
        </div>

        {pendingKuppiRequests.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 40, marginBottom: '0.5rem' }}>OK</div>
            <p>No pending Kuppi conductor requests right now.</p>
          </div>
        )}

        {pendingKuppiRequests.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {pendingKuppiRequests.map((request) => (
              <div
                key={request._id}
                style={{
                  background: '#f8faff',
                  border: '1.5px solid #e8ecf4',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem', gap: 10 }}>
                  <div>
                    <div style={{ color: '#f97316', fontSize: 14, fontWeight: 700 }}>{request.fullName}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{request.studentEmail}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: 'rgba(249, 115, 22, 0.2)',
                    color: '#f97316',
                  }}>
                    Pending
                  </span>
                </div>

                <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.6 }}>
                  <div><strong>Subject:</strong> {request.mainSubject}</div>
                  <div><strong>Module:</strong> {request.moduleLikeToDo}</div>
                  <div><strong>Year:</strong> {request.currentStudyYear} · {request.currentSemester}</div>
                  <div><strong>Availability:</strong> {request.availability}</div>
                </div>

                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: '0.75rem' }}>
                  {new Date(request.createdAt).toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem' }}>
                  <button
                    onClick={() => handleKuppiDecision(request._id, 'approved')}
                    disabled={kuppiProcessingId === request._id}
                    style={{
                      border: 'none',
                      borderRadius: 10,
                      background: '#22c55e',
                      color: '#ffffff',
                      padding: '9px 14px',
                      fontWeight: 700,
                      cursor: kuppiProcessingId === request._id ? 'not-allowed' : 'pointer',
                      opacity: kuppiProcessingId === request._id ? 0.6 : 1,
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleKuppiDecision(request._id, 'rejected')}
                    disabled={kuppiProcessingId === request._id}
                    style={{
                      border: 'none',
                      borderRadius: 10,
                      background: '#ef4444',
                      color: '#ffffff',
                      padding: '9px 14px',
                      fontWeight: 700,
                      cursor: kuppiProcessingId === request._id ? 'not-allowed' : 'pointer',
                      opacity: kuppiProcessingId === request._id ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        ...cardStyle,
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: 18 }}>
            🚨 Student High-Stress Alerts ({stressAlerts.length})
          </h3>
        </div>

        {stressAlertsLoading && <div style={{ color: '#9ca3af' }}>Loading stress alerts...</div>}
        {stressAlertsError && <div style={{ color: '#ef4444' }}>{stressAlertsError}</div>}

        {!stressAlertsLoading && stressAlerts.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem' }}>
            No active high-stress alerts right now.
          </div>
        )}

        {!stressAlertsLoading && stressAlerts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {stressAlerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  background: '#fff7f7',
                  border: '1.5px solid #fecaca',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ color: '#b91c1c', fontSize: 14, fontWeight: 800 }}>{alert.title || 'High Stress Detected'}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 16, background: '#fee2e2', color: '#991b1b' }}>
                    {alert.severity || 'HIGH'}
                  </span>
                </div>
                <div style={{ color: '#7f1d1d', fontSize: 13, lineHeight: 1.5 }}>{alert.message}</div>
                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: '0.6rem' }}>
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => handleAcknowledgeStressAlert(alert._id)}
                  style={{
                    marginTop: '0.7rem',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  Acknowledge Alert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        ...cardStyle,
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1a1a2e', fontSize: 18 }}>
          📊 Stress Level Percentages (Last 30 Days)
        </h3>

        {stressSummaryLoading && <div style={{ color: '#9ca3af' }}>Loading stress chart...</div>}
        {stressSummaryError && <div style={{ color: '#ef4444' }}>{stressSummaryError}</div>}

        {!stressSummaryLoading && stressSummary && (
          <>
            <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '1.2rem' }}>
              {[
                { key: 'HIGH', label: 'High', color: '#dc2626' },
                { key: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
                { key: 'LOW', label: 'Low', color: '#16a34a' },
              ].map((item) => {
                const row = stressSummary.levelBreakdown?.[item.key] || { count: 0, percentage: 0 }
                return (
                  <div key={item.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: '#374151', fontWeight: 700 }}>{item.label}</span>
                      <span style={{ color: '#6b7280' }}>{row.percentage}% ({row.count})</span>
                    </div>
                    <div style={{ width: '100%', height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, row.percentage))}%`,
                          height: '100%',
                          background: item.color,
                          transition: 'width 260ms ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Total Submissions</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.totalSubmissions || 0}</div>
              </div>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Average Stress Score</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.averageStressScore || 0}</div>
              </div>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Period</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.periodDays || 30}d</div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 0.75rem', color: '#1f2937', fontSize: 15 }}>Recent Student Stress Submissions</h4>
            {(!stressSummary.recentSubmissions || stressSummary.recentSubmissions.length === 0) && (
              <div style={{ color: '#9ca3af', fontSize: 13 }}>No submissions in this period.</div>
            )}
            {stressSummary.recentSubmissions && stressSummary.recentSubmissions.length > 0 && (
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {stressSummary.recentSubmissions.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '0.7rem 0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ color: '#111827', fontSize: 13, fontWeight: 700 }}>{row.studentName}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.studentEmail || 'No email'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: row.stressLevel === 'HIGH' ? '#dc2626' : row.stressLevel === 'MEDIUM' ? '#b45309' : '#166534' }}>
                          {row.stressLevel}
                        </div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Score: {row.stressScore}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, color: '#6b7280', fontSize: 11 }}>
                      Colors: {(row.selectedColors || []).join(', ') || 'N/A'} • {new Date(row.submittedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
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

      {/* Pending Module Requests Section */}
      <div style={{
        ...cardStyle,
        borderRadius: 14,
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: 18 }}>
            📚 Pending Module Creation Requests ({pendingModuleRequests.length})
          </h3>
          <Link
            to="/admin/module-requests"
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

        {modulesLoading && <div style={{ color: '#9ca3af' }}>Loading module requests...</div>}
        {modulesError && <div style={{ color: '#ef4444' }}>{modulesError}</div>}

        {!modulesLoading && pendingModuleRequests.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: 40, marginBottom: '0.5rem' }}>✅</div>
            <p>No pending module creation requests.</p>
          </div>
        )}

        {!modulesLoading && pendingModuleRequests.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {pendingModuleRequests.map((req) => (
              <div
                key={req._id}
                onClick={() => setSelectedModuleRequest(req)}
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
                    <div style={{ color: '#f97316', fontSize: 14, fontWeight: 700 }}>{req.code} · {req.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{req.lecturerName} · {req.lecturerEmail}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: 'rgba(249, 115, 22, 0.2)',
                    color: '#f97316',
                  }}>
                    ⏳ Pending
                  </span>
                </div>

                <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {req.department} · {req.semester} · {req.academicYear}
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
                  Review Module →
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
