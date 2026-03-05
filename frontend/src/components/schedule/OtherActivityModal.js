import { useState } from 'react'
import { GOAL_CATEGORIES, generateOtherActivitySchedule } from '../../utils/otherActivityEngine'

const ACCENT       = '#06b6d4'
const ACCENT_DARK  = '#0891b2'
const ACCENT_BG    = 'rgba(6,182,212,0.12)'
const ACCENT_BORDER = 'rgba(6,182,212,0.3)'
const ACCENT_RGBA  = (a) => `rgba(6,182,212,${a})`
const GRADIENT     = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`

const STEPS = ['Goal Type', 'Details', 'Schedule', 'Milestones']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CURRENCY_OPTIONS = ['$', '€', '£', 'Rs', 'A$', 'C$', '¥', '₹']

const FINANCIAL_IDS = ['save-car','save-house','save-travel','invest','debt-free','emergency']

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
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? ACCENT : done ? '#aaa' : '#444', whiteSpace: 'nowrap' }}>{label}</span>
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

let midCounter = 100
const newMilestone = (name = '') => ({ id: midCounter++, name })

// ── Main component ─────────────────────────────────────────────────────────
function OtherActivityModal({ onClose, onGenerate }) {
  const [step, setStep] = useState(0)

  // Step 0 – Goal type
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [customGoalName, setCustomGoalName] = useState('')
  const [search, setSearch] = useState('')

  // Step 1 – Details
  const [goalDescription, setGoalDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [currentStatus, setCurrentStatus] = useState(0)
  // Financial
  const [isSavingsGoal, setIsSavingsGoal] = useState(false)
  const [currency, setCurrency] = useState('$')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentSavedAmount, setCurrentSavedAmount] = useState('')

  // Step 2 – Schedule
  const [hoursPerWeek, setHoursPerWeek] = useState(5)
  const [weeklyDays, setWeeklyDays] = useState([1, 3, 5])
  const [studyTime, setStudyTime] = useState('')

  // Step 3 – Milestones
  const [milestones, setMilestones] = useState([])

  const [errors, setErrors] = useState({})
  const today = new Date().toISOString().split('T')[0]

  const goalName = selectedGoal
    ? (selectedGoal.id === 'custom' ? (customGoalName.trim() || 'My Goal') : selectedGoal.name)
    : ''

  const goalCategoryName = selectedGoal
    ? GOAL_CATEGORIES.find((c) => c.items.some((i) => i.id === selectedGoal.id))?.category || ''
    : ''

  const isFinancial = selectedGoal ? FINANCIAL_IDS.includes(selectedGoal.id) : false

  // When a goal is selected, pre-populate milestones from defaultMilestones
  const selectGoal = (goal) => {
    setSelectedGoal(goal)
    setSearch('')
    setErrors((e) => ({ ...e, goalType: '' }))
    if (goal.defaultMilestones && goal.defaultMilestones.length > 0) {
      setMilestones(goal.defaultMilestones.map((m) => newMilestone(m)))
    } else {
      setMilestones([newMilestone()])
    }
    // financial goals auto-toggle the savings toggle
    if (FINANCIAL_IDS.includes(goal.id)) setIsSavingsGoal(true)
    else setIsSavingsGoal(false)
  }

  const toggleDay = (d) => {
    setWeeklyDays((prev) =>
      prev.includes(d) ? (prev.length > 1 ? prev.filter((x) => x !== d) : prev) : [...prev, d].sort()
    )
  }

  const addMilestone    = () => setMilestones((m) => [...m, newMilestone()])
  const removeMilestone = (id) => setMilestones((m) => m.filter((x) => x.id !== id))
  const updateMilestone = (id, value) => setMilestones((m) => m.map((x) => x.id === id ? { ...x, name: value } : x))

  const daysUntil = (dateStr) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const weeksUntil = (dateStr) => {
    const d = daysUntil(dateStr)
    return d !== null ? Math.ceil(d / 7) : null
  }

  const filteredCategories = GOAL_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((i) =>
      !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0)

  const validate = () => {
    const errs = {}
    if (step === 0) {
      if (!selectedGoal) errs.goalType = 'Please select a goal type'
      if (selectedGoal?.id === 'custom' && !customGoalName.trim()) errs.customName = 'Please enter your goal name'
    }
    if (step === 1) {
      if (!targetDate) errs.targetDate = 'Please set a target date'
      else if (new Date(targetDate) <= new Date()) errs.targetDate = 'Target date must be in the future'
      if (isSavingsGoal) {
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) errs.targetAmount = 'Enter a valid target amount'
        if (currentSavedAmount !== '' && isNaN(Number(currentSavedAmount))) errs.currentSavedAmount = 'Enter a valid number'
      }
    }
    if (step === 2) {
      if (!studyTime) errs.studyTime = 'Please select your preferred schedule time'
    }
    if (step === 3) {
      const filled = milestones.filter((m) => m.name.trim())
      if (!filled.length) errs.milestones = 'Add at least one milestone'
      milestones.forEach((m) => {
        if (!m.name.trim()) errs[`milestone_${m.id}`] = 'Required'
      })
    }
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const next = () => {
    if (!validate()) return
    if (step < 3) setStep((s) => s + 1)
    else submit()
  }

  const submit = () => {
    const result = generateOtherActivitySchedule({
      goalId:              selectedGoal?.id || 'custom',
      goalName,
      goalCategoryName,
      targetDate,
      currentStatus,
      hoursPerWeek,
      weeklyCommitmentDays: weeklyDays,
      milestones:          milestones.filter((m) => m.name.trim()).map((m) => m.name),
      isSavingsGoal,
      targetAmount:        isSavingsGoal ? Number(targetAmount) : null,
      currentSavedAmount:  isSavingsGoal ? Number(currentSavedAmount || 0) : 0,
      currency,
      studyTime,
    })
    onGenerate(result)
  }

  const weeks = weeksUntil(targetDate)
  const weeklySave = (isSavingsGoal && targetAmount && weeks)
    ? Math.ceil((Number(targetAmount) - Number(currentSavedAmount || 0)) / weeks)
    : null

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#161616', border: '1px solid #262626', borderRadius: 22, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 24px 80px rgba(0,0,0,0.65)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" fill="none" stroke={ACCENT} strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.3px' }}>Other Activity Plan</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
              {selectedGoal ? `${goalName} — step ${step + 1} of ${STEPS.length}` : 'Personal goals · life events · financial plans'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#777', flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 0: Goal Type ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search goals…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...fieldInput(false), paddingLeft: 34 }}
              />
            </div>

            {errors.goalType && <p style={errStyle}>{errors.goalType}</p>}

            <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: 2 }}>
              {filteredCategories.map((cat) => (
                <div key={cat.category}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>{cat.category}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {cat.items.map((goal) => {
                      const active = selectedGoal?.id === goal.id
                      return (
                        <button
                          key={goal.id}
                          onClick={() => selectGoal(goal)}
                          style={{ background: active ? ACCENT_BG : '#1a1a1a', border: active ? `1.5px solid ${ACCENT}` : '1px solid #242424', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{goal.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: active ? 700 : 600, color: active ? ACCENT : '#ddd' }}>{goal.name}</div>
                            <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{goal.desc}</div>
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

            {selectedGoal?.id === 'custom' && (
              <Field label="What is your goal?" error={errors.customName} required>
                <input
                  value={customGoalName}
                  onChange={(e) => { setCustomGoalName(e.target.value); setErrors((er) => ({ ...er, customName: '' })) }}
                  placeholder="e.g. Buy a Lamborghini, Learn to surf…"
                  style={fieldInput(!!errors.customName)}
                />
              </Field>
            )}
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Goal badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10 }}>
              <span style={{ fontSize: 18 }}>{selectedGoal?.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{goalName}</span>
              <button onClick={() => setStep(0)} style={{ marginLeft: 'auto', fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>change</button>
            </div>

            <Field label="Describe your goal" hint="(optional)">
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder={`What does achieving "${goalName}" look like for you?`}
                rows={2}
                style={{ ...fieldInput(false), resize: 'none', fontFamily: 'inherit', height: 'auto' }}
              />
            </Field>

            <Field label="Target date" error={errors.targetDate} required hint={targetDate ? `${daysUntil(targetDate)} days · ${weeksUntil(targetDate)} weeks away` : ''}>
              <input
                type="date" min={today}
                value={targetDate}
                onChange={(e) => { setTargetDate(e.target.value); setErrors((er) => ({ ...er, targetDate: '' })) }}
                style={{ ...fieldInput(!!errors.targetDate), colorScheme: 'dark' }}
              />
            </Field>

            <Field label="Current progress" hint="How much of this goal have you already completed?">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input type="range" min={0} max={100} value={currentStatus} onChange={(e) => setCurrentStatus(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT, cursor: 'pointer' }} />
                <div style={{ minWidth: 60, height: 38, background: ACCENT_RGBA(0.12), border: `1.5px solid ${ACCENT_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: ACCENT }}>{currentStatus}%</div>
              </div>
            </Field>

            {/* Financial goal toggle */}
            <div>
              <button
                onClick={() => setIsSavingsGoal((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: isSavingsGoal ? ACCENT_RGBA(0.08) : '#1a1a1a', border: `1.5px solid ${isSavingsGoal ? ACCENT_BORDER : '#2a2a2a'}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s' }}
              >
                <div style={{ width: 36, height: 20, borderRadius: 20, background: isSavingsGoal ? ACCENT : '#333', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: isSavingsGoal ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isSavingsGoal ? ACCENT : '#aaa' }}>This is a financial / savings goal</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Track how much you need to save each week</div>
                </div>
              </button>
            </div>

            {isSavingsGoal && (
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Field label="Currency" error={null}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 4 }}>
                    {CURRENCY_OPTIONS.map((c) => (
                      <button key={c} onClick={() => setCurrency(c)} style={{ padding: '5px 12px', borderRadius: 8, border: currency === c ? `1.5px solid ${ACCENT}` : '1px solid #2a2a2a', background: currency === c ? ACCENT_RGBA(0.12) : '#1a1a1a', color: currency === c ? ACCENT : '#777', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
                    ))}
                  </div>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Target amount" error={errors.targetAmount} required>
                    <input
                      type="number" min={0} placeholder="e.g. 50000"
                      value={targetAmount}
                      onChange={(e) => { setTargetAmount(e.target.value); setErrors((er) => ({ ...er, targetAmount: '' })) }}
                      style={fieldInput(!!errors.targetAmount)}
                    />
                  </Field>
                  <Field label="Already saved" error={errors.currentSavedAmount}>
                    <input
                      type="number" min={0} placeholder="e.g. 5000"
                      value={currentSavedAmount}
                      onChange={(e) => { setCurrentSavedAmount(e.target.value); setErrors((er) => ({ ...er, currentSavedAmount: '' })) }}
                      style={fieldInput(!!errors.currentSavedAmount)}
                    />
                  </Field>
                </div>

                {weeklySave !== null && targetDate && (
                  <div style={{ padding: '8px 12px', background: ACCENT_RGBA(0.08), border: `1px solid ${ACCENT_RGBA(0.2)}`, borderRadius: 8, fontSize: 12, color: ACCENT, fontWeight: 600 }}>
                    💡 To reach your target you need to save approx. <strong>{currency}{weeklySave.toLocaleString()}</strong> per week over {weeks} weeks
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Schedule ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Set how often you will work on this goal each week.</p>

            <Field label="Hours per week you can commit">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 4 }}>
                <input type="range" min={1} max={40} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} style={{ flex: 1, accentColor: ACCENT, cursor: 'pointer' }} />
                <div style={{ minWidth: 60, height: 38, background: ACCENT_RGBA(0.12), border: `1.5px solid ${ACCENT_BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: ACCENT }}>{hoursPerWeek}h</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: '#444' }}>1h</span>
                <span style={{ fontSize: 10, color: '#444' }}>40h</span>
              </div>
            </Field>

            <Field label="Which days will you work on this?" hint="(tap to toggle)">
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 6 }}>
                {DAY_LABELS.map((name, idx) => {
                  const on = weeklyDays.includes(idx)
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      style={{ width: 44, height: 44, borderRadius: 10, border: on ? `2px solid ${ACCENT}` : '1.5px solid #2a2a2a', background: on ? ACCENT_RGBA(0.12) : '#1a1a1a', color: on ? ACCENT : '#666', fontSize: 12, fontWeight: on ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}
                    >{name}</button>
                  )
                })}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>{weeklyDays.length} day{weeklyDays.length !== 1 ? 's' : ''}/week · approx {Math.round(hoursPerWeek / weeklyDays.length * 10) / 10}h per session</div>
            </Field>

            <Field label="When do you prefer to work on this?" error={errors.studyTime} required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 4 }}>
                {[
                  { id: 'morning', label: 'Morning', sub: 'Start from 8:00 AM', emoji: '🌅' },
                  { id: 'night',   label: 'Evening',  sub: 'Start from 7:00 PM', emoji: '🌙' },
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

        {/* ── STEP 3: Milestones ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Break your goal into key milestones. These help track your progress and keep you motivated. You can edit the pre-filled ones.
            </p>

            {errors.milestones && <p style={errStyle}>{errors.milestones}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: 320, overflowY: 'auto', paddingRight: 2 }}>
              {milestones.map((m, idx) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: ACCENT_RGBA(0.12), border: `1px solid ${ACCENT_RGBA(0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{idx + 1}</div>
                  <input
                    value={m.name}
                    onChange={(e) => { updateMilestone(m.id, e.target.value); setErrors((er) => ({ ...er, [`milestone_${m.id}`]: '' })) }}
                    placeholder={`Milestone ${idx + 1}…`}
                    style={{ ...fieldInput(!!errors[`milestone_${m.id}`]), flex: 1 }}
                  />
                  {milestones.length > 1 && (
                    <button onClick={() => removeMilestone(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px' }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  {errors[`milestone_${m.id}`] && <span style={{ fontSize: 10, color: '#ef4444' }}>Required</span>}
                </div>
              ))}
            </div>

            <button
              onClick={addMilestone}
              style={{ width: '100%', padding: '9px', background: 'transparent', border: `1.5px dashed ${ACCENT_RGBA(0.3)}`, borderRadius: 10, cursor: 'pointer', color: '#666', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ACCENT_RGBA(0.3); e.currentTarget.style.color = '#666' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Milestone
            </button>

            {/* Summary */}
            <div style={{ background: ACCENT_RGBA(0.05), border: `1px solid ${ACCENT_RGBA(0.15)}`, borderRadius: 14, padding: '1rem', marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Plan Summary</div>
              {[
                { label: 'Goal',      value: goalName },
                { label: 'Deadline',  value: targetDate ? new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'Weeks',     value: weeksUntil(targetDate) ? `${weeksUntil(targetDate)} weeks` : '—' },
                { label: 'Commitment',value: `${hoursPerWeek}h/week · ${weeklyDays.length} days` },
                ...(isSavingsGoal && targetAmount ? [{ label: 'Save/week', value: `${currency}${weeklySave?.toLocaleString() ?? '—'}` }] : []),
                { label: 'Milestones',value: milestones.filter((m) => m.name.trim()).length },
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
            ? <button onClick={() => setStep((s) => s - 1)} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12, padding: '11px 20px', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back
              </button>
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

export default OtherActivityModal
