// ── Schedule Generation Engine ────────────────────────────────────────────

const PHASE_COLORS = {
  research:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Research' },
  understanding:{ color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'Understanding' },
  core:         { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  label: 'Core Work' },
  review:       { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Review' },
  polish:       { color: '#eab308', bg: 'rgba(234,179,8,0.12)',   label: 'Final Polish' },
}

const TASK_BANK = {
  research: [
    'Gather reference materials and academic sources',
    'Read assignment brief thoroughly and annotate key requirements',
    'Create a mind map of core concepts',
    'Identify knowledge gaps and topics to study',
    'Compile a resource list and bibliography outline',
    'Review lecture notes relevant to the topic',
  ],
  understanding: [
    'Study core theory and underlying concepts',
    'Summarise key ideas in your own words',
    'Create a structured outline / skeleton for the assignment',
    'Cross-check understanding against marking criteria',
    'Discuss concepts with peers or teaching assistants',
  ],
  core: [
    'Write the introduction and define scope',
    'Develop the main argument / solution — Part 1',
    'Develop the main argument / solution — Part 2',
    'Expand supporting sections with evidence',
    'Integrate research findings into content',
    'Complete practical / problem-solving sections',
    'Write conclusion and recommendations',
    'Add in-text citations and references',
  ],
  review: [
    'Re-read the full draft for logical flow',
    'Check alignment with marking rubric',
    'Revise weak sections and strengthen arguments',
    'Proofread for grammar, spelling, and style',
    'Verify all references and citations are correct',
    'Request peer feedback and incorporate changes',
  ],
  polish: [
    'Apply final formatting (font, spacing, headings)',
    'Run plagiarism check if available',
    'Final read-through and last-minute fixes',
    'Prepare and package submission files',
    'Submit assignment before the deadline',
  ],
}

const GRADE_INTENSITY = {
  'A+': 4, 'A': 3,
  'B+': 3, 'B': 2,
  'C+': 2, 'C': 2,
  'D': 1, 'F': 1,
}

function getIntensityFromMark(mark) {
  if (mark >= 85) return 4
  if (mark >= 70) return 3
  if (mark >= 55) return 2
  return 1
}

function getIntensity(form) {
  if (form.performanceType === 'grade') return GRADE_INTENSITY[form.grade] ?? 2
  return getIntensityFromMark(form.mark)
}

function getPhasePlan(intensity, totalDays) {
  // returns array of { phase, dayCount } — proportional to totalDays
  const raw = {
    4: [
      { phase: 'research',      pct: 0.12 },
      { phase: 'understanding', pct: 0.13 },
      { phase: 'core',          pct: 0.45 },
      { phase: 'review',        pct: 0.20 },
      { phase: 'polish',        pct: 0.10 },
    ],
    3: [
      { phase: 'research',      pct: 0.15 },
      { phase: 'core',          pct: 0.50 },
      { phase: 'review',        pct: 0.25 },
      { phase: 'polish',        pct: 0.10 },
    ],
    2: [
      { phase: 'core',          pct: 0.60 },
      { phase: 'review',        pct: 0.30 },
      { phase: 'polish',        pct: 0.10 },
    ],
    1: [
      { phase: 'core',          pct: 0.70 },
      { phase: 'review',        pct: 0.30 },
    ],
  }

  const plan = raw[intensity]

  // Distribute days — at least 1 day per phase, then spread remainder
  const distributed = plan.map((p) => ({
    ...p,
    dayCount: Math.max(1, Math.round(p.pct * totalDays)),
  }))

  // Reconcile so sum === totalDays
  let diff = totalDays - distributed.reduce((s, p) => s + p.dayCount, 0)
  const coreIdx = distributed.findIndex((p) => p.phase === 'core')
  distributed[coreIdx].dayCount += diff

  return distributed
}

function buildSessions(hoursPerDay, studyTime, tasks) {
  const sessionStartHour = studyTime === 'morning' ? 8 : 19
  const sessions = []
  const used = tasks.slice()

  let hour = sessionStartHour
  let remaining = hoursPerDay

  // Break hours into 1.5h–2h sessions
  while (remaining > 0 && used.length > 0) {
    const sessionLen = remaining >= 2 ? 1.5 : remaining
    const task = used.shift()
    const startStr = formatHour(hour)
    hour += sessionLen
    remaining -= sessionLen
    const endStr = formatHour(hour)
    sessions.push({ time: `${startStr} – ${endStr}`, task, duration: sessionLen })
    if (remaining > 0 && used.length > 0) hour += 0.25 // 15 min break
  }

  return sessions
}

function formatHour(h) {
  const fullH = Math.floor(h)
  const mins = Math.round((h - fullH) * 60)
  const ampm = fullH >= 12 ? 'PM' : 'AM'
  const display = fullH > 12 ? fullH - 12 : fullH === 0 ? 12 : fullH
  return `${display}:${mins.toString().padStart(2, '0')} ${ampm}`
}

function pickTasks(bank, count, usedSet) {
  const available = bank.filter((t) => !usedSet.has(t))
  const picked = available.slice(0, count)
  picked.forEach((t) => usedSet.add(t))
  // Cycle if exhausted
  if (picked.length < count) {
    const extra = bank.slice(0, count - picked.length)
    extra.forEach((t) => picked.push(t))
  }
  return picked
}

/**
 * Main generation function
 * @param {object} form — from AssignmentModal state
 * @returns {object} schedule output
 */
export function generateAssignmentSchedule(form) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(form.dueDate)
  due.setHours(0, 0, 0, 0)

  const totalDays = Math.max(1, Math.round((due - today) / (1000 * 60 * 60 * 24)))
  const intensity = getIntensity(form)
  const phasePlan = getPhasePlan(intensity, totalDays)

  const days = []
  const usedTasks = new Set()
  const currentDate = new Date(today)

  let phaseIdx = 0
  let daysInCurrentPhase = 0

  for (let d = 0; d < totalDays; d++) {
    const phase = phasePlan[phaseIdx]
    const bank = TASK_BANK[phase.phase]
    const tasksPerSession = Math.max(1, Math.floor(form.hoursPerDay / 1.5))
    const tasks = pickTasks(bank, tasksPerSession, usedTasks)
    const sessions = buildSessions(form.hoursPerDay, form.studyTime, tasks)

    const isToday = d === 0
    const isLast = d === totalDays - 1

    days.push({
      date: new Date(currentDate),
      dayNumber: d + 1,
      phase: phase.phase,
      phaseLabel: PHASE_COLORS[phase.phase].label,
      color: PHASE_COLORS[phase.phase].color,
      bg: PHASE_COLORS[phase.phase].bg,
      sessions,
      hoursPlanned: form.hoursPerDay,
      isToday,
      isLast,
    })

    daysInCurrentPhase++
    if (daysInCurrentPhase >= phase.dayCount && phaseIdx < phasePlan.length - 1) {
      phaseIdx++
      daysInCurrentPhase = 0
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const targetLabel = form.performanceType === 'grade'
    ? `Grade ${form.grade}`
    : `${form.mark}/100`

  return {
    subject: form.subject,
    dueDate: due,
    totalDays,
    hoursPerDay: form.hoursPerDay,
    studyTime: form.studyTime,
    targetLabel,
    intensity,
    totalHours: form.hoursPerDay * totalDays,
    phases: phasePlan.map((p) => ({
      ...p,
      ...PHASE_COLORS[p.phase],
    })),
    days,
  }
}
