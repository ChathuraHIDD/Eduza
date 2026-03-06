import { useState } from 'react'

const skills = [
  { name: 'JavaScript', level: 85, color: '#f97316' },
  { name: 'React', level: 78, color: '#3b82f6' },
  { name: 'Python', level: 65, color: '#22c55e' },
  { name: 'UI/UX Design', level: 70, color: '#a855f7' },
  { name: 'Cloud Computing', level: 50, color: '#06b6d4' },
]

const achievements = [
  { title: "Dean's List", desc: 'Top 10% of class', icon: '🏆', color: '#f97316' },
  { title: 'Hackathon Winner', desc: '2nd Place — TechFest 2024', icon: '💡', color: '#3b82f6' },
  { title: 'Perfect Attendance', desc: 'Zero absences this term', icon: '✅', color: '#22c55e' },
  { title: 'Top Contributor', desc: 'Most active in forums', icon: '⭐', color: '#a855f7' },
]

const courses = [
  { name: 'Advanced Web Development', grade: 'A', progress: 72, color: '#f97316' },
  { name: 'Data Structures & Algorithms', grade: 'B+', progress: 45, color: '#3b82f6' },
  { name: 'UI/UX Design Principles', grade: 'A+', progress: 91, color: '#22c55e' },
  { name: 'Cloud Computing Fundamentals', grade: 'B', progress: 18, color: '#a855f7' },
]

const tabs = ['Overview', 'Courses', 'Achievements']

function Profile() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Profile header card ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e8ecf4',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Banner */}
        <div style={{
          height: 130,
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -50, top: -50,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', right: 120, bottom: -40,
            width: 140, height: 140, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
        </div>

        {/* Profile info */}
        <div style={{ padding: '0 2rem 1.75rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 90, height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            border: '4px solid #ffffff',
            boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#fff',
            position: 'absolute', top: -45,
          }}>JD</div>

          {/* Edit button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
            <button style={{
              background: '#ffffff',
              border: '1.5px solid #e8ecf4',
              borderRadius: 10,
              color: '#6b7280', fontSize: 12, fontWeight: 600,
              padding: '6px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          </div>

          <div style={{ marginTop: '0.35rem' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              John Doe
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#9ca3af' }}>
              Student ID: STU-20241023 · BSc Computer Science, Year 3
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Computer Science', 'Year 3', 'Full-time'].map((tag) => (
                <span key={tag} style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                  background: 'rgba(249,115,22,0.1)',
                  color: '#f97316',
                  border: '1px solid rgba(249,115,22,0.2)',
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem', marginTop: '1.5rem',
          }}>
            {[
              { label: 'GPA', value: '3.72', color: '#f97316' },
              { label: 'Courses', value: '8', color: '#3b82f6' },
              { label: 'Credits', value: '96', color: '#22c55e' },
              { label: 'Rank', value: '#12', color: '#a855f7' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#f8faff',
                border: '1.5px solid #e8ecf4',
                borderRadius: 14, padding: '0.875rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        background: '#f0f4ff',
        border: '1.5px solid #e8ecf4',
        borderRadius: 14, padding: '4px', marginBottom: '1.25rem',
        width: 'fit-content',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 22px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
              background: activeTab === tab ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'transparent',
              color: activeTab === tab ? '#fff' : '#9ca3af',
              transition: 'all 0.15s',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Personal info */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e8ecf4',
            borderRadius: 18, padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ margin: '0 0 1.1rem', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
              Personal Information
            </h3>
            {[
              { label: 'Email', value: 'john.doe@eduza.ac' },
              { label: 'Phone', value: '+1 (555) 234-5678' },
              { label: 'Faculty', value: 'Engineering & Technology' },
              { label: 'Department', value: 'Computer Science' },
              { label: 'Joined', value: 'September 2022' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #f0f4ff' : 'none',
              }}>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e8ecf4',
            borderRadius: 18, padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ margin: '0 0 1.1rem', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
              Skills & Proficiency
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{skill.name}</span>
                    <span style={{ fontSize: 12, color: skill.color, fontWeight: 700 }}>{skill.level}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f0f4ff', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${skill.level}%`,
                      background: skill.color,
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Courses tab ── */}
      {activeTab === 'Courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map((c) => (
            <div key={c.name} style={{
              background: '#ffffff',
              border: '1.5px solid #e8ecf4',
              borderLeft: `4px solid ${c.color}`,
              borderRadius: 14, padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 8 }}>
                  <div style={{ flex: 1, height: 5, background: '#f0f4ff', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: c.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, fontWeight: 600 }}>{c.progress}%</span>
                </div>
              </div>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: `${c.color}18`,
                border: `1.5px solid ${c.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: c.color,
                flexShrink: 0,
              }}>{c.grade}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Achievements tab ── */}
      {activeTab === 'Achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {achievements.map((a) => (
            <div key={a.title} style={{
              background: '#ffffff',
              border: '1.5px solid #e8ecf4',
              borderRadius: 18, padding: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${a.color}15`,
                border: `1.5px solid ${a.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
