// ── Whole Semester Schedule Engine ───────────────────────────────────────
// Generates a week-by-week study plan across all modules for an entire semester.
// Supports mid-semester starts (planStart = max(today, semesterStart)).

export const MODULE_COLORS = [
  '#22c55e', '#3b82f6', '#f97316', '#a855f7',
  '#ef4444', '#06b6d4', '#eab308', '#ec4899',
]

const PHASE_META = {
  intro:    { label: 'Introduction',  color: '#3b82f6', desc: 'Get familiar with the module' },
  core:     { label: 'Core Study',    color: '#22c55e', desc: 'Deep dive into main content' },
  practice: { label: 'Practice',      color: '#f97316', desc: 'Apply knowledge with exercises' },
  revise:   { label: 'Revision',      color: '#a855f7', desc: 'Consolidate and solidify' },
  exam:     { label: 'Exam Prep',     color: '#ef4444', desc: 'Final preparation and review' },
}

const TASK_BANK = {
  intro: (m) => [
    `Review the ${m} module outline and learning objectives`,
    `Read introductory materials for ${m}`,
    `Create a study roadmap for ${m}`,
    `Identify key topics and themes in ${m}`,
    `Set up an organised notes structure for ${m}`,
    `Skim the ${m} textbook table of contents`,
  ],
  core: (m) => [
    `Study core theory chapters for ${m}`,
    `Annotate and summarise ${m} lecture notes`,
    `Complete ${m} required readings`,
    `Create a concept map for ${m} main topics`,
    `Write out key definitions and principles for ${m}`,
    `Review worked examples in ${m}`,
    `Watch/re-watch recorded lectures for ${m}`,
    `Cross-reference ${m} notes with the textbook`,
    `Build a ${m} glossary of key terms`,
    `Identify and study weak areas in ${m}`,
  ],
  practice: (m) => [
    `Attempt ${m} practice problems and exercises`,
    `Complete ${m} tutorial questions`,
    `Work through ${m} past assessment papers`,
    `Apply ${m} concepts to real-world scenarios`,
    `Identify patterns in ${m} past assessment questions`,
    `Self-test on ${m} key concepts`,
    `Complete ${m} online practice exercises`,
  ],
  revise: (m) => [
    `Condense ${m} notes into a 1-page summary`,
    `Create flashcards for ${m} key concepts`,
    `Build a ${m} formula and key-fact sheet`,
    `Re-do challenging ${m} practice problems`,
    `Review ${m} weak areas one more time`,
    `Explain ${m} concepts aloud (Feynman technique)`,
  ],
  exam: (m) => [
    `Attempt a full ${m} past exam paper under timed conditions`,
    `Review ${m} marking criteria and grade descriptors`,
    `Final read-through of ${m} full summary sheet`,
    `Check ${m} formula sheet is complete`,
    `Light revision of ${m} personally noted weak spots`,
    `Skim ${m} past papers for question patterns`,
  ],
}

// Determine the overall semester phase based on progress through the semester
function getSemesterPhase(weeksElapsed, totalWeeks) {
  const progress = totalWeeks > 0 ? weeksElapsed / totalWeeks : 0
  if (progress < 0.12) return 'intro'
  if (progress < 0.5)  return 'core'
  if (progress < 0.72) return 'practice'
  if (progress < 0.88) return 'revise'
  return 'exam'
}

// Override phase for modules that have a nearby exam
function effectivePhase(basePhase, weeksToExam) {
  if (weeksToExam <= 1) return 'exam'
  if (weeksToExam <= 2) return 'revise'
  if (weeksToExam <= 4 && (basePhase === 'intro')) return 'core'
  return basePhase
}

// Weighted day allocation — strictly respects daysCount
function allocateDays(modules, daysCount) {
  if (!modules.length || daysCount === 0)
    return modules.map((m) => ({ ...m, allocDays: 0 }))

  const totalPriority = modules.reduce((s, m) => s + m.priority, 0)
  const alloc = modules.map((m) => ({
    ...m,
    exact:     (m.priority / totalPriority) * daysCount,
    allocDays: 0,
  }))

  // Floor each allocation
  let remainder = daysCount
  alloc.forEach((m) => {
    m.allocDays = Math.floor(m.exact)
    remainder -= m.allocDays
  })

  // Distribute remaining slots to highest fractional parts
  alloc
    .map((m, i) => ({ i, frac: m.exact - m.allocDays }))
    .sort((a, b) => b.frac - a.frac)
    .slice(0, remainder)
    .forEach(({ i }) => { alloc[i].allocDays++ })

  return alloc
}

function gradeToTarget(grade) {
  const map = { 'A+': 95, 'A': 85, 'B+': 78, 'B': 72, 'C+': 65, 'C': 60, 'D': 50, 'F': 40 }
  return map[grade] ?? 70
}

function fmtDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * @param {object} form
 *   semesterLabel  — string  e.g. "Semester 1 2026"
 *   semesterStart  — ISO date string  "YYYY-MM-DD"
 *   semesterEnd    — ISO date string
 *   modules        — [{ id, name, examDate?, difficulty(1-5) }]
 *   hoursPerDay    — number
 *   studyDays      — number[]  0=Mon … 6=Sun
 *   studyTime      — 'morning' | 'night'
 *   performanceType — 'grade' | 'mark'
 *   grade          — string
 *   mark           — number
 */
