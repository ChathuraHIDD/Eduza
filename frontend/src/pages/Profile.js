import { useState } from 'react'

const skills = [
  { name: 'JavaScript', level: 85, color: '#f7df1e' },
  { name: 'React', level: 78, color: '#61dafb' },
  { name: 'Python', level: 65, color: '#3776ab' },
  { name: 'UI/UX Design', level: 70, color: '#22c55e' },
  { name: 'Cloud Computing', level: 50, color: '#a855f7' },
]

const achievements = [
  { title: 'Dean\'s List', desc: 'Top 10% of class', icon: '🏆' },
  { title: 'Hackathon Winner', desc: '2nd Place — TechFest 2024', icon: '💡' },
  { title: 'Perfect Attendance', desc: 'Zero absences this term', icon: '✅' },
  { title: 'Top Contributor', desc: 'Most active in forums', icon: '⭐' },
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
      {/* Profile header card */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #242424',
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        {/* Banner */}
        <div style={{
          height: 120,
          background: 'linear-gradient(135deg, #1a0700 0%, #2d1200 40%, #1a0a30 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(249,115,22,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.15) 0%, transparent 50%)',
          }} />
        </div>

        {/* Profile info */}
        <div style={{ padding: '0 2rem 1.5rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 90, height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            border: '4px solid #1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#fff',
            position: 'absolute', top: -45,
          }}>JD</div>

          {/* Edit button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem' }}>
            <button style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: 8,
              color: '#aaa', fontSize: 12, fontWeight: 500,
              padding: '6px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
          </div>

          <div style={{ marginTop: '0.35rem' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
              John Doe
            </h2>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#666' }}>
              Student ID: STU-20241023 · BSc Computer Science, Year 3
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['Computer Science', 'Year 3', 'Full-time'].map((tag) => (
                <span key={tag} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: 'rgba(249,115,22,0.12)', color: '#f97316',
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px', marginTop: '1.25rem',
            background: '#242424', borderRadius: 12, overflow: 'hidden',
          }}>
            {[
              { label: 'GPA', value: '3.72' },
              { label: 'Courses', value: '8' },
              { label: 'Credits', value: '96' },
              { label: 'Rank', value: '#12' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#1e1e1e', padding: '0.75rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        background: '#1a1a1a', border: '1px solid #242424',
        borderRadius: 12, padding: '4px', marginBottom: '1.25rem',
        width: 'fit-content',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 18px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              background: activeTab === tab ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'transparent',
              color: activeTab === tab ? '#fff' : '#777',
              transition: 'all 0.15s',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Personal info */}
          <div style={{
            background: '#1a1a1a', border: '1px solid #242424',
            borderRadius: 14, padding: '1.25rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>Personal Information</h3>
            {[
              { label: 'Email', value: 'john.doe@eduza.ac' },
              { label: 'Phone', value: '+1 (555) 234-5678' },
              { label: 'Faculty', value: 'Engineering & Technology' },
              { label: 'Department', value: 'Computer Science' },
              { label: 'Joined', value: 'September 2022' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #1e1e1e',
              }}>
                <span style={{ fontSize: 12, color: '#666' }}>{item.label}</span>
                <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{
            background: '#1a1a1a', border: '1px solid #242424',
            borderRadius: 14, padding: '1.25rem',
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>Skills & Proficiency</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{skill.name}</span>
                    <span style={{ fontSize: 12, color: skill.color, fontWeight: 600 }}>{skill.level}%</span>
                  </div>
                  <div style={{ height: 5, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${skill.level}%`,
                      background: skill.color,
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {courses.map((c) => (
            <div key={c.name} style={{
              background: '#1a1a1a', border: '1px solid #242424',
              borderLeft: `4px solid ${c.color}`,
              borderRadius: 12, padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 6 }}>
                  <div style={{ flex: 1, height: 4, background: '#242424', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: c.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#666', flexShrink: 0 }}>{c.progress}%</span>
                </div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${c.color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, color: c.color,
              }}>{c.grade}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {achievements.map((a) => (
            <div key={a.title} style={{
              background: '#1a1a1a', border: '1px solid #242424',
              borderRadius: 14, padding: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(249,115,22,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0,
              }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
