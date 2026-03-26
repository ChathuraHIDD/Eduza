import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createStressLog } from '../utils/stressHubApi'

const YELLOW_ACTIVITIES = [
  {
    icon: '🎧',
    title: 'Listen to Something',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    description:
      'Put your earphones in or turn up your speaker. Play something slow, soft and familiar. Search lofi beats or calm piano on Spotify or YouTube. Close your eyes for 5 minutes and just listen. Do not scroll, do not multitask. Just listen.',
  },
  {
    icon: '👀',
    title: 'Watch Something',
    image:
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
    description:
      'Search relaxing nature sounds on YouTube. Pick rainfall, ocean waves, or a crackling fireplace. Make it fullscreen and sit comfortably for 3 to 5 minutes. Let your mind go quiet with no other tabs open.',
  },
  {
    icon: '🌬️',
    title: 'Breathe',
    image:
      'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1200&q=80',
    description:
      'Close your eyes. Breathe in slowly through your nose for 4 counts. Hold for 4 counts. Breathe out through your mouth for 6 counts. Do this 5 times. Your nervous system starts calming within minutes.',
  },
  {
    icon: '✍️',
    title: 'Write Something',
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    description:
      'Open the journal box and write 3 things that are stressing you right now. Do not think about grammar or structure. Then write 1 thing you are grateful for today. Getting it out of your head makes it smaller.',
  },
  {
    icon: '🏃',
    title: 'Move Around',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    description:
      'Stand up now and walk slowly around your room for 2 minutes. No phone, no music. Just walk and breathe. Movement helps break the stress loop in your body and helps you reset.',
  },
  {
    icon: '🧘',
    title: 'Stretch Your Body',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    description:
      'Raise both arms above your head and hold for 10 seconds. Roll your shoulders back 5 times. Stretch your neck left and right slowly. Shake your hands loose. Moving stress out of your body works fast.',
  },
  {
    icon: '🌊',
    title: 'Calm Your Mind',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    description:
      'Close all other tabs and apps. Open one calming visual and stare at it for 60 full seconds. No scrolling, no clicking, no notifications. One quiet minute can shift your whole state.',
  },
  {
    icon: '💬',
    title: 'Talk to Someone',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    description:
      'Send a message to a friend, family member, or your school counsellor. You do not need to explain everything. Just say: hey, I am having a rough moment. Connection is one of the fastest ways to lower stress.',
  },
]

function StressHubYellowResult() {
  const navigate = useNavigate()

  const [status, setStatus] = useState('saving')
  const [error, setError] = useState('')
  const [animateIn, setAnimateIn] = useState(false)
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
    const timer = setTimeout(() => setAnimateIn(true), 70)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const submitYellowCheckIn = async () => {
      if (!isStudent) {
        setStatus('forbidden')
        return
      }

      try {
        setError('')
        await createStressLog({
          selectedColors: ['YELLOW'],
          notes: 'Auto-submitted from yellow stress flow page',
          recentActivities: ['stress-hub-yellow-flow'],
        })
        setStatus('done')
      } catch (err) {
        setError(err.message || 'Failed to submit yellow stress check-in')
        setStatus('error')
      }
    }

    submitYellowCheckIn()
  }, [isStudent])

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

  const handleActivitySelect = (activity) => {
    if (!isStudent) return
    setSelectedActivity(activity)
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
          background: 'linear-gradient(130deg, #fef9c3 0%, #fde68a 45%, #fcd34d 100%)',
          border: '1px solid #f59e0b',
          boxShadow: '0 18px 35px rgba(180,83,9,0.16)',
          transform: animateIn ? 'translateY(0)' : 'translateY(10px)',
          opacity: animateIn ? 1 : 0.7,
          transition: 'all 520ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ color: '#713f12', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Yellow Stress Result
        </div>
        <h1 style={{ margin: '0.45rem 0 0.4rem', color: '#422006', fontSize: 32, lineHeight: 1.2 }}>
          You are feeling a little stressed. That is okay.
        </h1>
        <p style={{ margin: 0, color: '#78350f', fontSize: 16 }}>
          Try one of these right now.
        </p>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '0.9rem',
          }}
        >
          {YELLOW_ACTIVITIES.map((activity) => (
            <article
              key={activity.title}
              onClick={() => handleActivitySelect(activity)}
              style={{
                borderRadius: 16,
                border: '1px solid #fde68a',
                background: 'linear-gradient(150deg, #fefce8 0%, #fef9c3 100%)',
                overflow: 'hidden',
                boxShadow: '0 10px 18px rgba(161,98,7,0.08)',
                cursor: isStudent ? 'pointer' : 'default',
                transform: 'translateY(0)',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
              }}
            >
              <div
                style={{
                  height: 160,
                  backgroundImage: `linear-gradient(160deg, rgba(15,23,42,0.24), rgba(15,23,42,0.04)), url('${activity.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#fde68a',
                }}
              />
              <div style={{ padding: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }} aria-hidden='true'>
                    {activity.icon}
                  </span>
                  <h3 style={{ margin: 0, color: '#78350f', fontSize: 20, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif', letterSpacing: '0.02em' }}>
                    {activity.title}
                  </h3>
                </div>
                <p style={{ margin: 0, color: '#854d0e', fontSize: 14, lineHeight: 1.65 }}>{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div
        style={{
          marginTop: '1rem',
          borderRadius: 14,
          border: '1px solid #fef08a',
          background: '#fffbeb',
          padding: '0.8rem 1rem',
        }}
      >
        {status === 'saving' && <div style={{ color: '#854d0e', fontSize: 14 }}>Saving your activity note...</div>}
        {status === 'done' && <div style={{ color: '#14532d', fontSize: 14 }}>Your activity was noted.</div>}
        {status === 'forbidden' && <div style={{ color: '#854d0e', fontSize: 14 }}>Your activity was noted.</div>}
        {status === 'error' && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/group-chat')}
          style={{
            border: 'none',
            borderRadius: 999,
            background: 'linear-gradient(140deg, #f59e0b, #d97706)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            padding: '0.66rem 1.1rem',
            cursor: 'pointer',
            boxShadow: '0 10px 18px rgba(217,119,6,0.25)',
          }}
        >
          Talk to Someone
        </button>

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
              border: '1px solid #fde68a',
              background: '#fefce8',
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
                      color: '#78350f',
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
                    background: '#fef3c7',
                    color: '#92400e',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '0.45rem 0.6rem',
                  }}
                >
                  Close
                </button>
              </div>
              <p style={{ margin: '0.65rem 0 0', color: '#854d0e', fontSize: 15, lineHeight: 1.75 }}>
                {selectedActivity.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StressHubYellowResult
