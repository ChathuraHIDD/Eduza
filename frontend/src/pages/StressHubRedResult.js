import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createStressLog, getFutureSelfMessage } from '../utils/stressHubApi'

const RED_SUPPORT_CARDS = [
  {
    title: 'Book A Doctor Visit',
    subtitle: 'Please go and meet a doctor to reduce your stress level safely.',
    image:
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80',
    badge: 'Medical Support',
    actionLabel: 'Open Sri Lanka Hospital Links',
    actionUrl: '#sri-lanka-hospital-links',
  },
  {
    title: 'Contact Campus Counsellor',
    subtitle: 'Talk to a professional counsellor today and share what you are feeling.',
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80',
    badge: 'Counselling',
    actionLabel: 'Call 1926 (Mental Health Helpline)',
    actionUrl: 'tel:1926',
  },
  {
    title: 'Inform A Trusted Person',
    subtitle: 'Tell a parent, guardian, or close friend so you are not handling this alone.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    badge: 'Immediate Support',
  },
]

const SRI_LANKA_HOSPITALS = [
  {
    name: 'National Institute of Mental Health (NIMH) - Angoda',
    city: 'Colombo',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=National+Institute+of+Mental+Health+Angoda',
    websiteUrl: 'https://nimh.health.gov.lk/',
  },
  {
    name: 'National Hospital of Sri Lanka',
    city: 'Colombo',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=National+Hospital+of+Sri+Lanka',
    websiteUrl: 'https://nhsl.health.gov.lk/',
  },
  {
    name: 'Lanka Hospitals',
    city: 'Colombo',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lanka+Hospitals+Colombo',
    websiteUrl: 'https://www.lankahospitals.com/',
  },
  {
    name: 'Asiri Hospital',
    city: 'Colombo',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Asiri+Hospital+Colombo',
    websiteUrl: 'https://asirihealth.com/',
  },
  {
    name: 'Nawaloka Hospital',
    city: 'Colombo',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Nawaloka+Hospital+Colombo',
    websiteUrl: 'https://www.nawaloka.com/',
  },
]

