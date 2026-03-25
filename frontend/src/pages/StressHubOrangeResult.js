import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createStressLog, getFutureSelfMessage } from '../utils/stressHubApi'

const TABS = [
  { key: 'GAMES', label: 'Games' },
  { key: 'MUSIC', label: 'Calm Music Videos' },
  { key: 'TECHNIQUES', label: 'Techniques' },
  { key: 'COMMUNITY', label: 'Community Favorites' },
]

const ORANGE_GAMES = [
  {
    slug: 'underwater-drift',
    title: 'Underwater Drift',
    subtitle: 'A bioluminescent journey through the silent deep.',
    image: '/images/stress-games/underwater-drift.jpg',
    vibe: 'Deep Focus',
  },
  {
    slug: 'lantern-sky',
    title: 'Lantern Sky',
    subtitle: 'Release warm words into the night.',
    image: '/images/stress-games/lantern-sky.jpg',
    vibe: 'Gratitude',
  },
  {
    slug: 'rain-room',
    title: 'Rain Room',
    subtitle: 'Move your calm circle through the storm.',
    image: '/images/stress-games/rain-room.jpg',
    vibe: 'Breathing Flow',
  },
  {
    slug: 'desert-sunrise',
    title: 'Desert Sunrise',
    subtitle: 'A still cinematic reset over quiet dunes.',
    image: '/images/stress-games/desert-sunrise.jpg',
    vibe: 'Stillness',
  },
  {
    slug: 'firefly-forest',
    title: 'Firefly Forest',
    subtitle: 'Attract light and brighten the path.',
    image: '/images/stress-games/firefly-forest.jpg',
    vibe: 'Nature Calm',
  },
]

const FEATURED_PLAY_IMAGE = '/images/stress-games/featured-underwater.jpg'

