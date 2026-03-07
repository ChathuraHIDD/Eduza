function LecturerDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const firstName = user?.name ? user.name.split(' ')[0] : 'Lecturer'
  
    const stats = [
      { label: 'Modules Teaching', value: '5', icon: '📘', note: 'This semester' },
      { label: 'Today Classes', value: '3', icon: '🎓', note: '2 lectures, 1 lab' },
      { label: 'Assignments Pending', value: '18', icon: '📝', note: 'Need grading' },
      { label: 'Students', value: '146', icon: '👥', note: 'Across all modules' },
    ]
  
    const classes = [
      { title: 'Advanced Web Development', time: '09:00 AM', room: 'Hall A-12' },
      { title: 'Database Systems', time: '11:30 AM', room: 'Lab B-2' },
      { title: 'Software Engineering', time: '02:00 PM', room: 'Hall C-1' },
    ]
  
    const tasks = [
      'Review assignment submissions',
      'Upload lecture materials',
      'Update module announcements',
      'Prepare next lecture slides',
    ]
  
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #1d1308 100%)',
            border: '1px solid #2a2010',
            borderRadius: 18,
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600, marginBottom: 8 }}>
            Lecturer Dashboard
          </div>
          <h1 style={{ margin: 0, color: '#f5f5f5', fontSize: 28, fontWeight: 800 }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ margin: '8px 0 0', color: '#777', fontSize: 14 }}>
            Manage lectures, students, grading, and teaching activities from one place.
          </p>
        </div>
  
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                background: '#1a1a1a',
                border: '1px solid #242424',
                borderRadius: 14,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: '#777', fontSize: 13 }}>{item.label}</span>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
              </div>
              <div style={{ color: '#f5f5f5', fontSize: 30, fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#555', fontSize: 12, marginTop: 6 }}>{item.note}</div>
            </div>
          ))}
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #242424',
              borderRadius: 14,
              padding: '1.25rem',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#f0f0f0' }}>Today&apos;s Classes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {classes.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: '#161616',
                    border: '1px solid #222',
                    borderRadius: 12,
                    padding: '1rem',
                  }}
                >
                  <div style={{ color: '#f5f5f5', fontWeight: 700 }}>{item.title}</div>
                  <div style={{ color: '#777', fontSize: 13, marginTop: 6 }}>
                    {item.time} · {item.room}
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #242424',
              borderRadius: 14,
              padding: '1.25rem',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#f0f0f0' }}>Priority Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map((task) => (
                <div
                  key={task}
                  style={{
                    background: '#161616',
                    border: '1px solid #222',
                    borderRadius: 10,
                    padding: '0.9rem 1rem',
                    color: '#ccc',
                    fontSize: 14,
                  }}
                >
                  {task}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default LecturerDashboard