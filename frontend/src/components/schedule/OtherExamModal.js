import { useState, useRef } from 'react'
import { generateOtherExamSchedule } from '../../utils/otherExamEngine'

const ACCENT       = '#a855f7'
const ACCENT_DARK  = '#7c3aed'
const ACCENT_BG    = 'rgba(168,85,247,0.12)'
const ACCENT_BORDER = 'rgba(168,85,247,0.3)'
const ACCENT_RGBA  = (a) => `rgba(168,85,247,${a})`
const GRADIENT     = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
const gradeColors = {
  'A+': '#22c55e', 'A': '#22c55e',
  'B+': '#f97316', 'B': '#f97316',
  'C+': '#eab308', 'C': '#eab308',
  'D':  '#ef4444', 'F': '#ef4444',
}

const WEAKNESS_LABELS = { 1: 'Very Strong', 2: 'Strong', 3: 'Average', 4: 'Weak', 5: 'Very Weak' }
const WEAKNESS_COLORS = { 1: '#22c55e', 2: '#86efac', 3: '#eab308', 4: '#f97316', 5: '#ef4444' }
const PREP_LABELS     = { 1: "Haven't Started", 2: 'Just Started', 3: 'Getting There', 4: 'Well Prepared', 5: 'Fully Ready' }
const PREP_COLORS     = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#86efac', 5: '#22c55e' }

const STEPS = ['Exam Type', 'Papers', 'Readiness', 'Target']

// Pre-defined external exam types
const PRESET_EXAMS = [
  {
    category: 'National School Exams',
    exams: [
      { id: 'gce-al',   name: 'GCE Advanced Level (A/L)',   icon: '🎓', desc: 'Sri Lanka / UK A-Level examinations', defaultSubjects: ['Combined Maths', 'Physics', 'Chemistry'] },
      { id: 'gce-ol',   name: 'GCE Ordinary Level (O/L)',   icon: '📘', desc: 'Sri Lanka / UK O-Level examinations', defaultSubjects: ['Mathematics', 'Science', 'English', 'History'] },
      { id: 'grade5',   name: 'Grade 5 Scholarship',        icon: '⭐', desc: 'Sri Lanka Grade 5 Scholarship Exam', defaultSubjects: ['Mathematics', 'First Language', 'Second Language', 'General Knowledge'] },
    ],
  },
  {
    category: 'Professional & Vocational',
    exams: [
      { id: 'aat',       name: 'AAT (Accounting Technician)',  icon: '📊', desc: 'Association of Accounting Technicians', defaultSubjects: ['Financial Statements', 'Management Accounting', 'Taxation'] },
      { id: 'law',       name: 'Law Examination',              icon: '⚖️', desc: 'Bar exam / Law college entrance',       defaultSubjects: ['Constitutional Law', 'Contract Law', 'Criminal Law', 'Tort Law'] },
      { id: 'cima',      name: 'CIMA',                         icon: '💼', desc: 'Chartered Institute of Management Accountants', defaultSubjects: ['Business Finance', 'Management Accounting', 'Financial Reporting'] },
      { id: 'acca',      name: 'ACCA',                         icon: '💰', desc: 'Association of Chartered Certified Accountants', defaultSubjects: ['Financial Accounting', 'Management Accounting', 'Audit & Assurance'] },
    ],
  },
  {
    category: 'Language & Proficiency',
    exams: [
      { id: 'ielts',    name: 'IELTS',                    icon: '🌍', desc: 'International English Language Testing System', defaultSubjects: ['Listening', 'Reading', 'Writing', 'Speaking'] },
      { id: 'toefl',   name: 'TOEFL',                    icon: '🔤', desc: 'Test of English as a Foreign Language',          defaultSubjects: ['Reading', 'Listening', 'Speaking', 'Writing'] },
      { id: 'sat',     name: 'SAT',                      icon: '🏫', desc: 'Scholastic Assessment Test (US College Board)',   defaultSubjects: ['Math', 'Evidence-Based Reading', 'Writing'] },
      { id: 'gre',     name: 'GRE',                      icon: '🔬', desc: 'Graduate Record Examinations',                   defaultSubjects: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing'] },
    ],
  },
  {
    category: 'Custom',
    exams: [
      { id: 'custom',  name: 'Other / Custom Exam',      icon: '✏️', desc: 'Any other exam not listed above',               defaultSubjects: [] },
    ],
  },
]

let nextId = 1
function newPaper(name = '') {
  return { id: nextId++, subject: name, date: '' }
}

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
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? ACCENT : '#555' }}>{i + 1}</span>
                }
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

