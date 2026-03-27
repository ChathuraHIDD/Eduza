import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const GAME_MAP = {
  'underwater-drift': {
    title: 'Underwater Drift',
    subtitle: 'Soft directional guide',
  },
  'lantern-sky': {
    title: 'Lantern Sky',
    subtitle: 'Release healing words',
  },
  'rain-room': {
    title: 'Rain Room',
    subtitle: 'Move your calm circle',
  },
  'desert-sunrise': {
    title: 'Desert Sunrise',
    subtitle: 'Pure cinematic watch',
  },
  'firefly-forest': {
    title: 'Firefly Forest',
    subtitle: 'Tap to attract light',
  },
}

const JELLYFISH = [
  { x: 18, y: 68, size: 22 },
  { x: 38, y: 58, size: 16 },
  { x: 64, y: 72, size: 20 },
  { x: 78, y: 62, size: 14 },
]

const RAINDROPS = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  x: (i * 19) % 100,
  speed: 0.7 + (i % 5) * 0.18,
  size: 6 + (i % 4) * 3,
}))

const randomBetween = (min, max) => min + Math.random() * (max - min)

const randomFirefly = (id) => ({
  id,
  x: randomBetween(8, 92),
  y: randomBetween(12, 86),
  glow: randomBetween(0.6, 1),
})

