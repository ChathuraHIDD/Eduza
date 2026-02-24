import { useState } from 'react'
import AssignmentModal from '../components/schedule/AssignmentModal'
import ScheduleResult from '../components/schedule/ScheduleResult'
import MidExamModal from '../components/schedule/MidExamModal'
import MidExamResult from '../components/schedule/MidExamResult'

const scheduleTypes = [
  {
    id: 'assignment',
    label: 'Assignment',
    description: 'Plan and track your assignment progress day by day',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: '#f97316',
    available: true,
  },
  {
    id: 'mid-exam',
    label: 'Semester Mid Exam',
    description: 'Smart revision plan for your mid-semester exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    color: '#3b82f6',
    available: true,
  },
  {
    id: 'final-exam',
    label: 'Semester Final Exam',
    description: 'Comprehensive plan for your final semester exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: '#ef4444',
    available: false,
  },
  {
    id: 'whole-semester',
    label: 'Whole Semester',
    description: 'Full semester roadmap across all your modules',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: '#22c55e',
    available: false,
  },
  {
    id: 'other-exam',
    label: 'Other Exam',
    description: 'Custom schedule for quizzes, tests, or external exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: '#a855f7',
    available: false,
  },
  {
    id: 'other-activity',
    label: 'Other Activity',
    description: 'Plan presentations, projects, and any other activities',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
    color: '#06b6d4',
    available: false,
  },
]

function SmartSchedule() {
  const [modalOpen, setModalOpen] = useState(false)
  const [midExamModalOpen, setMidExamModalOpen] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)
  const [scheduleType, setScheduleType] = useState(null)

  const handleTypeSelect = (type) => {
    if (!type.available) return
    if (type.id === 'assignment') setModalOpen(true)
    if (type.id === 'mid-exam') setMidExamModalOpen(true)
  }

  const handleGenerate = (scheduleData) => {
    setModalOpen(false)
    setMidExamModalOpen(false)
    setScheduleType('assignment')
    setGeneratedSchedule(scheduleData)
  }

  const handleMidExamGenerate = (scheduleData) => {
    setMidExamModalOpen(false)
    setScheduleType('mid-exam')
    setGeneratedSchedule(scheduleData)
  }

  const handleReset = () => {
    setGeneratedSchedule(null)
    setScheduleType(null)
  }

  if (generatedSchedule && scheduleType === 'assignment') {
    return <ScheduleResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'mid-exam') {
    return <MidExamResult data={generatedSchedule} onBack={handleReset} />
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #1e1408 100%)',
        border: '1px solid #2a2010',
        borderRadius: 18,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(249,115,22,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AI-Powered
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
          Smart Schedule
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: '#666', lineHeight: 1.6 }}>
          Select a schedule type below. Our AI will generate a personalised, day-by-day study plan tailored to your goals.
        </p>
      </div>

      {/* Schedule type grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        {scheduleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type)}
            disabled={!type.available}
            style={{
              background: '#1a1a1a',
              border: `1px solid ${type.available ? '#2a2a2a' : '#1e1e1e'}`,
              borderRadius: 16,
              padding: '1.5rem',
              cursor: type.available ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              opacity: type.available ? 1 : 0.5,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = `1px solid ${type.color}55`
              e.currentTarget.style.background = `${type.color}08`
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = '1px solid #2a2a2a'
              e.currentTarget.style.background = '#1a1a1a'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Available badge */}
            {type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 700,
                background: 'rgba(249,115,22,0.15)',
                color: '#f97316', padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
              }}>AVAILABLE</div>
            )}
            {!type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 600,
                background: '#1e1e1e', color: '#555',
                padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
              }}>COMING SOON</div>
            )}

            {/* Icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 14,
              background: `${type.color}18`,
              border: `1.5px solid ${type.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: type.color,
              marginBottom: '1rem',
            }}>
              {type.icon}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>
              {type.label}
            </div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
              {type.description}
            </div>

            {type.available && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: '1rem' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: type.color }}>Get Started</span>
                <svg width="14" height="14" fill="none" stroke={type.color} strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Assignment modal */}
      {modalOpen && (
        <AssignmentModal
          onClose={() => setModalOpen(false)}
          onGenerate={handleGenerate}
        />
      )}

      {/* Mid Exam modal */}
      {midExamModalOpen && (
        <MidExamModal
          onClose={() => setMidExamModalOpen(false)}
          onGenerate={handleMidExamGenerate}
        />
      )}
    </div>
  )
}

export default SmartSchedule
