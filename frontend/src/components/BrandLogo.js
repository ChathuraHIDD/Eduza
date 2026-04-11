import { useState } from 'react'

function BrandLogo({
  width = 36,
  height = 36,
  rounded = 10,
  scale = 1,
  showWordmark = false,
  wordmarkColor = '#132a60',
  imagePath = '/images/eduza-logo.png',
  bg = 'transparent',
  padding = 0,
  style = {},
  imageStyle = {},
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      {!hasError ? (
        <div
          style={{
            width,
            height,
            borderRadius: rounded,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bg,
            padding,
            boxSizing: 'border-box',
          }}
        >
          <img
            src={imagePath}
            alt="EDUZA logo"
            width={width}
            height={height}
            onError={() => setHasError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              filter: 'drop-shadow(0 10px 18px rgba(249,115,22,0.3))',
              ...imageStyle,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width,
            height,
            borderRadius: rounded,
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.max(12, Math.round(Math.min(width, height) * 0.44)),
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            boxShadow: '0 10px 24px rgba(249,115,22,0.22)',
          }}
        >
          E
        </div>
      )}

      {showWordmark && (
        <span style={{ fontSize: 20, fontWeight: 700, color: wordmarkColor, letterSpacing: '-0.5px' }}>
          EDU<span style={{ color: '#f97316' }}>ZA</span>
        </span>
      )}
    </div>
  )
}

export default BrandLogo
