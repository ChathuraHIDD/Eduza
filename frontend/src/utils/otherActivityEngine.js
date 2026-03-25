// ── Other Activity / Personal Goal Planner Engine ─────────────────────────
// Generates a week-by-week (and day-level) action plan for any personal goal:
// financial savings, fitness, skill learning, life events, travel, etc.

export const ACTIVITY_COLORS = [
  '#06b6d4', '#a855f7', '#22c55e', '#f97316',
  '#3b82f6', '#ef4444', '#eab308', '#ec4899',
]

// ── Goal category metadata ──────────────────────────────────────────────────
export const GOAL_CATEGORIES = [
  {
    category: 'Financial Goals',
    items: [
      { id: 'save-car',     name: 'Buy a Car',           icon: '🚗', desc: 'Save up for your dream vehicle',          defaultMilestones: ['Research & set budget', 'Open dedicated savings account', 'Reach 25% of target', 'Reach 50% of target', 'Reach 75% of target', 'Final purchase'] },
      { id: 'save-house',   name: 'Buy a House',         icon: '🏠', desc: 'Save for house deposit or full purchase',  defaultMilestones: ['Set savings target', 'Build emergency fund', 'Reach 10% deposit', 'Secure mortgage pre-approval', 'Reach full deposit', 'Purchase'] },
      { id: 'save-travel',  name: 'Travel / Vacation',   icon: '✈️', desc: 'Plan and save for your dream trip',        defaultMilestones: ['Pick destination & set budget', 'Book time off work', 'Reach 25% saved', 'Book flights & hotels', 'Reach full budget', 'Trip!'] },
      { id: 'invest',       name: 'Start Investing',     icon: '📈', desc: 'Build an investment portfolio',            defaultMilestones: ['Learn investment basics', 'Open brokerage account', 'First investment', 'Monthly contribution habit', 'Quarterly review', 'Review & rebalance'] },
      { id: 'debt-free',    name: 'Pay Off Debt',        icon: '💳', desc: 'Clear loans, credit cards or student debt',defaultMilestones: ['List all debts', 'Build budget', 'Pay off smallest debt', 'Pay off 50%', 'Pay off 75%', 'Debt free!'] },
      { id: 'emergency',    name: 'Emergency Fund',      icon: '🛡️', desc: '3–6 months of living expenses saved',      defaultMilestones: ['Calculate monthly expenses', 'Reach 1 month', 'Reach 2 months', 'Reach 4 months', 'Reach 6 months', 'Fund complete'] },
    ],
  },
  {
    category: 'Life Events',
    items: [
      { id: 'marriage',     name: 'Marriage / Wedding',  icon: '💍', desc: 'Plan and save for your wedding',           defaultMilestones: ['Set total budget', 'Book venue', 'Book photographer', 'Send invitations', 'Final payments', 'Wedding day!'] },
      { id: 'baby',         name: 'Starting a Family',   icon: '👶', desc: 'Prepare financially and practically',      defaultMilestones: ['Financial readiness check', 'Build baby fund', 'Baby-proof home', 'Buy essentials', 'Parental leave plan', 'Birth'] },
      { id: 'relocation',   name: 'Relocate / Move',     icon: '📦', desc: 'Plan your home move or city relocation',   defaultMilestones: ['Choose destination', 'Find housing', 'Handle legal/admin', 'Pack & organise', 'Transport arrangements', 'Move-in day'] },
    ],
  },
  {
    category: 'Health & Fitness',
    items: [
      { id: 'weight-loss',  name: 'Weight Loss / Fat Loss',  icon: '🏃', desc: 'Reach your target weight with a plan', defaultMilestones: ['Establish baseline measurements', 'Start weekly tracking', 'Lose first 10%', 'Lose 25% of target', 'Lose 50% of target', 'Reach goal weight'] },
      { id: 'muscle',       name: 'Build Muscle / Strength', icon: '💪', desc: 'Build strength and muscle mass',        defaultMilestones: ['Create workout plan', 'Establish nutrition targets', 'Complete first 4 weeks', 'Visible progress check', 'Strength milestone', 'Goal achieved'] },
      { id: 'marathon',     name: 'Run a Marathon',          icon: '🏅', desc: 'Train for a 5K, half or full marathon',  defaultMilestones: ['Choose a race & register', 'Run consistently 3x/week', 'Hit 10km distance', 'Hit half-marathon distance', 'Taper week', 'Race day'] },
    ],
  },
  {
    category: 'Skills & Learning',
    items: [
      { id: 'language',     name: 'Learn a Language',    icon: '🌍', desc: 'Reach conversational or fluency level',   defaultMilestones: ['Learn alphabet & basics', 'Master 500 common words', 'First full conversation', 'Handle everyday situations', 'Reading & writing', 'Fluency'] },
      { id: 'instrument',   name: 'Learn an Instrument', icon: '🎸', desc: 'Learn to play guitar, piano, etc.',        defaultMilestones: ['Learn basics & chords', 'Practice daily', 'Learn first song', 'Perform for someone', 'Learn 5 songs', 'Record yourself playing'] },
      { id: 'coding',       name: 'Learn to Code',       icon: '💻', desc: 'Go from beginner to building projects',   defaultMilestones: ['Complete basics course', 'Build first project', 'Learn version control', 'Deploy a live project', 'Complete 3 projects', 'Job-ready portfolio'] },
      { id: 'business',     name: 'Start a Business',    icon: '🚀', desc: 'Turn your idea into a running venture',   defaultMilestones: ['Validate the idea', 'Write a business plan', 'Set up legal entity', 'Build MVP / first product', 'Get first client', 'First profitable month'] },
    ],
  },
  {
    category: 'Custom',
    items: [
      { id: 'custom',       name: 'Custom Goal',         icon: '🎯', desc: 'Any personal goal or activity',           defaultMilestones: ['Define the goal clearly', 'Break it into actions', 'First milestone', 'Second milestone', 'Third milestone', 'Goal complete!'] },
    ],
  },
]

