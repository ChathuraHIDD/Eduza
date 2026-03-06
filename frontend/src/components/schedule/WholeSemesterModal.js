import { useState } from 'react'
import { generateWholeSemesterSchedule } from '../../utils/wholeSemesterEngine'

const ACCENT       = '#22c55e'
const ACCENT_DARK  = '#16a34a'
const ACCENT_BG    = 'rgba(34,197,94,0.12)'
const ACCENT_RGBA  = (a) => `rgba(34,197,94,${a})`
const GRADIENT     = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`

const GRADES      = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
const gradeColors = {
  'A+': '#22c55e', 'A': '#22c55e',
  'B+': '#f97316', 'B': '#f97316',
  'C+': '#eab308', 'C': '#eab308',
  'D':  '#ef4444', 'F': '#ef4444',
}

const STEPS = ['Semester', 'Modules', 'Habits', 'Goals']

const SEMESTERS = [
  'Semester 1', 'Semester 2',
  'Trimester 1', 'Trimester 2', 'Trimester 3',
  'Summer Session', 'Winter Session',
]

const YEARS = ['2024', '2025', '2026', '2027', '2028']

const WEEK_DAYS = [
  { label: 'Mon', value: 0 }, { label: 'Tue', value: 1 },
  { label: 'Wed', value: 2 }, { label: 'Thu', value: 3 },
  { label: 'Fri', value: 4 }, { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
]

const DIFF_LABELS = { 1: 'Very Easy', 2: 'Easy', 3: 'Moderate', 4: 'Hard', 5: 'Very Hard' }
const DIFF_COLORS = { 1: '#22c55e', 2: '#86efac', 3: '#eab308', 4: '#f97316', 5: '#ef4444' }

let _nextId = 1
const newModule = () => ({ id: _nextId++, name: '', examDate: '', difficulty: 3 })

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem' }}>
      {STEPS.map((label, i) => {
        const done = i < current, active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: done ? ACCENT : active ? ACCENT_RGBA(0.15) : '#1e1e1e',
                border: done || active ? `2px solid ${ACCENT}` : '2px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}>
                {done
                  ? <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? ACCENT : '#555' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? ACCENT : done ? '#aaa' : '#444', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '-14px 6px 0', background: done ? ACCENT : '#1e1e1e', transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, hint, error, required, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>
          {label}{required && <span style={{ color: ACCENT, marginLeft: 2 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: '#555' }}>{hint}</span>}
      </div>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>{error}</p>}
    </div>
  )
}

const inputStyle = (err) => ({
  width: '100%', boxSizing: 'border-box',
  background: '#1a1a1a', border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`,
  borderRadius: 10, padding: '10px 12px',
  color: '#f0f0f0', fontSize: 14, outline: 'none',
})

