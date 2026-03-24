import { useEffect, useState } from 'react'
import { createModule, updateModule, uploadWeeklyModulePdf } from '../utils/moduleApi'

// ── Shared styles ─────────────────────────────────────────────────────────
const input = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #e8ecf4', fontSize: 13, color: '#1a1a2e',
  background: '#f8faff', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const label = {
  fontSize: 12, fontWeight: 600, color: '#6b7280',
  marginBottom: 5, display: 'block',
}
const sectionTitle = {
  fontSize: 12, fontWeight: 700, color: '#f97316',
  textTransform: 'uppercase', letterSpacing: 1,
  margin: '1.5rem 0 0.875rem', paddingBottom: 8,
  borderBottom: '1.5px solid #f0f4ff',
}

const DAYS   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const LEVELS = ['100', '200', '300', '400', '500', '600']
const TYPES  = ['lecture', 'lab', 'tutorial', 'online', 'hybrid']
const FACULTIES = [
  { value: 'IT', label: 'IT - Information Technology' },
  { value: 'EN', label: 'EN - Engineering' },
  { value: 'HS', label: 'HS - Humanity Sciences' },
  { value: 'BS', label: 'BS - Business Studies' },
]
const SEMESTERS = ['Jan-Jun Semester', 'July-Dec Semester']
const createWeek = (weekNumber) => ({
  weekNumber,
  topic: '',
  instructionText: '',
  pdfFile: null,
  pdfFileName: '',
  pdfFileUrl: '',
})

const EMPTY = {
  code:         '',
  name:         '',
  description:  '',
  department:   '',
  faculty:      'IT',
  credits:      '3',
  type:         'lecture',
  level:        '100',
  semester:     'Jan-Jun Semester',
  academicYear: '',
  maxStudents:  '150',
  prerequisites:    '',
  learningOutcomes: '',
  weeklySyllabus:   [createWeek(1)],
  tags:             '',
  assessmentAssignments: '20',
  assessmentMid:         '30',
  assessmentFinal:       '50',
  scheduleDays:  [],
  scheduleStart: '',
  scheduleEnd:   '',
  scheduleVenue: '',
}

