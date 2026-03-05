import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/smart-schedule': 'Smart Schedule',
  '/stress-hub': 'Stress Management Hub',
  '/profile': 'My Profile',
  '/lecture-profile': 'Lecture Profile',
}

function Topbar({ onMenuClick }) {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'EDUZA'

  return (
    <header style={{
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #e8ecf4',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem',
      gap: '1rem',
      flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{
          background: 'none', border: 'none', color: '#6b7280',
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
      <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
        {title}
      </h1>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#f4f6fb', border: '1.5px solid #e8ecf4',
        borderRadius: '10px', padding: '7px 14px',
        maxWidth: 240, width: '100%',
        transition: 'border-color 0.15s',
      }}>
        <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Search..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            fontSize: 13, color: '#374151', width: '100%',
          }}
        />
      </div>

      {/* Notification bell */}
      <button style={{
        background: '#f4f6fb', border: '1.5px solid #e8ecf4',
        borderRadius: '10px', width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#6b7280', position: 'relative', flexShrink: 0,
        transition: 'all 0.15s ease',
      }}>
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: '#f97316', border: '1.5px solid #ffffff',
        }} />
      </button>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
      }}>JD</div>
    </header>
  )
}

export default Topbar
