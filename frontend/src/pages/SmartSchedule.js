import { useState } from 'react'
import AssignmentModal from '../components/schedule/AssignmentModal'
import ScheduleResult from '../components/schedule/ScheduleResult'
import MidExamModal from '../components/schedule/MidExamModal'
import MidExamResult from '../components/schedule/MidExamResult'
import FinalExamModal from '../components/schedule/FinalExamModal'
import FinalExamResult from '../components/schedule/FinalExamResult'
import WholeSemesterModal from '../components/schedule/WholeSemesterModal'
import WholeSemesterResult from '../components/schedule/WholeSemesterResult'
import OtherExamModal from '../components/schedule/OtherExamModal'
import OtherExamResult from '../components/schedule/OtherExamResult'
import OtherActivityModal from '../components/schedule/OtherActivityModal'
import OtherActivityResult from '../components/schedule/OtherActivityResult'

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
    available: true,
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
    available: true,
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
    available: true,
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
    available: true,
  },
]

// ---- ML helpers (no UI change needed) ----
function gradeToTargetPercent(grade) {
  const map = {
    'A+': 90,
    'A': 85,
    'B+': 78,
    'B': 72,
    'C+': 65,
    'C': 60,
    'D': 50,
    'F': 40,
  }
  return map[grade] ?? 70
}

function deriveDifficultyFromTarget(targetPercent) {
  // simple rule: higher target -> more difficult
  if (targetPercent >= 85) return 3
  if (targetPercent >= 65) return 2
  return 1
}

