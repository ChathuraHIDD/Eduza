import { Link } from 'react-router-dom'

const stats = [
  { label: 'Courses Enrolled', value: '8', icon: '📚', change: '+2 this month' },
  { label: 'Hours Studied', value: '124', icon: '⏱', change: '+12 this week' },
  { label: 'Assignments Due', value: '3', icon: '📝', change: '2 overdue' },
  { label: 'Grade Average', value: '87%', icon: '🎯', change: '+4% this term' },
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

function StatCard({ stat }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #242424',
      borderRadius: 14,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#777', fontWeight: 500 }}>{stat.label}</span>
        <span style={{ fontSize: 20 }}>{stat.icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-1px', lineHeight: 1 }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 12, color: '#555' }}>{stat.change}</div>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #242424',
      borderRadius: 14,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${course.color}22`,
            border: `1.5px solid ${course.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            <svg width="18" height="18" fill="none" stroke={course.color} strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 3 }}>{course.title}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{course.lecturer}</div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
          background: `${course.color}22`, color: course.color, whiteSpace: 'nowrap',
        }}>{course.tag}</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#666' }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: course.color }}>{course.progress}%</span>
        </div>
        <div style={{ height: 5, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${course.progress}%`,
            background: `linear-gradient(90deg, ${course.color}, ${course.color}bb)`,
            borderRadius: 3,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

function Home() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #1e1408 100%)',
        border: '1px solid #2a2010',
        borderRadius: 18,
        padding: '1.75rem 2rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        }} />
        <div>
          <div style={{ fontSize: 13, color: '#f97316', fontWeight: 500, marginBottom: 6 }}>{today}</div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
            Good morning, John 👋
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#666', lineHeight: 1.5 }}>
            You have <span style={{ color: '#f97316', fontWeight: 600 }}>3 assignments</span> due this week and{' '}
            <span style={{ color: '#f97316', fontWeight: 600 }}>4 classes</span> scheduled today.
          </p>
        </div>
        <Link
          to="/smart-schedule"
          style={{
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            color: '#fff', textDecoration: 'none',
            padding: '10px 20px', borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
          }}
        >
          View Schedule →
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {stats.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Courses */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>My Courses</h3>
            <button style={{
              background: 'none', border: '1px solid #2a2a2a', borderRadius: 8,
              color: '#aaa', fontSize: 12, padding: '5px 12px', cursor: 'pointer',
            }}>View All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>

        {/* Today's schedule */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>Today's Classes</h3>
            <Link to="/smart-schedule" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>See all</Link>
          </div>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #242424',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {upcoming.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 1.1rem',
                  borderBottom: i < upcoming.length - 1 ? '1px solid #1e1e1e' : 'none',
                }}
              >
                <div style={{ width: 3, height: 36, borderRadius: 3, background: typeColors[item.type] || '#666', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{item.subject}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{item.type} · {item.room}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: '#888',
                  textAlign: 'right', flexShrink: 0,
                }}>{item.time}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ marginTop: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Smart Schedule', path: '/smart-schedule', icon: '📅' },
                { label: 'My Profile', path: '/profile', icon: '👤' },
                { label: 'Lecture Profile', path: '/lecture-profile', icon: '🎓' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#1a1a1a', border: '1px solid #242424',
                    borderRadius: 10, padding: '10px 14px',
                    textDecoration: 'none', color: '#ccc', fontSize: 13,
                    fontWeight: 500,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <span>{link.icon}</span>
                  {link.label}
                  <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
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
