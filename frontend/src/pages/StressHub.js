import StressHubPanel from '../components/schedule/StressHubPanel'

function StressHub() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14,116,144,0.25) 0%, rgba(22,101,52,0.15) 50%, rgba(15,23,42,0.95) 100%)',
          border: '1px solid rgba(148,163,184,0.2)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -40,
            bottom: -60,
            width: 180,
            height: 180,
            borderRadius: '40%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)',
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: '#7dd3fc',
            fontWeight: 600,
          }}
        >
          Wellness Focus
        </p>
        <h2
          style={{
            margin: '0.4rem 0 0.6rem',
            fontSize: 28,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.5px',
          }}
        >
          Stress Management Hub
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: '#cbd5f5', maxWidth: 620, lineHeight: 1.6 }}>
          Track your stress levels with color signals, log calming sessions, and follow smart alerts to stay balanced.
        </p>
      </div>

      <StressHubPanel />
    </div>
  )
}

export default StressHub
