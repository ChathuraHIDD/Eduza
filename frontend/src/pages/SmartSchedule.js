import { useState } from 'react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const schedule = {
  Monday: [
    { time: '08:00', end: '09:30', subject: 'Advanced Web Development', type: 'Lecture', room: 'Hall A-12', color: '#f97316' },
    { time: '10:00', end: '11:00', subject: 'Data Structures', type: 'Tutorial', room: 'Lab B-4', color: '#3b82f6' },
    { time: '14:00', end: '15:30', subject: 'Cloud Computing', type: 'Lecture', room: 'Hall D-7', color: '#a855f7' },
  ],
  Tuesday: [
    { time: '09:00', end: '10:30', subject: 'UI/UX Design', type: 'Workshop', room: 'Studio C', color: '#22c55e' },
    { time: '13:00', end: '14:00', subject: 'Advanced Web Development', type: 'Tutorial', room: 'Lab A-3', color: '#f97316' },
  ],
  Wednesday: [
    { time: '08:00', end: '09:30', subject: 'Data Structures', type: 'Lecture', room: 'Hall B-2', color: '#3b82f6' },
    { time: '11:00', end: '12:30', subject: 'Cloud Computing', type: 'Lab', room: 'Cloud Lab', color: '#a855f7' },
    { time: '15:00', end: '16:30', subject: 'UI/UX Design', type: 'Lecture', room: 'Hall C-1', color: '#22c55e' },
  ],
  Thursday: [
    { time: '09:30', end: '11:00', subject: 'Advanced Web Development', type: 'Lecture', room: 'Hall A-12', color: '#f97316' },
    { time: '13:30', end: '14:30', subject: 'Data Structures', type: 'Lab', room: 'Lab B-4', color: '#3b82f6' },
  ],
  Friday: [
    { time: '10:00', end: '11:30', subject: 'Cloud Computing', type: 'Lecture', room: 'Hall D-7', color: '#a855f7' },
    { time: '14:00', end: '16:00', subject: 'UI/UX Design', type: 'Workshop', room: 'Studio C', color: '#22c55e' },
  ],
}

const assignments = [
  { subject: 'Web Development', title: 'Build a REST API', due: 'Tomorrow', priority: 'High', color: '#f97316' },
  { subject: 'Data Structures', title: 'Binary Tree Implementation', due: 'In 3 days', priority: 'Medium', color: '#3b82f6' },
  { subject: 'UI/UX Design', title: 'Wireframe Prototype', due: 'Next week', priority: 'Low', color: '#22c55e' },
]

const priorityColors = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e',
}

function SmartSchedule() {
  const [selectedDay, setSelectedDay] = useState('Monday')
  const todayIndex = new Date().getDay() - 1
  const currentDate = new Date()

  const getDateForDay = (index) => {
    const d = new Date(currentDate)
    const diff = index - (currentDate.getDay() - 1)
    d.setDate(d.getDate() + diff)
    return d.getDate()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #1e1408)',
        border: '1px solid #2a2010',
        borderRadius: 18,
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
            Smart Schedule
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
            AI-powered weekly planner · {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 10,
          padding: '8px 14px',
        }}>
          <svg width="16" height="16" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f97316' }}>AI Optimized</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Weekly schedule */}
        <div>
          {/* Day selector */}
          <div style={{
            display: 'flex', gap: '0.5rem',
            background: '#1a1a1a', border: '1px solid #242424',
            borderRadius: 14, padding: '0.5rem',
            marginBottom: '1rem',
          }}>
            {days.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none',
                  cursor: 'pointer',
                  background: selectedDay === day ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'transparent',
                  color: selectedDay === day ? '#fff' : '#666',
                  fontWeight: selectedDay === day ? 700 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span style={{ fontSize: 11, opacity: 0.8 }}>{shortDays[i]}</span>
                <span>{getDateForDay(i)}</span>
              </button>
            ))}
          </div>

          {/* Classes for selected day */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(schedule[selectedDay] || []).length === 0 && (
              <div style={{
                background: '#1a1a1a', border: '1px solid #242424',
                borderRadius: 14, padding: '3rem',
                textAlign: 'center', color: '#555', fontSize: 14,
              }}>
                No classes scheduled for this day
              </div>
            )}
            {(schedule[selectedDay] || []).map((cls, i) => (
              <div key={i} style={{
                background: '#1a1a1a',
                border: '1px solid #242424',
                borderLeft: `4px solid ${cls.color}`,
                borderRadius: 14,
                padding: '1.1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: 48, minWidth: 48, height: 48,
                  borderRadius: 12,
                  background: `${cls.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" fill="none" stroke={cls.color} strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>{cls.subject}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: `${cls.color}22`, color: cls.color,
                    }}>{cls.type}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>📍 {cls.room}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>{cls.time}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>to {cls.end}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Week overview mini-grid */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>
              Week at a Glance
            </h3>
            <div style={{
              background: '#1a1a1a', border: '1px solid #242424',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {days.map((day, di) => (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    borderBottom: di < days.length - 1 ? '1px solid #1e1e1e' : 'none',
                    background: selectedDay === day ? 'rgba(249,115,22,0.05)' : 'transparent',
                  }}
                >
                  <span style={{
                    width: 80, fontSize: 13, fontWeight: selectedDay === day ? 600 : 400,
                    color: selectedDay === day ? '#f97316' : '#777',
                  }}>{day}</span>
                  <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {(schedule[day] || []).map((cls, i) => (
                      <span key={i} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: `${cls.color}22`, color: cls.color,
                        fontWeight: 500,
                      }}>{cls.subject.split(' ')[0]}</span>
                    ))}
                    {(schedule[day] || []).length === 0 && (
                      <span style={{ fontSize: 12, color: '#444' }}>—</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#555', flexShrink: 0 }}>
                    {(schedule[day] || []).length} class{(schedule[day] || []).length !== 1 ? 'es' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Assignments */}
        <div>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>
            Upcoming Deadlines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignments.map((a, i) => (
              <div key={i} style={{
                background: '#1a1a1a', border: '1px solid #242424',
                borderRadius: 12, padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: `${a.color}22`, color: a.color,
                  }}>{a.subject}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: priorityColors[a.priority],
                  }}>{a.priority}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#555' }}>Due: {a.due}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ marginTop: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>
              This Week
            </h3>
            <div style={{
              background: '#1a1a1a', border: '1px solid #242424',
              borderRadius: 12, padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              {[
                { label: 'Total Classes', value: Object.values(schedule).flat().length },
                { label: 'Study Hours', value: '18h 30m' },
                { label: 'Free Slots', value: '6 slots' },
              ].map((stat) => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{stat.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartSchedule
