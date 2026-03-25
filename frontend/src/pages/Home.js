import { Link } from 'react-router-dom'

const stats = [
  { label: 'Courses Enrolled', value: '8', icon: '📚', change: '+2 this month', color: '#f97316' },
  { label: 'Hours Studied', value: '124', icon: '⏱', change: '+12 this week', color: '#3b82f6' },
  { label: 'Assignments Due', value: '3', icon: '📝', change: '2 overdue', color: '#ef4444' },
  { label: 'Grade Average', value: '87%', icon: '🎯', change: '+4% this term', color: '#22c55e' },
]

const courses = [
  { id: 1, title: 'Advanced Web Development', lecturer: 'Dr. Sarah Chen', progress: 72, color: '#f97316', tag: 'In Progress' },
  { id: 2, title: 'Data Structures & Algorithms', lecturer: 'Prof. Mark Williams', progress: 45, color: '#3b82f6', tag: 'In Progress' },
  { id: 3, title: 'UI/UX Design Principles', lecturer: 'Ms. Anya Patel', progress: 91, color: '#22c55e', tag: 'Almost Done' },
  { id: 4, title: 'Cloud Computing Fundamentals', lecturer: 'Dr. James Lee', progress: 18, color: '#a855f7', tag: 'Just Started' },
]

const upcoming = [
  { time: '09:00 AM', subject: 'Web Development', type: 'Lecture', room: 'Hall A-12' },
  { time: '11:30 AM', subject: 'Algorithms', type: 'Tutorial', room: 'Lab B-4' },
  { time: '02:00 PM', subject: 'UI/UX Design', type: 'Workshop', room: 'Studio C' },
  { time: '04:30 PM', subject: 'Cloud Computing', type: 'Lecture', room: 'Hall D-7' },
]

const typeColors = {
  Lecture: '#f97316',
  Tutorial: '#3b82f6',
  Workshop: '#22c55e',
}

const quickLinks = [
  { label: 'Smart Schedule', path: '/smart-schedule', icon: '📅', color: '#f97316' },
  { label: 'My Profile', path: '/profile', icon: '👤', color: '#3b82f6' },
  { label: 'Lecture Profile', path: '/lecture-profile', icon: '🎓', color: '#22c55e' },
]

function StatCard({ stat }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e8ecf4',
      borderRadius: 16,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {stat.label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${stat.color}15`,
          border: `1.5px solid ${stat.color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>{stat.icon}</div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{stat.change}</div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e8ecf4',
      borderRadius: 16,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${course.color}18`,
            border: `1.5px solid ${course.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            <svg width="18" height="18" fill="none" stroke={course.color} strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 3 }}>{course.title}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{course.lecturer}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: `${course.color}15`,
          color: course.color,
          border: `1px solid ${course.color}25`,
          whiteSpace: 'nowrap',
        }}>{course.tag}</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: course.color }}>{course.progress}%</span>
        </div>
        <div style={{ height: 6, background: '#f0f4ff', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${course.progress}%`,
            background: course.color,
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

function Home() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // login/register - get logged user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // login/register - get first name from logged user name
  const firstName = user?.name ? user.name.split(' ')[0] : 'User'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Welcome banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)',
          border: 'none',
          borderRadius: 24,
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Right big circle */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
          }}
        />

        {/* Right lower circle */}
        <div
          style={{
            position: 'absolute',
            right: 100,
            bottom: -80,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.14)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
              padding: '8px 14px',
              borderRadius: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.14)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ⚡
            </span>
            AI-Powered
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            {/* login/register - show logged user first name */}
            Good morning, {firstName} 👋
          </h2>

          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.6,
              maxWidth: 700,
            }}
          >
            You have <span style={{ fontWeight: 700, color: '#fff' }}>3 assignments</span> due this week and{' '}
            <span style={{ fontWeight: 700, color: '#fff' }}>4 classes</span> scheduled today.
          </p>
        </div>

        <Link
          to="/smart-schedule"
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(255,255,255,0.16)',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          View Schedule →
        </Link>
      </div>

      {/* ── Stats grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {stats.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Courses */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>My Courses</h3>
            <button style={{
              background: '#ffffff',
              border: '1.5px solid #e8ecf4',
              borderRadius: 10,
              color: '#6b7280', fontSize: 12, fontWeight: 600,
              padding: '6px 14px', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>View All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>

        {/* Right column */}
        <div>

          {/* Today's classes */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Today's Classes</h3>
            <Link to="/smart-schedule" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>
              See all →
            </Link>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e8ecf4',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            {upcoming.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 1.1rem',
                  borderBottom: i < upcoming.length - 1 ? '1px solid #f0f4ff' : 'none',
                }}
              >
                <div style={{
                  width: 4, height: 38, borderRadius: 4,
                  background: typeColors[item.type] || '#9ca3af',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>{item.subject}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{item.type} · {item.room}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: typeColors[item.type] || '#9ca3af',
                  textAlign: 'right', flexShrink: 0,
                  background: `${typeColors[item.type] || '#9ca3af'}12`,
                  border: `1px solid ${typeColors[item.type] || '#9ca3af'}25`,
                  borderRadius: 8, padding: '3px 8px',
                }}>{item.time}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.875rem', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#ffffff',
                    border: '1.5px solid #e8ecf4',
                    borderRadius: 12, padding: '11px 14px',
                    textDecoration: 'none', color: '#374151', fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${link.color}15`,
                    border: `1.5px solid ${link.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, flexShrink: 0,
                  }}>{link.icon}</div>
                  {link.label}
                  <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home