// ── Phase definitions ────────────────────────────────────────────────────────
const PHASE_META = {
  foundation: { label: 'Foundation',   color: '#3b82f6', icon: '🏗️',  desc: 'Build habits, do research and prepare' },
  momentum:   { label: 'Momentum',     color: '#f97316', icon: '🔥',  desc: 'Take consistent action and build speed' },
  push:       { label: 'Push Phase',   color: '#a855f7', icon: '⚡',  desc: 'Increase intensity — big progress here' },
  final:      { label: 'Final Sprint', color: '#22c55e', icon: '🏁',  desc: 'Close it out with focus and energy' },
}

function getPhase(progressPct) {
  if (progressPct < 0.25) return 'foundation'
  if (progressPct < 0.60) return 'momentum'
  if (progressPct < 0.85) return 'push'
  return 'final'
}

// ── Generic task banks — applicable to any goal type ────────────────────────
const BASE_TASKS = {
  foundation: [
    'Research and document your goal in detail',
    'Define exactly what success looks like for this goal',
    'Break the goal into clear weekly mini-targets',
    'Set up any accounts, apps, or tools you need',
    'Find an accountability partner or group',
    'Schedule dedicated time blocks in your calendar',
    'Review your current habits and identify blockers',
    'Set up a progress tracking method (spreadsheet, app, journal)',
  ],
  momentum: [
    'Execute this week\'s planned action items',
    'Track your progress and log results',
    'Review your weekly numbers vs target',
    'Adjust your approach based on what is working',
    'Celebrate small wins to maintain motivation',
    'Remove one obstacle that is slowing your progress',
    'Check in with your accountability partner',
    'Revisit your goal vision — read why you started',
  ],
  push: [
    'Increase your commitment this week by 10%',
    'Identify the single highest-impact action for today',
    'Review your milestone progress and re-plan if needed',
    'Double down on the strategy that is working best',
    'Address any setbacks directly — don\'t ignore them',
    'Visualise the outcome — read your goal statement',
    'Put in extra effort this week — this is the pivot point',
    'Update your tracking with honest, current numbers',
  ],
  final: [
    'You are close — stay focused and do not slow down',
    'Execute the final planned steps of your goal',
    'Handle any last admin, paperwork, or logistics',
    'Review everything completed — celebrate the journey',
    'Share your progress with someone who supported you',
    'Document the lessons learned from this goal',
    'Take the final action to complete the goal',
    'Plan your next goal while you have momentum',
  ],
}

