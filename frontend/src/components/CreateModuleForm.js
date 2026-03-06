import { useState } from 'react'
import { createModule } from '../utils/moduleApi'

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

const EMPTY = {
  code:         '',
  name:         '',
  description:  '',
  department:   '',
  faculty:      '',
  credits:      '3',
  type:         'lecture',
  level:        '100',
  semester:     '',
  academicYear: '',
  maxStudents:  '150',
  prerequisites:    '',
  learningOutcomes: '',
  syllabus:         '',
  tags:             '',
  assessmentAssignments: '20',
  assessmentMid:         '30',
  assessmentFinal:       '50',
  scheduleDays:  [],
  scheduleStart: '',
  scheduleEnd:   '',
  scheduleVenue: '',
}

// ─────────────────────────────────────────────────────────────────────────
// Props:
//   lecturer  – { id, name, email, department } (logged-in lecturer)
//   onSuccess – fn(newModule) called after successful save
//   onCancel  – fn() called when user clicks Cancel (optional)
// ─────────────────────────────────────────────────────────────────────────
export default function CreateModuleForm({ lecturer, onSuccess, onCancel }) {
  const [form, setForm]       = useState({ ...EMPTY, department: lecturer?.department || '' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

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

  const assessmentTotal =
    (Number(form.assessmentAssignments) || 0) +
    (Number(form.assessmentMid)         || 0) +
    (Number(form.assessmentFinal)       || 0)

  const isValid =
    form.code.trim() &&
    form.name.trim() &&
    form.department.trim() &&
    form.credits &&
    form.semester.trim() &&
    form.academicYear.trim() &&
    assessmentTotal === 100

  // ── submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        code:         form.code.trim().toUpperCase(),
        name:         form.name.trim(),
        description:  form.description.trim(),
        department:   form.department.trim(),
        faculty:      form.faculty.trim(),
        credits:      Number(form.credits),
        type:         form.type,
        level:        form.level,
        semester:     form.semester.trim(),
        academicYear: form.academicYear.trim(),
        maxStudents:  Number(form.maxStudents) || 150,
        lecturerId:   lecturer?.id   || '',
        lecturerName: lecturer?.name || '',
        lecturerEmail: lecturer?.email || '',
        prerequisites:    form.prerequisites.split(',').map(s => s.trim()).filter(Boolean),
        learningOutcomes: form.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean),
        syllabus:         form.syllabus.trim(),
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
      const created = await createModule(payload)
      setSuccess(true)
      setForm({ ...EMPTY, department: lecturer?.department || '' })
      if (onSuccess) onSuccess(created)
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
          Create New Module
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
              It is now pending admin approval. You can track its status in the Requests tab.
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
          <input value={form.code} onChange={e => set('code', e.target.value)}
            placeholder="e.g. CS401" style={input} />
        </div>
        <div>
          <label style={label}>Module Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Advanced Web Development" style={input} />
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
          <input value={form.faculty} onChange={e => set('faculty', e.target.value)}
            placeholder="e.g. Faculty of Engineering" style={input} />
        </div>
        <div>
          <label style={label}>Tags (comma-separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="e.g. web, javascript, react" style={input} />
        </div>
        <div>
          <label style={label}>Syllabus URL / Document Path</label>
          <input value={form.syllabus} onChange={e => set('syllabus', e.target.value)}
            placeholder="e.g. /docs/cs401-syllabus.pdf" style={input} />
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
          <input value={form.semester} onChange={e => set('semester', e.target.value)}
            placeholder="e.g. Sem 1 2026" style={input} />
        </div>
        <div>
          <label style={label}>Academic Year *</label>
          <input value={form.academicYear} onChange={e => set('academicYear', e.target.value)}
            placeholder="e.g. 2025/2026" style={input} />
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

      {/* ── Section 5: Schedule ── */}
      <p style={sectionTitle}>5 · Class Schedule</p>
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
          {saving ? '⏳ Submitting…' : '✓ Submit Module for Approval'}
        </button>
      </div>
    </div>
  )
}