function StressHubOrangeResult() {
  const navigate = useNavigate()
  const pulseRef = useRef(null)

  const [status, setStatus] = useState('saving')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [futureSelfMessage, setFutureSelfMessage] = useState('')
  const [activeTab, setActiveTab] = useState('GAMES')
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedGameSlug, setSelectedGameSlug] = useState(ORANGE_GAMES[0].slug)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isStudent = user?.role === 'student'

  const selectedGame = useMemo(
    () => ORANGE_GAMES.find((item) => item.slug === selectedGameSlug) || ORANGE_GAMES[0],
    [selectedGameSlug]
  )

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadFutureMessage = async () => {
      if (!isStudent) return
      try {
        const response = await getFutureSelfMessage()
        setFutureSelfMessage(response?.message || '')
      } catch {
        setFutureSelfMessage('')
      }
    }

    loadFutureMessage()
  }, [isStudent])

  useEffect(() => {
    const submitOrangeCheckIn = async () => {
      if (!isStudent) {
        setStatus('forbidden')
        return
      }

      try {
        setError('')
        await createStressLog({
          selectedColors: ['ORANGE'],
          notes: 'Auto-submitted from orange stress flow page',
          recentActivities: ['stress-hub-orange-flow'],
        })
        setSavedAt(new Date().toLocaleString())
        setStatus('done')
      } catch (err) {
        setError(err.message || 'Failed to submit orange stress check-in')
        setStatus('error')
      }
    }

    submitOrangeCheckIn()
  }, [isStudent])

  const launchSelectedGame = () => {
    navigate(`/stress-hub/orange/games/${selectedGameSlug}`)
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
      {futureSelfMessage && (
        <section
          style={{
            marginBottom: '0.9rem',
            borderRadius: 16,
            border: '1px solid #fdba74',
            background: 'linear-gradient(140deg, #fff7ed 0%, #ffedd5 100%)',
            padding: '0.9rem 1rem',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#9a3412', textTransform: 'uppercase' }}>
            Message From Your Green State
          </div>
          <p style={{ margin: '0.45rem 0 0', color: '#7c2d12', lineHeight: 1.65 }}>
            {futureSelfMessage}
          </p>
        </section>
      )}

      <section
        style={{
          borderRadius: 30,
          overflow: 'hidden',
          minHeight: 360,
          position: 'relative',
          backgroundImage:
            "linear-gradient(120deg, rgba(10,10,10,0.62) 0%, rgba(36,23,8,0.45) 38%, rgba(0,0,0,0.65) 100%), url('https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 26px 50px rgba(17,24,39,0.28)',
          transform: animateIn ? 'translateY(0)' : 'translateY(14px)',
          opacity: animateIn ? 1 : 0.68,
          transition: 'all 620ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ padding: '2.1rem 2rem', maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.24)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#fff7ed',
              fontWeight: 700,
              fontSize: 14,
              padding: '0.45rem 0.85rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
            High Cortisol Detected
          </div>

          <h1 style={{ margin: '1rem 0 0.65rem', color: '#fff7ed', fontSize: 34, lineHeight: 1.2 }}>
            You are in an elevated stress zone.
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,237,213,0.9)', fontSize: 15, lineHeight: 1.7 }}>
            Your heart rate variability is lower than usual. Let's take three minutes to reset your
            nervous system through guided resonance breathing.
          </p>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1.3rem' }}>
            <button
              onClick={() => navigate('/stress-hub/orange/games/underwater-drift')}
              style={{
                border: 'none',
                borderRadius: 999,
                background: 'linear-gradient(140deg, #f97316, #ea580c)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                padding: '0.85rem 1.5rem',
                cursor: 'pointer',
                boxShadow: '0 14px 26px rgba(249,115,22,0.35)',
              }}
            >
              Start Breathing Exercise
            </button>
            <button
              onClick={() => pulseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              style={{
                border: '1px solid rgba(255,237,213,0.45)',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff7ed',
                fontWeight: 700,
                fontSize: 16,
                padding: '0.85rem 1.4rem',
                cursor: 'pointer',
              }}
            >
              Check vitals
            </button>
          </div>
        </div>
      </section>

      <div
        style={{
          marginTop: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          paddingBottom: '0.4rem',
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                border: 'none',
                background: 'transparent',
                borderBottom: active ? '3px solid #ea580c' : '3px solid transparent',
                color: active ? '#9a3412' : '#52525b',
                fontWeight: active ? 800 : 600,
                padding: '0.7rem 0.2rem',
                cursor: 'pointer',
                fontSize: 20,
                fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
                letterSpacing: '0.03em',
                transition: 'all 220ms ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'GAMES' && (
        <section style={{ marginTop: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, color: '#9a3412', fontSize: 47, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
                Cinematic Mini Game
              </h2>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: 16 }}>
                Immersive focus experiences to calm the mind.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={selectedGameSlug}
                onChange={(event) => setSelectedGameSlug(event.target.value)}
                style={{
                  borderRadius: 10,
                  border: '1px solid #fed7aa',
                  padding: '0.55rem 0.7rem',
                  fontSize: 13,
                  color: '#7c2d12',
                  background: '#fff',
                }}
              >
                {ORANGE_GAMES.map((game) => (
                  <option key={game.slug} value={game.slug}>
                    {game.title}
                  </option>
                ))}
              </select>
              <button
                onClick={launchSelectedGame}
                style={{
                  border: 'none',
                  borderRadius: 999,
                  background: 'linear-gradient(140deg, #fb923c, #ea580c)',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '0.55rem 1rem',
                  cursor: 'pointer',
                }}
              >
                View All Experiences
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              borderRadius: 30,
              overflow: 'hidden',
              minHeight: 300,
              position: 'relative',
              backgroundImage: `radial-gradient(circle at 50% 4%, rgba(186,230,253,0.5) 0%, rgba(186,230,253,0) 38%), linear-gradient(145deg, rgba(2,6,23,0.32), rgba(2,132,199,0.18) 46%, rgba(2,6,23,0.58)), url('${FEATURED_PLAY_IMAGE}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 38px rgba(15,23,42,0.2)',
            }}
          >
            <div
              style={{
                padding: '1.15rem 1.25rem',
                display: 'inline-block',
                background: 'linear-gradient(160deg, rgba(15,23,42,0.72), rgba(51,65,85,0.56))',
                border: '1px solid rgba(203,213,225,0.25)',
                backdropFilter: 'blur(2px)',
                borderRadius: 16,
                margin: '1.1rem 0 0 1.1rem',
                color: '#fff',
                maxWidth: 560,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fcd34d', letterSpacing: '0.08em' }}>
                FEATURED PLAY
              </div>
              <div
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                  fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
                  letterSpacing: '0.02em',
                  lineHeight: 0.98,
                }}
              >
                Underwater Drift
              </div>
              <div style={{ marginTop: 6, color: '#dbeafe', fontSize: 19 }}>
                A bioluminescent journey through the silent deep.
              </div>
            </div>

            <button
              onClick={() => navigate('/stress-hub/orange/games/underwater-drift')}
              style={{
                position: 'absolute',
                right: 22,
                bottom: 22,
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: 'none',
                background: '#ffffff',
                color: '#c2410c',
                fontSize: 28,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 14px 24px rgba(0,0,0,0.3)',
              }}
            >
              {'>'}
            </button>
          </div>

          <div
            style={{
              marginTop: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {ORANGE_GAMES.map((card) => (
              <div
                key={card.title}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 20px rgba(15,23,42,0.07)',
                }}
              >
                <div
                  style={{
                    height: 150,
                    backgroundImage: `linear-gradient(140deg, rgba(15,23,42,0.16), rgba(15,23,42,0.04)), url('${card.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#e2e8f0',
                  }}
                />
                <div style={{ padding: '0.8rem' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      borderRadius: 999,
                      background: '#ffedd5',
                      color: '#9a3412',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      marginBottom: 6,
                    }}
                  >
                    {card.vibe}
                  </div>
                  <div
                    style={{
                      color: '#111827',
                      fontWeight: 800,
                      fontSize: 18,
                      fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>{card.subtitle}</div>
                  <button
                    onClick={() => navigate(`/stress-hub/orange/games/${card.slug}`)}
                    style={{
                      marginTop: 10,
                      border: 'none',
                      borderRadius: 8,
                      background: 'linear-gradient(140deg, #fb923c, #ea580c)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '0.4rem 0.7rem',
                      cursor: 'pointer',
                    }}
                  >
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1rem',
              borderRadius: 14,
              border: '1px solid #fed7aa',
              background: '#fff7ed',
              padding: '0.8rem',
            }}
          >
            <div style={{ color: '#9a3412', fontWeight: 700, marginBottom: 4 }}>Selected experience</div>
            <div style={{ color: '#7c2d12' }}>
              {selectedGame.title} - {selectedGame.subtitle}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'MUSIC' && (
        <section
          style={{
            marginTop: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <iframe
            width='100%'
            height='220'
            src='https://www.youtube.com/embed/lFcSrYw-ARY'
            title='Calm Music'
            style={{ border: 0, borderRadius: 14, boxShadow: '0 12px 24px rgba(15,23,42,0.12)' }}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          />
          <iframe
            width='100%'
            height='220'
            src='https://www.youtube.com/embed/qUz93CyNIz0'
            title='Calming Techniques'
            style={{ border: 0, borderRadius: 14, boxShadow: '0 12px 24px rgba(15,23,42,0.12)' }}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          />
        </section>
      )}

      {activeTab === 'TECHNIQUES' && (
        <section style={{ marginTop: '1.25rem', display: 'grid', gap: '0.6rem' }}>
          {[
            'Breathe with a fixed rhythm: 4 in, 4 hold, 6 out for 5 rounds.',
            'Break your work into one tiny next step. Focus only on the next 10 minutes.',
            'Release body tension: drop shoulders, unclench jaw, relax hands.',
            'Hydrate and stand near a window for 2 minutes of slow breathing.',
            'Message a friend, mentor, or family member if stress keeps rising.',
          ].map((tip, index) => (
            <div
              key={tip}
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#fff',
                padding: '0.8rem',
                color: '#334155',
                boxShadow: '0 6px 12px rgba(15,23,42,0.05)',
              }}
            >
              <span style={{ color: '#c2410c', fontWeight: 800, marginRight: 6 }}>{index + 1}.</span>
              {tip}
            </div>
          ))}
        </section>
      )}

      {activeTab === 'COMMUNITY' && (
        <section
          style={{
            marginTop: '1.25rem',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            background: '#fff',
            padding: '1rem',
          }}
        >
          <div style={{ color: '#111827', fontWeight: 800 }}>Community favorites are updating soon.</div>
          <div style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            You'll see the most-used calming sessions from students here.
          </div>
        </section>
      )}

      <section
        ref={pulseRef}
        style={{
          marginTop: '1.3rem',
          borderRadius: 24,
          background: 'linear-gradient(130deg, #27272a 0%, #3f3f46 100%)',
          color: '#fff',
          padding: '1.3rem',
          boxShadow: '0 20px 30px rgba(0,0,0,0.22)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 38, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
          Your Resilience Pulse
        </h3>
        <p style={{ margin: '0.4rem 0 0', color: 'rgba(255,255,255,0.8)' }}>
          Your current stress resilience is improving. Based on your activity, we recommend a cool-down
          session in 15 minutes.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#fdba74' }}>78%</div>
            <div style={{ fontSize: 12, color: '#d4d4d8', letterSpacing: '0.08em' }}>RESILIENCE</div>
          </div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#fdba74' }}>12m</div>
            <div style={{ fontSize: 12, color: '#d4d4d8', letterSpacing: '0.08em' }}>MINDFULNESS</div>
          </div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#fdba74' }}>Good</div>
            <div style={{ fontSize: 12, color: '#d4d4d8', letterSpacing: '0.08em' }}>SLEEP QUALITY</div>
          </div>
        </div>
      </section>

      <div
        style={{
          marginTop: '1rem',
          borderRadius: 14,
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          padding: '0.8rem 1rem',
        }}
      >
        {status === 'saving' && (
          <div style={{ color: '#9a3412', fontSize: 13 }}>Saving your Orange stress event...</div>
        )}
        {status === 'done' && (
          <div style={{ color: '#14532d', fontSize: 13 }}>Orange stress check-in saved at {savedAt}.</div>
        )}
        {status === 'forbidden' && (
          <div style={{ color: '#991b1b', fontSize: 13 }}>Only student accounts can submit this check-in.</div>
        )}
        {status === 'error' && <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div>}
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
            padding: '0.6rem 0.9rem',
            fontWeight: 700,
          }}
        >
          Back to color hub
        </Link>
      </div>
    </div>
  )
}

export default StressHubOrangeResult
