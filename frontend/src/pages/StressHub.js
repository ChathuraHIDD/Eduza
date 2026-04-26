import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STRESS_LEVELS = [
  {
    label: 'No Stress',
    short: 'No Stress',
    route: '/stress-hub/blue',
    scale: '0-1',
    colors: ['#6ddc57', '#3dbf47'],
    face: 'big-smile',
    description: 'You feel calm, steady, and fully in control.',
  },
  {
    label: 'Mild',
    short: 'Mild',
    route: '/stress-hub/green',
    scale: '2-3',
    colors: ['#b7ef52', '#79cb46'],
    face: 'smile',
    description: 'You feel okay with a little pressure, but still balanced.',
  },
  {
    label: 'Moderate',
    short: 'Moderate',
    route: '/stress-hub/yellow',
    scale: '4-5',
    colors: ['#ffe816', '#ffcd00'],
    face: 'flat',
    description: 'Stress is noticeable and starting to affect your focus.',
  },
  {
    label: 'Severe',
    short: 'Severe',
    route: '/stress-hub/orange',
    scale: '6-7',
    colors: ['#ffc14f', '#ff9823'],
    face: 'sad',
    description: 'Stress feels heavy and you likely need support right now.',
  },
  {
    label: 'Very Severe',
    short: 'Very Severe',
    route: '/stress-hub/orange',
    scale: '8-9',
    colors: ['#ffa24a', '#ff7a22'],
    face: 'shaky',
    description: 'Your body and mind are under strong pressure.',
  },
  {
    label: 'Worst Possible',
    short: 'Worst Possible',
    route: '/stress-hub/red',
    scale: '10',
    colors: ['#ff5248', '#f12626'],
    face: 'panic',
    description: 'This is an urgent stress state. Strong help is recommended.',
  },
]