async function predictTaskDuration({ current_progress, target_progress, past_study_pace, difficulty, daily_hours }) {
  const baseUrl = (import.meta?.env?.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')

  const res = await fetch(`${baseUrl}/api/ml/task-duration/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_progress,
      target_progress,
      past_study_pace,
      difficulty,
      daily_hours,
    }),
  })

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = payload?.message || payload?.error || 'Prediction failed'
    throw new Error(msg)
  }

  // expected: { predicted_minutes: number }
  return payload
}

function SmartSchedule() {
  const [modalOpen, setModalOpen] = useState(false)
  const [midExamModalOpen, setMidExamModalOpen] = useState(false)
  const [finalExamModalOpen, setFinalExamModalOpen] = useState(false)
  const [wholeSemesterModalOpen, setWholeSemesterModalOpen] = useState(false)
  const [otherExamModalOpen, setOtherExamModalOpen] = useState(false)
  const [otherActivityModalOpen, setOtherActivityModalOpen] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)
  const [scheduleType, setScheduleType] = useState(null)

  // optional UI state (won't break anything)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState('')

  const handleTypeSelect = (type) => {
    if (!type.available) return
    if (type.id === 'assignment') setModalOpen(true)
    if (type.id === 'mid-exam') setMidExamModalOpen(true)
    if (type.id === 'final-exam') setFinalExamModalOpen(true)
    if (type.id === 'whole-semester') setWholeSemesterModalOpen(true)
    if (type.id === 'other-exam') setOtherExamModalOpen(true)
    if (type.id === 'other-activity') setOtherActivityModalOpen(true)
  }

  // ✅ assignment generate (now includes ML prediction)
  const handleGenerate = async (scheduleData) => {
    setModalOpen(false)
    setMidExamModalOpen(false)
    setScheduleType('assignment')
    setMlError('')
    setGeneratedSchedule(scheduleData)

    // --- derive ML inputs from modal form (scheduleData usually contains these) ---
    // NOTE: scheduleEngine output should include subject, hoursPerDay, targetLabel etc.
    // If your scheduleEngine doesn’t return mark/grade, we still can infer a target.
    const hoursPerDay = Number(scheduleData?.hoursPerDay ?? 3)

    // Try to infer target progress:
    // - if scheduleData contains mark (number) use it
    // - else if it contains grade string, map it
    // - else fallback 70
    let target_progress = 70
    if (typeof scheduleData?.mark === 'number') target_progress = scheduleData.mark
    if (typeof scheduleData?.grade === 'string' && scheduleData.grade) target_progress = gradeToTargetPercent(scheduleData.grade)

    // If scheduleEngine stores targetLabel like "A+" or "70%", try to parse it
    if (typeof scheduleData?.targetLabel === 'string') {
      const tl = scheduleData.targetLabel.trim()
      const asNum = Number(tl.replace('%', ''))
      if (!Number.isNaN(asNum) && asNum > 0) target_progress = asNum
      if (['A+','A','B+','B','C+','C','D','F'].includes(tl)) target_progress = gradeToTargetPercent(tl)
    }

    const current_progress = 0 // starting point
    const difficulty = deriveDifficultyFromTarget(target_progress)

    // until you have real stopwatch pace in DB, we use a default
    // (later you will replace this by reading the student's history)
    const past_study_pace = 25 // minutes per 1% progress (reasonable baseline)
    const daily_hours = hoursPerDay

    // --- call ML endpoint and attach result into scheduleData ---
    setMlLoading(true)
    try {
      const pred = await predictTaskDuration({
        current_progress,
        target_progress,
        past_study_pace,
        difficulty,
        daily_hours,
      })

      const predicted_minutes = Number(pred?.predicted_minutes ?? pred?.predictedMinutes ?? 0)
      const predicted_hours = predicted_minutes ? Number((predicted_minutes / 60).toFixed(2)) : 0
      const predicted_days = (predicted_hours && daily_hours) ? Math.ceil(predicted_hours / daily_hours) : 0

      setGeneratedSchedule((prev) => ({
        ...prev,
        ml: {
          predicted_minutes,
          predicted_hours,
          predicted_days,
          inputs: { current_progress, target_progress, past_study_pace, difficulty, daily_hours },
        },
      }))
    } catch (e) {
      setMlError(e?.message || 'ML prediction failed')
      // keep schedule usable even if ML fails
    } finally {
      setMlLoading(false)
    }
  }

  const handleMidExamGenerate = (scheduleData) => {
    setMidExamModalOpen(false)
    setScheduleType('mid-exam')
    setGeneratedSchedule(scheduleData)
  }

  const handleFinalExamGenerate = (scheduleData) => {
    setFinalExamModalOpen(false)
    setScheduleType('final-exam')
    setGeneratedSchedule(scheduleData)
  }

  const handleWholeSemesterGenerate = (scheduleData) => {
    setWholeSemesterModalOpen(false)
    setScheduleType('whole-semester')
    setGeneratedSchedule(scheduleData)
  }

  const handleOtherExamGenerate = (scheduleData) => {
    setOtherExamModalOpen(false)
    setScheduleType('other-exam')
    setGeneratedSchedule(scheduleData)
  }

  const handleOtherActivityGenerate = (scheduleData) => {
    setOtherActivityModalOpen(false)
    setScheduleType('other-activity')
    setGeneratedSchedule(scheduleData)
  }

  const handleReset = () => {
    setGeneratedSchedule(null)
    setScheduleType(null)
    setFinalExamModalOpen(false)
    setWholeSemesterModalOpen(false)
    setOtherExamModalOpen(false)
    setOtherActivityModalOpen(false)
    setMlLoading(false)
    setMlError('')
  }

  if (generatedSchedule && scheduleType === 'assignment') {
    return (
      <div>
        {/* Optional lightweight ML status (won’t affect your UI much) */}
        {(mlLoading || mlError) && (
          <div style={{ maxWidth: 900, margin: '0 auto 1rem' }}>
            {mlLoading && (
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#888',
              }}>
                ⏳ Calculating AI time estimate…
              </div>
            )}
            {mlError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#ef4444',
              }}>
                ⚠️ AI estimate unavailable: {mlError}
              </div>
            )}
          </div>
        )}

        <ScheduleResult data={generatedSchedule} onBack={handleReset} />
      </div>
    )
  }

  if (generatedSchedule && scheduleType === 'mid-exam') {
    return <MidExamResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'final-exam') {
    return <FinalExamResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'whole-semester') {
    return <WholeSemesterResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'other-exam') {
    return <OtherExamResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'other-activity') {
    return <OtherActivityResult data={generatedSchedule} onBack={handleReset} />
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        borderRadius: 20,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', right: 100, bottom: -50,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI-Powered
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Smart Schedule
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
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
              background: '#ffffff',
              border: `1.5px solid ${type.available ? '#e8ecf4' : '#f0f2f8'}`,
              borderRadius: 18,
              padding: '1.5rem',
              cursor: type.available ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              opacity: type.available ? 1 : 0.5,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = `1.5px solid ${type.color}55`
              e.currentTarget.style.background = `${type.color}06`
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}20`
            }}
            onMouseLeave={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = '1.5px solid #e8ecf4'
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Available badge */}
            {type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 700,
                background: 'rgba(249,115,22,0.1)',
                color: '#f97316', padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
                border: '1px solid rgba(249,115,22,0.2)',
              }}>AVAILABLE</div>
            )}
            {!type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 600,
                background: '#f0f2f8', color: '#9ca3af',
                padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
                border: '1px solid #e8ecf4',
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

            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>
              {type.label}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
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

      {/* Final Exam modal */}
      {finalExamModalOpen && (
        <FinalExamModal
          onClose={() => setFinalExamModalOpen(false)}
          onGenerate={handleFinalExamGenerate}
        />
      )}

      {/* Whole Semester modal */}
      {wholeSemesterModalOpen && (
        <WholeSemesterModal
          onClose={() => setWholeSemesterModalOpen(false)}
          onGenerate={handleWholeSemesterGenerate}
        />
      )}

      {/* Other Exam modal */}
      {otherExamModalOpen && (
        <OtherExamModal
          onClose={() => setOtherExamModalOpen(false)}
          onGenerate={handleOtherExamGenerate}
        />
      )}

      {/* Other Activity modal */}
      {otherActivityModalOpen && (
        <OtherActivityModal
          onClose={() => setOtherActivityModalOpen(false)}
          onGenerate={handleOtherActivityGenerate}
        />
      )}
    </div>
  )
}

export default SmartSchedule