import { useState, useRef, useEffect } from 'react'
import CreateModuleForm from '../components/CreateModuleForm'
import { fetchModules } from '../utils/moduleApi'

// ── Mock: logged-in lecturer ──────────────────────────────────────────────
const LECTURER = {
  id: 'L001',
  name: 'Dr. Sarah Chen',
  title: 'Associate Professor',
  department: 'Computer Science & Engineering',
  email: 's.chen@eduza.ac',
  phone: '+1 (555) 801-2345',
  office: 'Block A, Room 214',
  hours: 'Mon & Wed 2–4 PM',
  specialty: 'Web Technologies & Full-Stack Development',
  initials: 'SC',
  color: '#f97316',
  bio: 'Leading researcher in modern web technologies with over 12 years of industry and academic experience. Published 30+ peer-reviewed papers and leads the university\'s Web Innovation Lab.',
  modules: [
    { code: 'CS401', name: 'Advanced Web Development',      students: 145, semester: 'Sem 1 2026' },
    { code: 'CS312', name: 'Full-Stack Engineering',         students: 112, semester: 'Sem 1 2026' },
    { code: 'CS210', name: 'JavaScript Frameworks',          students: 85,  semester: 'Sem 2 2025' },
  ],
}

// ── Mock: registered students ─────────────────────────────────────────────
const STUDENTS = [
  { id: 'STU-001', name: 'John Doe',      email: 'john.doe@eduza.ac',    year: 3, program: 'BSc Computer Science',    gpa: 3.72, courses: ['CS401','CS312'], status: 'Active', joined: 'Sep 2022', phone: '+1 (555) 234-5678', rank: '#12', attendance: 92 },
  { id: 'STU-002', name: 'Aisha Mohamed', email: 'a.mohamed@eduza.ac',   year: 2, program: 'BSc Computer Science',    gpa: 3.91, courses: ['CS401','CS210'], status: 'Active', joined: 'Sep 2023', phone: '+1 (555) 345-6789', rank: '#3',  attendance: 98 },
  { id: 'STU-003', name: 'Ravi Sharma',   email: 'r.sharma@eduza.ac',    year: 3, program: 'BSc Software Engineering', gpa: 3.45, courses: ['CS312'],        status: 'Active', joined: 'Sep 2022', phone: '+1 (555) 456-7890', rank: '#28', attendance: 85 },
  { id: 'STU-004', name: 'Emily Zhang',   email: 'e.zhang@eduza.ac',     year: 1, program: 'BSc Computer Science',    gpa: 3.88, courses: ['CS210'],         status: 'Active', joined: 'Sep 2024', phone: '+1 (555) 567-8901', rank: '#5',  attendance: 96 },
  { id: 'STU-005', name: 'Kwame Asante',  email: 'k.asante@eduza.ac',    year: 2, program: 'BSc Information Technology', gpa: 3.21, courses: ['CS401'],    status: 'Active', joined: 'Sep 2023', phone: '+1 (555) 678-9012', rank: '#67', attendance: 79 },
  { id: 'STU-006', name: 'Sofia Rossi',   email: 's.rossi@eduza.ac',     year: 3, program: 'BSc Computer Science',    gpa: 3.67, courses: ['CS401','CS312','CS210'], status: 'Active', joined: 'Sep 2022', phone: '+1 (555) 789-0123', rank: '#19', attendance: 90 },
  { id: 'STU-007', name: "Liam O'Brien",  email: 'l.obrien@eduza.ac',    year: 2, program: 'BSc Software Engineering', gpa: 3.55, courses: ['CS312'],       status: 'Active', joined: 'Sep 2023', phone: '+1 (555) 890-1234', rank: '#18', attendance: 88 },
  { id: 'STU-008', name: 'Priya Nair',    email: 'p.nair@eduza.ac',      year: 1, program: 'BSc Computer Science',    gpa: 4.00, courses: ['CS210'],         status: 'Active', joined: 'Sep 2024', phone: '+1 (555) 901-2345', rank: '#1',  attendance: 100 },
]

