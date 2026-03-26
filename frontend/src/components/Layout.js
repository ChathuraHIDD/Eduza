import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  // If user is not authenticated, show only the content (Landing page)
  if (!user) {
    return <Outlet />
  }

  // Guardians can only use student lookup and result pages.
  if (user?.role === 'guardian') {
    const allowedPaths = ['/coordinator', '/guardian/stress-result']
    const isAllowed = allowedPaths.some((path) => location.pathname.startsWith(path))
    if (!isAllowed) {
      return <Navigate to="/coordinator" replace />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f4f6fb' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 40, display: 'block'
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main*/}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
