import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const COLOR_FLOW = [
  {
    key: 'RED',
    label: 'HIGH',
    icon: '⚡',
    softBg: '#fee2e2',
    pillBg: '#ef4444',
    text: '#7f1d1d',
  },
  {
    key: 'ORANGE',
    label: 'ELEVATED',
    icon: '▲',
    softBg: '#ffedd5',
    pillBg: '#f97316',
    text: '#9a3412',
  },
  {
    key: 'YELLOW',
    label: 'MILD',
    icon: '≋',
    softBg: '#ecfccb',
    pillBg: '#84cc16',
    text: '#3f6212',
  },
  {
    key: 'GREEN',
    label: 'BALANCED',
    icon: '☄',
    softBg: '#dcfce7',
    pillBg: '#22c55e',
    text: '#166534',
  },
  {
    key: 'BLUE',
    label: 'CALM',
    icon: '➰',
    softBg: '#dbeafe',
    pillBg: '#3b82f6',
    text: '#1e3a8a',
  },
]

function StressHub() {
  const navigate = useNavigate()
  const [animateIn, setAnimateIn] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [hubAlert, setHubAlert] = useState({ open: false, title: '', message: '', type: 'info' })
  const [pendingRoute, setPendingRoute] = useState('')

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const canSubmit = user?.role === 'student'

  const showHubAlert = (title, message, type = 'info') => {
    setHubAlert({ open: true, title, message, type })
  }

  const closeHubAlert = () => {
    const route = pendingRoute
    setHubAlert((prev) => ({ ...prev, open: false }))
    setPendingRoute('')
    if (route) {
      navigate(route)
    }
  }

  const playAlertSound = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return

      const audioCtx = new AudioCtx()
      const now = audioCtx.currentTime

      const makeTone = (frequency, start, duration, gain = 0.05) => {
        const osc = audioCtx.createOscillator()
        const g = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(frequency, start)
        g.gain.setValueAtTime(0.0001, start)
        g.gain.exponentialRampToValueAtTime(gain, start + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, start + duration)
        osc.connect(g)
        g.connect(audioCtx.destination)
        osc.start(start)
        osc.stop(start + duration)
      }

      if (type === 'warning') {
        makeTone(420, now, 0.16, 0.045)
        makeTone(320, now + 0.12, 0.2, 0.04)
      } else {
        makeTone(520, now, 0.12, 0.04)
        makeTone(690, now + 0.1, 0.16, 0.045)
      }

      setTimeout(() => {
        audioCtx.close().catch(() => {})
      }, 600)
    } catch {
      // Silent fallback when Web Audio is blocked.
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 70)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 960)
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    if (!hubAlert.open) return
    playAlertSound(hubAlert.type)
  }, [hubAlert.open, hubAlert.type])

  const handleColorClick = (colorKey) => {
    if (!canSubmit) {
      showHubAlert(
        'Student Check-In Only',
        'Please log in with a student account to submit stress check-ins in this hub.',
        'warning'
      )
      return
    }

    const routeMap = {
      RED: '/stress-hub/red',
      ORANGE: '/stress-hub/orange',
      YELLOW: '/stress-hub/yellow',
      GREEN: '/stress-hub/green',
      BLUE: '/stress-hub/blue',
    }

    const labelMap = {
      RED: 'High Stress',
      ORANGE: 'Elevated Stress',
      YELLOW: 'Mild Stress',
      GREEN: 'Balanced State',
      BLUE: 'Calm State',
    }

    const target = routeMap[colorKey]
    if (!target) return

    setPendingRoute(target)
    showHubAlert('Success!', 'Record Saved!', 'success')
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
      <style>
        {`
          @keyframes hubAlertFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes hubAlertPopIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.06fr 1.44fr',
          gap: '1rem',
          alignItems: 'stretch',
          transform: animateIn ? 'translateY(0)' : 'translateY(10px)',
          opacity: animateIn ? 1 : 0.72,
          transition: 'all 560ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div
          style={{
            borderRadius: 28,
            background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 16px 28px rgba(15,23,42,0.08)',
            padding: '1.25rem 1.1rem',
          }}
        >
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? 44 : 58, lineHeight: 0.98, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            Your Personal
            <span style={{ display: 'block', color: '#2563eb' }}>Sanctuary.</span>
          </h1>
          <p style={{ margin: '0.7rem 0 0', color: '#475569', fontSize: 14, lineHeight: 1.7, maxWidth: 350 }}>
            Take a moment to breathe. Pick your current state and unlock the best support path for this exact moment.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/stress-hub/yellow')}
              style={{
                border: 'none',
                borderRadius: 8,
                background: '#2563eb',
                color: '#fff',
                padding: '0.58rem 0.8rem',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 8px 14px rgba(37,99,235,0.24)',
              }}
            >
              Explore Paths
            </button>
            <button
              onClick={() => navigate('/stress-hub/green')}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#e2e8f0',
                color: '#334155',
                padding: '0.58rem 0.8rem',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              View Journal
            </button>
          </div>
        </div>

        <div
          style={{
            borderRadius: 28,
            background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 18px 30px rgba(15,23,42,0.07)',
            padding: '1rem 1rem 1.1rem',
          }}
        >
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 11, letterSpacing: '0.11em', textTransform: 'uppercase' }}>
            Stress Check-In
          </div>
          <h2 style={{ margin: '0.35rem 0 0.1rem', color: '#1f2937', fontSize: isMobile ? 34 : 41, lineHeight: 0.95, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            How are you feeling right now?
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
            Pick the color that best matches your current stress level.
          </p>

          {!canSubmit && (
            <div
              style={{
                marginTop: '0.6rem',
                borderRadius: 10,
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '0.45rem 0.65rem',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Only student accounts can submit check-ins.
            </div>
          )}

          <div
            style={{
              marginTop: '0.8rem',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))',
              gap: '0.6rem',
            }}
          >
            {COLOR_FLOW.map((color) => (
              <button
                key={color.key}
                onClick={() => handleColorClick(color.key)}
                style={{
                  border: '1px solid rgba(148,163,184,0.26)',
                  borderRadius: 20,
                  background: color.softBg,
                  minHeight: 96,
                  padding: '0.55rem 0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 6px 14px rgba(15,23,42,0.05)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: color.pillBg,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 16,
                    boxShadow: '0 8px 12px rgba(15,23,42,0.17)',
                  }}
                >
                  {color.icon}
                </span>
                <span style={{ color: color.text, fontWeight: 700, fontSize: 11, letterSpacing: '0.05em' }}>
                  {color.label}
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div
              style={{
                borderRadius: 999,
                background: '#e2e8f0',
                color: '#1f2937',
                fontWeight: 700,
                fontSize: 12,
                padding: '0.5rem 0.8rem',
                textAlign: 'center',
              }}
            >
              Quick support paths
            </div>
            <div
              style={{
                borderRadius: 999,
                background: '#dbeafe',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: 12,
                padding: '0.5rem 0.8rem',
                textAlign: 'center',
              }}
            >
              Private check-in
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.8rem' }}>
          <span style={{ width: 20, height: 3, borderRadius: 999, background: '#2563eb' }} />
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: 34, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            Wellness Insights
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.65fr 0.8fr',
            gap: '1rem',
          }}
        >
          <article
            style={{
              borderRadius: 30,
              minHeight: 184,
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
              position: 'relative',
              backgroundImage:
                "linear-gradient(160deg, rgba(2,6,23,0.35) 0%, rgba(30,41,59,0.16) 46%, rgba(2,6,23,0.46) 100%), url('https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 14px 28px rgba(15,23,42,0.14)',
            }}
          >
            <div style={{ padding: '1.3rem 1.2rem', maxWidth: 420 }}>
              <h4 style={{ margin: 0, color: '#f8fafc', fontSize: 38, lineHeight: 0.95, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
                Mastering the Morning
                <span style={{ display: 'block' }}>Mindset</span>
              </h4>
              <p style={{ margin: '0.55rem 0 0', color: 'rgba(241,245,249,0.9)', fontSize: 13, lineHeight: 1.6 }}>
                Five rituals to ground yourself before the digital world demands your attention.
              </p>
              <button
                type='button'
                style={{
                  marginTop: '0.8rem',
                  border: 'none',
                  borderRadius: 8,
                  background: 'rgba(59,130,246,0.85)',
                  color: '#fff',
                  padding: '0.42rem 0.7rem',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Read Article →
              </button>
            </div>
          </article>

          <article
            style={{
              borderRadius: 30,
              minHeight: 184,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 14px 24px rgba(15,23,42,0.08)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#166534',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                }}
              >
                ☘
              </div>
              <h4 style={{ margin: '0.7rem 0 0.2rem', color: '#1f2937', fontSize: 32, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
                Breathwork Timer
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
                Synchronize your breath with our rhythmic visual guide.
              </p>
            </div>
            <button
              onClick={() => navigate('/stress-hub/orange/games/underwater-drift')}
              style={{
                marginTop: '0.7rem',
                border: 'none',
                borderRadius: 8,
                background: '#2f3338',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                padding: '0.6rem 0.8rem',
                cursor: 'pointer',
              }}
            >
              Start Session
            </button>
          </article>
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '0.8fr 1.65fr',
            gap: '1rem',
          }}
        >
          <article
            style={{
              borderRadius: 26,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 12px 22px rgba(15,23,42,0.06)',
              padding: '1rem',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#ffedd5',
                color: '#c2410c',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
              }}
            >
              ✎
            </div>
            <h4 style={{ margin: '0.7rem 0 0.2rem', color: '#1f2937', fontSize: 31, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
              Daily Reflection
            </h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
              Write down three things you are grateful for today.
            </p>
            <button
              onClick={() => navigate('/stress-hub/green')}
              style={{
                marginTop: '0.9rem',
                width: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                fontSize: 13,
                padding: '0.6rem 0.8rem',
                cursor: 'pointer',
              }}
            >
              Open Journal
            </button>
          </article>

          <article
            style={{
              borderRadius: 30,
              border: '1px solid #93c5fd',
              background: 'linear-gradient(145deg, #60a5fa 0%, #3b82f6 100%)',
              boxShadow: '0 16px 28px rgba(37,99,235,0.24)',
              padding: '1.1rem',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <h4 style={{ margin: 0, color: '#eff6ff', fontSize: 36, lineHeight: 0.96, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
                Your 7-Day Resilience
              </h4>
              <p style={{ margin: '0.5rem 0 0', color: '#dbeafe', fontSize: 13, lineHeight: 1.6, maxWidth: 350 }}>
                You have maintained a Balanced state for 4 days this week. Keep going.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 3 }}>
              {[34, 52, 24, 66, 30, 60, 58].map((h, idx) => (
                <span
                  key={`bar-${idx}`}
                  style={{
                    width: 20,
                    height: h,
                    borderRadius: 4,
                    background: idx > 4 ? '#082f49' : 'rgba(30,64,175,0.55)',
                  }}
                />
              ))}
            </div>
          </article>
        </div>
      </section>

      {hubAlert.open && (
        <div
          onClick={closeHubAlert}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.22)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1200,
            padding: '1rem',
            animation: 'hubAlertFadeIn 180ms ease',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 8,
              background: '#ffffff',
              boxShadow: '0 18px 34px rgba(15,23,42,0.2)',
              padding: '1.55rem 1.2rem 1.2rem',
              textAlign: 'center',
              animation: 'hubAlertPopIn 180ms ease',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                margin: '0 auto',
                borderRadius: '50%',
                border: hubAlert.type === 'warning' ? '6px solid #fcd34d' : '6px solid #bbf7d0',
                display: 'grid',
                placeItems: 'center',
                color: hubAlert.type === 'warning' ? '#d97706' : '#86d36b',
                fontSize: 52,
                fontWeight: 900,
              }}
            >
              {hubAlert.type === 'warning' ? '!' : '✓'}
            </div>

            <div style={{ marginTop: '1rem', color: '#3f3f46', fontSize: 52, lineHeight: 0.9, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
              {hubAlert.title}
            </div>
            <div style={{ marginTop: '0.45rem', color: '#52525b', fontSize: 20 }}>{hubAlert.message}</div>

            <div style={{ marginTop: '1.2rem' }}>
              <button
                onClick={closeHubAlert}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  background: '#6366f1',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 16,
                  padding: '0.62rem 1.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 0 4px rgba(99,102,241,0.25)',
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StressHub
