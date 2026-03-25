function CoordinatorDashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const firstName = user?.name ? user.name.split(' ')[0] : 'Coordinator'
  
    const stats = [
      { label: 'Managed Programs', value: '4', icon: '🏫', note: 'Current semester' },
      { label: 'Pending Approvals', value: '9', icon: '✅', note: 'Need action' },
      { label: 'Student Requests', value: '21', icon: '📨', note: 'Open cases' },
      { label: 'Meetings Today', value: '2', icon: '📅', note: 'Scheduled' },
    ]
  
    const approvals = [
      'Approve lecturer timetable update',
      'Review student support request',
      'Confirm program schedule changes',
      'Validate module allocation',
    ]
  
    const notices = [
      'Semester registration opens Monday',
      'Exam hall allocation draft ready',
      'Coordinator weekly review at 3 PM',
    ]
  
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1008 100%)',
            border: '1px solid #2a2010',
            borderRadius: 18,
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600, marginBottom: 8 }}>
            Coordinator Dashboard
          </div>
          <h1 style={{ margin: 0, color: '#f5f5f5', fontSize: 28, fontWeight: 800 }}>
            Welcome, {firstName} 👋
          </h1>
          <p style={{ margin: '8px 0 0', color: '#777', fontSize: 14 }}>
            Coordinate academic planning, approvals, and student support operations.
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
  
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #242424',
              borderRadius: 14,
              padding: '1.25rem',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#f0f0f0' }}>Pending Approvals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {approvals.map((item) => (
                <div
                  key={item}
                  style={{
                    background: '#161616',
                    border: '1px solid #222',
                    borderRadius: 10,
                    padding: '0.95rem 1rem',
                    color: '#ccc',
                  }}
                >
                  {item}
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
            <h3 style={{ marginTop: 0, color: '#f0f0f0' }}>Coordinator Notices</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notices.map((item) => (
                <div
                  key={item}
                  style={{
                    background: '#161616',
                    border: '1px solid #222',
                    borderRadius: 10,
                    padding: '0.95rem 1rem',
                    color: '#ccc',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default CoordinatorDashboard