function StressHubOrangeGamePage() {
  const { gameSlug } = useParams()

  const [sceneSeconds, setSceneSeconds] = useState(0)
  const [animTick, setAnimTick] = useState(0)
  const [driftPosition, setDriftPosition] = useState({ x: 50, y: 68 })
  const [lanternWord, setLanternWord] = useState('calm')
  const [lanterns, setLanterns] = useState([])
  const [releasedCount, setReleasedCount] = useState(0)
  const [showHappyEnding, setShowHappyEnding] = useState(false)
  const [calmCircle, setCalmCircle] = useState({ x: 50, y: 58 })
  const [fireflies, setFireflies] = useState(() => Array.from({ length: 12 }, (_, i) => randomFirefly(i + 1)))

  const game = GAME_MAP[gameSlug]

  const playToneSequence = useCallback((tones) => {
    try {
      if (typeof window === 'undefined') return
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      const now = ctx.currentTime + 0.02

      tones.forEach((tone) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = tone.type || 'sine'
        osc.frequency.setValueAtTime(tone.freq, now + tone.at)

        gain.gain.setValueAtTime(0.0001, now + tone.at)
        gain.gain.exponentialRampToValueAtTime(tone.volume || 0.05, now + tone.at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.at + tone.duration)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + tone.at)
        osc.stop(now + tone.at + tone.duration + 0.02)
      })

      const endAt = Math.max(...tones.map((tone) => tone.at + tone.duration))
      setTimeout(() => {
        ctx.close().catch(() => {})
      }, Math.max(350, Math.ceil((endAt + 0.08) * 1000)))
    } catch {
      // Sound is optional enhancement; ignore audio runtime issues silently.
    }
  }, [])

  const playLanternReleaseSound = useCallback(() => {
    playToneSequence([
      { freq: 523.25, at: 0, duration: 0.14, volume: 0.045, type: 'sine' },
      { freq: 659.25, at: 0.12, duration: 0.16, volume: 0.04, type: 'triangle' },
      { freq: 783.99, at: 0.24, duration: 0.2, volume: 0.035, type: 'sine' },
    ])
  }, [playToneSequence])

  const playHappyEndingSound = useCallback(() => {
    playToneSequence([
      { freq: 523.25, at: 0, duration: 0.15, volume: 0.05, type: 'triangle' },
      { freq: 659.25, at: 0.14, duration: 0.18, volume: 0.05, type: 'triangle' },
      { freq: 783.99, at: 0.28, duration: 0.2, volume: 0.055, type: 'sine' },
      { freq: 987.77, at: 0.42, duration: 0.24, volume: 0.05, type: 'sine' },
      { freq: 1174.66, at: 0.58, duration: 0.32, volume: 0.045, type: 'sine' },
    ])
  }, [playToneSequence])

  useEffect(() => {
    if (!game) return undefined
    setSceneSeconds(0)
    const timer = setInterval(() => {
      setSceneSeconds((prev) => Math.min(180, prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [game, gameSlug])

  useEffect(() => {
    if (!game) return undefined
    const timer = setInterval(() => setAnimTick((prev) => prev + 1), 120)
    return () => clearInterval(timer)
  }, [game])

  useEffect(() => {
    if (gameSlug !== 'lantern-sky') return undefined
    const timer = setInterval(() => {
      setLanterns((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.y + item.speed,
            x: Math.min(94, Math.max(6, item.x + Math.sin((Date.now() / 580) + item.phase) * item.drift)),
          }))
          .filter((item) => item.y < 128)
      )
    }, 90)
    return () => clearInterval(timer)
  }, [gameSlug])

  useEffect(() => {
    if (!showHappyEnding) return undefined
    const timer = setTimeout(() => setShowHappyEnding(false), 4200)
    return () => clearTimeout(timer)
  }, [showHappyEnding])

  useEffect(() => {
    if (gameSlug !== 'lantern-sky' || releasedCount === 0) return
    if (releasedCount % 5 === 0) {
      setShowHappyEnding(true)
      playHappyEndingSound()
    }
  }, [releasedCount, gameSlug, playHappyEndingSound])

  useEffect(() => {
    if (gameSlug !== 'firefly-forest') return undefined
    const timer = setInterval(() => {
      setFireflies((prev) => {
        const moved = prev.map((fly) => ({
          ...fly,
          x: Math.min(94, Math.max(6, fly.x + randomBetween(-1.4, 1.4))),
          y: Math.min(90, Math.max(8, fly.y + randomBetween(-1.2, 1.2))),
          glow: Math.min(1.2, Math.max(0.45, fly.glow + randomBetween(-0.12, 0.12))),
        }))

        if (moved.length >= 70 || Math.random() > 0.25) return moved

        return [...moved, randomFirefly(Date.now() + Math.floor(Math.random() * 1000))]
      })
    }, 320)
    return () => clearInterval(timer)
  }, [gameSlug])

  const movePointer = (event, setter) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY

    const x = ((clientX - rect.left) / rect.width) * 100
    const y = ((clientY - rect.top) / rect.height) * 100

    setter({
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(90, Math.max(8, y)),
    })
  }

  const releaseLantern = () => {
    const cleanWord = lanternWord.trim().slice(0, 18)
    if (!cleanWord) return

    const palettes = [
      { balloon: 'linear-gradient(180deg, #fef08a, #f59e0b)', glow: 'rgba(251,191,36,0.6)' },
      { balloon: 'linear-gradient(180deg, #bfdbfe, #38bdf8)', glow: 'rgba(56,189,248,0.55)' },
      { balloon: 'linear-gradient(180deg, #fbcfe8, #fb7185)', glow: 'rgba(244,114,182,0.55)' },
      { balloon: 'linear-gradient(180deg, #bbf7d0, #34d399)', glow: 'rgba(52,211,153,0.5)' },
    ]
    const colorSet = palettes[Math.floor(Math.random() * palettes.length)]

    setLanterns((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        word: cleanWord,
        x: randomBetween(10, 90),
        y: 2,
        speed: randomBetween(0.35, 0.72),
        drift: randomBetween(0.06, 0.22),
        phase: randomBetween(0, Math.PI * 2),
        balloon: colorSet.balloon,
        glow: colorSet.glow,
      },
    ])
    playLanternReleaseSound()

    setReleasedCount((prev) => prev + 1)
    setLanternWord('')
  }

  const attractFireflies = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY

    const cx = ((clientX - rect.left) / rect.width) * 100
    const cy = ((clientY - rect.top) / rect.height) * 100

    setFireflies((prev) =>
      prev.map((fly, index) =>
        index < 14
          ? {
              ...fly,
              x: Math.min(95, Math.max(5, cx + randomBetween(-10, 10))),
              y: Math.min(92, Math.max(6, cy + randomBetween(-10, 10))),
              glow: 1.15,
            }
          : fly
      )
    )
  }

  const sunriseProgress = useMemo(() => Math.min(1, sceneSeconds / 180), [sceneSeconds])
  const rainFade = useMemo(() => Math.max(0, 100 - sceneSeconds * 1.15), [sceneSeconds])
  const rainPhase = rainFade > 60 ? 'Heavy Rain' : rainFade > 20 ? 'Light Rain' : rainFade > 0 ? 'Snow Drift' : 'Clear Warm Room'

  if (!game) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}>
        <div style={{ borderRadius: 16, border: '1px solid #fecaca', background: '#fff7f7', color: '#991b1b', padding: '1rem' }}>
          Game not found.
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Link to='/stress-hub/orange' style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>
            Back to Orange games
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'radial-gradient(circle at 30% 20%, #1e293b 0%, #0f172a 45%, #020617 100%)',
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        padding: '1rem 1.2rem 1.2rem',
        boxSizing: 'border-box',
      }}
    >
      <style>
        {`
          @keyframes lanternSkyFloat {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-7px); }
            100% { transform: translateY(0px); }
          }

          @keyframes lanternSkyTwinkle {
            0% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.95; transform: scale(1.15); }
            100% { opacity: 0.25; transform: scale(0.85); }
          }

          @keyframes lanternSkyCelebrate {
            0% { opacity: 0; transform: translate(-50%, 12px) scale(0.95); }
            100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          }

          @keyframes lanternSkyShimmer {
            0% { transform: translateX(-120%); }
            100% { transform: translateX(140%); }
          }
        `}
      </style>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div
        style={{
          borderRadius: 20,
          padding: '1.25rem 1.4rem',
          background: 'linear-gradient(140deg, #7c2d12 0%, #c2410c 45%, #f97316 100%)',
          color: '#fff7ed',
          boxShadow: '0 20px 36px rgba(124,45,18,0.28)',
        }}
      >
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,247,237,0.88)', fontWeight: 700 }}>
          Orange Game Experience
        </div>
        <h1 style={{ margin: '0.35rem 0 0.3rem', fontSize: 30 }}>{game.title}</h1>
        <p style={{ margin: 0, color: 'rgba(255,247,237,0.94)' }}>{game.subtitle}</p>
      </div>

      <div style={{ marginTop: '0.9rem', marginBottom: '0.8rem', color: '#475569', fontSize: 13, fontWeight: 700 }}>
        {Math.floor(sceneSeconds / 60)}:{String(sceneSeconds % 60).padStart(2, '0')} / 3:00
      </div>

      <div
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid #fed7aa',
          background: '#020617',
          minHeight: '72vh',
          position: 'relative',
        }}
      >
        {gameSlug === 'underwater-drift' && (
          <div
            onMouseMove={(event) => movePointer(event, setDriftPosition)}
            onTouchMove={(event) => movePointer(event, setDriftPosition)}
            style={{
              position: 'relative',
              height: '72vh',
              background: 'radial-gradient(circle at 50% -20%, rgba(147,197,253,0.7) 0%, rgba(14,116,144,0.5) 25%, rgba(2,6,23,1) 80%)',
              overflow: 'hidden',
              cursor: 'crosshair',
            }}
          >
            <div style={{ position: 'absolute', left: '48%', top: -60, width: 180, height: 240, background: 'linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.02))', transform: 'translateX(-50%) rotate(3deg)', filter: 'blur(1px)' }} />
            {JELLYFISH.map((jelly, index) => (
              <div
                key={jelly.x}
                style={{
                  position: 'absolute',
                  left: `${jelly.x + Math.sin((animTick + index * 8) * 0.08) * 3}%`,
                  top: `${jelly.y + Math.cos((animTick + index * 8) * 0.08) * 2}%`,
                  width: jelly.size,
                  height: jelly.size,
                  borderRadius: '50% 50% 46% 46%',
                  background: 'radial-gradient(circle at 30% 25%, rgba(196,181,253,0.95), rgba(59,130,246,0.38))',
                  boxShadow: '0 0 16px rgba(56,189,248,0.45)',
                }}
              />
            ))}
            <div style={{ position: 'absolute', left: '18%', top: '48%', width: 150, height: 26, borderRadius: 99, background: 'rgba(148,163,184,0.2)', filter: 'blur(1px)' }} />
            <div style={{ position: 'absolute', left: '68%', top: '42%', width: 120, height: 20, borderRadius: 99, background: 'rgba(148,163,184,0.18)' }} />
            <div
              style={{
                position: 'absolute',
                left: `${driftPosition.x}%`,
                top: `${driftPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 32% 28%, #fdba74, #f97316)',
                boxShadow: '0 0 24px rgba(251,146,60,0.45)',
              }}
            />
            <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#e0f2fe', fontSize: 12 }}>
              Move gently with mouse/touch to drift
            </div>
          </div>
        )}

        {gameSlug === 'lantern-sky' && (
          <div
            style={{
              position: 'relative',
              height: '72vh',
              background: 'radial-gradient(circle at 50% -15%, rgba(14,165,233,0.3), rgba(8,47,73,0.08) 26%, transparent 58%), linear-gradient(180deg, #020617 0%, #0f172a 46%, #1e293b 100%)',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', left: '50%', top: '12%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(191,219,254,0.1) 45%, transparent 70%)', boxShadow: '0 0 60px rgba(125,211,252,0.22)' }} />
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={`star-${i}`}
                style={{
                  position: 'absolute',
                  left: `${8 + (i * 11) % 84}%`,
                  top: `${8 + (i * 7) % 38}%`,
                  width: 4 + (i % 3),
                  height: 4 + (i % 3),
                  borderRadius: '50%',
                  background: 'rgba(224,242,254,0.9)',
                  animation: `lanternSkyTwinkle ${1.6 + (i % 4) * 0.35}s ease-in-out infinite`,
                  animationDelay: `${(i % 6) * 0.2}s`,
                }}
              />
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 92, background: 'linear-gradient(180deg, rgba(30,41,59,0.18), rgba(15,23,42,0.88))' }} />

            {lanterns.map((lantern) => (
              <div
                key={lantern.id}
                style={{
                  position: 'absolute',
                  left: `${lantern.x}%`,
                  bottom: `${lantern.y}%`,
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  animation: `lanternSkyFloat ${2.6 + ((lantern.id % 4) * 0.35)}s ease-in-out infinite`,
                }}
              >
                <div
                  style={{
                    width: 54,
                    minHeight: 50,
                    borderRadius: '50% 50% 44% 44%',
                    background: lantern.balloon,
                    boxShadow: `0 0 28px ${lantern.glow}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#111827',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '0.28rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: -25,
                      top: 0,
                      width: 22,
                      height: '100%',
                      background: 'rgba(255,255,255,0.38)',
                      transform: 'skewX(-24deg)',
                      animation: 'lanternSkyShimmer 1.8s ease-in-out infinite',
                    }}
                  />
                  <span style={{ zIndex: 1, textShadow: '0 1px 0 rgba(255,255,255,0.55)' }}>{lantern.word}</span>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50% 50% 70% 70%', background: 'rgba(251,191,36,0.95)', margin: '0 auto', marginTop: -1 }} />
                <div style={{ width: 2, height: 28, background: 'rgba(226,232,240,0.82)', margin: '0 auto' }} />
              </div>
            ))}

            {showHappyEnding && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '20%',
                  transform: 'translateX(-50%)',
                  width: 'min(92%, 540px)',
                  borderRadius: 16,
                  border: '1px solid rgba(125,211,252,0.45)',
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.86), rgba(30,41,59,0.82))',
                  color: '#f8fafc',
                  padding: '0.95rem 1rem',
                  textAlign: 'center',
                  boxShadow: '0 18px 32px rgba(14,116,144,0.3)',
                  animation: 'lanternSkyCelebrate 380ms ease',
                }}
              >
                <div style={{ fontSize: 12, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#bae6fd', fontWeight: 800 }}>
                  Happy Ending Moment
                </div>
                <div style={{ marginTop: 4, fontSize: 22, fontWeight: 900, color: '#fef3c7' }}>Your hopes are rising beautifully</div>
                <div style={{ marginTop: 4, fontSize: 13, color: '#dbeafe' }}>
                  You released {releasedCount} uplifting words. Keep going, one kind thought at a time.
                </div>
              </div>
            )}

            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={lanternWord}
                onChange={(event) => setLanternWord(event.target.value)}
                placeholder='Type your hope, dream, or comment'
                style={{ flex: 1, minWidth: 220, borderRadius: 10, border: '1px solid #334155', padding: '0.58rem 0.72rem', background: 'rgba(11,18,32,0.92)', color: '#e2e8f0', fontSize: 13 }}
              />
              <button
                onClick={releaseLantern}
                style={{ border: 'none', borderRadius: 10, padding: '0.58rem 0.85rem', background: 'linear-gradient(145deg, #fbbf24, #f97316)', color: '#111827', fontWeight: 900, cursor: 'pointer', boxShadow: '0 12px 20px rgba(249,115,22,0.3)' }}
              >
                Send To Sky
              </button>
              <div style={{ width: '100%', color: '#e0f2fe', fontSize: 12 }}>
                Balloon messages released: {releasedCount} • Every 5 messages unlocks a happy ending moment.
              </div>
            </div>
          </div>
        )}

        {gameSlug === 'rain-room' && (
          <div
            onMouseMove={(event) => movePointer(event, setCalmCircle)}
            onTouchMove={(event) => movePointer(event, setCalmCircle)}
            style={{
              position: 'relative',
              height: '72vh',
              background: rainFade > 0 ? 'linear-gradient(180deg, #020617, #111827)' : 'linear-gradient(180deg, #f8fafc, #ffedd5)',
              overflow: 'hidden',
              cursor: 'crosshair',
            }}
          >
            {RAINDROPS.map((drop) => {
              const y = (animTick * drop.speed + drop.id * 7) % 120
              const isSnow = rainFade <= 20 && rainFade > 0
              return (
                <div
                  key={drop.id}
                  style={{
                    position: 'absolute',
                    left: `${drop.x}%`,
                    top: `${y - 20}%`,
                    width: isSnow ? 3 : 2,
                    height: isSnow ? 3 : drop.size,
                    borderRadius: 8,
                    background: isSnow ? 'rgba(255,255,255,0.85)' : `rgba(148,163,184,${Math.max(0.08, rainFade / 100)})`,
                  }}
                />
              )
            })}
            <div
              style={{
                position: 'absolute',
                left: `${calmCircle.x}%`,
                top: `${calmCircle.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0.04) 62%, rgba(251,191,36,0) 78%)',
                boxShadow: '0 0 20px rgba(251,191,36,0.25)',
                border: '1px solid rgba(251,191,36,0.3)',
              }}
            />
            <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#e2e8f0', fontSize: 12 }}>
              {rainPhase} • move your calm circle
            </div>
          </div>
        )}

        {gameSlug === 'desert-sunrise' && (
          <div
            style={{
              position: 'relative',
              height: '72vh',
              background: `linear-gradient(180deg, rgba(${8 + sunriseProgress * 130}, ${18 + sunriseProgress * 105}, ${35 + sunriseProgress * 50}, 1) 0%, rgba(${18 + sunriseProgress * 200}, ${34 + sunriseProgress * 120}, ${60 + sunriseProgress * 20}, 1) 52%, rgba(120,74,44,1) 100%)`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${76 - sunriseProgress * 56}%`,
                transform: 'translate(-50%, -50%)',
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fde68a 0%, #f97316 72%)',
                boxShadow: '0 0 36px rgba(251,146,60,0.5)',
              }}
            />
            <div style={{ position: 'absolute', left: -20, bottom: -40, width: 260, height: 120, borderRadius: '60% 40% 0 0', background: '#7c2d12' }} />
            <div style={{ position: 'absolute', right: -30, bottom: -45, width: 290, height: 130, borderRadius: '55% 45% 0 0', background: '#9a3412' }} />
            {sunriseProgress > 0.68 && (
              <>
                <div style={{ position: 'absolute', left: `${20 + (animTick % 80)}%`, top: '18%', width: 10, height: 2, background: '#1f2937' }} />
                <div style={{ position: 'absolute', left: `${24 + (animTick % 80)}%`, top: '20%', width: 8, height: 2, background: '#1f2937' }} />
                <div style={{ position: 'absolute', left: `${28 + (animTick % 80)}%`, top: '17%', width: 9, height: 2, background: '#1f2937' }} />
              </>
            )}
            <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#fff7ed', fontSize: 12 }}>
              Stay still. Watch the sunrise unfold.
            </div>
          </div>
        )}

        {gameSlug === 'firefly-forest' && (
          <div
            onMouseDown={attractFireflies}
            onTouchStart={attractFireflies}
            style={{
              position: 'relative',
              height: '72vh',
              background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #14532d 100%)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'absolute', left: '42%', bottom: 0, width: 120, height: 320, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(251,191,36,0.1))', clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)' }} />
            {fireflies.map((fly) => (
              <div
                key={fly.id}
                style={{
                  position: 'absolute',
                  left: `${fly.x}%`,
                  top: `${fly.y}%`,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'rgba(254,240,138,0.95)',
                  boxShadow: `0 0 ${10 + fly.glow * 18}px rgba(253,224,71,0.85)`,
                  transform: `scale(${0.85 + Math.sin((animTick + fly.id) * 0.08) * 0.2})`,
                }}
              />
            ))}
            <div style={{ position: 'absolute', left: 12, bottom: 12, color: '#fde68a', fontSize: 12 }}>
              Tap/click to attract fireflies • Lights gathered: {fireflies.length}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
        <Link
          to='/stress-hub/orange'
          style={{
            display: 'inline-block',
            borderRadius: 10,
            background: '#0f172a',
            color: '#f8fafc',
            textDecoration: 'none',
            padding: '0.58rem 0.9rem',
            fontWeight: 700,
          }}
        >
          Back To Game List
        </Link>
        <Link
          to='/stress-hub'
          style={{
            display: 'inline-block',
            borderRadius: 10,
            background: '#334155',
            color: '#f8fafc',
            textDecoration: 'none',
            padding: '0.58rem 0.9rem',
            fontWeight: 700,
          }}
        >
          Exit Full Screen
        </Link>
      </div>
      </div>
    </div>
  )
}

export default StressHubOrangeGamePage