const toFormState = (moduleData, lecturerDepartment = '') => {
  if (!moduleData) {
    return { ...EMPTY, department: lecturerDepartment || '' }
  }

  const weekly = Array.isArray(moduleData.weeklySyllabus) && moduleData.weeklySyllabus.length > 0
    ? moduleData.weeklySyllabus.slice(0, 12).map((w, idx) => ({
        weekNumber: Number(w.weekNumber) || idx + 1,
        topic: String(w.topic || ''),
        instructionText: String(w.instructionText || ''),
        pdfFile: null,
        pdfFileName: String(w.pdfFileName || ''),
        pdfFileUrl: String(w.pdfFileUrl || ''),
      }))
    : [createWeek(1)]

  return {
    ...EMPTY,
    code: String(moduleData.code || ''),
    name: String(moduleData.name || ''),
    description: String(moduleData.description || ''),
    department: String(moduleData.department || lecturerDepartment || ''),
    faculty: String(moduleData.faculty || 'IT'),
    credits: String(moduleData.credits ?? '3'),
    type: String(moduleData.type || 'lecture'),
    level: String(moduleData.level || '100'),
    semester: String(moduleData.semester || 'Jan-Jun Semester'),
    academicYear: String(moduleData.academicYear || ''),
    maxStudents: String(moduleData.maxStudents ?? '150'),
    prerequisites: Array.isArray(moduleData.prerequisites)
      ? moduleData.prerequisites.join(', ')
      : '',
    learningOutcomes: Array.isArray(moduleData.learningOutcomes)
      ? moduleData.learningOutcomes.join('\n')
      : '',
    weeklySyllabus: weekly,
    tags: Array.isArray(moduleData.tags)
      ? moduleData.tags.join(', ')
      : '',
    assessmentAssignments: String(moduleData.assessmentStructure?.assignments ?? 20),
    assessmentMid: String(moduleData.assessmentStructure?.midExam ?? 30),
    assessmentFinal: String(moduleData.assessmentStructure?.finalExam ?? 50),
    scheduleDays: Array.isArray(moduleData.schedule?.days) ? moduleData.schedule.days : [],
    scheduleStart: String(moduleData.schedule?.startTime || ''),
    scheduleEnd: String(moduleData.schedule?.endTime || ''),
    scheduleVenue: String(moduleData.schedule?.venue || ''),
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Props:
//   lecturer  – { id, name, email, department } (logged-in lecturer)
//   mode      – 'create' | 'edit'
//   initialModule – module object when mode is edit
//   onSuccess – fn(module) called after successful save
//   onCancel  – fn() called when user clicks Cancel (optional)
// ─────────────────────────────────────────────────────────────────────────
export default function CreateModuleForm({ lecturer, mode = 'create', initialModule = null, onSuccess, onCancel }) {
  const isEditMode = mode === 'edit'
  const [form, setForm]       = useState(() => toFormState(initialModule, lecturer?.department || ''))
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    code: '',
    name: '',
    academicYear: '',
    weeklySyllabus: '',
  })

  useEffect(() => {
    setForm(toFormState(initialModule, lecturer?.department || ''))
    setSuccess(false)
    setError('')
    setFieldErrors({ code: '', name: '', academicYear: '', weeklySyllabus: '' })
  }, [initialModule, lecturer?.department, isEditMode])

  // ── helpers ──────────────────────────────────────────────────────────
  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const toggleDay = day => {
    setForm(p => ({
      ...p,
      scheduleDays: p.scheduleDays.includes(day)
        ? p.scheduleDays.filter(d => d !== day)
        : [...p.scheduleDays, day],
    }))
  }

  const setWeekField = (weekIndex, key, value) => {
    setForm(prev => ({
      ...prev,
      weeklySyllabus: prev.weeklySyllabus.map((week, idx) => (
        idx === weekIndex ? { ...week, [key]: value } : week
      )),
    }))
  }

  const addWeek = () => {
    setForm((prev) => {
      if (prev.weeklySyllabus.length >= 12) return prev
      const nextWeek = createWeek(prev.weeklySyllabus.length + 1)
      return {
        ...prev,
        weeklySyllabus: [...prev.weeklySyllabus, nextWeek],
      }
    })
    setFieldErrors((prev) => ({ ...prev, weeklySyllabus: '' }))
  }

  const removeWeek = (weekIndex) => {
    setForm((prev) => {
      if (prev.weeklySyllabus.length <= 1) {
        return prev
      }
      const withoutWeek = prev.weeklySyllabus.filter((_, idx) => idx !== weekIndex)
      const reindexed = withoutWeek.map((week, idx) => ({ ...week, weekNumber: idx + 1 }))
      return {
        ...prev,
        weeklySyllabus: reindexed,
      }
    })
  }

  const handleCodeChange = (rawValue) => {
    const cleaned = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '')
    set('code', cleaned)
    setFieldErrors((prev) => ({
      ...prev,
      code: rawValue !== cleaned
        ? 'Module ID allows only letters and numbers (no special characters).'
        : '',
    }))
  }

  const handleNameChange = (rawValue) => {
    const cleaned = rawValue.replace(/[0-9]/g, '')
    set('name', cleaned)
    setFieldErrors((prev) => ({
      ...prev,
      name: rawValue !== cleaned
        ? 'Module name cannot contain numbers.'
        : '',
    }))
  }

  const handleAcademicYearChange = (rawValue) => {
    if (!/^\d{0,4}(\/\d{0,4})?$/.test(rawValue)) {
      setFieldErrors((prev) => ({
        ...prev,
        academicYear: 'Academic year must use digits only (example: 2026 or 2026/2027).',
      }))
      return
    }

    const firstYearPart = rawValue.slice(0, 4)
    if (firstYearPart.length === 4) {
      const firstYear = Number(firstYearPart)
      if (Number.isNaN(firstYear) || firstYear < 2026) {
        setFieldErrors((prev) => ({
          ...prev,
          academicYear: 'Academic year cannot be before 2026.',
        }))
        return
      }
    }

    set('academicYear', rawValue)
    setFieldErrors((prev) => ({ ...prev, academicYear: '' }))
  }

  const assessmentTotal =
    (Number(form.assessmentAssignments) || 0) +
    (Number(form.assessmentMid)         || 0) +
    (Number(form.assessmentFinal)       || 0)

  const weeklyLectureValid =
    form.weeklySyllabus.length >= 1 &&
    form.weeklySyllabus.every((w) => w.topic.trim() && w.instructionText.trim())

  const isValid =
    form.code.trim() &&
    form.name.trim() &&
    form.department.trim() &&
    form.faculty &&
    form.credits &&
    form.semester &&
    form.academicYear.trim() &&
    weeklyLectureValid &&
    !fieldErrors.code &&
    !fieldErrors.name &&
    !fieldErrors.academicYear &&
    assessmentTotal === 100

  // ── submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    setError('')

    if (!weeklyLectureValid) {
      setFieldErrors((prev) => ({
        ...prev,
        weeklySyllabus: 'At least one lecture week is required, and each added week must have topic and instruction text.',
      }))
      setSaving(false)
      return
    }

    try {
      const weeklySyllabusWithUploads = await Promise.all(
        form.weeklySyllabus.map(async (w) => {
          if (!w.pdfFile) {
            return {
              weekNumber: w.weekNumber,
              topic: w.topic.trim(),
              instructionText: w.instructionText.trim(),
              pdfFileName: w.pdfFileName,
              pdfFileUrl: w.pdfFileUrl || '',
            }
          }

          const uploadRes = await uploadWeeklyModulePdf(w.pdfFile, w.weekNumber)
          return {
            weekNumber: w.weekNumber,
            topic: w.topic.trim(),
            instructionText: w.instructionText.trim(),
            pdfFileName: uploadRes.pdfFileName || w.pdfFileName,
            pdfFileUrl: uploadRes.pdfFileUrl || '',
          }
        })
      )

      const payload = {
        code:         form.code.trim().toUpperCase(),
        name:         form.name.trim(),
        description:  form.description.trim(),
        department:   form.department.trim(),
        faculty:      form.faculty,
        credits:      Number(form.credits),
        type:         form.type,
        level:        form.level,
        semester:     form.semester,
        academicYear: form.academicYear.trim(),
        maxStudents:  Number(form.maxStudents) || 150,
        prerequisites:    form.prerequisites.split(',').map(s => s.trim()).filter(Boolean),
        learningOutcomes: form.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean),
        weeklySyllabus:   weeklySyllabusWithUploads,
        tags:             form.tags.split(',').map(s => s.trim()).filter(Boolean),
        assessmentStructure: {
          assignments: Number(form.assessmentAssignments) || 0,
          midExam:     Number(form.assessmentMid)         || 0,
          finalExam:   Number(form.assessmentFinal)       || 0,
        },
        schedule: {
          days:      form.scheduleDays,
          startTime: form.scheduleStart,
          endTime:   form.scheduleEnd,
          venue:     form.scheduleVenue.trim(),
        },
      }
      let saved
      if (isEditMode) {
        const moduleId = initialModule?._id
        if (!moduleId) {
          throw new Error('Module ID is missing for update.')
        }
        saved = await updateModule(moduleId, payload)
      } else {
        saved = await createModule(payload)
        setForm({ ...EMPTY, department: lecturer?.department || '' })
        setFieldErrors({ code: '', name: '', academicYear: '', weeklySyllabus: '' })
      }

      setSuccess(true)
      if (onSuccess) onSuccess(saved)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: '#ffffff', border: '1.5px solid #e8ecf4',
      borderRadius: 20, padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
          {isEditMode ? 'Update Module' : 'Create New Module'}
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
          Fill in all required fields. The module will be submitted for admin approval before becoming active.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{
          background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)',
          borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>Module submitted successfully!</div>
            <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
              {isEditMode
                ? 'Module update submitted successfully. It is now pending admin approval.'
                : 'It is now pending admin approval. You can track its status in the Requests tab.'}
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)',
          borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ fontSize: 13, color: '#dc2626' }}>{error}</div>
        </div>
      )}

      {/* ── Section 1: Basic Information ── */}
      <p style={sectionTitle}>1 · Basic Information</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div>
          <label style={label}>Module Code *</label>
          <input value={form.code} onChange={e => handleCodeChange(e.target.value)}
            placeholder="e.g. CS401" style={input} />
          {fieldErrors.code && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{fieldErrors.code}</div>}
        </div>
        <div>
          <label style={label}>Module Name *</label>
          <input value={form.name} onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Advanced Web Development" style={input} />
          {fieldErrors.name && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{fieldErrors.name}</div>}
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={label}>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Brief overview of what this module covers…" rows={3}
            style={{ ...input, resize: 'vertical' }} />
        </div>
        <div>
          <label style={label}>Department *</label>
          <input value={form.department} onChange={e => set('department', e.target.value)}
            placeholder="e.g. Computer Science & Engineering" style={input} />
        </div>
        <div>
          <label style={label}>Faculty / School</label>
          <select value={form.faculty} onChange={e => set('faculty', e.target.value)} style={input}>
            {FACULTIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Tags (comma-separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="e.g. web, javascript, react" style={input} />
        </div>
      </div>

      {/* ── Section 2: Academic Details ── */}
      <p style={sectionTitle}>2 · Academic Details</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
        <div>
          <label style={label}>Credit Hours *</label>
          <input type="number" min="1" max="10" value={form.credits}
            onChange={e => set('credits', e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>Level</label>
          <select value={form.level} onChange={e => set('level', e.target.value)} style={input}>
            {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Module Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={input}>
            {TYPES.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Semester *</label>
          <select value={form.semester} onChange={e => set('semester', e.target.value)} style={input}>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Academic Year *</label>
          <input value={form.academicYear} onChange={e => handleAcademicYearChange(e.target.value)}
            placeholder="e.g. 2026/2027" style={input} />
          {fieldErrors.academicYear && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{fieldErrors.academicYear}</div>}
        </div>
        <div>
          <label style={label}>Max Students</label>
          <input type="number" min="1" value={form.maxStudents}
            onChange={e => set('maxStudents', e.target.value)} style={input} />
        </div>
      </div>

      {/* ── Section 3: Curriculum ── */}
      <p style={sectionTitle}>3 · Curriculum</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div>
          <label style={label}>Prerequisites (comma-separated module codes)</label>
          <input value={form.prerequisites} onChange={e => set('prerequisites', e.target.value)}
            placeholder="e.g. CS101, CS201" style={input} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={label}>Learning Outcomes (one per line)</label>
          <textarea value={form.learningOutcomes} onChange={e => set('learningOutcomes', e.target.value)}
            placeholder={'e.g.\nUnderstand core web protocols\nBuild full-stack applications\nApply REST API design patterns'}
            rows={5} style={{ ...input, resize: 'vertical' }} />
        </div>
      </div>

      {/* ── Section 4: Assessment Structure ── */}
      <p style={sectionTitle}>4 · Assessment Structure (must total 100%)</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', alignItems: 'end' }}>
        <div>
          <label style={label}>Assignments %</label>
          <input type="number" min="0" max="100" value={form.assessmentAssignments}
            onChange={e => set('assessmentAssignments', e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>Mid Exam %</label>
          <input type="number" min="0" max="100" value={form.assessmentMid}
            onChange={e => set('assessmentMid', e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>Final Exam %</label>
          <input type="number" min="0" max="100" value={form.assessmentFinal}
            onChange={e => set('assessmentFinal', e.target.value)} style={input} />
        </div>
        {/* Total indicator */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: assessmentTotal === 100 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1.5px solid ${assessmentTotal === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <span style={{ fontSize: 14 }}>{assessmentTotal === 100 ? '✅' : '⚠️'}</span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: assessmentTotal === 100 ? '#16a34a' : '#dc2626',
            }}>
              Total: {assessmentTotal}% {assessmentTotal === 100 ? '— ready' : `— must be 100 (${100 - assessmentTotal > 0 ? '+' : ''}${100 - assessmentTotal} remaining)`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 5: Weekly Syllabus ── */}
      <p style={sectionTitle}>5 · Weekly Syllabus Plan (1 to 12 Weeks)</p>
      <div style={{
        marginBottom: '0.875rem',
        background: 'rgba(249,115,22,0.06)',
        border: '1.5px solid rgba(249,115,22,0.2)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 12,
        color: '#92400e',
      }}>
        Add weeks as needed (minimum 1, maximum 12). Each week needs a lecture title and instruction text.
      </div>

      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.6rem' }}>
        <button
          type="button"
          onClick={addWeek}
          disabled={form.weeklySyllabus.length >= 12}
          style={{
            border: '1.5px solid #e8ecf4',
            borderRadius: 10,
            background: '#f8faff',
            color: '#374151',
            fontSize: 12,
            fontWeight: 700,
            padding: '8px 12px',
            cursor: form.weeklySyllabus.length >= 12 ? 'not-allowed' : 'pointer',
          }}
        >
          + Add Week
        </button>
        <div style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
          Weeks added: {form.weeklySyllabus.length}/12
        </div>
      </div>

      {fieldErrors.weeklySyllabus && (
        <div style={{ fontSize: 11, color: '#dc2626', marginBottom: 8 }}>{fieldErrors.weeklySyllabus}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
        {form.weeklySyllabus.map((week, idx) => (
          <div key={week.weekNumber} style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>Week {week.weekNumber}</div>
              <button
                type="button"
                onClick={() => removeWeek(idx)}
                disabled={form.weeklySyllabus.length <= 1}
                style={{
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)',
                  color: '#dc2626',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '5px 9px',
                  cursor: form.weeklySyllabus.length <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Remove
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={label}>Topic / Lecture Title</label>
                <input
                  value={week.topic}
                  onChange={(e) => setWeekField(idx, 'topic', e.target.value)}
                  placeholder={`Week ${week.weekNumber} topic`}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Lecture PDF Upload</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setWeekField(idx, 'pdfFile', file)
                    setWeekField(idx, 'pdfFileName', file?.name || '')
                  }}
                  style={{ ...input, padding: '7px 10px' }}
                />
                {week.pdfFileName && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                    Selected: {week.pdfFileName}
                    {week.pdfFileUrl && !week.pdfFile && ' (already uploaded)'}
                  </div>
                )}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Instruction Text *</label>
                <textarea
                  rows={3}
                  value={week.instructionText}
                  onChange={(e) => setWeekField(idx, 'instructionText', e.target.value)}
                  placeholder={`Instructions for week ${week.weekNumber} lecture...`}
                  style={{ ...input, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section 6: Schedule ── */}
      <p style={sectionTitle}>6 · Class Schedule</p>
      <div style={{ marginBottom: '0.875rem' }}>
        <label style={label}>Days</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {DAYS.map(day => {
            const active = form.scheduleDays.includes(day)
            return (
              <button key={day} onClick={() => toggleDay(day)} type="button" style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${active ? 'rgba(249,115,22,0.4)' : '#e8ecf4'}`,
                background: active ? 'rgba(249,115,22,0.1)' : '#f8faff',
                color: active ? '#f97316' : '#6b7280',
              }}>
                {day.slice(0, 3)}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.875rem' }}>
        <div>
          <label style={label}>Start Time</label>
          <input type="time" value={form.scheduleStart}
            onChange={e => set('scheduleStart', e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>End Time</label>
          <input type="time" value={form.scheduleEnd}
            onChange={e => set('scheduleEnd', e.target.value)} style={input} />
        </div>
        <div>
          <label style={label}>Venue / Room</label>
          <input value={form.scheduleVenue} onChange={e => set('scheduleVenue', e.target.value)}
            placeholder="e.g. Block A, Hall 201 or Zoom link" style={input} />
        </div>
      </div>

      {/* ── Admin notice ── */}
      <div style={{
        marginTop: '1.5rem',
        background: 'rgba(249,115,22,0.06)', border: '1.5px solid rgba(249,115,22,0.2)',
        borderRadius: 12, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 12, color: '#92400e' }}>
          <strong>Admin Approval Required:</strong> This module will be submitted with status <em>Pending</em>.
          Once approved by an administrator, it will become active and visible to students.
        </p>
      </div>

      {/* ── Actions ── */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button onClick={onCancel} disabled={saving} style={{
            padding: '10px 22px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid #e8ecf4', background: '#f8faff', color: '#6b7280',
          }}>
            Cancel
          </button>
        )}
        <button onClick={handleSubmit} disabled={!isValid || saving} style={{
          padding: '10px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: isValid && !saving ? 'pointer' : 'not-allowed',
          border: 'none',
          background: isValid && !saving
            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)'
            : '#e8ecf4',
          color: isValid && !saving ? '#ffffff' : '#9ca3af',
          boxShadow: isValid && !saving ? '0 4px 15px rgba(249,115,22,0.35)' : 'none',
          transition: 'all 0.2s',
        }}>
          {saving ? '⏳ Submitting…' : isEditMode ? '✓ Submit Update for Approval' : '✓ Submit Module for Approval'}
        </button>
      </div>
    </div>
  )
}
