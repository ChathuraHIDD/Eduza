import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import LogoutModal from './LogoutModal' // login/register

const navItems = [
  {
    label: 'Smart Schedule',
    path: '/smart-schedule',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Stress Management',
    path: '/stress-hub',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    ),
  },
  /*{
    label: 'Profile',
    path: '/profile',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },*/
  {
    label: 'Lecture Profile',
    path: '/lecture-profile',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  // saumya's part
  {
    label: 'Group Chat',
    path: '/group-chat',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Kuppi Sessions',
    path: '/kuppi-sessions',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="9" cy="7" r="4" />
        <path d="M17 11V7" />
        <path d="M15 9h4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
  },
  {
    label: 'Software Hub',
    path: '/software-hub',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
      </svg>
    ),
  },
  {
    label: 'AI Notes',
    path: '/ai-notes',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#161616',
          borderRight: '1px solid #222222',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : undefined,
        }}
        className="hidden lg:flex"
      >
        <SidebarContent onClose={onClose} />
      </aside>

      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#161616',
          borderRight: '1px solid #222222',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="lg:hidden"
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}

function SidebarContent({ onClose }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false) // login/register
  const menuRef = useRef(null)

  // login/register - get logged user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // login/register - create initials from logged user name
  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  // login/register - format role with capital first letter
  const formattedRole =
    user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // user menu - go to profile
  const handleProfileClick = () => {
    setMenuOpen(false)
    onClose?.()
    navigate('/profile')
  }

  // user menu - open custom logout modal
  const handleLogoutClick = () => {
    setMenuOpen(false)
    setLogoutModalOpen(true)
  }

  // user menu - confirm logout
  const handleConfirmLogout = () => {
    setLogoutModalOpen(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onClose?.()
    navigate('/login')
  }

  return (
    <>
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}
          >
            E
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
            EDU<span style={{ color: '#f97316' }}>ZA</span>
          </span>
        </NavLink>

        <button
          onClick={onClose}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav label */}
      <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#555',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Navigation
        </span>
      </div>

      {/* Home link */}
      <nav style={{ padding: '0 0.75rem', flex: 1 }}>
        <NavLink
          to="/"
          end
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14.5px',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#f97316' : '#aaaaaa',
            background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
            marginBottom: 2,
            transition: 'all 0.15s ease',
          })}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>

        <div style={{ height: 1, background: '#222', margin: '10px 4px' }} />

        <div style={{ padding: '4px 12px 8px' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#555',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Menu
          </span>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14.5px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#f97316' : '#aaaaaa',
              background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
              marginBottom: 2,
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        ref={menuRef}
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #222',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name || 'User')}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#f0f0f0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'User'}
            </div>

            <div style={{ fontSize: 12, color: '#666' }}>
              {formattedRole}
            </div>
          </div>

          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#888"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{
              transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '20px',
              right: '20px',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
              zIndex: 100,
            }}
          >
            <button
              onClick={handleProfileClick}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ddd',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
                borderBottom: '1px solid #222',
              }}
            >
              Profile
            </button>

            <button
              onClick={handleLogoutClick}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ff8a8a',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Log out
            </button>
          </div>
        )}

        {/* login/register - custom styled logout modal */}
        <LogoutModal
          open={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      </div>
    </>
  )
}

export default Sidebar