import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createStressLog, saveFutureSelfMessage } from '../utils/stressHubApi'

const GREEN_ACTIVITIES = [
  {
    icon: '🎯',
    title: 'Take on Your Biggest Task',
    image: '/images/stress-green/biggest-task.jpg',
    description:
      'You are at peak mental capacity right now. Open that assignment, project or task you have been avoiding. Even 20 focused minutes now will feel effortless compared to doing it while stressed.',
  },
  {
    icon: '📚',
    title: 'Learn Something New',
    image: '/images/stress-green/learn-new.jpg',
    description:
      'Your brain absorbs best when calm. Watch a short video about a topic you are genuinely curious about and feed your mind something good while it is open and ready.',
  },
  {
    icon: '🎨',
    title: 'Create Something',
    image: '/images/stress-green/create-something.jpg',
    description:
      'Draw, write a poem, make a playlist, design something, or build something. Green is your creative peak. Do not just consume today, produce something new.',
  },
  {
    icon: '💬',
    title: 'Appreciate Someone',
    image: '/images/stress-green/appreciate-someone.jpg',
    description:
      'Send a genuine message to someone who matters to you. A real thank-you can lift both you and the person receiving it.',
  },
  {
    icon: '✍️',
    title: 'Write to Your Future Self',
    image: '/images/stress-green/future-self.jpg',
    description:
      'Write a message for hard days ahead, like: You have felt good before and you will again. You are stronger than the stress.',
  },
  {
    icon: '🌍',
    title: 'Do Something for Someone Else',
    image: '/images/stress-green/do-for-others.jpg',
    description:
      'Help a classmate, volunteer for a task, or do one kind thing without being asked. Surplus energy grows when you share it.',
  },
  {
    icon: '🏆',
    title: 'Set a Goal',
    image: '/images/stress-green/set-goal.jpg',
    description:
      'Write one clear goal for this week with a deadline. Not a wish, a specific target you can follow through on.',
  },
  {
    icon: '🎵',
    title: 'Celebrate With Music',
    image: '/images/stress-green/celebrate-music.jpg',
    description:
      'Play your favorite energizing song and enjoy this good moment fully. You do not always need to optimize everything to make it meaningful.',
  },
]

const GREEN_STORY_CARDS = [
  {
    title: 'Focus Momentum',
    subtitle: 'Direct your calm into deep, meaningful work.',
    image: '/images/stress-green/biggest-task.jpg',
  },
  {
    title: 'Creative Energy',
    subtitle: 'Use this state to make, design, and express.',
    image: '/images/stress-green/create-something.jpg',
  },
  {
    title: 'Human Connection',
    subtitle: 'Share appreciation and positive action today.',
    image: '/images/stress-green/appreciate-someone.jpg',
  },
]