// ── Mock: initial requests ────────────────────────────────────────────────
const INITIAL_REQUESTS = [
  { id: 'REQ-001', type: 'Profile Update', detail: 'Updated office hours to Mon & Wed 2–4 PM', submittedAt: '2026-03-01 10:23 AM', status: 'approved', note: '' },
  { id: 'REQ-002', type: 'Extra Class',    detail: 'CS401 — Revision: Async JS on Mar 8, 2:00 PM, Hall A-12', submittedAt: '2026-03-03 09:15 AM', status: 'pending', note: '' },
  { id: 'REQ-003', type: 'Module Upload',  detail: 'CS312 — Week 9 lecture slides (week9-slides.pdf)', submittedAt: '2026-03-04 03:45 PM', status: 'pending', note: '' },
  { id: 'REQ-004', type: 'Content Update', detail: 'CS210 — Updated Week 7 assignment brief', submittedAt: '2026-02-28 11:00 AM', status: 'rejected', note: 'Please resubmit with correct file format (.pdf required)' },
]

const TABS = ['Overview', 'Students', 'Extra Classes', 'Modules', 'Create Module', 'Requests']

const MODULE_COLORS = { CS401: '#f97316', CS312: '#3b82f6', CS210: '#22c55e' }

// ── Shared styles ─────────────────────────────────────────────────────────
const cardStyle = {
  background: '#ffffff',
  border: '1.5px solid #e8ecf4',
  borderRadius: 16,
  padding: '1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1.5px solid #e8ecf4', fontSize: 13, color: '#1a1a2e',
  background: '#f8faff', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#6b7280',
  marginBottom: 5, display: 'block',
}

// ── Status pill ───────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    pending:  { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)',  label: '⏳ Pending'  },
    approved: { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)',   label: '✅ Approved' },
    rejected: { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.25)',  label: '❌ Rejected' },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{c.label}</span>
  )
}

// ── Submit success banner ─────────────────────────────────────────────────
function SuccessBanner({ message }) {
  return (
    <div style={{
      background: 'rgba(34,197,94,0.10)', border: '1.5px solid rgba(34,197,94,0.3)',
      borderRadius: 10, padding: '10px 14px', marginBottom: '1rem',
      fontSize: 13, color: '#16a34a', fontWeight: 600,
    }}>✅ {message}</div>
  )
}

// ── Warning notice ────────────────────────────────────────────────────────
function AdminNotice() {
  return (
    <div style={{
      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 10, padding: '10px 14px',
      fontSize: 12, color: '#92400e',
    }}>
      ⚠️ This request will be sent to the admin for approval before taking effect.
    </div>
  )
}