// Financial-specific extras
const FINANCIAL_TASKS = {
  foundation: [
    'Set up a dedicated savings account or envelope',
    'Calculate your monthly disposable income',
    'Identify and cut unnecessary monthly expenses',
    'Set up an automatic transfer to your savings goal',
  ],
  momentum: [
    'Check your savings balance and update your tracker',
    'Review this month\'s budget vs actuals',
    'Look for one extra income opportunity this week',
    'Check subscriptions and cancel unused ones',
  ],
  push: [
    'Boost savings rate — cut one non-essential expense',
    'Explore side-income opportunities',
    'Review investment or interest rate options',
    'Calculate how many weeks remain to your target',
  ],
  final: [
    'Final balance check — confirm you have reached/are close to target',
    'Complete any final financial paperwork or applications',
    'Celebrate reaching your financial milestone',
    'Start planning how to maintain this new financial discipline',
  ],
}

// Health-specific extras
const HEALTH_TASKS = {
  foundation: [
    'Take starting measurements / photos',
    'Set up a workout schedule in your calendar',
    'Meal-prep for the week ahead',
    'Get enough sleep — recovery is part of training',
  ],
  momentum: [
    'Complete scheduled workouts for this week',
    'Track your food intake / macros',
    'Check in on your measurements or performance',
    'Make sure you are hydrating well each day',
  ],
  push: [
    'Increase training intensity or duration by 10%',
    'Try a new healthy recipe or meal plan variation',
    'Address any physical pain or fatigue before it worsens',
    'Take progress photos to compare with your start',
  ],
  final: [
    'Taper or maintain — don\'t over-train near goal',
    'Final measurement / weigh-in check',
    'Prepare for the final event or benchmark test',
    'Plan how to maintain results after hitting the goal',
  ],
}

function getTasksForGoal(goalId, phase) {
  const isFinancial = ['save-car','save-house','save-travel','invest','debt-free','emergency'].includes(goalId)
  const isHealth    = ['weight-loss','muscle','marathon'].includes(goalId)

  const extras = isFinancial ? (FINANCIAL_TASKS[phase] || []) : isHealth ? (HEALTH_TASKS[phase] || []) : []
  const base   = BASE_TASKS[phase] || []

  // Interleave extras and base tasks
  const combined = []
  const maxLen = Math.max(base.length, extras.length)
  for (let i = 0; i < maxLen; i++) {
    if (extras[i]) combined.push(extras[i])
    if (base[i])   combined.push(base[i])
  }
  return combined
}

// ── Milestone phase boundaries ────────────────────────────────────────────
function buildMilestones(milestones, totalWeeks) {
  if (!milestones || milestones.length === 0) return []
  const step = totalWeeks / milestones.length
  return milestones.map((name, i) => ({
    name,
    week: Math.round((i + 1) * step),
  }))
}

