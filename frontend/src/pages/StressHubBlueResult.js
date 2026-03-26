import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createStressLog, getCalmStreak } from '../utils/stressHubApi'

const BLUE_ACTIVITIES = [
  {
    icon: '🧠',
    title: 'Sharpen Your Mind',
    description:
      'Your mind is completely clear right now. Pick your most challenging subject and focus for 25 distraction-free minutes. Calm thinking improves depth and memory retention.',
  },
  {
    icon: '📖',
    title: 'Read Something Deep',
    description:
      'Choose a book, article, or thoughtful topic and read slowly. Blue state concentration is rare and powerful, so give it something meaningful.',
  },
  {
    icon: '🎨',
    title: 'Create Without Pressure',
    description:
      'Draw, design, or write the first line of something. In calm state, creativity moves without overthinking. Just begin and let it flow.',
  },
  {
    icon: '🌿',
    title: 'Spend Time in Nature',
    description:
      'Step outside and walk slowly. Notice the sky, trees, and sounds around you. Even ten quiet minutes outdoors can deepen calm profoundly.',
  },
  {
    icon: '🧘',
    title: 'Meditate and Go Deeper',
    description:
      'Sit comfortably, close your eyes, and focus on breath for five minutes. This is not about reducing stress. It is about expanding stillness.',
  },
  {
    icon: '✍️',
    title: 'Reflect on Your Journey',
    description:
      'Open your journal and write honestly about where you were, where you are, and where you want to go. Calm moments reveal truth clearly.',
  },
  {
    icon: '💡',
    title: 'Plan Your Future',
    description:
      'Write down meaningful goals for this week, month, and year. Calm planning comes from your truest self and produces better execution.',
  },
  {
    icon: '🤝',
    title: 'Be Present With Someone',
    description:
      'Talk with a friend or family member without agenda. Be fully present, listen deeply, and give genuine attention.',
  },
  {
    icon: '🎵',
    title: 'Listen With Full Attention',
    description:
      'Pick one album or playlist and listen from start to finish without multitasking. In calm state, music becomes deeply memorable.',
  },
  {
    icon: '🌙',
    title: 'Rest Intentionally',
    description:
      'Take 15 minutes of intentional rest. No scrolling. No half-focus media. Just stillness and recovery. You return sharper and clearer.',
  },
]

