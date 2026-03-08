// ── Other / External Exam Schedule Engine ────────────────────────────────
// Works for any non-university exam: GCE A/L, GCE O/L, Grade 5 Scholarship,
// AAT, Law Exams, IELTS, and any custom exam.

export const SUBJECT_COLORS = [
  '#a855f7', '#3b82f6', '#f97316', '#22c55e',
  '#ef4444', '#06b6d4', '#eab308', '#ec4899',
]

const PHASE_META = {
  learn:    { label: 'Deep Learning',  color: '#3b82f6', desc: 'Build solid conceptual knowledge' },
  practice: { label: 'Practice',       color: '#f97316', desc: 'Past papers & timed exercises' },
  revise:   { label: 'Revision',       color: '#a855f7', desc: 'Condense and reinforce' },
  final:    { label: 'Final Review',   color: '#22c55e', desc: 'Skim key points, no new content' },
}

// Generic task banks — work for any external exam
const TASK_BANK = {
  learn: (subject) => [
    `Read and annotate core ${subject} study material`,
    `Review the official ${subject} syllabus and identify all topic areas`,
    `Summarise ${subject} theory notes in your own words`,
    `Create a concept map of key ${subject} topics`,
    `Study ${subject} textbook chapters in depth`,
    `Write out key definitions, formulas, and rules for ${subject}`,
    `Watch recommended tutorials or lectures on ${subject}`,
    `Cross-reference ${subject} notes with the official marking scheme`,
    `Identify and focus on weak areas in ${subject}`,
    `Build a ${subject} topic-by-topic checklist from the syllabus`,
  ],
  practice: (subject) => [
    `Attempt a ${subject} past paper under timed exam conditions`,
    `Complete ${subject} model answer exercises`,
    `Work through ${subject} past paper questions topic by topic`,
    `Review ${subject} marking schemes and examiner comments`,
    `Identify patterns in ${subject} past exam questions`,
    `Self-test on ${subject} key definitions and concepts`,
    `Complete ${subject} practice exercises from study guides`,
    `Attempt ${subject} short-answer questions without notes`,
  ],
  revise: (subject) => [
    `Condense ${subject} notes into a 1-page summary sheet`,
    `Create quick-recall flashcards for ${subject} key points`,
    `Build a ${subject} formula / key-rule sheet`,
    `Re-attempt challenging ${subject} past paper questions`,
    `Review ${subject} weak areas one more time`,
    `Explain ${subject} core concepts aloud from memory`,
    `Check your ${subject} summary sheet for any missing topics`,
  ],
  final: (subject) => [
    `Light read-through of ${subject} full summary sheet`,
    `Final check of ${subject} formula and key-fact sheet`,
    `Skim one ${subject} past paper for question patterns`,
    `Check personally noted ${subject} weak spots`,
    `Prepare your ${subject} exam stationery and materials`,
    `Rest well — you have prepared for ${subject}, trust the process!`,
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
  const start    = studyTime === 'morning' ? 8 : 19
  const sessions = []
  let hour       = start
  let remaining  = hoursPerDay
  const pool     = [...tasks]

  while (remaining > 0 && pool.length > 0) {
    const len  = remaining >= 2 ? 1.5 : remaining
    const task = pool.shift()
    sessions.push({
      time:     `${formatHour(hour)} – ${formatHour(hour + len)}`,
      task,
      duration: len,
    })
    hour      += len + 0.25  // 15-min break
    remaining -= len
  }
  return sessions
}

function priorityScore(exam, daysRemaining) {
  if (daysRemaining <= 0) return -Infinity
  const weaknessMult = 0.8 + (exam.weakness - 1) * 0.3   // 0.8 – 2.0
  const prepMult     = 2.2 - (exam.prep    - 1) * 0.3   // 2.2 – 1.0
  return (weaknessMult * prepMult) / daysRemaining
}

/**
 * @param {object} form
 *   examTypeName  — string  e.g. "GCE Advanced Level"
 *   exams         — [{ id, subject, date, weakness(1-5), prep(1-5), notes }]
 *   hoursPerDay   — number
 *   studyTime     — 'morning' | 'night'
 *   currentProgress — number (0–100)
 *   performanceType — 'grade' | 'mark'
 *   grade         — string
 *   mark          — number
 */
export function generateOtherExamSchedule(form) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const exams = form.exams.map((e, i) => {
    const examDate = new Date(e.date)
    examDate.setHours(0, 0, 0, 0)
    return { ...e, examDate, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }
  })

  const lastExam  = exams.reduce((m, e) => e.examDate > m ? e.examDate : m, exams[0].examDate)
  const totalDays = Math.max(1, Math.round((lastExam - today) / (1000 * 60 * 60 * 24)) + 1)

  const taskCounters = {}
  exams.forEach((e) => { taskCounters[e.id] = 0 })

  const days = []

  for (let d = 0; d < totalDays; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)

    const examsTodayList = exams.filter((e) => e.examDate.toDateString() === date.toDateString())
    const studyable      = exams.filter((e) => e.examDate > date)

    if (studyable.length === 0) {
      days.push({
        date:         new Date(date),
        dayNumber:    d + 1,
        isExamDay:    true,
        examSubjects: examsTodayList.map((e) => ({ subject: e.subject, color: e.color })),
        sessions:     [],
        phase:        'exam',
        phaseLabel:   examsTodayList.length > 0 ? 'Exam Day' : 'Rest Day',
        color:        '#a855f7',
        bg:           'rgba(168,85,247,0.1)',
        subject:      'EXAM / REST',
        subjectColor: '#a855f7',
      })
      continue
    }

    const criticals = studyable.filter((e) => {
      const diff = Math.round((e.examDate - date) / (1000 * 60 * 60 * 24))
      return diff <= 1
    })

    let chosen
    if (criticals.length > 0) {
      chosen = criticals.sort((a, b) => a.examDate - b.examDate)[0]
    } else {
      chosen = studyable.slice().sort((a, b) => {
        const dA = Math.round((a.examDate - date) / (1000 * 60 * 60 * 24))
        const dB = Math.round((b.examDate - date) / (1000 * 60 * 60 * 24))
        return priorityScore(b, dB) - priorityScore(a, dA)
      })[0]
    }

    const daysToExam  = Math.round((chosen.examDate - date) / (1000 * 60 * 60 * 24))
    const phase       = getPhase(daysToExam)
    const phaseMeta   = PHASE_META[phase]
    const bank        = TASK_BANK[phase](chosen.subject)
    const tasksNeeded = Math.max(1, Math.ceil(form.hoursPerDay / 1.5))

    const tasks = []
    for (let t = 0; t < tasksNeeded; t++) {
      tasks.push(bank[taskCounters[chosen.id] % bank.length])
      taskCounters[chosen.id]++
    }

    const sessions = buildSessions(form.hoursPerDay, form.studyTime, tasks)

    const nearExams = studyable
      .filter((e) => e.id !== chosen.id)
      .filter((e) => Math.round((e.examDate - date) / (1000 * 60 * 60 * 24)) <= 2)

    days.push({
      date:          new Date(date),
      dayNumber:     d + 1,
      isExamDay:     false,
      examsTodayList: examsTodayList.map((e) => ({ subject: e.subject, color: e.color })),
      subject:       chosen.subject,
      subjectColor:  chosen.color,
      subjectId:     chosen.id,
      daysToExam,
      phase,
      phaseLabel:    phaseMeta.label,
      color:         phaseMeta.color,
      bg:            `${phaseMeta.color}12`,
      sessions,
      hoursPlanned:  form.hoursPerDay,
      weaknessLevel: chosen.weakness,
      prepLevel:     chosen.prep,
      notes:         chosen.notes,
      nearExams,
      examToday:     examsTodayList.map((e) => e.subject),
    })
  }

  const targetLabel = form.performanceType === 'grade' ? `Grade ${form.grade}` : `${form.mark}/100`

  const examTimeline = exams
    .slice()
    .sort((a, b) => a.examDate - b.examDate)
    .map((e) => ({
      subject:      e.subject,
      date:         e.examDate,
      color:        e.color,
      daysFromToday: Math.round((e.examDate - today) / (1000 * 60 * 60 * 24)),
      weakness:     e.weakness,
      prep:         e.prep,
    }))

  return {
    type:          'other-exam',
    examTypeName:  form.examTypeName,
    exams:         examTimeline,
    totalDays,
    hoursPerDay:   form.hoursPerDay,
    studyTime:     form.studyTime,
    currentProgress: form.currentProgress,
    targetLabel,
    totalHours:    form.hoursPerDay * days.filter((d) => !d.isExamDay).length,
    days,
  }
}
