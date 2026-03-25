import StressHubPanel from '../components/schedule/StressHubPanel'

function StressHub() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Inter", "Space Grotesk", sans-serif',
          boxShadow: '0 8px 32px rgba(8,145,178,0.25)',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.75)',
            fontWeight: 700,
          }}
        >
          Wellness Focus
        </p>
        <h2
          style={{
            margin: '0.4rem 0 0.6rem',
            fontSize: 28,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}
        >
          Stress Management Hub
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 620, lineHeight: 1.6 }}>
          Track your stress levels with color signals, log calming sessions, and follow smart alerts to stay balanced.
        </p>
      </div>

      <StressHubPanel />
    </div>
  )
}

export default StressHub