function StressHubBlueResult() {
  const [status, setStatus] = useState('saving')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)

  const [streakDays, setStreakDays] = useState(0)
  const [streakMilestone, setStreakMilestone] = useState(null)
  const [streakLoading, setStreakLoading] = useState(true)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isStudent = user?.role === 'student'

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 768)
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    if (!selectedActivity) return
    const onEsc = (event) => {
      if (event.key === 'Escape') setSelectedActivity(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onEsc)
    }
  }, [selectedActivity])

  useEffect(() => {
    const initBlueState = async () => {
      if (!isStudent) {
        setStatus('forbidden')
        setStreakLoading(false)
        return
      }

      try {
        setError('')
        await createStressLog({
          selectedColors: ['BLUE'],
          notes: 'Student reported calm state',
          recentActivities: ['stress-hub-blue-flow'],
        })
        setSavedAt(new Date().toLocaleString())
        setStatus('done')
      } catch (err) {
        setError(err.message || 'Failed to submit blue stress check-in')
        setStatus('error')
      }

      try {
        const streak = await getCalmStreak()
        setStreakDays(Number(streak?.streakDays || 0))
        setStreakMilestone(streak?.milestone || null)
      } catch {
        setStreakDays(0)
        setStreakMilestone(null)
      } finally {
        setStreakLoading(false)
      }
    }

    initBlueState()
  }, [isStudent])

  return (
    <>
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          filter: selectedActivity ? 'blur(6px)' : 'none',
          transition: 'filter 180ms ease',
        }}
      >
        <section
          style={{
            borderRadius: 24,
            padding: '1.4rem 1.2rem',
            background: 'linear-gradient(140deg, #0f172a 0%, #1e3a8a 52%, #0c4a6e 100%)',
            border: '1px solid rgba(125,211,252,0.35)',
            boxShadow: '0 22px 40px rgba(2,6,23,0.34)',
          }}
        >
          <div style={{ color: '#93c5fd', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Blue Stress Result
          </div>
          <h1 style={{ margin: '0.45rem 0 0.35rem', color: '#dbeafe', fontSize: 32, lineHeight: 1.2 }}>
            You are calm. You are okay. This is a good place to be.
          </h1>
          <p style={{ margin: 0, color: '#bfdbfe', fontSize: 16, maxWidth: 760, lineHeight: 1.7 }}>
            You are feeling calm and at peace. Beautiful. Here are some ways to deepen that calm and enjoy it fully.
          </p>
        </section>

        <section
          style={{
            marginTop: '1rem',
            borderRadius: 16,
            border: '1px solid #bfdbfe',
            background: 'linear-gradient(140deg, #eff6ff 0%, #dbeafe 100%)',
            padding: '1rem',
          }}
        >
          <h3 style={{ margin: '0 0 0.45rem', color: '#1e3a8a' }}>Calm Streak</h3>
          {streakLoading ? (
            <p style={{ margin: 0, color: '#1d4ed8' }}>Calculating your streak...</p>
          ) : (
            <>
              <p style={{ margin: 0, color: '#1e40af', lineHeight: 1.6 }}>
                You have been calm or balanced for <strong>{streakDays}</strong> day{streakDays === 1 ? '' : 's'} in a row. Keep going.
              </p>
              {streakMilestone && (
                <div
                  style={{
                    marginTop: '0.6rem',
                    borderRadius: 12,
                    background: '#dbeafe',
                    border: '1px solid #93c5fd',
                    padding: '0.55rem 0.7rem',
                    color: '#1e3a8a',
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{streakMilestone.badge}</div>
                  <div style={{ marginTop: 2, fontSize: 13 }}>{streakMilestone.message}</div>
                </div>
              )}
            </>
          )}
        </section>

        <section style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: '0.9rem',
            }}
          >
            {BLUE_ACTIVITIES.map((activity) => (
              <article
                key={activity.title}
                onClick={() => setSelectedActivity(activity)}
                style={{
                  borderRadius: 16,
                  border: '1px solid #bfdbfe',
                  background: 'linear-gradient(150deg, #eff6ff 0%, #dbeafe 100%)',
                  padding: '1rem',
                  boxShadow: '0 10px 18px rgba(30,58,138,0.08)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }} aria-hidden='true'>
                    {activity.icon}
                  </span>
                  <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: 22, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.02em' }}>
                    {activity.title}
                  </h3>
                </div>
                <p style={{ margin: 0, color: '#1e40af', fontSize: 14, lineHeight: 1.65 }}>{activity.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div
          style={{
            marginTop: '1rem',
            borderRadius: 14,
            border: '1px solid #bfdbfe',
            background: '#eff6ff',
            padding: '0.8rem 1rem',
          }}
        >
          {status === 'saving' && <div style={{ color: '#1e40af', fontSize: 14 }}>Saving calm check-in...</div>}
          {status === 'done' && <div style={{ color: '#1d4ed8', fontSize: 14 }}>Student reported calm state. Logged at {savedAt}.</div>}
          {status === 'forbidden' && <div style={{ color: '#1e40af', fontSize: 14 }}>Your activity was noted.</div>}
          {status === 'error' && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Link
            to='/stress-hub'
            style={{
              display: 'inline-block',
              borderRadius: 10,
              background: '#0f172a',
              color: '#f8fafc',
              textDecoration: 'none',
              padding: '0.65rem 0.95rem',
              fontWeight: 700,
            }}
          >
            Back to color hub
          </Link>
        </div>
      </div>

      {selectedActivity && (
        <div
          onClick={() => setSelectedActivity(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.52)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(760px, 100%)',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid #93c5fd',
              background: '#eff6ff',
              boxShadow: '0 30px 60px rgba(2,6,23,0.35)',
            }}
          >
            <div
              style={{
                padding: '1.2rem 1rem 0.8rem',
                background: 'linear-gradient(145deg, #1e3a8a, #0c4a6e)',
                color: '#eff6ff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 30 }} aria-hidden='true'>
                    {selectedActivity.icon}
                  </span>
                  <h2
                    style={{
                      margin: 0,
                      color: '#eff6ff',
                      fontSize: 32,
                      fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {selectedActivity.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    background: '#dbeafe',
                    color: '#1e3a8a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '0.45rem 0.6rem',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              <p style={{ margin: 0, color: '#1e40af', fontSize: 15, lineHeight: 1.75 }}>
                {selectedActivity.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StressHubBlueResult