const fieldInput = (err) => ({
  width: '100%', boxSizing: 'border-box',
  background: '#111', border: `1px solid ${err ? '#ef4444' : '#1e1e1e'}`,
  borderRadius: 8, padding: '9px 11px',
  color: '#f0f0f0', fontSize: 13, outline: 'none',
})

const errStyle = { margin: '4px 0 0', fontSize: 11, color: '#ef4444' }

// ── Main component ────────────────────────────────────────────────────────
function OtherExamModal({ onClose, onGenerate }) {
  const [step, setStep] = useState(0)

  // Step 0 – Exam type
  const [selectedPreset, setSelectedPreset] = useState(null)   // full preset object
  const [customExamName, setCustomExamName] = useState('')
  const [search, setSearch] = useState('')

  // Step 1 – Papers / subjects with dates
  const [papers, setPapers] = useState([newPaper()])

  // Step 2 – Subject readiness
  const [subjectDetails, setSubjectDetails] = useState({})
  const [currentProgress, setCurrentProgress] = useState(0)
  const [hoursPerDay, setHoursPerDay] = useState(3)
  const [studyTime, setStudyTime] = useState('')

  // Step 3 – Target
  const [performanceType, setPerformanceType] = useState('grade')
  const [grade, setGrade] = useState('')
  const [mark, setMark] = useState(70)

  const [errors, setErrors] = useState({})
  const today = new Date().toISOString().split('T')[0]

  // Computed exam name
  const examTypeName = selectedPreset
    ? (selectedPreset.id === 'custom' ? (customExamName.trim() || 'Custom Exam') : selectedPreset.name)
    : ''

  // Paper helpers
  const addPaper    = () => setPapers((p) => [...p, newPaper()])
  const removePaper = (id) => setPapers((p) => p.filter((x) => x.id !== id))
  const updatePaper = (id, field, value) => {
    setPapers((p) => p.map((x) => x.id === id ? { ...x, [field]: value } : x))
    setErrors((e) => ({ ...e, [`paper_${id}_${field}`]: '' }))
  }

  const daysUntil = (dateStr) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  }

  // Subject detail helpers
  const getDetail = (id) => subjectDetails[id] || { weakness: 3, prep: 2, notes: '' }
  const setDetail = (id, field, value) =>
    setSubjectDetails((d) => ({ ...d, [id]: { ...getDetail(id), [field]: value } }))

  // Select preset and pre-populate papers
  const selectPreset = (preset) => {
    setSelectedPreset(preset)
    setSearch('')
    if (preset.defaultSubjects && preset.defaultSubjects.length > 0) {
      setPapers(preset.defaultSubjects.map((s) => newPaper(s)))
    } else {
      setPapers([newPaper()])
    }
    setErrors((e) => ({ ...e, examType: '' }))
  }

  // Filtered exam list
  const filteredCategories = PRESET_EXAMS.map((cat) => ({
    ...cat,
    exams: cat.exams.filter((e) =>
      !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.exams.length > 0)

  const validate = () => {
    const errs = {}
    if (step === 0) {
      if (!selectedPreset) errs.examType = 'Please select an exam type'
      if (selectedPreset?.id === 'custom' && !customExamName.trim()) errs.customName = 'Please enter the exam name'
    }
    if (step === 1) {
      const filled = papers.filter((p) => p.subject.trim())
      if (!filled.length) errs.papers = 'Add at least one paper / subject'
      papers.forEach((p) => {
        if (!p.subject.trim()) errs[`paper_${p.id}_subject`] = 'Required'
        if (!p.date)           errs[`paper_${p.id}_date`]    = 'Required'
        else if (new Date(p.date) <= new Date()) errs[`paper_${p.id}_date`] = 'Must be a future date'
      })
    }
    if (step === 2) {
      if (!studyTime) errs.studyTime = 'Please select your study preference'
    }
    if (step === 3 && performanceType === 'grade' && !grade) errs.grade = 'Please select a target grade'
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const next = () => {
    if (!validate()) return
    if (step < 3) setStep((s) => s + 1)
    else submit()
  }

  const submit = () => {
    const enrichedPapers = papers
      .filter((p) => p.subject.trim())
      .map((p) => ({ ...p, ...getDetail(p.id) }))

    const result = generateOtherExamSchedule({
      examTypeName,
      exams:           enrichedPapers,
      hoursPerDay,
      studyTime,
      currentProgress,
      performanceType,
      grade,
      mark,
    })
    onGenerate({ ...result, currentProgress })
  }

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
          borderRadius: 22, width: '100%', maxWidth: 580,
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
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.3px' }}>Other Exam Plan</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              {selectedPreset ? `${examTypeName} — step ${step + 1} of ${STEPS.length}` : 'External & common examinations'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#777', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 0: Exam Type ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search exam type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...fieldInput(false), paddingLeft: 34, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {errors.examType && <p style={errStyle}>{errors.examType}</p>}

            <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: 2 }}>
              {filteredCategories.map((cat) => (
                <div key={cat.category}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>{cat.category}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {cat.exams.map((preset) => {
                      const active = selectedPreset?.id === preset.id
                      return (
                        <button
                          key={preset.id}
                          onClick={() => selectPreset(preset)}
                          style={{
                            background: active ? ACCENT_BG : '#1a1a1a',
                            border: active ? `1.5px solid ${ACCENT}` : '1px solid #242424',
                            borderRadius: 12, padding: '10px 12px',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                          }}
                        >
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{preset.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: active ? 700 : 600, color: active ? ACCENT : '#ddd' }}>{preset.name}</div>
                            <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{preset.desc}</div>
                          </div>
                          {active && (
                            <svg width="16" height="16" fill="none" stroke={ACCENT} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom name input */}
            {selectedPreset?.id === 'custom' && (
              <Field label="Exam Name" error={errors.customName} required>
                <input
                  value={customExamName}
                  onChange={(e) => { setCustomExamName(e.target.value); setErrors((er) => ({ ...er, customName: '' })) }}
                  placeholder="e.g. ACCA P1, Chartered Engineer Exam…"
                  style={fieldInput(!!errors.customName)}
                />
              </Field>
            )}
          </div>
        )}

        {/* ── STEP 1: Papers / Subjects ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Selected exam badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10, marginBottom: '0.25rem' }}>
              <span style={{ fontSize: 18 }}>{selectedPreset?.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{examTypeName}</span>
              <button onClick={() => setStep(0)} style={{ marginLeft: 'auto', fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>change</button>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Enter each paper or subject you are sitting, with the exam date. The planner will schedule study days accordingly.
            </p>

            {errors.papers && <p style={errStyle}>{errors.papers}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
              {papers.map((paper, idx) => (
                <div key={paper.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: ACCENT_RGBA(0.12), border: `1px solid ${ACCENT_RGBA(0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ACCENT, flexShrink: 0, marginTop: 8 }}>{idx + 1}</div>

                  <div style={{ flex: 1, display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '2 1 160px' }}>
                      <input
                        placeholder="Paper / Subject name"
                        value={paper.subject}
                        onChange={(e) => updatePaper(paper.id, 'subject', e.target.value)}
                        style={fieldInput(!!errors[`paper_${paper.id}_subject`])}
                      />
                      {errors[`paper_${paper.id}_subject`] && <div style={errStyle}>{errors[`paper_${paper.id}_subject`]}</div>}
                    </div>
                    <div style={{ flex: '1 1 140px' }}>
                      <input
                        type="date" min={today}
                        value={paper.date}
                        onChange={(e) => updatePaper(paper.id, 'date', e.target.value)}
                        style={{ ...fieldInput(!!errors[`paper_${paper.id}_date`]), colorScheme: 'dark' }}
                      />
                      {errors[`paper_${paper.id}_date`] && <div style={errStyle}>{errors[`paper_${paper.id}_date`]}</div>}
                      {paper.date && !errors[`paper_${paper.id}_date`] && (
                        <div style={{ fontSize: 10, color: ACCENT, marginTop: 3 }}>{daysUntil(paper.date)} days away</div>
                      )}
                    </div>
                  </div>

                  {papers.length > 1 && (
                    <button onClick={() => removePaper(paper.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '8px 4px', flexShrink: 0 }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addPaper}
              style={{ marginTop: 4, width: '100%', padding: '9px', background: 'transparent', border: `1.5px dashed ${ACCENT_RGBA(0.3)}`, borderRadius: 10, cursor: 'pointer', color: '#666', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ACCENT_RGBA(0.3); e.currentTarget.style.color = '#666' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Another Paper / Subject
            </button>
          </div>
        )}

        {/* ── STEP 2: Readiness ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Rate yourself on each paper and set your study habits so we can build the best plan.
            </p>

            {/* Per-subject weakness/prep */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 300, overflowY: 'auto', paddingRight: 2 }}>
              {papers.filter((p) => p.subject.trim()).map((paper) => {
                const detail = getDetail(paper.id)
                const days   = daysUntil(paper.date)
                return (
                  <div key={paper.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '1rem 1.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>{paper.subject}</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                          {paper.date && new Date(paper.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {days !== null && (
                            <span style={{ marginLeft: 8, fontWeight: 600, color: days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : ACCENT }}>
                              {days} day{days !== 1 ? 's' : ''} away
                            </span>
                          )}
                        </div>
                      </div>
                      {days !== null && (
                        <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: days <= 3 ? 'rgba(239,68,68,0.12)' : days <= 7 ? 'rgba(249,115,22,0.12)' : ACCENT_RGBA(0.12), color: days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : ACCENT }}>
                          {days <= 3 ? 'URGENT' : days <= 7 ? 'SOON' : 'UPCOMING'}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>My Weakness Level</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: WEAKNESS_COLORS[detail.weakness], background: `${WEAKNESS_COLORS[detail.weakness]}18`, padding: '1px 8px', borderRadius: 20 }}>{WEAKNESS_LABELS[detail.weakness]}</span>
                      </div>
                      <input type="range" min={1} max={5} value={detail.weakness} onChange={(e) => setDetail(paper.id, 'weakness', Number(e.target.value))} style={{ width: '100%', accentColor: WEAKNESS_COLORS[detail.weakness], cursor: 'pointer' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: '#444' }}>Strong</span>
                        <span style={{ fontSize: 10, color: '#444' }}>Weak</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>Current Preparation</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: PREP_COLORS[detail.prep], background: `${PREP_COLORS[detail.prep]}18`, padding: '1px 8px', borderRadius: 20 }}>{PREP_LABELS[detail.prep]}</span>
                      </div>
                      <input type="range" min={1} max={5} value={detail.prep} onChange={(e) => setDetail(paper.id, 'prep', Number(e.target.value))} style={{ width: '100%', accentColor: PREP_COLORS[detail.prep], cursor: 'pointer' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: '#444' }}>Not Started</span>
                        <span style={{ fontSize: 10, color: '#444' }}>Fully Ready</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 5 }}>Topics you find most difficult <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span></div>
                      <textarea
                        placeholder={`e.g. "Struggling with past paper timing for ${paper.subject.split(' ')[0] || 'this paper'}"`}
                        value={detail.notes}
                        onChange={(e) => setDetail(paper.id, 'notes', e.target.value)}
                        rows={2}
                        style={{ width: '100%', background: '#161616', border: '1.5px solid #222', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#ccc', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall progress */}
            <Field label="Overall progress so far (%)" hint="How much of the total syllabus have you already covered?" error={errors.currentProgress}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input type="range" min={0} max={100} value={currentProgress} onChange={(e) => setCurrentProgress(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT, cursor: 'pointer' }} />
                <div style={{ minWidth: 64, height: 40, background: ACCENT_RGBA(0.12), border: `1.5px solid ${ACCENT_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: ACCENT }}>{currentProgress}%</div>
              </div>
            </Field>

            {/* Hours per day */}
            <Field label="Study hours you can manage per day" hint="Be realistic — consistency beats cramming">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input type="range" min={1} max={12} value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT, cursor: 'pointer' }} />
                <div style={{ minWidth: 52, height: 40, background: ACCENT_RGBA(0.12), border: `1.5px solid ${ACCENT_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: ACCENT }}>{hoursPerDay}h</div>
              </div>
            </Field>

            {/* Study time preference */}
            <Field label="When do you study best?" error={errors.studyTime} required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 4 }}>
                {[
                  { id: 'morning', label: 'Morning Person', sub: 'Sessions from 8:00 AM', emoji: '🌅' },
                  { id: 'night',   label: 'Night Owl',      sub: 'Sessions from 7:00 PM', emoji: '🌙' },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => { setStudyTime(opt.id); setErrors((e) => ({ ...e, studyTime: '' })) }} style={{ background: studyTime === opt.id ? ACCENT_RGBA(0.1) : '#1a1a1a', border: studyTime === opt.id ? `2px solid ${ACCENT}` : '1.5px solid #2a2a2a', borderRadius: 14, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: studyTime === opt.id ? ACCENT : '#ddd', marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
              {errors.studyTime && <div style={errStyle}>{errors.studyTime}</div>}
            </Field>
          </div>
        )}

        {/* ── STEP 3: Target ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Field label="How would you like to set your overall target?">
              <div style={{ display: 'flex', gap: 0, background: '#111', border: '1px solid #222', borderRadius: 10, padding: 4, marginTop: 4 }}>
                {[
                  { id: 'grade', label: 'By Grade' },
                  { id: 'mark',  label: 'By Mark (%)' },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => setPerformanceType(opt.id)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: performanceType === opt.id ? GRADIENT : 'transparent', color: performanceType === opt.id ? '#fff' : '#666', fontSize: 13, fontWeight: performanceType === opt.id ? 600 : 400, transition: 'all 0.15s' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {performanceType === 'grade' && (
              <Field label="Select your target grade" error={errors.grade} required>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 4 }}>
                  {GRADES.map((g) => (
                    <button key={g} onClick={() => { setGrade(g); setErrors((e) => ({ ...e, grade: '' })) }} style={{ width: 52, height: 52, borderRadius: 12, border: grade === g ? `2px solid ${gradeColors[g]}` : '1.5px solid #2a2a2a', background: grade === g ? `${gradeColors[g]}18` : '#1a1a1a', color: grade === g ? gradeColors[g] : '#666', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>{g}</button>
                  ))}
                </div>
                {errors.grade && <div style={errStyle}>{errors.grade}</div>}
              </Field>
            )}

            {performanceType === 'mark' && (
              <Field label="Set your overall target mark">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 8 }}>
                  <input type="range" min={40} max={100} value={mark} onChange={(e) => setMark(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT, cursor: 'pointer' }} />
                  <div style={{ minWidth: 64, height: 40, background: ACCENT_RGBA(0.12), border: `1.5px solid ${ACCENT_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: ACCENT }}>{mark}%</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#444' }}>40%</span><span style={{ fontSize: 11, color: '#444' }}>100%</span>
                </div>
              </Field>
            )}

            {/* Plan summary */}
            <div style={{ background: ACCENT_RGBA(0.05), border: `1px solid ${ACCENT_RGBA(0.15)}`, borderRadius: 14, padding: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Plan Summary</div>
              {[
                { label: 'Exam',     value: examTypeName },
                { label: 'Papers',   value: papers.filter((p) => p.subject.trim()).length },
                { label: 'Progress', value: `${currentProgress}% done` },
                { label: 'Study',    value: `${hoursPerDay}h/day · ${studyTime === 'morning' ? '🌅 Morning' : studyTime === 'night' ? '🌙 Night' : '—'}` },
                { label: 'Target',   value: performanceType === 'grade' ? (grade || '—') : `${mark}%` },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${ACCENT_RGBA(0.1)}` }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
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
          <button onClick={next} style={{ background: GRADIENT, border: 'none', borderRadius: 12, padding: '11px 24px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 20px ${ACCENT_RGBA(0.35)}` }}>
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

export default OtherExamModal
