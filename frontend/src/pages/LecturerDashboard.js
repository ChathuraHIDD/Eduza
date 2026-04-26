import { useNavigate } from 'react-router-dom'

function LecturerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user?.name ? user.name.split(' ')[0] : 'Lecturer'

  const quickActions = [
    {
      title: 'Software Hub',
      subtitle: 'Browse and manage learning software',
      icon: '💻',
      badge: 'Library',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
      path: '/software-hub',
    },
    {
      title: 'Add Software',
      subtitle: 'Upload new tools for your students',
      icon: '➕',
      badge: 'Upload',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      path: '/upload-software',
    },
    {
      title: 'Module Quiz Manager',
      subtitle: 'Create and update module quizzes',
      icon: '📝',
      badge: 'Assessments',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      path: '/lecturer/module-quiz',
    },
    {
      title: 'Module Self Check',
      subtitle: 'Build self-check learning outcomes',
      icon: '✅',
      badge: 'Practice',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      path: '/lecturer/module-selfcheck',
    },
  ]

  const stats = [
    { label: 'Teaching Tools', value: '4', detail: 'Ready to manage' },
    { label: 'Quiz Builder', value: 'MCQ', detail: 'Module based' },
    { label: 'Self Checks', value: 'LO', detail: 'Outcome focused' },
  ]

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 36 }}>
      <section
        style={{
          background: 'linear-gradient(135deg, #ff6a00 0%, #f97316 48%, #d5541b 100%)',
          borderRadius: 28,
          padding: '34px 36px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 230,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 28,
          alignItems: 'center',
          marginBottom: 28,
          boxShadow: '0 24px 60px rgba(249, 115, 22, 0.22)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -90,
            right: -70,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.14)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -95,
            right: 260,
            width: 190,
            height: 190,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.24)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Lecturer Dashboard
          </div>
          <h1
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 34,
              lineHeight: 1.12,
              fontWeight: 900,
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              color: 'rgba(255,255,255,0.92)',
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 560,
            }}
          >
            Manage software resources, module quizzes, and self-check activities
            from one focused workspace.
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gap: 12,
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{stat.label}</div>
                <div style={{ fontSize: 12, opacity: 0.84, marginTop: 3 }}>{stat.detail}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {quickActions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={() => navigate(action.path)}
            style={{
              position: 'relative',
              minHeight: 230,
              border: 'none',
              borderRadius: 24,
              padding: 24,
              textAlign: 'left',
              color: '#fff',
              cursor: 'pointer',
              overflow: 'hidden',
              background: action.gradient,
              boxShadow: '0 18px 38px rgba(15, 23, 42, 0.13)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'translateY(-8px)'
              event.currentTarget.style.boxShadow = '0 28px 58px rgba(15, 23, 42, 0.18)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'translateY(0)'
              event.currentTarget.style.boxShadow = '0 18px 38px rgba(15, 23, 42, 0.13)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                top: -54,
                right: -48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.16)',
              }}
            />
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                height: '100%',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 1 }}>{action.icon}</span>
                <span
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {action.badge}
                </span>
              </div>

              <div>
                <h2 style={{ margin: 0, fontSize: 23, lineHeight: 1.2, fontWeight: 900 }}>
                  {action.title}
                </h2>
                <p
                  style={{
                    margin: '8px 0 0',
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    fontWeight: 600,
                  }}
                >
                  {action.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)',
          gap: 20,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #e6e8ee',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
          }}
        >
          <div style={{ color: '#1f2937', fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
            Quick Workflow
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              'Upload useful software resources for students.',
              'Create module quizzes to assess understanding.',
              'Add self-check outcomes so students can track confidence.',
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#475569',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: '#fff7ed',
                    color: '#f97316',
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: '#111827',
            borderRadius: 20,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Need to edit modules?</div>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>
            Use your lecture profile to create modules first, then attach quizzes
            and self-checks to those modules.
          </p>
          <button
            type="button"
            onClick={() => navigate('/lecture-profile')}
            style={{
              marginTop: 18,
              width: '100%',
              border: 'none',
              borderRadius: 12,
              padding: '11px 14px',
              background: '#fff',
              color: '#111827',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Open Lecture Profile
          </button>
        </div>
      </section>
    </div>
  )
}

export default LecturerDashboard