// ── Time helpers ──────────────────────────────────────────────────────────
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatTime(hour24, studyTime) {
  const base = studyTime === 'morning' ? 8 : 19
  const h = base + hour24
  const ampm = h < 12 ? 'AM' : 'PM'
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:00 ${ampm}`
}

// ── Core engine ──────────────────────────────────────────────────────────
export function generateOtherActivitySchedule(form) {
  const {
    goalId,
    goalName,
    goalCategoryName,
    targetDate,
    currentStatus,       // 0-100 % already done
    hoursPerWeek,
    weeklyCommitmentDays,  // [0..6] day-of-week indices
    milestones,
    isSavingsGoal,
    targetAmount,
    currentSavedAmount,
    currency,
    studyTime,           // 'morning' | 'night'
  } = form

  const today     = new Date()
  const deadline  = new Date(targetDate)
  const totalDays = Math.max(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)), 1)
  const totalWeeks = Math.max(Math.ceil(totalDays / 7), 1)

  const committedDays = (weeklyCommitmentDays && weeklyCommitmentDays.length > 0)
    ? weeklyCommitmentDays
    : [1, 3, 5]  // Mon, Wed, Fri default

  const hoursPerSession = Math.max(1, Math.round((hoursPerWeek || 5) / committedDays.length))
  const totalHours = totalWeeks * (hoursPerWeek || 5)

  // Build milestone map: week → milestone name
  const milestonePlan = buildMilestones(milestones, totalWeeks)
  const milestoneByWeek = {}
  milestonePlan.forEach((m) => { milestoneByWeek[m.week] = m.name })

  // Financial stats if applicable
  const remaining = isSavingsGoal
    ? Math.max(0, (targetAmount || 0) - (currentSavedAmount || 0))
    : null
  const weeklySavingsTarget = remaining !== null && totalWeeks > 0
    ? Math.ceil(remaining / totalWeeks)
    : null

  const weeks = []
  let dayNumber = 1

  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = addDays(today, (w - 1) * 7)
    const weekEnd   = addDays(today, w * 7 - 1)

    const progressPct = (currentStatus / 100) + ((1 - currentStatus / 100) * ((w - 1) / totalWeeks))
    const phase       = getPhase(progressPct)
    const phaseMeta   = PHASE_META[phase]
    const taskPool    = getTasksForGoal(goalId, phase)

    const milestone = milestoneByWeek[w] || null
    const weeksLeft = totalWeeks - w

    // Build session days for this week
    const days = []
    for (let d = 0; d < 7; d++) {
      const dateOfDay   = addDays(weekStart, d)
      if (dateOfDay >= deadline) continue  // past deadline

      const dayOfWeek   = dateOfDay.getDay()
      const isActionDay = committedDays.includes(dayOfWeek)
      if (!isActionDay) continue

      const sessions = []
      let timeOffset = 0
      const sessionsCount = Math.max(1, Math.min(3, Math.round(hoursPerSession / 1.5)))
      const durationEach  = Math.max(1, Math.round(hoursPerSession / sessionsCount))

      for (let s = 0; s < sessionsCount; s++) {
        const taskIdx = (dayNumber * 3 + s) % taskPool.length
        sessions.push({
          task:     taskPool[taskIdx],
          time:     formatTime(timeOffset, studyTime),
          duration: durationEach,
        })
        timeOffset += durationEach + 0.5
      }

      days.push({
        date:         dateOfDay,
        dayOfWeek,
        dayName:      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayOfWeek],
        dayNumber:    dayNumber++,
        phase,
        phaseLabel:   phaseMeta.label,
        color:        phaseMeta.color,
        sessions,
        hoursPlanned: hoursPerSession,
        weeksLeft,
        progressPct:  progressPct + (1 - currentStatus / 100) * (1 / (totalWeeks * committedDays.length)),
      })
    }

    // Is this week a milestone week?
    const isMilestoneWeek = !!milestone
    const isDeadlineWeek  = weeksLeft === 0

    weeks.push({
      weekNumber:       w,
      weekStart,
      weekEnd,
      phase,
      phaseLabel:       phaseMeta.label,
      phaseIcon:        phaseMeta.icon,
      phaseDesc:        phaseMeta.desc,
      color:            phaseMeta.color,
      days,
      milestone,
      isMilestoneWeek,
      isDeadlineWeek,
      weeksLeft,
      progressAtEnd:    Math.min(100, Math.round(progressPct * 100 + (100 - currentStatus) / totalWeeks)),
      weeklySavingsTarget,
    })
  }

  // Target label
  let targetLabel = 'Goal Complete'
  if (isSavingsGoal && targetAmount) {
    targetLabel = `${currency || ''}${Number(targetAmount).toLocaleString()}`
  }

  return {
    type:               'other-activity',
    goalId,
    goalName,
    goalCategoryName,
    targetDate:         deadline,
    totalDays,
    totalWeeks,
    hoursPerWeek:       hoursPerWeek || 5,
    studyTime,
    currentStatus,
    targetLabel,
    totalHours:         Math.round(totalHours),
    milestones:         milestonePlan,
    isSavingsGoal:      !!isSavingsGoal,
    targetAmount:       targetAmount || null,
    currentSavedAmount: currentSavedAmount || 0,
    currency:           currency || '',
    remaining,
    weeklySavingsTarget,
    weeks,
  }
}