// ── Main modal ────────────────────────────────────────────────────────────
function WholeSemesterModal({ onClose, onGenerate }) {
  const [step, setStep] = useState(0)

  // Step 0 – Semester info
  const [semName,   setSemName]   = useState('Semester 1')
  const [semYear,   setSemYear]   = useState('2026')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  // Step 1 – Modules
  const [modules, setModules] = useState([newModule(), newModule(), newModule()])

  // Step 2 – Habits
  const [hoursPerDay, setHoursPerDay] = useState(3)
  const [studyDays,   setStudyDays]   = useState([0, 1, 2, 3, 4]) // Mon–Fri
  const [studyTime,   setStudyTime]   = useState('')

  // Step 3 – Goals
  const [perfType, setPerfType] = useState('grade')
  const [grade,    setGrade]    = useState('')
  const [mark,     setMark]     = useState(70)

  const [errors, setErrors] = useState({})
  const today = new Date().toISOString().split('T')[0]

  const isMidSemester = startDate && today > startDate

  // Module helpers
  const addModule    = () => setModules((m) => [...m, newModule()])
  const removeModule = (id) => setModules((m) => m.filter((x) => x.id !== id))
  const updateModule = (id, field, value) => {
    setModules((m) => m.map((x) => x.id === id ? { ...x, [field]: value } : x))
    setErrors((e) => ({ ...e, [`mod_${id}_${field}`]: '' }))
  }

  const toggleDay = (val) => {
    setStudyDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val].sort((a, b) => a - b)
    )
    setErrors((e) => ({ ...e, studyDays: '' }))
  }

  const validateStep = () => {
    const errs = {}
    if (step === 0) {
      if (!startDate) errs.startDate = 'Start date is required'
      if (!endDate)   errs.endDate   = 'End date is required'
      else if (endDate <= startDate) errs.endDate = 'End date must be after start date'
    }
    if (step === 1) {
      const filled = modules.filter((m) => m.name.trim())
      if (!filled.length) errs.modules = 'Add at least one module'
      modules.forEach((m) => { if (!m.name.trim()) errs[`mod_${m.id}_name`] = 'Required' })
    }
    if (step === 2) {
      if (!studyDays.length) errs.studyDays = 'Select at least one study day'
      if (!studyTime)        errs.studyTime  = 'Please select your preferred study time'
    }
    if (step === 3) {
      if (perfType === 'grade' && !grade) errs.grade = 'Select a target grade'
    }
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const next = () => {
    if (!validateStep()) return
    if (step < 3) setStep((s) => s + 1)
    else submit()
  }

  const submit = () => {
    const schedule = generateWholeSemesterSchedule({
      semesterLabel: `${semName} ${semYear}`,
      semesterStart: startDate,
      semesterEnd:   endDate,
      modules:       modules.filter((m) => m.name.trim()),
      hoursPerDay,
      studyDays,
      studyTime,
      performanceType: perfType,
      grade,
      mark,
    })
    onGenerate(schedule)
  }

  // Weeks preview
  const weeksPreview = (startDate && endDate && endDate > startDate)
    ? Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (864e5 * 7))
    : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161616', border: '1px solid #262626',
          borderRadius: 22, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '2rem', boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" fill="none" stroke={ACCENT} strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.3px' }}>Whole Semester Plan</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Full semester roadmap across all your modules</p>
          </div>
          <button onClick={onClose} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#777', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 0: Semester ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Semester" required>
                <select value={semName} onChange={(e) => setSemName(e.target.value)} style={{ ...inputStyle(false), colorScheme: 'dark' }}>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Year" required>
                <select value={semYear} onChange={(e) => setSemYear(e.target.value)} style={{ ...inputStyle(false), colorScheme: 'dark' }}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="Semester Start" error={errors.startDate} required>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ ...inputStyle(!!errors.startDate), colorScheme: 'dark' }} />
              </Field>
              <Field label="Semester End" error={errors.endDate} required>
                <input type="date" value={endDate} min={startDate || today} onChange={(e) => setEndDate(e.target.value)} style={{ ...inputStyle(!!errors.endDate), colorScheme: 'dark' }} />
              </Field>
            </div>

            {weeksPreview && (
              <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
                <span style={{ color: ACCENT, fontWeight: 600 }}>{weeksPreview} weeks</span> planned
              </div>
            )}

            {/* Mid-semester notice */}
            {isMidSemester && (
              <div style={{ background: ACCENT_RGBA(0.07), border: `1px solid ${ACCENT_RGBA(0.22)}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>📅</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 2 }}>Mid-semester start detected</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Your plan will begin from today and cover the remaining weeks of the semester.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Modules ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: 13, color: '#666' }}>
              Add all modules for this semester. Set an exam/assessment date and difficulty so the planner can prioritise correctly.
            </p>
            {errors.modules && <p style={{ margin: 0, fontSize: 11, color: '#ef4444' }}>{errors.modules}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 360, overflowY: 'auto', paddingRight: 2 }}>
              {modules.map((mod, idx) => (
                <div key={mod.id} style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: 14, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{idx + 1}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc', flex: 1 }}>Module {idx + 1}</span>
                    {modules.length > 1 && (
                      <button onClick={() => removeModule(mod.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>×</button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div>
                      <input
                        value={mod.name}
                        onChange={(e) => updateModule(mod.id, 'name', e.target.value)}
                        placeholder="e.g. Data Structures & Algorithms"
                        style={inputStyle(!!errors[`mod_${mod.id}_name`])}
                      />
                      {errors[`mod_${mod.id}_name`] && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#ef4444' }}>{errors[`mod_${mod.id}_name`]}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>Exam / Assessment Date <span style={{ color: '#444' }}>(optional)</span></label>
                        <input
                          type="date"
                          value={mod.examDate}
                          min={startDate || today}
                          max={endDate || undefined}
                          onChange={(e) => updateModule(mod.id, 'examDate', e.target.value)}
                          style={{ ...inputStyle(false), fontSize: 12, colorScheme: 'dark' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 4 }}>
                          Difficulty:&nbsp;
                          <span style={{ color: DIFF_COLORS[mod.difficulty], fontWeight: 700 }}>{DIFF_LABELS[mod.difficulty]}</span>
                        </label>
                        <input
                          type="range" min={1} max={5} value={mod.difficulty}
                          onChange={(e) => updateModule(mod.id, 'difficulty', Number(e.target.value))}
                          style={{ width: '100%', accentColor: DIFF_COLORS[mod.difficulty], marginTop: 9 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addModule}
              style={{ background: ACCENT_BG, border: `1px dashed ${ACCENT_RGBA(0.35)}`, borderRadius: 12, padding: '10px', cursor: 'pointer', color: ACCENT, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Another Module
            </button>
          </div>
        )}

        {/* ── STEP 2: Habits ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hours per day */}
            <Field label="Study hours per day" required>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input type="range" min={1} max={10} value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT }} />
                <div style={{ minWidth: 60, background: '#1e1e1e', border: `1px solid ${ACCENT_RGBA(0.35)}`, borderRadius: 8, padding: '6px 10px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: ACCENT }}>{hoursPerDay}h</div>
              </div>
            </Field>

            {/* Days per week */}
            <Field label="Study days per week" error={errors.studyDays} required>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 4 }}>
                {WEEK_DAYS.map((d) => {
                  const active = studyDays.includes(d.value)
                  return (
                    <button key={d.value} onClick={() => toggleDay(d.value)} style={{ width: 44, height: 36, borderRadius: 8, border: `1.5px solid ${active ? ACCENT : '#2a2a2a'}`, background: active ? ACCENT_BG : '#1a1a1a', color: active ? ACCENT : '#666', fontSize: 12, fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {d.label}
                    </button>
                  )
                })}
              </div>
              {studyDays.length > 0 && (
                <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                  {studyDays.length} days/week ·&nbsp;
                  <span style={{ color: ACCENT, fontWeight: 600 }}>~{hoursPerDay * studyDays.length}h/week</span>
                </div>
              )}
            </Field>

            {/* Study time */}
            <Field label="Preferred study time" error={errors.studyTime} required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 4 }}>
                {[
                  { value: 'morning', label: '🌅 Morning', desc: 'Sessions start ~8 AM' },
                  { value: 'night',   label: '🌙 Night',   desc: 'Sessions start ~7 PM' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => { setStudyTime(opt.value); setErrors((e) => ({ ...e, studyTime: '' })) }} style={{ background: studyTime === opt.value ? ACCENT_BG : '#1a1a1a', border: `1.5px solid ${studyTime === opt.value ? ACCENT : '#2a2a2a'}`, borderRadius: 12, padding: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: studyTime === opt.value ? ACCENT : '#ddd', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ── STEP 3: Goals ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Set your overall target grade or score. The planner will allocate more time to harder modules to help you reach your goal.
            </p>

            {/* Toggle grade / mark */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#1a1a1a', border: '1px solid #242424', borderRadius: 12, padding: 4, gap: 4 }}>
              {[
                { value: 'grade', label: '🎓 By Grade', desc: 'e.g. A, B+' },
                { value: 'mark',  label: '📊 By Score', desc: 'e.g. 75%' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setPerfType(opt.value)} style={{ background: perfType === opt.value ? GRADIENT : 'transparent', border: 'none', borderRadius: 9, padding: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: perfType === opt.value ? '#fff' : '#666', marginBottom: 2 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: perfType === opt.value ? 'rgba(255,255,255,0.65)' : '#444' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {perfType === 'grade' && (
              <Field label="Target Grade" error={errors.grade} required>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 4 }}>
                  {GRADES.map((g) => (
                    <button key={g} onClick={() => { setGrade(g); setErrors((e) => ({ ...e, grade: '' })) }} style={{ minWidth: 44, padding: '6px 12px', borderRadius: 9, border: `1.5px solid ${grade === g ? gradeColors[g] + '88' : '#2a2a2a'}`, background: grade === g ? `${gradeColors[g]}18` : '#1a1a1a', color: grade === g ? gradeColors[g] : '#666', fontSize: 13, fontWeight: grade === g ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>{g}</button>
                  ))}
                </div>
              </Field>
            )}

            {perfType === 'mark' && (
              <Field label="Target Score (%)">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                  <input type="range" min={40} max={100} value={mark} onChange={(e) => setMark(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT }} />
                  <div style={{ minWidth: 60, background: '#1e1e1e', border: `1px solid ${ACCENT_RGBA(0.35)}`, borderRadius: 8, padding: '6px 10px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: ACCENT }}>{mark}%</div>
                </div>
              </Field>
            )}

            {/* Summary preview */}
            {startDate && endDate && modules.some((m) => m.name.trim()) && (
              <div style={{ background: ACCENT_RGBA(0.05), border: `1px solid ${ACCENT_RGBA(0.15)}`, borderRadius: 14, padding: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>Plan Summary</div>
                {[
                  { label: 'Semester',    value: `${semName} ${semYear}` },
                  { label: 'Duration',    value: weeksPreview ? `${weeksPreview} weeks` : '—' },
                  { label: 'Modules',     value: modules.filter((m) => m.name.trim()).length },
                  { label: 'Study load',  value: `${hoursPerDay}h/day · ${studyDays.length} days/week` },
                  { label: 'Target',      value: perfType === 'grade' ? (grade || '—') : `${mark}%` },
                  isMidSemester && { label: 'Start',  value: '📅 Mid-semester (today)' },
                ].filter(Boolean).map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${ACCENT_RGBA(0.1)}` }}>
                    <span style={{ fontSize: 12, color: '#555' }}>{row.label}</span>
                    <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '0.75rem' }}>
          {step > 0
            ? (
              <button onClick={() => setStep((s) => s - 1)} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12, padding: '11px 20px', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back
              </button>
            )
            : <div />
          }
          <button onClick={next} style={{ background: GRADIENT, border: 'none', borderRadius: 12, padding: '11px 24px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 20px ${ACCENT_RGBA(0.3)}` }}>
            {step < 3 ? (
              <>Next <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                Generate Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WholeSemesterModal
