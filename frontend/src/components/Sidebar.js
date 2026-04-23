import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import LogoutModal from './LogoutModal'
import BrandLogo from './BrandLogo'

function Sidebar({ open, onClose }) {
  return (
    <div
      style={{
        width: open ? '260px' : '0px',
        minWidth: open ? '260px' : '0px',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      aria-hidden={!open}
    >
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#f3f3f5',
          borderRight: '1px solid #e2e3e8',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          transition: 'opacity 0.2s ease',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </div>
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
      : user?.role === 'guardian'
      ? '/coordinator'
      : user?.role === 'coordinator'
      ? '/coordinator'
      : '/dashboard'

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
    {
      label: 'MBTI Measure',
      path: '/mbti-measure',
      icon: mbtiIcon,
    },
    {
      label: 'Progress Tracker',
      path: '/progress-tracker',
      icon: aiNotesIcon,
    },
    {
      label: 'GPA Calculator',
      path: '/gpa-calculator',
      icon: gpaCalculatorIcon,
    },
    {
      label: 'Get Break',
      path: '/get-break',
      icon: breakIcon,
    },

  ]

  const lecturerNavItems = [
    {
      label: 'Software Hub',
      path: '/software-hub',
      icon: softwareHubIcon,
    },
    {
      label: 'Lecture Profile',
      path: '/lecture-profile',
      icon: lectureProfileIcon,
    },
    {
      label: 'Module Quiz Manager',
      path: '/lecturer/module-quiz',
      icon: moduleQuizIcon,
    },
    {
      label: 'Module Self Check',
      path: '/lecturer/module-selfcheck',
      icon: moduleQuizIcon,
    },
  ]

  const adminNavItems = [
    {
      label: 'All Requests',
      path: '/admin/requests',
      icon: aiNotesIcon,
    },
    {
      label: 'Module Requests',
      path: '/admin/module-requests',
      icon: aiNotesIcon,
    },
    {
      label: 'Kuppi Details',
      path: '/admin/kuppi-details',
      icon: kuppiIcon,
    },
    {
      label: 'Create Kuppi',
      path: '/admin/create-kuppi',
      icon: kuppiIcon,
    },
 
    {
      label: 'Group Chat',
      path: '/group-chat',
      icon: groupChatIcon,
    },
    {
      label: 'Stress Management',
      path: '/admin/stress-management',
      icon: stressIcon,
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
    {
      label: 'MBTI Measure',
      path: '/mbti-measure',
      icon: mbtiIcon,
    },
  ]

  const guardianNavItems = [
    {
      label: 'Student Search',
      path: '/coordinator',
      icon: stressIcon,
    },
  ]

  const navItems =
    user?.role === 'lecturer'
      ? lecturerNavItems
      : user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'guardian'
      ? guardianNavItems
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
      <div
        style={{
          padding: '1.5rem 1.5rem 1rem',
          borderBottom: '1px solid #e2e3e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <NavLink to={homePath} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo
            width={60}
            height={60}
            rounded={18}
            scale={1}
            showWordmark={false}
            bg="#ffffff"
            padding={10}
            imageStyle={{ borderRadius: 16 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px' }}>
              EDUZA
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              Student Dashboard
            </span>
          </div>
        </NavLink>

        <button
          onClick={onClose}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', color: '#8d93a6', cursor: 'pointer', padding: 4 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#b0b5c4',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
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
            fontSize: '14.5px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#f97316' : '#6f7688',
            background: isActive ? '#efe2da' : 'transparent',
            marginBottom: 2,
            transition: 'all 0.15s ease',
          })}
        >
          {homeIcon}
          Home
        </NavLink>

        <div style={{ height: 1, background: '#dddfe6', margin: '10px 4px' }} />

        <div style={{ padding: '4px 12px 8px' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#b0b5c4',
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
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#f97316' : '#6f7688',
              background: isActive ? '#efe2da' : 'transparent',
              marginBottom: 2,
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        ref={menuRef}
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e3e8',
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
                color: '#1f2430',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'User'}
            </div>

            <div style={{ fontSize: 12, color: '#9096a8' }}>{formattedRole}</div>
          </div>

          <svg
            width="16"
            height="16"
            fill="none"
            stroke="#8d93a6"
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
              background: '#ffffff',
              border: '1px solid #e2e3e8',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 12px 24px rgba(16,24,40,0.12)',
              zIndex: 100,
            }}
          >
            <button
              onClick={handleProfileClick}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#4b5565',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
                borderBottom: '1px solid #eef0f4',
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
                color: '#e06a6a',
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

        <LogoutModal
          open={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
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

const mbtiIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 3a3 3 0 0 1 3 3c0 .74-.27 1.41-.72 1.92A4.5 4.5 0 0 1 18.5 12v1.5" />
    <path d="M12 3a3 3 0 0 0-3 3c0 .74.27 1.41.72 1.92A4.5 4.5 0 0 0 5.5 12v1.5" />
    <path d="M8 21v-2.5A2.5 2.5 0 0 1 10.5 16H12" />
    <path d="M16 21v-2.5a2.5 2.5 0 0 0-2.5-2.5H12" />
    <circle cx="12" cy="12" r="2.25" />
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

const moduleQuizIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M9 3h6l4 4v14H5V3h4z" />
    <path d="M9 3v4h6" />
    <path d="M9 12h6" />
    <path d="M9 16h4" />
  </svg>
)

const gpaCalculatorIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="8" y1="19" x2="16" y2="19" />
  </svg>
)

const breakIcon = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" />
    <path d="M12 7v5" />
    <path d="M12 17v.01" />
    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
)

export default Sidebar
