import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import LogoutModal from './LogoutModal'

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#ffffff',
          borderRight: '1px solid #e8ecf4',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : undefined,
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
        }}
        className="hidden lg:flex"
      >
        <SidebarContent onClose={onClose} />
      </aside>

      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#ffffff',
          borderRight: '1px solid #e8ecf4',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const menuRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const formattedRole =
    user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'

  const homePath =
    user?.role === 'lecturer'
      ? '/lecturer'
      : user?.role === 'admin'
      ? '/admin'
      : user?.role === 'coordinator'
      ? '/coordinator'
      : '/'

  // different sidebar by role
  const studentNavItems = [
    {
      label: 'Smart Schedule',
      path: '/smart-schedule',
      icon: calendarIcon,
    },
    {
      label: 'Stress Management',
      path: '/stress-hub',
      icon: stressIcon,
    },
    {
      label: 'Group Chat',
      path: '/group-chat',
      icon: groupChatIcon,
    },
    {
      label: 'Kuppi Sessions',
      path: '/kuppi-sessions',
      icon: kuppiIcon,
    },
    {
      label: 'Software Hub',
      path: '/software-hub',
      icon: softwareHubIcon,
    },
    {
      label: 'AI Notes',
      path: '/ai-notes',
      icon: aiNotesIcon,
    },
  ]

  const lecturerNavItems = [
    {
      label: 'Software Hub',
      path: '/software-hub',
      icon: softwareHubIcon,
    },
  ]

  const adminNavItems = [
    {
      label: 'Lecture Profile',
      path: '/lecture-profile',
      icon: lectureProfileIcon,
    },
    {
      label: 'Software Hub',
      path: '/software-hub',
      icon: softwareHubIcon,
    },
    {
      label: 'Group Chat',
      path: '/group-chat',
      icon: groupChatIcon,
    },
  ]

  const coordinatorNavItems = [
    {
      label: 'Smart Schedule',
      path: '/smart-schedule',
      icon: calendarIcon,
    },
    {
      label: 'Software Hub',
      path: '/software-hub',
      icon: softwareHubIcon,
    },
    {
      label: 'Group Chat',
      path: '/group-chat',
      icon: groupChatIcon,
    },
    {
      label: 'AI Notes',
      path: '/ai-notes',
      icon: aiNotesIcon,
    },
  ]

  const navItems =
    user?.role === 'lecturer'
      ? lecturerNavItems
      : user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'coordinator'
      ? coordinatorNavItems
      : studentNavItems

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

  const handleProfileClick = () => {
    setMenuOpen(false)
    onClose?.()
    navigate('/profile')
  }

  const handleLogoutClick = () => {
    setMenuOpen(false)
    setLogoutModalOpen(true)
  }

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
      <div style={{
        padding: '1.25rem 1.5rem 1rem',
        borderBottom: '1px solid #e8ecf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
            boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
          }}>E</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
            EDU<span style={{ color: '#f97316' }}>ZA</span>
          </span>
        </NavLink>

        <button
          onClick={onClose}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav label */}
      <div style={{ padding: '1.25rem 1.5rem 0.4rem' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#b0bac9', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Navigation
        </span>
      </div>

      <nav style={{ padding: '0 0.75rem', flex: 1 }}>
        <NavLink
          to={homePath}
          end
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#f97316' : '#6b7280',
            background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
            marginBottom: 2,
            transition: 'all 0.15s ease',
          })}
        >
          {homeIcon}
          Home
        </NavLink>

        {/* Divider */}
        <div style={{ height: 1, background: '#e8ecf4', margin: '10px 4px' }} />

        <div style={{ padding: '4px 12px 8px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#b0bac9', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#f97316' : '#6b7280',
              background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
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
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e8ecf4',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#fafbfd',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
        }}>JD</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            John Doe
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Student</div>
        </div>
      </div>
    </>
  )
}

const homeIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const calendarIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const stressIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
)

const profileIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const lectureProfileIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const groupChatIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const kuppiIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="9" cy="7" r="4" />
    <path d="M17 11V7" />
    <path d="M15 9h4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
)

const softwareHubIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
  </svg>
)

const aiNotesIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

export default Sidebar