function StressHubGreenResult() {
  const [status, setStatus] = useState('saving')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [futureMessage, setFutureMessage] = useState('')
  const [futureStatus, setFutureStatus] = useState('idle')
  const [futureError, setFutureError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isStudent = user?.role === 'student'

  useEffect(() => {
    const submitGreenCheckIn = async () => {
      if (!isStudent) {
        setStatus('forbidden')
        return
      }

      try {
        setError('')
        await createStressLog({
          selectedColors: ['GREEN'],
          notes: 'Auto-submitted from green stress flow page',
          recentActivities: ['stress-hub-green-flow'],
        })
        setSavedAt(new Date().toLocaleString())
        setStatus('done')
      } catch (err) {
        setError(err.message || 'Failed to submit green stress check-in')
        setStatus('error')
      }
    }

    submitGreenCheckIn()
  }, [isStudent])

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

  const handleSaveFutureMessage = async () => {
    if (!isStudent) return
    const trimmed = futureMessage.trim()
    if (!trimmed) {
      setFutureError('Please write a short message first.')
      return
    }

    try {
      setFutureStatus('saving')
      setFutureError('')
      await saveFutureSelfMessage(trimmed)
      setFutureStatus('done')
    } catch (err) {
      setFutureStatus('error')
      setFutureError(err.message || 'Failed to save your message')
    }
  }

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
          background: 'linear-gradient(130deg, #dcfce7 0%, #86efac 45%, #34d399 100%)',
          border: '1px solid #10b981',
          boxShadow: '0 18px 35px rgba(5,150,105,0.16)',
        }}
      >
        <div style={{ color: '#065f46', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Green Stress Result
        </div>
        <h1 style={{ margin: '0.45rem 0 0.35rem', color: '#064e3b', fontSize: 32, lineHeight: 1.2 }}>
          You are in your best state right now. Use it. Grow it. Enjoy it.
        </h1>
        <p style={{ margin: 0, color: '#065f46', fontSize: 16 }}>
          Balanced energy is rare. Use this momentum to build something meaningful.
        </p>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: '0.85rem',
          }}
        >
          {GREEN_STORY_CARDS.map((item) => (
            <article
              key={item.title}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #86efac',
                boxShadow: '0 12px 24px rgba(5,150,105,0.14)',
                background: '#f0fdf4',
              }}
            >
              <div
                style={{
                  height: 140,
                  backgroundImage: `linear-gradient(165deg, rgba(6,95,70,0.18), rgba(6,95,70,0.02)), url('${item.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ padding: '0.8rem 0.9rem' }}>
                <div style={{ color: '#065f46', fontWeight: 800, fontSize: 17 }}>{item.title}</div>
                <p style={{ margin: '0.35rem 0 0', color: '#166534', fontSize: 13, lineHeight: 1.5 }}>{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: '0.9rem',
          }}
        >
          {GREEN_ACTIVITIES.map((activity) => (
            <article
              key={activity.title}
              onClick={() => setSelectedActivity(activity)}
              style={{
                borderRadius: 16,
                border: '1px solid #bbf7d0',
                background: 'linear-gradient(150deg, #f0fdf4 0%, #dcfce7 100%)',
                overflow: 'hidden',
                boxShadow: '0 10px 18px rgba(5,150,105,0.08)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  height: 160,
                  backgroundImage: `linear-gradient(160deg, rgba(15,23,42,0.24), rgba(15,23,42,0.04)), url('${activity.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#bbf7d0',
                }}
              />
              <div style={{ padding: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }} aria-hidden='true'>
                    {activity.icon}
                  </span>
                  <h3 style={{ margin: 0, color: '#065f46', fontSize: 20, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.02em' }}>
                    {activity.title}
                  </h3>
                </div>
                <p style={{ margin: 0, color: '#166534', fontSize: 14, lineHeight: 1.65 }}>{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: '1rem',
          borderRadius: 16,
          border: '1px solid #6ee7b7',
          background: '#ecfdf5',
          padding: '1rem',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem', color: '#065f46' }}>Write to Your Future Self</h3>
        <p style={{ margin: '0 0 0.6rem', color: '#166534', fontSize: 14 }}>
          Save one message for yourself to read when you later feel low.
        </p>
        <textarea
          value={futureMessage}
          onChange={(event) => setFutureMessage(event.target.value)}
          rows={4}
          placeholder='Write your future-self message here...'
          style={{
            width: '100%',
            borderRadius: 12,
            border: '1px solid #86efac',
            padding: '0.7rem 0.8rem',
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit',
            color: '#14532d',
            background: '#ffffff',
          }}
        />
        <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveFutureMessage}
            style={{
              border: 'none',
              borderRadius: 999,
              background: 'linear-gradient(140deg, #22c55e, #16a34a)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              padding: '0.6rem 1rem',
              cursor: 'pointer',
            }}
          >
            Save Message
          </button>
          {futureStatus === 'saving' && <span style={{ color: '#166534', fontSize: 13 }}>Saving...</span>}
          {futureStatus === 'done' && <span style={{ color: '#14532d', fontSize: 13 }}>Saved for your future self.</span>}
          {futureStatus === 'error' && <span style={{ color: '#b91c1c', fontSize: 13 }}>{futureError}</span>}
          {!futureError && futureStatus !== 'error' && isStudent === false && (
            <span style={{ color: '#166534', fontSize: 13 }}>Only students can save messages.</span>
          )}
          {futureError && futureStatus !== 'error' && <span style={{ color: '#b45309', fontSize: 13 }}>{futureError}</span>}
        </div>
      </section>

      <div
        style={{
          marginTop: '1rem',
          borderRadius: 14,
          border: '1px solid #bbf7d0',
          background: '#f0fdf4',
          padding: '0.8rem 1rem',
        }}
      >
        {status === 'saving' && <div style={{ color: '#166534', fontSize: 14 }}>Saving your activity note...</div>}
        {status === 'done' && <div style={{ color: '#14532d', fontSize: 14 }}>Your green check-in was logged at {savedAt}.</div>}
        {status === 'forbidden' && <div style={{ color: '#166534', fontSize: 14 }}>Your activity was noted.</div>}
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
            background: 'rgba(2,6,23,0.48)',
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
              border: '1px solid #86efac',
              background: '#f0fdf4',
              boxShadow: '0 30px 60px rgba(2,6,23,0.35)',
            }}
          >
            <div
              style={{
                height: 250,
                backgroundImage: `linear-gradient(160deg, rgba(15,23,42,0.35), rgba(15,23,42,0.08)), url('${selectedActivity.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 30 }} aria-hidden='true'>
                    {selectedActivity.icon}
                  </span>
                  <h2
                    style={{
                      margin: 0,
                      color: '#065f46',
                      fontSize: 30,
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
                    background: '#dcfce7',
                    color: '#065f46',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '0.45rem 0.6rem',
                  }}
                >
                  Close
                </button>
              </div>
              <p style={{ margin: '0.65rem 0 0', color: '#166534', fontSize: 15, lineHeight: 1.75 }}>
                {selectedActivity.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StressHubGreenResult