function StressFace({ variant, colors }) {
  const isFlat = variant === 'flat'
  const isSad = variant === 'sad'
  const isShaky = variant === 'shaky'
  const isPanic = variant === 'panic'
  const isSmile = variant === 'smile' || variant === 'big-smile'

  return (
    <div
      style={{
        width: 132,
        height: 132,
        borderRadius: '50%',
        margin: '0 auto',
        position: 'relative',
        background: `radial-gradient(circle at 30% 24%, rgba(255,255,255,0.38), transparent 22%), linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        boxShadow: '0 14px 28px rgba(15, 23, 42, 0.12)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 38,
          top: 48,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.22)',
          boxShadow: '42px 0 0 rgba(0,0,0,0.22)',
        }}
      />

      {(variant === 'big-smile' || variant === 'smile') && (
        <>
          <div style={{ position: 'absolute', left: 28, top: 28, width: 16, height: 8, borderTop: '4px solid rgba(0,0,0,0.2)', borderRadius: '14px 14px 0 0' }} />
          <div style={{ position: 'absolute', right: 28, top: 28, width: 16, height: 8, borderTop: '4px solid rgba(0,0,0,0.2)', borderRadius: '14px 14px 0 0' }} />
        </>
      )}

      {(isFlat || isSad || isShaky || isPanic) && (
        <>
          <div style={{ position: 'absolute', left: 30, top: 34, width: 18, height: 4, borderTop: '4px solid rgba(0,0,0,0.18)' }} />
          <div style={{ position: 'absolute', right: 30, top: 34, width: 18, height: 4, borderTop: '4px solid rgba(0,0,0,0.18)' }} />
        </>
      )}

      {variant === 'big-smile' && (
        <div
          style={{
            position: 'absolute',
            left: 26,
            bottom: 28,
            width: 80,
            height: 40,
            borderBottom: '5px solid rgba(0,0,0,0.2)',
            borderRadius: '0 0 70px 70px',
          }}
        />
      )}

      {variant === 'smile' && (
        <div
          style={{
            position: 'absolute',
            left: 36,
            bottom: 32,
            width: 60,
            height: 30,
            borderBottom: '5px solid rgba(0,0,0,0.2)',
            borderRadius: '0 0 50px 50px',
          }}
        />
      )}

      {isFlat && (
        <div
          style={{
            position: 'absolute',
            left: 45,
            bottom: 44,
            width: 42,
            borderTop: '5px solid rgba(0,0,0,0.2)',
          }}
        />
      )}

      {isSad && (
        <div
          style={{
            position: 'absolute',
            left: 38,
            bottom: 36,
            width: 56,
            height: 24,
            borderTop: '5px solid rgba(0,0,0,0.2)',
            borderRadius: '36px 36px 0 0',
          }}
        />
      )}

      {isShaky && (
        <svg
          viewBox="0 0 100 40"
          style={{
            position: 'absolute',
            left: 28,
            bottom: 26,
            width: 76,
            height: 28,
          }}
        >
          <path
            d="M5 20 C 12 6, 20 34, 28 20 S 44 6, 52 20 S 68 34, 76 20 S 88 6, 95 20"
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )}

      {isPanic && (
        <div
          style={{
            position: 'absolute',
            left: 29,
            bottom: 24,
            width: 74,
            height: 34,
            borderRadius: '18px',
            background: 'rgba(196, 17, 17, 0.28)',
          }}
        />
      )}
    </div>
  )
}

function StressHub() {
  const navigate = useNavigate()
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(null)

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

  const handleSelect = (item) => {
    setSelectedLevel(item.label)
    if (!isStudent) return

    navigate(item.route, {
      state: {
        stressLabel: item.label,
        stressScale: item.scale,
      },
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '36px 24px',
        background:
          'radial-gradient(circle at top left, rgba(255, 211, 153, 0.22), transparent 18%), radial-gradient(circle at top right, rgba(191, 219, 254, 0.2), transparent 18%), linear-gradient(180deg, #fbfbfd 0%, #f5f7fb 100%)',
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          transform: animateIn ? 'translateY(0)' : 'translateY(12px)',
          opacity: animateIn ? 1 : 0.72,
          transition: 'all 520ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: '999px',
                background: '#fff7ed',
                color: '#ea580c',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Stress Check-In
            </div>
            <h1
              style={{
                margin: '18px 0 0',
                color: '#2d2642',
                fontSize: 50,
                lineHeight: 1.02,
                letterSpacing: '-0.05em',
                fontWeight: 800,
              }}
            >
              How stressed are you right now?
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: 620, color: '#7c7f91', lineHeight: 1.7, fontSize: 16 }}>
              Choose the level that matches how you feel now. We will take you to the support page that fits your current state.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ‹
          </button>
        </div>

        {!isStudent && (
          <div
            style={{
              marginTop: 18,
              borderRadius: 16,
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '12px 14px',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Only student accounts can submit a stress check-in.
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
              gap: 10,
              alignItems: 'end',
            }}
          >
            {Array.from({ length: 11 }, (_, index) => (
              <div key={index} style={{ textAlign: 'center', color: '#111827', fontSize: 22, fontWeight: 500 }}>
                {index}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
              gap: 6,
              marginTop: 12,
            }}
          >
            {[
              '#42bf4f',
              '#57c246',
              '#70c742',
              '#89cb3f',
              '#c6d726',
              '#ffce12',
              '#ffb61d',
              '#ff9d22',
              '#ff8420',
              '#ff661b',
              '#f14426',
            ].map((color, index) => (
              <div
                key={index}
                style={{
                  height: 34,
                  background: color,
                  borderRadius: index === 0 ? '999px 0 0 999px' : index === 10 ? '0 999px 999px 0' : 0,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 42,
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(160px, 1fr))',
            gap: 22,
            alignItems: 'start',
          }}
        >
          {STRESS_LEVELS.map((item) => {
            const active = selectedLevel === item.label

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelect(item)}
                disabled={!isStudent}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: isStudent ? 'pointer' : 'not-allowed',
                  opacity: isStudent ? 1 : 0.58,
                  transform: active ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'transform 0.16s ease',
                }}
              >
                <StressFace variant={item.face} colors={item.colors} />
                <div style={{ marginTop: 18, color: '#111827', fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>
                  {item.short}
                </div>
                <div style={{ marginTop: 10, color: '#7c7f91', fontSize: 13, lineHeight: 1.65, maxWidth: 180, marginInline: 'auto' }}>
                  {item.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StressHub
