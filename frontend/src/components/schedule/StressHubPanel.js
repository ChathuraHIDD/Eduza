import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  acknowledgeStressAlert,
  createRelaxationSession,
  createStressLog,
  getStressAlerts,
  getStressDashboard,
  getStressHubConfig,
} from '../../utils/stressHubApi'

const COLOR_SWATCHES = {
  BLUE: '#3b82f6',
  RED: '#ef4444',
  YELLOW: '#facc15',
  GREEN: '#22c55e',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  WHITE: '#f8fafc',
}

const trendChartPath = (points, width, height, padding = 20) => {
  if (points.length === 0) return ''
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)

  return points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1 || 1)) * (width - padding * 2)
      const normalized = (point.value - min) / range
      const y = height - padding - normalized * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

const formatScoreLabel = (score) => `${Math.round(score)} / 100`

function StressHubPanel() {
  const [config, setConfig] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [recentActivitiesInput, setRecentActivitiesInput] = useState('')
  const [notes, setNotes] = useState('')
  const [studentId, setStudentId] = useState('')
  const [periodDays, setPeriodDays] = useState(14)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  const [activityType, setActivityType] = useState('BREATHING')
  const [durationMinutes, setDurationMinutes] = useState(5)
  const [completed, setCompleted] = useState(true)

  const chartPoints = useMemo(() => {
    if (!dashboard?.stressTrends) return []
    return dashboard.stressTrends.map((trend) => ({
      label: trend.day,
      value: trend.averageStressScore,
    }))
  }, [dashboard])

  const loadData = useCallback(async (id = studentId, days = periodDays) => {
    try {
      setError('')
      const [configData, dashboardData, alertsData] = await Promise.all([
        getStressHubConfig(),
        getStressDashboard(id || undefined, days),
        getStressAlerts(id || undefined, 'OPEN'),
      ])
      setConfig(configData)
      setDashboard(dashboardData)
      setAlerts(alertsData)
    } catch (err) {
      setError(err.message || 'Failed to load stress hub data')
    }
  }, [periodDays, studentId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const toggleColor = (colorKey) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorKey)) {
        return prev.filter((color) => color !== colorKey)
      }
      if (prev.length >= 5) return prev
      return [...prev, colorKey]
    })
  }

  const handleStressSubmit = async () => {
    try {
      setStatusMessage('')
      setError('')

      const recentActivities = recentActivitiesInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      const payload = {
        studentId: studentId || undefined,
        selectedColors,
        recentActivities,
        notes: notes || undefined,
      }

      const response = await createStressLog(payload)
      setStatusMessage(
        `Logged stress level: ${response.stressLog.stressLevel} (${formatScoreLabel(
          response.stressLog.stressScore
        )})`
      )
      setSelectedColors([])
      setRecentActivitiesInput('')
      setNotes('')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to save stress log')
    }
  }

  const handleRelaxationSubmit = async () => {
    try {
      setStatusMessage('')
      setError('')

      const payload = {
        studentId: studentId || undefined,
        activityType,
        durationMinutes: Number(durationMinutes),
        completed,
      }

      await createRelaxationSession(payload)
      setStatusMessage('Relaxation session logged. Great job!')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to log relaxation session')
    }
  }

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeStressAlert(alertId)
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to acknowledge alert')
    }
  }

  const colorKeys = Object.keys(COLOR_SWATCHES)

  return (
    <section style={{ marginTop: '3rem', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
      <div
        style={{
          borderRadius: 20,
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(3,7,18,0.95) 0%, rgba(15,23,42,0.88) 60%, rgba(30,41,59,0.85) 100%)',
          border: '1px solid rgba(148,163,184,0.2)',
          boxShadow: '0 20px 45px rgba(15,23,42,0.55)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>
              Stress Management Hub
            </p>
            <h3 style={{ margin: '0.35rem 0 0.5rem', fontSize: 28, fontWeight: 800, color: '#f8fafc' }}>
              Check in. Reset. Build calmer momentum.
            </h3>
            <p style={{ margin: 0, color: '#cbd5f5', maxWidth: 520, lineHeight: 1.6, fontSize: 14 }}>
              Select your stress colors, capture recent activities, and unlock calming tools with real-time wellness insights.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              placeholder="Student ID (optional)"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.35)',
                color: '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: 12,
                fontSize: 12,
                width: 180,
              }}
            />
            <button
              onClick={() => loadData()}
              style={{
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f97316, #facc15)',
                border: 'none',
                color: '#0f172a',
                fontWeight: 700,
                padding: '0.65rem 1rem',
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        {(error || statusMessage) && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 12,
              background: error ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
              color: error ? '#fecaca' : '#bbf7d0',
              fontSize: 13,
            }}
          >
            {error || statusMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div
            style={{
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 18,
              padding: '1.5rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Stress level tracker</h4>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Select up to five colors that match your mood.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {colorKeys.map((key) => {
                const active = selectedColors.includes(key)
                const color = COLOR_SWATCHES[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleColor(key)}
                    style={{
                      borderRadius: 999,
                      border: active ? '2px solid #f8fafc' : '1px solid rgba(148,163,184,0.4)',
                      background: active ? color : 'rgba(15,23,42,0.6)',
                      color: active ? '#0f172a' : '#e2e8f0',
                      padding: '0.35rem 0.75rem',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: '0.85rem', display: 'grid', gap: '0.5rem' }}>
              <input
                value={recentActivitiesInput}
                onChange={(event) => setRecentActivitiesInput(event.target.value)}
                placeholder="Recent activities (comma separated)"
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(2,6,23,0.6)',
                  color: '#f8fafc',
                  padding: '0.6rem 0.75rem',
                  fontSize: 12,
                }}
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Notes for this moment"
                rows={3}
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(2,6,23,0.6)',
                  color: '#f8fafc',
                  padding: '0.6rem 0.75rem',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              <button
                onClick={handleStressSubmit}
                disabled={selectedColors.length === 0}
                style={{
                  borderRadius: 10,
                  border: 'none',
                  background: selectedColors.length === 0 ? 'rgba(148,163,184,0.4)' : 'linear-gradient(135deg, #38bdf8, #6366f1)',
                  color: '#0f172a',
                  fontWeight: 700,
                  padding: '0.65rem',
                  cursor: selectedColors.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Save stress entry
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 18,
              padding: '1.5rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Mini relaxation games</h4>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Log breathing exercises, quick puzzles, pomodoro focus, or meditation with calming sounds.
            </p>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <select
                value={activityType}
                onChange={(event) => setActivityType(event.target.value)}
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(2,6,23,0.6)',
                  color: '#f8fafc',
                  padding: '0.6rem 0.75rem',
                  fontSize: 12,
                }}
              >
                <option value="BREATHING">Breathing Exercise</option>
                <option value="PUZZLE">Quick Puzzle</option>
                <option value="POMODORO">Pomodoro Timer</option>
                <option value="MEDITATION">Meditation Timer</option>
              </select>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.4)',
                    background: 'rgba(2,6,23,0.6)',
                    color: '#f8fafc',
                    padding: '0.6rem 0.75rem',
                    fontSize: 12,
                  }}
                />
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#e2e8f0',
                  fontSize: 12,
                }}>
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(event) => setCompleted(event.target.checked)}
                  />
                  Completed
                </label>
              </div>
              <button
                onClick={handleRelaxationSubmit}
                style={{
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
                  color: '#052e16',
                  fontWeight: 700,
                  padding: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                Log relaxation session
              </button>
              <div style={{ marginTop: '0.6rem', display: 'grid', gap: '0.5rem' }}>
                {config?.games &&
                  Object.entries(config.games).map(([key, game]) => (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(30,41,59,0.6)',
                        borderRadius: 12,
                        padding: '0.6rem 0.75rem',
                        border: '1px solid rgba(148,163,184,0.2)',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{game.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: '0.2rem' }}>{game.description}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 18,
              padding: '1.5rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Wellness dashboard</h4>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Stress trends over time, wellness points, and current status.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                value={periodDays}
                onChange={(event) => setPeriodDays(Number(event.target.value))}
                style={{
                  width: 90,
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(2,6,23,0.6)',
                  color: '#f8fafc',
                  padding: '0.5rem 0.6rem',
                  fontSize: 12,
                }}
              />
              <button
                onClick={() => loadData()}
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(30,41,59,0.7)',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                }}
              >
                Update
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <svg viewBox="0 0 420 160" style={{ width: '100%', height: 160 }}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="420" height="160" fill="rgba(2,6,23,0.7)" rx="16" />
                {chartPoints.length > 0 ? (
                  <path
                    d={trendChartPath(chartPoints, 420, 160, 20)}
                    fill="none"
                    stroke="url(#stressGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ) : (
                  <text x="210" y="80" textAnchor="middle" fill="#64748b" fontSize="12">
                    No stress entries yet
                  </text>
                )}
              </svg>
            </div>
            <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>Latest stress score</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                  {dashboard?.latestStressLog
                    ? formatScoreLabel(dashboard.latestStressLog.stressScore)
                    : 'No data'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>Relaxation minutes</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                  {dashboard?.relaxationSummary?.totalRelaxationMinutes ?? 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>Wellness points</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                  {dashboard?.relaxationSummary?.totalPoints ?? 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>Open stress alerts</span>
                <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                  {dashboard?.openHighStressAlerts ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div
            style={{
              background: 'rgba(15,23,42,0.75)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 18,
              padding: '1.5rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Smart alerts</h4>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Automated alerts with suggested breaks when stress is high.
            </p>
            {alerts.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748b' }}>No open alerts. You are in a safe zone.</div>
            )}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  style={{
                    borderRadius: 14,
                    padding: '0.85rem',
                    background: 'rgba(30,41,59,0.7)',
                    border: '1px solid rgba(248,113,113,0.3)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: '#fecaca', marginTop: '0.3rem' }}>{alert.message}</div>
                  {alert.suggestedActions?.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.3rem' }}>
                      {alert.suggestedActions.map((action, index) => (
                        <div key={`${alert._id}-${index}`} style={{ fontSize: 11, color: '#e2e8f0' }}>
                          {action}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    style={{
                      marginTop: '0.6rem',
                      borderRadius: 10,
                      border: 'none',
                      background: 'rgba(248,113,113,0.85)',
                      color: '#0f172a',
                      fontWeight: 700,
                      padding: '0.45rem 0.7rem',
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15,23,42,0.75)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: 18,
              padding: '1.5rem',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Color meaning guide</h4>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Use these meanings when selecting colors.
            </p>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {config?.colors &&
                Object.entries(config.colors).map(([key, info]) => (
                  <div key={key} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 6,
                        background: COLOR_SWATCHES[key] || '#94a3b8',
                        border: key === 'WHITE' ? '1px solid rgba(148,163,184,0.7)' : 'none',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{key}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{info.description}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StressHubPanel
