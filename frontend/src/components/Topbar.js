import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/smart-schedule': 'Smart Schedule',
  '/profile': 'My Profile',
  '/lecture-profile': 'Lecture Profile',
}

function Topbar({ onMenuClick }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'EDUZA'

  return (
    <header style={{
      height: '64px',
      background: '#161616',
      borderBottom: '1px solid #222222',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem',
      gap: '1rem',
      flexShrink: 0,
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{
          background: 'none', border: 'none', color: '#aaa',
          cursor: 'pointer', padding: '6px', borderRadius: '8px',
          display: 'flex', alignItems: 'center',
        }}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Page title */}
      <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.3px' }}>
        {title}
      </h1>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#1e1e1e', border: '1px solid #2a2a2a',
        borderRadius: '10px', padding: '6px 14px',
        maxWidth: 240, width: '100%',
      }}>
        <svg width="15" height="15" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Search..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 13, color: '#ccc', width: '100%',
          }}
        />
      </div>

      {/* Notification bell */}
      <button style={{
        background: '#1e1e1e', border: '1px solid #2a2a2a',
        borderRadius: '10px', width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#aaa', position: 'relative', flexShrink: 0,
      }}>
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: '#f97316', border: '1.5px solid #161616',
        }} />
      </button>
    </header>
  )
}

export default Topbar
