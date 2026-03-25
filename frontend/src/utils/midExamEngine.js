// ── Mid Exam Schedule Engine ──────────────────────────────────────────────
// Allocates study days across multiple subjects using proximity + weakness
// + preparation priority scoring

export const SUBJECT_COLORS = [
  '#3b82f6', '#f97316', '#22c55e', '#a855f7',
  '#ef4444', '#06b6d4', '#eab308', '#ec4899',
]

const PHASE_META = {
  learn:   { label: 'Deep Learning',    color: '#3b82f6', desc: 'Build solid understanding' },
  practice:{ label: 'Practice',         color: '#f97316', desc: 'Past papers & problem sets' },
  revise:  { label: 'Revision',         color: '#a855f7', desc: 'Consolidate your knowledge' },
  final:   { label: 'Final Review',     color: '#22c55e', desc: 'Last-minute key points' },
}

const TASK_BANK = {
  learn: (subject) => [
    `Read and annotate core ${subject} theory notes`,
    `Create a concept map for ${subject} key topics`,
    `Summarise ${subject} lecture slides in your own words`,
    `Identify and study weak areas in ${subject}`,
    `Review ${subject} textbook chapters in depth`,
    `Write out key definitions and theorems for ${subject}`,
    `Watch/re-watch recorded lectures for ${subject}`,
    `Cross-reference ${subject} notes with marking guide`,
  ],
  practice: (subject) => [
    `Attempt ${subject} past exam paper (timed)`,
    `Solve ${subject} practice problem sets`,
    `Work through ${subject} tutorial questions`,
    `Review ${subject} worked examples and model answers`,
    `Complete ${subject} online practice exercises`,
    `Identify patterns in ${subject} past exam questions`,
  ],
  revise: (subject) => [
    `Condense ${subject} notes into a 1-page summary`,
    `Create flashcards for ${subject} key concepts`,
    `Build a ${subject} formula / fact sheet`,
    `Re-do difficult ${subject} practice questions`,
    `Check ${subject} weak areas one final time`,
  ],
  final: (subject) => [
    `Quick read-through of ${subject} full summary sheet`,
    `Review ${subject} formula and key-fact sheet`,
    `Skim ${subject} past exam for question patterns`,
    `Light review of personally noted ${subject} weak spots`,
    `Get a good rest — you are ready for ${subject}!`,
  ],
}

function getPhase(daysToExam) {
  if (daysToExam <= 1) return 'final'
  if (daysToExam <= 3) return 'revise'
  if (daysToExam <= 7) return 'practice'
  return 'learn'
}

function formatHour(h) {
  const fullH = Math.floor(h)
  const mins  = Math.round((h - fullH) * 60)
  const ampm  = fullH >= 12 ? 'PM' : 'AM'
  const disp  = fullH > 12 ? fullH - 12 : fullH === 0 ? 12 : fullH
  return `${disp}:${mins.toString().padStart(2, '0')} ${ampm}`
}

function buildSessions(hoursPerDay, studyTime, tasks) {
  const start   = studyTime === 'morning' ? 8 : 19
  const sessions = []
  let hour       = start
  let remaining  = hoursPerDay
  const pool     = [...tasks]

  while (remaining > 0 && pool.length > 0) {
    const len  = remaining >= 2 ? 1.5 : remaining
    const task = pool.shift()
    sessions.push({
      time: `${formatHour(hour)} – ${formatHour(hour + len)}`,
      task,
      duration: len,
    })
    hour += len + 0.25 // 15-min break
    remaining -= len
  }
  return sessions
}

/**
 * Compute a priority score for a subject on a given day.
 * Higher score = more urgent = more likely to be assigned today.
 *
 * Score = (weaknessMultiplier * inversePrepMultiplier) / daysRemaining
 */
function priorityScore(exam, daysRemaining) {
  if (daysRemaining <= 0) return -Infinity
  const weaknessMult  = 0.8 + (exam.weakness - 1) * 0.3  // 0.8 – 2.0
  const prepMult      = 2.2 - (exam.prep    - 1) * 0.3  // 2.2 – 1.0 (less prep = higher)
  return (weaknessMult * prepMult) / daysRemaining
}

/**
 * @param {object} form
 *   exams        — [{ id, subject, date, weakness(1-5), prep(1-5), notes }]
 *   hoursPerDay  — number
 *   studyTime    — 'morning' | 'night'
 *   performanceType — 'grade' | 'mark'
 *   grade        — string
 *   mark         — number
 */
