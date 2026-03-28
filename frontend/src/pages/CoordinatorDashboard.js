import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CoordinatorDashboard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isGuardian = user?.role === 'guardian'

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError('Please enter student email')
      return
    }
    setError('')
    navigate(`/guardian/stress-result?email=${encodeURIComponent(trimmed)}`)
  }

  if (!isGuardian) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f5f5f5', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#888' }}>Only guardians can use student stress search.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1008 100%)',
          border: '1px solid #2a2010',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ color: '#f97316', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
          Guardian Portal
        </div>
        <h1 style={{ color: '#f5f5f5', margin: 0, fontSize: 28 }}>Search Student Stress Profile</h1>
        <p style={{ color: '#9ca3af', margin: '8px 0 0' }}>
          Enter student email and continue to the stress-level bar chart page.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#151515',
          border: '1px solid #232323',
          borderRadius: 14,
          padding: '1.25rem',
        }}
      >
        <label style={{ display: 'block', color: '#d1d5db', marginBottom: 8, fontSize: 13 }}>
          Student Email
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@email.com"
            style={{
              flex: 1,
              padding: '0.75rem 0.9rem',
              background: '#101010',
              color: '#f5f5f5',
              border: '1px solid #303030',
              borderRadius: 8,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1rem',
              background: '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            View Chart
          </button>
        </div>
        {error ? <p style={{ color: '#ef4444', marginTop: 10, marginBottom: 0 }}>{error}</p> : null}
      </form>
    </div>
  )
}

export default CoordinatorDashboard
