import { useState, useRef } from 'react'
import { generateMidExamSchedule } from '../../utils/midExamEngine'

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
const gradeColors = {
  'A+': '#22c55e', 'A': '#22c55e', 'B+': '#f97316', 'B': '#f97316',
  'C+': '#eab308', 'C': '#eab308', 'D': '#ef4444', 'F': '#ef4444',
}

const STEPS = ['Timetable', 'Subjects', 'Habits', 'Target']

const WEAKNESS_LABELS = { 1: 'Very Strong', 2: 'Strong', 3: 'Average', 4: 'Weak', 5: 'Very Weak' }
const WEAKNESS_COLORS = { 1: '#22c55e', 2: '#86efac', 3: '#eab308', 4: '#f97316', 5: '#ef4444' }
const PREP_LABELS = { 1: "Haven't Started", 2: 'Just Started', 3: 'Getting There', 4: 'Well Prepared', 5: 'Fully Ready' }
const PREP_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#86efac', 5: '#22c55e' }

let nextId = 1

function newExam() {
  return { id: nextId++, subject: '', date: '' }
}

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem' }}>
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: done ? '#3b82f6' : active ? 'rgba(59,130,246,0.15)' : '#1e1e1e',
                border: done || active ? '2px solid #3b82f6' : '2px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}>
                {done
                  ? <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#3b82f6' : '#555' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#3b82f6' : done ? '#aaa' : '#444', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '-14px 6px 0',
                background: done ? '#3b82f6' : '#1e1e1e',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
function MidExamModal({ onClose, onGenerate }) {
  const [step, setStep] = useState(0)
  const [timetableMode, setTimetableMode] = useState('manual')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [exams, setExams] = useState([newExam()])
  const [subjectDetails, setSubjectDetails] = useState({})
  const [studyTime, setStudyTime] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState(3)
  const [performanceType, setPerformanceType] = useState('grade')
  const [grade, setGrade] = useState('')
  const [mark, setMark] = useState(70)
  const [errors, setErrors] = useState({})
  const fileRef = useRef()
  const today = new Date().toISOString().split('T')[0]

  // ── Exam list helpers ──
  const addExam = () => setExams((e) => [...e, newExam()])
  const removeExam = (id) => setExams((e) => e.filter((x) => x.id !== id))
  const updateExam = (id, field, value) => {
    setExams((e) => e.map((x) => x.id === id ? { ...x, [field]: value } : x))
    setErrors((err) => ({ ...err, [`exam_${id}_${field}`]: '' }))
  }

  // ── Subject detail helpers ──
  const getDetail = (id) => subjectDetails[id] || { weakness: 3, prep: 2, notes: '' }
  const setDetail = (id, field, value) =>
    setSubjectDetails((d) => ({ ...d, [id]: { ...getDetail(id), [field]: value } }))

  // ── File upload ──
  const handleFile = (file) => {
    if (!file) return
    setUploadedFile(file)
  }
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ── Days remaining utility ──
  const daysUntil = (dateStr) => {
    if (!dateStr) return null
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  // ── Validation ──
  const validate = () => {
    const errs = {}
    if (step === 0) {
      if (timetableMode === 'upload' && !uploadedFile) {
        errs.file = 'Please upload a timetable file'
      }
      const validExams = exams.filter((e) => e.subject.trim() || e.date)
      if (validExams.length === 0) {
        errs.exams = 'Add at least one exam'
      }
      exams.forEach((e) => {
        if (!e.subject.trim()) errs[`exam_${e.id}_subject`] = 'Required'
        if (!e.date) errs[`exam_${e.id}_date`] = 'Required'
        else if (new Date(e.date) <= new Date()) errs[`exam_${e.id}_date`] = 'Must be future date'
      })
    }
    if (step === 2 && !studyTime) errs.studyTime = 'Select your study preference'
    if (step === 3 && performanceType === 'grade' && !grade) errs.grade = 'Select a grade'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validate()) return
    if (step < 3) setStep((s) => s + 1)
    else submit()
  }

  const submit = () => {
    const enrichedExams = exams.map((e) => ({
      ...e,
      ...getDetail(e.id),
    }))
    const result = generateMidExamSchedule({
      exams: enrichedExams,
      hoursPerDay,
      studyTime,
      performanceType,
      grade,
      mark,
    })
    onGenerate(result)
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
          padding: '2rem', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.3px' }}>
                Mid Exam Plan
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              Build a priority-driven study plan across all your mid exams
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#777', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 0: Timetable ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Mode toggle */}
            <div style={{
              display: 'flex', gap: 0, background: '#111',
              border: '1px solid #222', borderRadius: 10, padding: 4,
            }}>
              {[
                { id: 'manual', label: '✏️  Manual Entry' },
                { id: 'upload', label: '📎  Upload Timetable' },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setTimetableMode(opt.id)} style={{
                  flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: timetableMode === opt.id ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                  color: timetableMode === opt.id ? '#fff' : '#666',
                  fontSize: 13, fontWeight: timetableMode === opt.id ? 600 : 400,
                  transition: 'all 0.15s',
                }}>{opt.label}</button>
              ))}
            </div>

            {/* Upload zone */}
            {timetableMode === 'upload' && (
              <div>
                <input
                  ref={fileRef} type="file" accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  style={{
                    border: `2px dashed ${dragOver ? '#3b82f6' : uploadedFile ? '#22c55e' : '#2a2a2a'}`,
                    borderRadius: 14, padding: '2rem',
                    background: dragOver ? 'rgba(59,130,246,0.05)' : uploadedFile ? 'rgba(34,197,94,0.05)' : '#111',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {uploadedFile ? (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>
                        {uploadedFile.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        File saved — confirm your exam details below
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>
                        Drop your timetable here
                      </div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Supports JPG, PNG, PDF · Click to browse
                      </div>
                    </>
                  )}
                </div>
                {errors.file && <div style={errStyle}>{errors.file}</div>}
                {uploadedFile && (
                  <div style={{
                    marginTop: 10, background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 12, color: '#3b82f6',
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Please enter your exam dates below to confirm — auto-parsing from image will be available soon.
                  </div>
                )}
              </div>
            )}

            {/* Manual / confirmation table */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#c0c0c0', marginBottom: 8 }}>
                {timetableMode === 'upload' ? 'Confirm Your Exam Schedule' : 'Enter Your Exam Schedule'}
                <span style={{ color: '#3b82f6', marginLeft: 4 }}>*</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {exams.map((exam, idx) => (
                  <div key={exam.id} style={{
                    display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                    background: '#111', border: '1px solid #1e1e1e',
                    borderRadius: 12, padding: '10px 12px',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#3b82f6',
                      flexShrink: 0, marginTop: 8,
                    }}>{idx + 1}</div>

                    <div style={{ flex: 1, display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: '2 1 160px' }}>
                        <input
                          placeholder="Module / Subject name"
                          value={exam.subject}
                          onChange={(e) => updateExam(exam.id, 'subject', e.target.value)}
                          style={fieldInput(!!errors[`exam_${exam.id}_subject`])}
                        />
                        {errors[`exam_${exam.id}_subject`] && <div style={errStyle}>{errors[`exam_${exam.id}_subject`]}</div>}
                      </div>
                      <div style={{ flex: '1 1 140px' }}>
                        <input
                          type="date" min={today}
                          value={exam.date}
                          onChange={(e) => updateExam(exam.id, 'date', e.target.value)}
                          style={{ ...fieldInput(!!errors[`exam_${exam.id}_date`]), colorScheme: 'dark' }}
                        />
                        {errors[`exam_${exam.id}_date`] && <div style={errStyle}>{errors[`exam_${exam.id}_date`]}</div>}
                        {exam.date && !errors[`exam_${exam.id}_date`] && (
                          <div style={{ fontSize: 10, color: '#3b82f6', marginTop: 3 }}>
                            {daysUntil(exam.date)} days away
                          </div>
                        )}
                      </div>
                    </div>

                    {exams.length > 1 && (
                      <button
                        onClick={() => removeExam(exam.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#555', padding: '8px 4px', flexShrink: 0,
                        }}
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.exams && <div style={errStyle}>{errors.exams}</div>}

              <button
                onClick={addExam}
                style={{
                  marginTop: 8, width: '100%', padding: '9px',
                  background: 'transparent', border: '1.5px dashed #2a2a2a',
                  borderRadius: 10, cursor: 'pointer', color: '#666',
                  fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Another Exam
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: Subject Details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Tell us how strong you are in each subject and how prepared you currently are. This helps us prioritise your schedule.
            </p>
            {exams.map((exam) => {
              const detail = getDetail(exam.id)
              const days = daysUntil(exam.date)
              return (
                <div key={exam.id} style={{
                  background: '#111', border: '1px solid #1e1e1e',
                  borderRadius: 14, padding: '1rem 1.1rem',
                }}>
                  {/* Subject header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>{exam.subject}</div>
                      <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                        {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {days !== null && (
                          <span style={{
                            marginLeft: 8, fontWeight: 600,
                            color: days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : '#3b82f6',
                          }}>
                            {days} day{days !== 1 ? 's' : ''} away
                          </span>
                        )}
                      </div>
                    </div>
                    {days !== null && (
                      <div style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: days <= 3 ? 'rgba(239,68,68,0.12)' : days <= 7 ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)',
                        color: days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : '#3b82f6',
                      }}>
                        {days <= 3 ? 'URGENT' : days <= 7 ? 'SOON' : 'UPCOMING'}
                      </div>
                    )}
                  </div>

                  {/* Weakness slider */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>My Weakness Level</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: WEAKNESS_COLORS[detail.weakness],
                        background: `${WEAKNESS_COLORS[detail.weakness]}18`,
                        padding: '1px 8px', borderRadius: 20,
                      }}>{WEAKNESS_LABELS[detail.weakness]}</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={detail.weakness}
                      onChange={(e) => setDetail(exam.id, 'weakness', Number(e.target.value))}
                      style={{ width: '100%', accentColor: WEAKNESS_COLORS[detail.weakness], cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: '#444' }}>Strong</span>
                      <span style={{ fontSize: 10, color: '#444' }}>Weak</span>
                    </div>
                  </div>

                  {/* Prep slider */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>Current Preparation</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: PREP_COLORS[detail.prep],
                        background: `${PREP_COLORS[detail.prep]}18`,
                        padding: '1px 8px', borderRadius: 20,
                      }}>{PREP_LABELS[detail.prep]}</span>
                    </div>
                    <input
                      type="range" min={1} max={5} value={detail.prep}
                      onChange={(e) => setDetail(exam.id, 'prep', Number(e.target.value))}
                      style={{ width: '100%', accentColor: PREP_COLORS[detail.prep], cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: '#444' }}>Not Started</span>
                      <span style={{ fontSize: 10, color: '#444' }}>Fully Ready</span>
                    </div>
                  </div>

                  {/* Specific weaknesses notes */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 6 }}>
                      Specific topics you struggle with <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span>
                    </div>
                    <textarea
                      placeholder={`e.g. "I struggle with ${exam.subject.split(' ')[0] || 'chapter'} 3 and past papers"`}
                      value={detail.notes}
                      onChange={(e) => setDetail(exam.id, 'notes', e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', background: '#161616',
                        border: '1.5px solid #222', borderRadius: 8,
                        padding: '8px 12px', fontSize: 12, color: '#ccc',
                        resize: 'none', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── STEP 2: Study Habits ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Field label="Study hours you can manage per day" hint="Be realistic — exams require consistency over intensity">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input
                  type="range" min={1} max={12} value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <div style={{
                  minWidth: 52, height: 40, background: 'rgba(59,130,246,0.12)',
                  border: '1.5px solid rgba(59,130,246,0.3)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#3b82f6',
                }}>{hoursPerDay}h</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#444' }}>1h</span>
                <span style={{ fontSize: 11, color: '#444' }}>12h</span>
              </div>
            </Field>

            <Field label="When do you study best?" error={errors.studyTime} required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 4 }}>
                {[
                  { id: 'morning', label: 'Morning Person', sub: 'Sessions from 8:00 AM', emoji: '🌅' },
                  { id: 'night', label: 'Night Owl', sub: 'Sessions from 7:00 PM', emoji: '🌙' },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => { setStudyTime(opt.id); setErrors((e) => ({ ...e, studyTime: '' })) }} style={{
                    background: studyTime === opt.id ? 'rgba(59,130,246,0.1)' : '#1a1a1a',
                    border: studyTime === opt.id ? '2px solid #3b82f6' : '1.5px solid #2a2a2a',
                    borderRadius: 14, padding: '1rem', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: studyTime === opt.id ? '#3b82f6' : '#ddd', marginBottom: 3 }}>{opt.label}</div>
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
              <div style={{
                display: 'flex', gap: 0, background: '#111',
                border: '1px solid #222', borderRadius: 10, padding: 4, marginTop: 4,
              }}>
                {[{ id: 'grade', label: 'By Grade' }, { id: 'mark', label: 'By Mark (%)' }].map((opt) => (
                  <button key={opt.id} onClick={() => setPerformanceType(opt.id)} style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: performanceType === opt.id ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                    color: performanceType === opt.id ? '#fff' : '#666',
                    fontSize: 13, fontWeight: performanceType === opt.id ? 600 : 400, transition: 'all 0.15s',
                  }}>{opt.label}</button>
                ))}
              </div>
            </Field>

            {performanceType === 'grade' && (
              <Field label="Select your expected overall grade" error={errors.grade} required>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 4 }}>
                  {GRADES.map((g) => (
                    <button key={g} onClick={() => { setGrade(g); setErrors((e) => ({ ...e, grade: '' })) }} style={{
                      width: 52, height: 52, borderRadius: 12,
                      border: grade === g ? `2px solid ${gradeColors[g]}` : '1.5px solid #2a2a2a',
                      background: grade === g ? `${gradeColors[g]}18` : '#1a1a1a',
                      color: grade === g ? gradeColors[g] : '#666',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    }}>{g}</button>
                  ))}
                </div>
                {errors.grade && <div style={errStyle}>{errors.grade}</div>}
              </Field>
            )}

            {performanceType === 'mark' && (
              <Field label="Set your overall target mark out of 100">
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: markColor(mark), letterSpacing: '-2px' }}>{mark}</span>
                    <span style={{ fontSize: 16, color: '#555', fontWeight: 600 }}>/100</span>
                    <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 4, color: markColor(mark), background: `${markColor(mark)}18`, padding: '2px 8px', borderRadius: 20 }}>
                      {markLabel(mark)}
                    </span>
                  </div>
                  <input type="range" min={0} max={100} value={mark}
                    onChange={(e) => setMark(Number(e.target.value))}
                    style={{ width: '100%', accentColor: markColor(mark), cursor: 'pointer' }} />
                </div>
              </Field>
            )}

            {/* Summary */}
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Plan Summary
              </div>
              <Row label="Exams" value={`${exams.length} subject${exams.length > 1 ? 's' : ''}`} />
              <Row label="Daily Hours" value={`${hoursPerDay}h/day`} />
              <Row label="Study Time" value={studyTime === 'morning' ? '🌅 Morning' : studyTime === 'night' ? '🌙 Night' : '—'} />
              <Row label="Target" value={performanceType === 'grade' ? (grade || '—') : `${mark}/100`} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button
            onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}
            style={{
              flex: 1, padding: '11px', borderRadius: 11,
              background: 'transparent', border: '1px solid #2a2a2a',
              color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >{step === 0 ? 'Cancel' : '← Back'}</button>
          <button
            onClick={next}
            style={{
              flex: 2, padding: '11px', borderRadius: 11, border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
            }}
          >{step < 3 ? 'Continue →' : '✨ Generate Schedule'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────

function Field({ label, hint, error, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#c0c0c0', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#3b82f6', marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ margin: '0 0 8px', fontSize: 11, color: '#555' }}>{hint}</p>}
      {children}
      {error && <div style={errStyle}>{error}</div>}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{value}</span>
    </div>
  )
}

const fieldInput = (hasErr) => ({
  width: '100%', background: '#0d0d0d',
  border: `1.5px solid ${hasErr ? '#ef4444' : '#1e1e1e'}`,
  borderRadius: 8, padding: '8px 10px',
  fontSize: 13, color: '#f0f0f0', outline: 'none', boxSizing: 'border-box',
})

const errStyle = { marginTop: 4, fontSize: 11, color: '#ef4444', fontWeight: 500 }

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

export default MidExamModal