export function generateMidExamSchedule(form) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Enrich exams with color and parsed date
  const exams = form.exams.map((e, i) => {
    const examDate = new Date(e.date)
    examDate.setHours(0, 0, 0, 0)
    return { ...e, examDate, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }
  })

  // Total span: today → last exam
  const lastExam   = exams.reduce((m, e) => e.examDate > m ? e.examDate : m, exams[0].examDate)
  const totalDays  = Math.max(1, Math.round((lastExam - today) / (1000 * 60 * 60 * 24)) + 1)

  const taskCounters = {}  // { examId: index } to cycle through tasks
  exams.forEach((e) => { taskCounters[e.id] = 0 })

  const days = []

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)

    // Exams happening exactly on this date
    const examsTodayList = exams.filter((e) => e.examDate.toDateString() === date.toDateString())

    // Exams that can still be studied (strictly in the future — not today)
    const studyable = exams.filter((e) => e.examDate > date)

    // If no studyable exams remain, this day is a pure exam/rest day
    if (studyable.length === 0) {
      days.push({
        date: new Date(date),
        dayNumber: d + 1,
        isExamDay: true,
        examSubjects: examsTodayList.map((e) => ({ subject: e.subject, color: e.color })),
        sessions: [],
        phase: 'exam',
        phaseLabel: examsTodayList.length > 0 ? 'Exam Day' : 'Rest Day',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        subject: 'EXAM DAY',
        subjectColor: '#ef4444',
      })
      continue
    }

    // Determine if any studyable exam is critical (1 day away) — give 100% focus
    const criticals = studyable.filter((e) => {
      const diff = Math.round((e.examDate - date) / (1000 * 60 * 60 * 24))
      return diff <= 1
    })

    let chosen
    if (criticals.length > 0) {
      // Most critical = soonest
      chosen = criticals.sort((a, b) => a.examDate - b.examDate)[0]
    } else {
      // Score all studyable exams and pick highest priority
      chosen = studyable.slice().sort((a, b) => {
        const dA = Math.round((a.examDate - date) / (1000 * 60 * 60 * 24))
        const dB = Math.round((b.examDate - date) / (1000 * 60 * 60 * 24))
        return priorityScore(b, dB) - priorityScore(a, dA)
      })[0]
    }

    const daysToExam = Math.round((chosen.examDate - date) / (1000 * 60 * 60 * 24))
    const phase      = getPhase(daysToExam)
    const phaseMeta  = PHASE_META[phase]
    const bank       = TASK_BANK[phase](chosen.subject)
    const tasksNeeded = Math.max(1, Math.ceil(form.hoursPerDay / 1.5))

    // Cycle through task bank
    const tasks = []
    for (let t = 0; t < tasksNeeded; t++) {
      tasks.push(bank[taskCounters[chosen.id] % bank.length])
      taskCounters[chosen.id]++
    }

    const sessions = buildSessions(form.hoursPerDay, form.studyTime, tasks)

    // Other studyable exams that are also very close (show alert in UI)
    const nearExams = studyable
      .filter((e) => e.id !== chosen.id)
      .filter((e) => Math.round((e.examDate - date) / (1000 * 60 * 60 * 24)) <= 2)

    days.push({
      date: new Date(date),
      dayNumber: d + 1,
      isExamDay: false,
      // Any exam happening TODAY on this study day (different subject)
      examsTodayList: examsTodayList.map((e) => ({ subject: e.subject, color: e.color })),
      subject: chosen.subject,
      subjectColor: chosen.color,
      subjectId: chosen.id,
      daysToExam,
      phase,
      phaseLabel: phaseMeta.label,
      color: phaseMeta.color,
      bg: `${phaseMeta.color}12`,
      sessions,
      hoursPlanned: form.hoursPerDay,
      weaknessLevel: chosen.weakness,
      prepLevel: chosen.prep,
      notes: chosen.notes,
      nearExams,
      examToday: examsTodayList.map((e) => e.subject),
    })
  }

  const targetLabel = form.performanceType === 'grade' ? `Grade ${form.grade}` : `${form.mark}/100`

  // Build exam timeline for the result header
  const examTimeline = exams
    .slice()
    .sort((a, b) => a.examDate - b.examDate)
    .map((e) => ({
      subject: e.subject,
      date: e.examDate,
      color: e.color,
      daysFromToday: Math.round((e.examDate - today) / (1000 * 60 * 60 * 24)),
      weakness: e.weakness,
      prep: e.prep,
    }))

  return {
    type: 'mid-exam',
    exams: examTimeline,
    totalDays,
    hoursPerDay: form.hoursPerDay,
    studyTime: form.studyTime,
    targetLabel,
    totalHours: form.hoursPerDay * days.filter((d) => !d.isExamDay).length,
    days,
  }
}
