import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getGuardianStudentStress } from '../utils/stressHubApi'

const PALETTE = {
  pageBg: '#f3f6fb',
  cardBg: '#ffffff',
  cardBorder: '#d8e0ea',
  title: '#1f2a37',
  muted: '#5b6b7d',
  track: '#e6edf5',
  link: '#275dad',
}

const BAR_COLORS = {
  RED: '#c62828',
  ORANGE: '#ef6c00',
  YELLOW: '#d9a300',
  GREEN: '#2e7d32',
  BLUE: '#1565c0',
}

function GuardianStressResult() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isGuardian = user?.role === 'guardian'
  const email = new URLSearchParams(location.search).get('email') || ''

  useEffect(() => {
    const load = async () => {
      if (!email) {
        setError('Student email is missing')
        setLoading(false)
        return
      }
      try {
        setError('')
        const data = await getGuardianStudentStress(email)
        setResult(data)
      } catch (err) {
        setError(err.message || 'Failed to load stress data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [email])

  if (!isGuardian) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f5f5f5', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#888' }}>Only guardians can view this page.</p>
      </div>
    )
  }

  const bars = result?.stressLevelBars || []
  const maxValue = Math.max(1, ...bars.map((item) => item.value || 0))
  const marks = result?.marks || { average: 0, modulesCount: 0, modules: [] }
  const maxMarksValue = Math.max(1, ...(marks.modules || []).map((item) => Number(item.latestMark || 0)))

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem', background: PALETTE.pageBg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, color: PALETTE.title, fontSize: 28 }}>Student Stress Level Chart</h1>
        <Link to="/coordinator" style={{ color: PALETTE.link, textDecoration: 'none', fontWeight: 700 }}>
          Back to Search
        </Link>
      </div>

      {loading ? (
        <div style={{ background: PALETTE.cardBg, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: 14, padding: '1.25rem', color: PALETTE.muted }}>
          Loading chart...
        </div>
      ) : null}

      {!loading && error ? (
        <div style={{ background: '#2a1111', border: '1px solid #7f1d1d', borderRadius: 14, padding: '1.25rem', color: '#fca5a5' }}>
          {error}
        </div>
      ) : null}

      {!loading && !error && result ? (
        <>
          <div
            style={{
              background: PALETTE.cardBg,
              border: `1px solid ${PALETTE.cardBorder}`,
              borderRadius: 14,
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ color: PALETTE.muted, fontSize: 13 }}>Student</div>
            <div style={{ color: PALETTE.title, fontSize: 20, fontWeight: 700 }}>{result.student?.name || '-'}</div>
            <div style={{ color: PALETTE.muted, fontSize: 14 }}>{result.student?.email || '-'}</div>
          </div>

          <div style={{ background: PALETTE.cardBg, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: 14, padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0, color: PALETTE.title, fontSize: 18 }}>Stress Level Bar Chart</h2>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {bars.map((item) => {
                const color = BAR_COLORS[item.key] || '#9ca3af'
                const widthPercent = Math.round(((item.value || 0) / maxValue) * 100)
                return (
                  <div key={item.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: PALETTE.muted }}>{item.label}</span>
                      <span style={{ color: PALETTE.title, fontWeight: 700 }}>{item.value}</span>
                    </div>
                    <div style={{ background: PALETTE.track, borderRadius: 999, overflow: 'hidden', height: 16 }}>
                      <div
                        style={{
                          width: `${widthPercent}%`,
                          background: color,
                          height: '100%',
                          transition: 'width 400ms ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ background: PALETTE.cardBg, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: 14, padding: '1.25rem', marginTop: '1rem' }}>
            <h2 style={{ marginTop: 0, color: PALETTE.title, fontSize: 18 }}>Student Marks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8fbff', border: `1px solid ${PALETTE.cardBorder}`, borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: PALETTE.muted, fontSize: 12 }}>Average Mark</div>
                <div style={{ color: PALETTE.title, fontSize: 24, fontWeight: 700 }}>{marks.average}%</div>
              </div>
              <div style={{ background: '#f8fbff', border: `1px solid ${PALETTE.cardBorder}`, borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: PALETTE.muted, fontSize: 12 }}>Modules Tracked</div>
                <div style={{ color: PALETTE.title, fontSize: 24, fontWeight: 700 }}>{marks.modulesCount}</div>
              </div>
            </div>

            {marks.modules && marks.modules.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                {marks.modules.map((item) => (
                  <div key={item.moduleName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: PALETTE.muted }}>{item.moduleName}</span>
                      <span style={{ color: PALETTE.title, fontWeight: 700 }}>{item.latestMark}%</span>
                    </div>
                    <div style={{ background: PALETTE.track, borderRadius: 999, overflow: 'hidden', height: 14 }}>
                      <div
                        style={{
                          width: `${Math.round((Number(item.latestMark || 0) / maxMarksValue) * 100)}%`,
                          background: '#275dad',
                          height: '100%',
                          transition: 'width 400ms ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: PALETTE.muted, marginBottom: 0 }}>No marks data found for this student.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default GuardianStressResult