export function generateWholeSemesterSchedule(form) {
  const {
    semesterLabel, semesterStart, semesterEnd,
    modules, hoursPerDay, studyDays, studyTime,
    performanceType, grade, mark,
  } = form

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const startDate = new Date(semesterStart); startDate.setHours(0, 0, 0, 0)
  const endDate   = new Date(semesterEnd);   endDate.setHours(0, 0, 0, 0)

  const planStart    = today > startDate ? today : startDate
  const isMidSemester = today > startDate

  const totalSemesterDays  = Math.max(1, Math.round((endDate - startDate) / 864e5))
  const totalSemesterWeeks = Math.ceil(totalSemesterDays / 7)

  const remainingDays  = Math.max(1, Math.round((endDate - planStart) / 864e5))
  const totalWeeks     = Math.ceil(remainingDays / 7)

  const elapsedDays    = Math.round((planStart - startDate) / 864e5)
  const currentWeekNum = Math.floor(elapsedDays / 7) + 1

  const targetValue = performanceType === 'grade' ? gradeToTarget(grade) : Number(mark)
  const targetLabel = performanceType === 'grade' ? grade : `${mark}%`

  // Enrich modules
  const enriched = modules.map((m, i) => ({
    ...m,
    color:    MODULE_COLORS[i % MODULE_COLORS.length],
    examDate: m.examDate ? (() => { const d = new Date(m.examDate); d.setHours(0,0,0,0); return d })() : endDate,
  }))

  // Task-cycle counters per module per phase
  const counters = {}
  enriched.forEach((m) => {
    counters[m.id] = { intro: 0, core: 0, practice: 0, revise: 0, exam: 0 }
  })

  const weeks = []

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = new Date(planStart); weekStart.setDate(planStart.getDate() + w * 7)
    const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)

    // Collect study days that actually fall within semester end
    const studyDatesInWeek = []
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(weekStart); dayDate.setDate(weekStart.getDate() + d)
      if (dayDate > endDate) break
      // Convert JS getDay() (0=Sun) → Mon=0 index
      const dow = (dayDate.getDay() + 6) % 7
      if (studyDays.includes(dow)) studyDatesInWeek.push(new Date(dayDate))
    }

    const daysCount     = studyDatesInWeek.length
    const weekTotalHrs  = daysCount * hoursPerDay

    // Semester phase for this week (based on weeks elapsed from semester start)
    const weeksElapsed = currentWeekNum - 1 + w
    const basePhase    = getSemesterPhase(weeksElapsed, totalSemesterWeeks)

    // Priority per module this week
    const modWithPriority = enriched.map((m) => {
      const weeksToExam = Math.max(0, Math.round((m.examDate - weekStart) / 864e5) / 7)
      // Base priority from difficulty (1–5), amplified by proximity to exam
      let priority = m.difficulty ?? 3
      if (weeksToExam <= 1)      priority *= 4
      else if (weeksToExam <= 2) priority *= 2.5
      else if (weeksToExam <= 4) priority *= 1.5
      return { ...m, priority, weeksToExam }
    })

    const allocated = allocateDays(modWithPriority, daysCount)

    // Build day entries
    const weekDays = []
    let dayIdx = 0

    for (const mod of allocated) {
      for (let d = 0; d < mod.allocDays && dayIdx < studyDatesInWeek.length; d++, dayIdx++) {
        const phase = effectivePhase(basePhase, mod.weeksToExam)
        const bank  = TASK_BANK[phase](mod.name)
        const cnt   = counters[mod.id][phase]
        const task  = bank[cnt % bank.length]
        counters[mod.id][phase]++

        weekDays.push({
          date:        studyDatesInWeek[dayIdx],
          module:      mod.name,
          moduleColor: mod.color,
          moduleId:    mod.id,
          phase,
          phaseLabel:  PHASE_META[phase].label,
          phaseColor:  PHASE_META[phase].color,
          hours:       hoursPerDay,
          task,
        })
      }
    }

    // Sort days chronologically
    weekDays.sort((a, b) => a.date - b.date)

    // Assessment/exam days occurring this week
    const examDays = enriched
      .filter((m) => m.examDate >= weekStart && m.examDate <= weekEnd)
      .map((m) => ({ subject: m.name, color: m.color, date: m.examDate }))

    weeks.push({
      weekNumber:    currentWeekNum + w,
      weekIndex:     w,
      weekStart:     new Date(weekStart),
      weekEnd:       new Date(weekEnd),
      weekLabel:     `${fmtDate(weekStart)} – ${fmtDate(weekEnd)}`,
      days:          weekDays,
      daysCount,
      weekTotalHrs,
      examDays,
      isCurrent:     w === 0,
    })
  }

  // Per-module stats
  const moduleStats = enriched.map((m) => {
    const totalDays  = weeks.reduce((s, w) => s + w.days.filter((d) => d.moduleId === m.id).length, 0)
    const totalHours = totalDays * hoursPerDay
    return { ...m, totalDays, totalHours }
  })

  const totalHours = weeks.reduce((s, w) => s + w.weekTotalHrs, 0)

  return {
    semesterLabel,
    semesterStart: startDate,
    semesterEnd:   endDate,
    isMidSemester,
    totalSemesterWeeks,
    totalWeeks,
    currentWeekNum,
    modules:       enriched,
    moduleStats,
    hoursPerDay,
    studyDays,
    studyTime,
    targetValue,
    targetLabel,
    totalHours,
    weeks,
  }
}