function StressHubRedResult() {
  const [status, setStatus] = useState('saving')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [futureSelfMessage, setFutureSelfMessage] = useState('')
  const [animateIn, setAnimateIn] = useState(false)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isStudent = user?.role === 'student'

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
    const submitRedCheckIn = async () => {
      if (!isStudent) {
        setStatus('forbidden')
        return
      }

      try {
        setError('')
        await createStressLog({
          selectedColors: ['RED'],
          notes: 'Auto-submitted from red stress flow page',
          recentActivities: ['stress-hub-red-flow'],
        })
        setSavedAt(new Date().toLocaleString())
        setStatus('done')
      } catch (err) {
        setError(err.message || 'Failed to submit red stress check-in')
        setStatus('error')
      }
    }

    submitRedCheckIn()
  }, [isStudent])

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
      {futureSelfMessage && (
        <section
          style={{
            marginBottom: '0.9rem',
            borderRadius: 16,
            border: '1px solid #fca5a5',
            background: 'linear-gradient(140deg, #fff1f2 0%, #ffe4e6 100%)',
            padding: '0.9rem 1rem',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#9f1239',
              textTransform: 'uppercase',
            }}
          >
            Message From Your Better Day
          </div>
          <p style={{ margin: '0.45rem 0 0', color: '#881337', lineHeight: 1.65 }}>{futureSelfMessage}</p>
        </section>
      )}

      <section
        style={{
          borderRadius: 30,
          overflow: 'hidden',
          minHeight: 360,
          position: 'relative',
          backgroundImage:
            "linear-gradient(120deg, rgba(17,17,17,0.68) 0%, rgba(69,10,10,0.52) 40%, rgba(17,17,17,0.7) 100%), url('https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 26px 50px rgba(127,29,29,0.33)',
          transform: animateIn ? 'translateY(0)' : 'translateY(14px)',
          opacity: animateIn ? 1 : 0.68,
          transition: 'all 620ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ padding: '2.1rem 2rem', maxWidth: 680 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#fff1f2',
              fontWeight: 700,
              fontSize: 14,
              padding: '0.45rem 0.85rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            Critical Stress Alert
          </div>

          <h1 style={{ margin: '1rem 0 0.65rem', color: '#fff1f2', fontSize: 36, lineHeight: 1.2 }}>
            You are in a high stress condition.
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,241,242,0.93)', fontSize: 16, lineHeight: 1.7 }}>
            Please go and meet a doctor to reduce your stress level. Do not ignore this condition.
            Professional medical support is the safest next step.
          </p>

          <div style={{ marginTop: '1.3rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button
              style={{
                border: 'none',
                borderRadius: 999,
                background: 'linear-gradient(140deg, #ef4444, #be123c)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 16,
                padding: '0.85rem 1.5rem',
                cursor: 'default',
                boxShadow: '0 14px 26px rgba(190,24,93,0.35)',
              }}
            >
              Meet A Doctor Today
            </button>
            <a
              href='tel:1990'
              style={{
                borderRadius: 999,
                background: 'rgba(15,23,42,0.75)',
                border: '1px solid rgba(255,255,255,0.26)',
                color: '#fff1f2',
                fontWeight: 700,
                fontSize: 15,
                padding: '0.78rem 1.1rem',
                textDecoration: 'none',
              }}
            >
              Call 1990 Ambulance
            </a>
            <a
              href='#sri-lanka-hospital-links'
              style={{
                borderRadius: 999,
                background: 'rgba(255,241,242,0.18)',
                border: '1px solid rgba(255,255,255,0.28)',
                color: '#fff1f2',
                fontWeight: 700,
                fontSize: 15,
                padding: '0.78rem 1.1rem',
                textDecoration: 'none',
              }}
            >
              View Sri Lanka Hospitals
            </a>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.35rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, color: '#9f1239', fontSize: 47, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
              Immediate Clinical Guidance
            </h2>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: 16 }}>
              Follow these support steps now. No games or music - focus on medical care.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '1.2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {RED_SUPPORT_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid #fecdd3',
                boxShadow: '0 12px 22px rgba(15,23,42,0.08)',
              }}
            >
              <div
                style={{
                  height: 160,
                  backgroundImage: `linear-gradient(140deg, rgba(15,23,42,0.16), rgba(15,23,42,0.04)), url('${card.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#fda4af',
                }}
              />
              <div style={{ padding: '0.8rem' }}>
                <div
                  style={{
                    display: 'inline-block',
                    borderRadius: 999,
                    background: '#ffe4e6',
                    color: '#9f1239',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    marginBottom: 6,
                  }}
                >
                  {card.badge}
                </div>
                <div
                  style={{
                    color: '#111827',
                    fontWeight: 800,
                    fontSize: 20,
                    fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif',
                  }}
                >
                  {card.title}
                </div>
                <div style={{ marginTop: 4, color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{card.subtitle}</div>
                {card.actionUrl && card.actionLabel && (
                  <a
                    href={card.actionUrl}
                    target={card.actionUrl.startsWith('#') || card.actionUrl.startsWith('tel:') ? undefined : '_blank'}
                    rel={card.actionUrl.startsWith('#') || card.actionUrl.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                    style={{
                      marginTop: 10,
                      display: 'inline-block',
                      borderRadius: 8,
                      background: '#be123c',
                      color: '#fff',
                      padding: '0.45rem 0.65rem',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {card.actionLabel}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id='sri-lanka-hospital-links'
        style={{
          marginTop: '1.2rem',
          borderRadius: 18,
          border: '1px solid #fecdd3',
          background: 'linear-gradient(145deg, #fff1f2 0%, #ffffff 100%)',
          padding: '1rem',
        }}
      >
        <div style={{ fontSize: 13, color: '#9f1239', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Direct Sri Lanka Hospital Links
        </div>
        <h3 style={{ margin: '0.3rem 0 0', color: '#881337', fontSize: 28, fontFamily: '"Bebas Neue", "Space Grotesk", sans-serif' }}>
          Choose A Hospital And Go Now
        </h3>
        <p style={{ margin: '0.3rem 0 0', color: '#64748b', fontSize: 14 }}>
          Use these direct links to open map directions or official hospital websites quickly.
        </p>

        <div
          style={{
            marginTop: '0.85rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {SRI_LANKA_HOSPITALS.map((hospital) => (
            <div
              key={hospital.name}
              style={{
                borderRadius: 14,
                border: '1px solid #fecaca',
                background: '#fff',
                padding: '0.75rem',
                boxShadow: '0 10px 18px rgba(190,24,93,0.08)',
              }}
            >
              <div style={{ color: '#111827', fontWeight: 800, fontSize: 15, lineHeight: 1.45 }}>{hospital.name}</div>
              <div style={{ marginTop: 2, color: '#9f1239', fontSize: 12, fontWeight: 700 }}>{hospital.city}, Sri Lanka</div>

              <div style={{ marginTop: '0.65rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={hospital.mapUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    borderRadius: 8,
                    background: '#be123c',
                    color: '#fff',
                    padding: '0.44rem 0.62rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Open Map
                </a>
                <a
                  href={hospital.websiteUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{
                    borderRadius: 8,
                    background: '#f1f5f9',
                    color: '#0f172a',
                    padding: '0.44rem 0.62rem',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                  }}
                >
                  Official Website
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          marginTop: '1rem',
          borderRadius: 14,
          border: '1px solid #fecaca',
          background: '#fff1f2',
          padding: '0.85rem',
        }}
      >
        {status === 'saving' && <div style={{ color: '#881337', fontSize: 14 }}>Saving your stress status...</div>}
        {status === 'done' && (
          <div style={{ color: '#881337', fontSize: 14 }}>
            Your red check-in was logged at {savedAt}. Please meet a doctor as soon as possible.
          </div>
        )}
        {status === 'forbidden' && <div style={{ color: '#9f1239', fontSize: 14 }}>Your activity was noted.</div>}
        {status === 'error' && <div style={{ color: '#be123c', fontSize: 14 }}>{error}</div>}
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

export default StressHubRedResult
