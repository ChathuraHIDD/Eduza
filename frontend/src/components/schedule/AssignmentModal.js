import { useState } from 'react'
import { generateAssignmentSchedule } from '../../utils/scheduleEngine'

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']

const gradeColors = {
  'A+': '#22c55e', 'A': '#22c55e',
  'B+': '#f97316', 'B': '#f97316',
  'C+': '#eab308', 'C': '#eab308',
  'D': '#ef4444', 'F': '#ef4444',
}

const steps = ['Details', 'Study Habits', 'Target']

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#f97316' : active ? 'rgba(249,115,22,0.15)' : '#1e1e1e',
                border: active ? '2px solid #f97316' : done ? '2px solid #f97316' : '2px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}>
                {done ? (
                  <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#f97316' : '#555' }}>{i + 1}</span>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#f97316' : done ? '#aaa' : '#444', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '-16px 8px 0',
                background: done ? '#f97316' : '#1e1e1e',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AssignmentModal({ onClose, onGenerate }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    subject: '',
    dueDate: '',
    currentProgress: 0, // ✅ NEW
    hoursPerDay: 3,
    studyTime: '',
    performanceType: 'grade',
    grade: '',
    mark: 70,
  })
  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validateStep = () => {
    const errs = {}
    if (step === 0) {
      if (!form.subject.trim()) errs.subject = 'Subject is required'
      if (!form.dueDate) errs.dueDate = 'Due date is required'
      else if (new Date(form.dueDate) <= new Date()) errs.dueDate = 'Due date must be in the future'
      if (form.currentProgress < 0 || form.currentProgress > 100) errs.currentProgress = 'Progress must be between 0 and 100'
    }
    if (step === 1) {
      if (!form.studyTime) errs.studyTime = 'Please select your study preference'
    }
    if (step === 2) {
      if (form.performanceType === 'grade' && !form.grade) errs.grade = 'Please select a grade'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    if (step < 2) setStep((s) => s + 1)
    else handleSubmit()
  }

  const handleSubmit = () => {
    const schedule = generateAssignmentSchedule(form)
    // ✅ keep currentProgress inside returned data (so ScheduleResult can show it)
    onGenerate({ ...schedule, currentProgress: form.currentProgress })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161616',
          border: '1px solid #262626',
          borderRadius: 22,
          width: '100%',
          maxWidth: 520,
          padding: '2rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(249,115,22,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.3px' }}>
                New Assignment Plan
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              Fill in the details to generate your personalised schedule
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e1e1e', border: '1px solid #2a2a2a',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#777', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} />

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Field label="Module / Subject" error={errors.subject} required>
              <input
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
                placeholder="e.g. Advanced Web Development"
                style={inputStyle(!!errors.subject)}
              />
            </Field>

            <Field label="Due Date" error={errors.dueDate} required>
              <input
                type="date"
                min={today}
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                style={{ ...inputStyle(!!errors.dueDate), colorScheme: 'dark' }}
              />
            </Field>

            {/* ✅ NEW: Current progress slider */}
            <Field label="Current progress (so far) %" error={errors.currentProgress} hint="If you already started, set your current completion level">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.currentProgress}
                  onChange={(e) => set('currentProgress', Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#f97316', cursor: 'pointer' }}
                />
                <div style={{
                  minWidth: 64, height: 40,
                  background: 'rgba(59,130,246,0.10)',
                  border: '1.5px solid rgba(59,130,246,0.25)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#3b82f6',
                }}>
                  {form.currentProgress}%
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#444' }}>0%</span>
                <span style={{ fontSize: 11, color: '#444' }}>100%</span>
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Field label="Study hours you can manage per day" hint="Be realistic — consistency beats intensity">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input
                  type="range"
                  min={1} max={12}
                  value={form.hoursPerDay}
                  onChange={(e) => set('hoursPerDay', Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#f97316', cursor: 'pointer' }}
                />
                <div style={{
                  minWidth: 52, height: 40,
                  background: 'rgba(249,115,22,0.12)',
                  border: '1.5px solid rgba(249,115,22,0.3)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#f97316',
                }}>
                  {form.hoursPerDay}h
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#444' }}>1h min</span>
                <span style={{ fontSize: 11, color: '#444' }}>12h max</span>
              </div>
            </Field>

            <Field label="When do you study best?" error={errors.studyTime} required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 4 }}>
                {[
                  { id: 'morning', label: 'Morning Person', sub: 'Study from ~8:00 AM', emoji: '🌅' },
                  { id: 'night', label: 'Night Owl', sub: 'Study from ~7:00 PM', emoji: '🌙' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => set('studyTime', opt.id)}
                    style={{
                      background: form.studyTime === opt.id ? 'rgba(249,115,22,0.1)' : '#1a1a1a',
                      border: form.studyTime === opt.id ? '2px solid #f97316' : '1.5px solid #2a2a2a',
                      borderRadius: 14, padding: '1rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: form.studyTime === opt.id ? '#f97316' : '#ddd', marginBottom: 3 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#555' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
              {errors.studyTime && <div style={errorStyle}>{errors.studyTime}</div>}
            </Field>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Field label="How would you like to set your target?">
              <div style={{
                display: 'flex', gap: 0,
                background: '#111', border: '1px solid #222',
                borderRadius: 10, padding: 4, marginTop: 4,
              }}>
                {[
                  { id: 'grade', label: 'By Grade' },
                  { id: 'mark', label: 'By Mark (%)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => set('performanceType', opt.id)}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                      cursor: 'pointer',
                      background: form.performanceType === opt.id ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'transparent',
                      color: form.performanceType === opt.id ? '#fff' : '#666',
                      fontSize: 13, fontWeight: form.performanceType === opt.id ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </Field>

            {form.performanceType === 'grade' && (
              <Field label="Select your expected grade" error={errors.grade} required>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 4 }}>
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => set('grade', g)}
                      style={{
                        width: 52, height: 52, borderRadius: 12,
                        border: form.grade === g ? `2px solid ${gradeColors[g]}` : '1.5px solid #2a2a2a',
                        background: form.grade === g ? `${gradeColors[g]}18` : '#1a1a1a',
                        color: form.grade === g ? gradeColors[g] : '#666',
                        fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >{g}</button>
                  ))}
                </div>
                {errors.grade && <div style={errorStyle}>{errors.grade}</div>}
              </Field>
            )}

            {form.performanceType === 'mark' && (
              <Field label="Set your target mark out of 100">
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: markColor(form.mark), letterSpacing: '-2px' }}>
                      {form.mark}
                    </span>
                    <span style={{ fontSize: 16, color: '#555', fontWeight: 600 }}>/100</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, marginLeft: 4,
                      color: markColor(form.mark),
                      background: `${markColor(form.mark)}18`,
                      padding: '2px 8px', borderRadius: 20,
                    }}>{markLabel(form.mark)}</span>
                  </div>
                  <input
                    type="range"
                    min={0} max={100}
                    value={form.mark}
                    onChange={(e) => set('mark', Number(e.target.value))}
                    style={{ width: '100%', accentColor: markColor(form.mark), cursor: 'pointer' }}
                  />
                </div>
              </Field>
            )}

            <div style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              borderRadius: 12,
              padding: '1rem',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Plan Summary
              </div>
              {[
                { label: 'Subject', value: form.subject },
                { label: 'Due', value: form.dueDate ? new Date(form.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—' },
                { label: 'Current', value: `${form.currentProgress}%` }, // ✅ NEW
                { label: 'Daily Hours', value: `${form.hoursPerDay}h/day` },
                { label: 'Study Time', value: form.studyTime === 'morning' ? '🌅 Morning' : form.studyTime === 'night' ? '🌙 Night' : '—' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '0.75rem' }}>
          <button
            onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            style={{
              flex: 1, padding: '11px', borderRadius: 11,
              background: 'transparent', border: '1px solid #2a2a2a',
              color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={next}
            style={{
              flex: 2, padding: '11px',
              borderRadius: 11, border: 'none',
              background: 'linear-gradient(135deg, #f97316, #c2410c)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            }}
          >
            {step < 2 ? 'Continue →' : '✨ Generate Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, error, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#c0c0c0', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: '#f97316', marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ margin: '0 0 8px', fontSize: 11, color: '#555' }}>{hint}</p>}
      {children}
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

const inputStyle = (hasError) => ({
  width: '100%',
  background: '#111',
  border: `1.5px solid ${hasError ? '#ef4444' : '#222'}`,
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: '#f0f0f0',
  outline: 'none',
  boxSizing: 'border-box',
})

const errorStyle = {
  marginTop: 5,
  fontSize: 11,
  color: '#ef4444',
  fontWeight: 500,
}

function markColor(m) {
  if (m >= 85) return '#22c55e'
  if (m >= 65) return '#f97316'
  if (m >= 50) return '#eab308'
  return '#ef4444'
}

function markLabel(m) {
  if (m >= 85) return 'Distinction'
  if (m >= 75) return 'Merit'
  if (m >= 65) return 'Credit'
  if (m >= 50) return 'Pass'
  return 'Below Pass'
}

export default AssignmentModal