// ── Submit button ─────────────────────────────────────────────────────────
function SubmitBtn({ disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#e8ecf4' : 'linear-gradient(135deg, #f97316, #c2410c)',
      border: 'none', borderRadius: 12, padding: '12px', width: '100%',
      color: disabled ? '#9ca3af' : '#fff',
      fontSize: 14, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>
      Submit for Admin Approval →
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════
function LectureProfile() {
  const [activeTab, setActiveTab]           = useState('Overview')
  const [requests, setRequests]             = useState(INITIAL_REQUESTS)
  const [studentSearch, setStudentSearch]   = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Overview — personal info
  const [editMode, setEditMode]             = useState(false)
  const [profileOk, setProfileOk]           = useState(false)
  const [personalForm, setPersonalForm]     = useState({
    name:   LECTURER.name,   title: LECTURER.title,
    email:  LECTURER.email,  phone: LECTURER.phone,
    office: LECTURER.office, hours: LECTURER.hours,
    bio:    LECTURER.bio,
  })

  // Extra classes
  const [classForm, setClassForm]           = useState({ module: 'CS401', topic: '', date: '', time: '', duration: '2', venue: '', notes: '' })
  const [classOk, setClassOk]               = useState(false)

  // Modules (content update)
  const [moduleForm, setModuleForm]         = useState({ module: 'CS401', week: '', type: 'lecture', title: '', description: '' })
  const [uploadFile, setUploadFile]         = useState(null)
  const [moduleOk, setModuleOk]             = useState(false)
  const fileRef                             = useRef()

  // Create Module tab — fetched from DB
  const [myModules, setMyModules]           = useState([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [modulesError, setModulesError]     = useState('')

  // Fetch lecturer's created modules whenever the Create Module tab is opened
  useEffect(() => {
    if (activeTab !== 'Create Module') return
    setModulesLoading(true)
    setModulesError('')
    fetchModules({ lecturerId: LECTURER.id })
      .then(data => setMyModules(data))
      .catch(() => setModulesError('Could not load modules — backend may be offline.'))
      .finally(() => setModulesLoading(false))
  }, [activeTab])

  // ── helpers ──────────────────────────────────────────────────────────
  const nextId  = () => `REQ-${String(requests.length + 1).padStart(3, '0')}`
  const nowStr  = () => new Date().toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
  const flash = (setter) => { setter(true); setTimeout(() => setter(false), 3500) }

  const addRequest = (req) => setRequests(prev => [req, ...prev])

  const pendingCount = requests.filter(r => r.status === 'pending').length

  // ── submit handlers ───────────────────────────────────────────────────
  const submitProfile = () => {
    addRequest({ id: nextId(), type: 'Profile Update', detail: `Updated personal profile — name: ${personalForm.name}, office: ${personalForm.office}`, submittedAt: nowStr(), status: 'pending', note: '' })
    setEditMode(false)
    flash(setProfileOk)
  }

  const submitClass = () => {
    addRequest({ id: nextId(), type: 'Extra Class', detail: `${classForm.module} — ${classForm.topic} on ${classForm.date} at ${classForm.time}, ${classForm.duration}h, ${classForm.venue}`, submittedAt: nowStr(), status: 'pending', note: '' })
    setClassForm({ module: 'CS401', topic: '', date: '', time: '', duration: '2', venue: '', notes: '' })
    flash(setClassOk)
  }

  const submitModule = () => {
    addRequest({ id: nextId(), type: uploadFile ? 'Module Upload' : 'Content Update', detail: `${moduleForm.module} — ${moduleForm.title}${uploadFile ? ` (${uploadFile.name})` : ''}`, submittedAt: nowStr(), status: 'pending', note: '' })
    setModuleForm({ module: 'CS401', week: '', type: 'lecture', title: '', description: '' })
    setUploadFile(null)
    flash(setModuleOk)
  }

  // ── filtered students ─────────────────────────────────────────────────
  const filteredStudents = STUDENTS.filter(s => {
    const q = studentSearch.toLowerCase()
    return s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q)
  })

  const classReady = classForm.topic && classForm.date && classForm.time && classForm.venue

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header banner ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        borderRadius: 20, padding: '1.75rem 2rem',
        marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
      }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 130, bottom: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>{LECTURER.initials}</div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
              Lecturer Dashboard
            </div>
            <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              {LECTURER.name}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              {LECTURER.title} · {LECTURER.department}
            </p>
          </div>

          {pendingCount > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: 12, padding: '9px 18px',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        background: '#f0f4ff', border: '1.5px solid #e8ecf4',
        borderRadius: 14, padding: 4, marginBottom: '1.5rem',
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSelectedStudent(null) }} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab ? 700 : 500,
            background: activeTab === tab ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'transparent',
            color: activeTab === tab ? '#fff' : '#9ca3af', transition: 'all 0.15s',
            boxShadow: activeTab === tab ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
            position: 'relative',
          }}>
            {tab}
            {tab === 'Requests' && pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5,
                width: 7, height: 7, borderRadius: '50%',
                background: activeTab === tab ? '#fbbf24' : '#f97316',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════  OVERVIEW  ═══════════════════════════ */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Personal Information – full width */}
          <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Personal Information</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {profileOk && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Sent for admin approval</span>}
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} style={{
                    background: '#fff', border: '1.5px solid #e8ecf4', borderRadius: 10,
                    color: '#6b7280', fontSize: 12, fontWeight: 600,
                    padding: '7px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}>✏️ Edit Profile</button>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditMode(false)} style={{
                      background: '#fff', border: '1.5px solid #e8ecf4', borderRadius: 10,
                      color: '#9ca3af', fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={submitProfile} style={{
                      background: 'linear-gradient(135deg, #f97316, #c2410c)', border: 'none',
                      borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700,
                      padding: '7px 16px', cursor: 'pointer',
                    }}>Submit for Approval →</button>
                  </div>
                )}
              </div>
            </div>

            {!editMode ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Full Name',     value: personalForm.name,   icon: '👤' },
                  { label: 'Title',         value: personalForm.title,  icon: '🎓' },
                  { label: 'Email',         value: personalForm.email,  icon: '📧' },
                  { label: 'Phone',         value: personalForm.phone,  icon: '📱' },
                  { label: 'Office',        value: personalForm.office, icon: '🏢' },
                  { label: 'Office Hours',  value: personalForm.hours,  icon: '🕐' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 5 }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
                <div style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '12px 14px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 5 }}>📝 Bio</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{personalForm.bio}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { key: 'name',   label: 'Full Name' }, { key: 'title',  label: 'Title' },
                  { key: 'email',  label: 'Email' },     { key: 'phone',  label: 'Phone' },
                  { key: 'office', label: 'Office' },    { key: 'hours',  label: 'Office Hours' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={personalForm[f.key]}
                      onChange={e => setPersonalForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inputStyle} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea value={personalForm.bio} rows={3}
                    onChange={e => setPersonalForm(p => ({ ...p, bio: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}><AdminNotice /></div>
              </div>
            )}
          </div>

          {/* My Modules */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>My Modules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {LECTURER.modules.map(m => (
                <div key={m.code} style={{
                  background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 10, flexShrink: 0,
                    background: `${MODULE_COLORS[m.code] || '#9ca3af'}18`,
                    border: `1.5px solid ${MODULE_COLORS[m.code] || '#9ca3af'}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: MODULE_COLORS[m.code] || '#9ca3af',
                  }}>{m.code}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{m.students} students · {m.semester}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Recent Requests</h3>
              <button onClick={() => setActiveTab('Requests')} style={{ background: 'none', border: 'none', fontSize: 12, color: '#f97316', fontWeight: 600, cursor: 'pointer' }}>
                View All →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {requests.slice(0, 4).map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{r.type}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail}</div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════  STUDENTS  ═══════════════════════════ */}
      {activeTab === 'Students' && (
        selectedStudent ? (
          /* ── Student detail view ── */
          <div>
            <button onClick={() => setSelectedStudent(null)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff', border: '1.5px solid #e8ecf4', borderRadius: 10,
              padding: '8px 16px', marginBottom: '1.25rem',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280',
            }}>
              ← Back to Students
            </button>

            {/* Student header card */}
            <div style={{ ...cardStyle, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #f97316, #c2410c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 800, color: '#fff',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                }}>
                  {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
                    {selectedStudent.name}
                  </h2>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#9ca3af' }}>
                    {selectedStudent.id} · {selectedStudent.program}, Year {selectedStudent.year}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { label: selectedStudent.status, bg: 'rgba(34,197,94,0.12)',   color: '#16a34a', border: 'rgba(34,197,94,0.2)' },
                      { label: `Year ${selectedStudent.year}`, bg: 'rgba(249,115,22,0.1)', color: '#f97316', border: 'rgba(249,115,22,0.2)' },
                      { label: `Joined ${selectedStudent.joined}`, bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
                    ].map(t => (
                      <span key={t.label} style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                {[
                  { label: 'GPA',        value: selectedStudent.gpa,           color: '#f97316' },
                  { label: 'Attendance', value: `${selectedStudent.attendance}%`, color: '#22c55e' },
                  { label: 'Rank',       value: selectedStudent.rank,           color: '#3b82f6' },
                  { label: 'Courses',    value: selectedStudent.courses.length, color: '#a855f7' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Contact */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Contact Information</h3>
                {[
                  { label: 'Email',   value: selectedStudent.email,   icon: '📧' },
                  { label: 'Phone',   value: selectedStudent.phone,   icon: '📱' },
                  { label: 'Program', value: selectedStudent.program, icon: '🎓' },
                  { label: 'Joined',  value: selectedStudent.joined,  icon: '📅' },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #f0f4ff' : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{item.icon} {item.label}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Enrolled modules */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Enrolled in Your Modules</h3>
                {selectedStudent.courses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {selectedStudent.courses.map(code => {
                      const mod = LECTURER.modules.find(m => m.code === code)
                      const c = MODULE_COLORS[code] || '#9ca3af'
                      return mod ? (
                        <div key={code} style={{
                          background: '#f8faff', border: `1.5px solid ${c}25`,
                          borderLeft: `4px solid ${c}`, borderRadius: 10, padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{mod.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{mod.code} · {mod.semester}</div>
                        </div>
                      ) : null
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Not enrolled in any of your modules.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Students list ── */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Registered Students</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found</p>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Search by name, ID, email or program…"
                  style={{ ...inputStyle, width: 320, paddingLeft: 36 }}
                />
                <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
              {filteredStudents.map(s => (
                <button key={s.id} onClick={() => setSelectedStudent(s)} style={{
                  background: '#ffffff', border: '1.5px solid #e8ecf4', borderRadius: 16,
                  padding: '1.25rem', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid #e8ecf4'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.875rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #f97316, #c2410c)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 800, color: '#fff',
                    }}>
                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{s.id}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, fontWeight: 500 }}>{s.program}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                        Yr {s.year}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                        GPA {s.gpa}
                      </span>
                    </div>
                    <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>No students found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</div>
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* ══════════════════════  EXTRA CLASSES  ══════════════════════════ */}
      {activeTab === 'Extra Classes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Form */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Schedule an Extra Class</h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: 12, color: '#9ca3af' }}>
              Sent to admin for approval before appearing on student schedules.
            </p>
            {classOk && <SuccessBanner message="Request submitted — awaiting admin approval" />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Module</label>
                <select value={classForm.module} onChange={e => setClassForm(p => ({ ...p, module: e.target.value }))} style={inputStyle}>
                  {LECTURER.modules.map(m => <option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Session Title / Topic</label>
                <input placeholder="e.g. Revision — Async JS & Promises" value={classForm.topic}
                  onChange={e => setClassForm(p => ({ ...p, topic: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={classForm.date} onChange={e => setClassForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <input type="time" value={classForm.time} onChange={e => setClassForm(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <select value={classForm.duration} onChange={e => setClassForm(p => ({ ...p, duration: e.target.value }))} style={inputStyle}>
                    {['1', '1.5', '2', '2.5', '3'].map(d => <option key={d} value={d}>{d} hr{d !== '1' ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Venue / Link</label>
                  <input placeholder="Hall A-12 or Zoom link" value={classForm.venue}
                    onChange={e => setClassForm(p => ({ ...p, venue: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes for Students (optional)</label>
                <textarea placeholder="Preparation notes, what to bring…" rows={3}
                  value={classForm.notes} onChange={e => setClassForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <AdminNotice />
              <SubmitBtn disabled={!classReady} onClick={submitClass} />
            </div>
          </div>

          {/* Submitted classes */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Submitted Extra Classes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.filter(r => r.type === 'Extra Class').length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '2rem 0', margin: 0 }}>
                  No extra classes submitted yet.
                </p>
              ) : (
                requests.filter(r => r.type === 'Extra Class').map(r => (
                  <div key={r.id} style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{r.id}</div>
                      <StatusPill status={r.status} />
                    </div>
                    <div style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600, marginBottom: 4 }}>{r.detail}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Submitted: {r.submittedAt}</div>
                    {r.note && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 5, fontStyle: 'italic' }}>Admin note: {r.note}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════  MODULES  ═══════════════════════════ */}
      {activeTab === 'Modules' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Upload/update form */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Update Module Content</h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: 12, color: '#9ca3af' }}>
              Upload files or update content. All changes require admin approval.
            </p>
            {moduleOk && <SuccessBanner message="Request submitted — awaiting admin approval" />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Module</label>
                <select value={moduleForm.module} onChange={e => setModuleForm(p => ({ ...p, module: e.target.value }))} style={inputStyle}>
                  {LECTURER.modules.map(m => <option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Week / Chapter</label>
                  <input placeholder="e.g. Week 9" value={moduleForm.week}
                    onChange={e => setModuleForm(p => ({ ...p, week: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Content Type</label>
                  <select value={moduleForm.type} onChange={e => setModuleForm(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                    {['lecture', 'tutorial', 'assignment', 'quiz', 'resource', 'announcement'].map(t => (
                      <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Title *</label>
                <input placeholder="e.g. Week 9 — REST APIs & Express.js" value={moduleForm.title}
                  onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description / Notes</label>
                <textarea placeholder="What students should know or do…" rows={3}
                  value={moduleForm.description} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* File upload */}
              <div>
                <label style={labelStyle}>Attach File (PDF, PPTX, DOCX, ZIP…)</label>
                <div onClick={() => fileRef.current?.click()} style={{
                  border: `2px dashed ${uploadFile ? 'rgba(249,115,22,0.4)' : '#e8ecf4'}`,
                  borderRadius: 12, padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                  background: uploadFile ? 'rgba(249,115,22,0.05)' : '#f8faff',
                }}>
                  <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  {uploadFile ? (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>{uploadFile.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{(uploadFile.size / 1024).toFixed(1)} KB · Click to change</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Click to browse files</div>
                      <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 2 }}>PDF, PPTX, DOCX, ZIP supported</div>
                    </div>
                  )}
                </div>
              </div>
              <AdminNotice />
              <SubmitBtn disabled={!moduleForm.title} onClick={submitModule} />
            </div>
          </div>

          {/* Module update history */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Module Update History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.filter(r => r.type === 'Module Upload' || r.type === 'Content Update').length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '2rem 0', margin: 0 }}>
                  No module updates submitted yet.
                </p>
              ) : (
                requests.filter(r => r.type === 'Module Upload' || r.type === 'Content Update').map(r => (
                  <div key={r.id} style={{ background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                        background: r.type === 'Module Upload' ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)',
                        color: r.type === 'Module Upload' ? '#3b82f6' : '#a855f7',
                      }}>{r.type}</span>
                      <StatusPill status={r.status} />
                    </div>
                    <div style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600, marginBottom: 4 }}>{r.detail}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.submittedAt}</div>
                    {r.note && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 5, fontStyle: 'italic' }}>Admin note: {r.note}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════  CREATE MODULE  ══════════════════════════ */}
      {activeTab === 'Create Module' && (
        <div>
          {/* Form */}
          <CreateModuleForm
            lecturer={{
              id:         LECTURER.id,
              name:       LECTURER.name,
              email:      LECTURER.email,
              department: LECTURER.department,
            }}
            onSuccess={newMod => setMyModules(prev => [newMod, ...prev])}
          />

          {/* ── My Created Modules list ── */}
          <div style={{ marginTop: '1.5rem', ...cardStyle }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>My Created Modules</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Modules you have submitted — sourced from the database</p>
              </div>
              {modulesLoading && (
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Loading…</span>
              )}
            </div>

            {modulesError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)',
                borderRadius: 12, padding: '12px 16px', marginBottom: '1rem',
                fontSize: 13, color: '#dc2626',
              }}>⚠️ {modulesError}</div>
            )}

            {!modulesLoading && !modulesError && myModules.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No modules created yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Use the form above to create your first module.</div>
              </div>
            )}

            {myModules.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem' }}>
                {myModules.map(m => {
                  const approvalColor = m.approvalStatus === 'approved'
                    ? '#16a34a' : m.approvalStatus === 'rejected' ? '#dc2626' : '#d97706'
                  const approvalBg = m.approvalStatus === 'approved'
                    ? 'rgba(34,197,94,0.1)' : m.approvalStatus === 'rejected'
                    ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.1)'
                  return (
                    <div key={m._id || m.code} style={{
                      background: '#f8faff', border: '1.5px solid #e8ecf4', borderRadius: 14, padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <span style={{
                            fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                            background: 'rgba(249,115,22,0.1)', color: '#f97316', marginRight: 6,
                          }}>{m.code}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: approvalBg, color: approvalColor,
                          }}>
                            {m.approvalStatus === 'approved' ? '✅ Approved' : m.approvalStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: m.status === 'active' ? 'rgba(34,197,94,0.1)' : '#f0f4ff',
                          color: m.status === 'active' ? '#16a34a' : '#9ca3af',
                        }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{m.department} · {m.credits} credits · {m.semester}</div>
                      {m.description && (
                        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {m.description}
                        </div>
                      )}
                      {m.adminNote && (
                        <div style={{
                          marginTop: 8, background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                          padding: '6px 10px', fontSize: 11, color: '#dc2626',
                        }}>
                          <strong>Admin note:</strong> {m.adminNote}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════  REQUESTS  ══════════════════════════ */}
      {activeTab === 'Requests' && (
        <div>
          {/* Summary counters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    count: requests.length,                              color: '#6b7280', bg: '#f8faff',                    border: '#e8ecf4' },
              { label: 'Pending',  count: requests.filter(r => r.status === 'pending').length,  color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)' },
              { label: 'Approved', count: requests.filter(r => r.status === 'approved').length, color: '#16a34a', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)' },
              { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 14, padding: '14px 28px', textAlign: 'center', minWidth: 100,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: '-0.5px' }}>{s.count}</div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
            <div style={{
              flex: 1, background: 'rgba(249,115,22,0.06)', border: '1.5px solid rgba(249,115,22,0.2)',
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                <strong>Admin Review Process:</strong> All submissions go to the admin for review.
                Approved changes take effect immediately. Rejected requests include an admin note.
              </div>
            </div>
          </div>

          {/* All requests */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>All Activity Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map(r => (
                <div key={r.id} style={{
                  background: '#f8faff',
                  border: `1.5px solid ${r.status === 'pending' ? 'rgba(245,158,11,0.25)' : r.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  borderLeft: `4px solid ${r.status === 'pending' ? '#f59e0b' : r.status === 'approved' ? '#22c55e' : '#ef4444'}`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#e8ecf4', color: '#6b7280' }}>{r.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{r.type}</span>
                    </div>
                    <StatusPill status={r.status} />
                  </div>
                  <div style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 600, marginBottom: 5 }}>{r.detail}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Submitted: {r.submittedAt}</div>
                  {r.note && (
                    <div style={{
                      marginTop: 8, background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                      padding: '7px 10px', fontSize: 12, color: '#dc2626',
                    }}>
                      <strong>Admin note:</strong> {r.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default LectureProfile