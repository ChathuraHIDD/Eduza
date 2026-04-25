import { useState } from 'react'
import AssignmentModal from '../components/schedule/AssignmentModal'
import ScheduleResult from '../components/schedule/ScheduleResult'
import MidExamModal from '../components/schedule/MidExamModal'
import MidExamResult from '../components/schedule/MidExamResult'
import FinalExamModal from '../components/schedule/FinalExamModal'
import FinalExamResult from '../components/schedule/FinalExamResult'
import WholeSemesterModal from '../components/schedule/WholeSemesterModal'
import WholeSemesterResult from '../components/schedule/WholeSemesterResult'
import OtherExamModal from '../components/schedule/OtherExamModal'
import OtherExamResult from '../components/schedule/OtherExamResult'
import OtherActivityModal from '../components/schedule/OtherActivityModal'
import OtherActivityResult from '../components/schedule/OtherActivityResult'
import { generateAssignmentSchedule } from '../utils/scheduleEngine'
import { generateMidExamSchedule } from '../utils/midExamEngine'
import { generateFinalExamSchedule } from '../utils/finalExamEngine'
import { generateWholeSemesterSchedule } from '../utils/wholeSemesterEngine'
import { generateOtherExamSchedule } from '../utils/otherExamEngine'
import { generateOtherActivitySchedule } from '../utils/otherActivityEngine'
import {
  createStudyPlan,
  deleteStudyPlanById,
  getStudyPlanById,
  getStudyPlans,
} from '../utils/studyPlanApi'

const SCHEDULE_ACCENT = '#f97316'

const scheduleTypes = [
  {
    id: 'assignment',
    label: 'Assignment',
    description: 'Plan and track your assignment progress day by day',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
  {
    id: 'mid-exam',
    label: 'Semester Mid Exam',
    description: 'Smart revision plan for your mid-semester exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
  {
    id: 'final-exam',
    label: 'Semester Final Exam',
    description: 'Comprehensive plan for your final semester exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
  {
    id: 'whole-semester',
    label: 'Whole Semester',
    description: 'Full semester roadmap across all your modules',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
  {
    id: 'other-exam',
    label: 'Other Exam',
    description: 'Custom schedule for quizzes, tests, or external exams',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
  {
    id: 'other-activity',
    label: 'Other Activity',
    description: 'Plan presentations, projects, and any other activities',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
    color: SCHEDULE_ACCENT,
    available: true,
  },
]

// ---- ML helpers (no UI change needed) ----
function gradeToTargetPercent(grade) {
  const map = {
    'A+': 90,
    'A': 85,
    'B+': 78,
    'B': 72,
    'C+': 65,
    'C': 60,
    'D': 50,
    'F': 40,
  }
  return map[grade] ?? 70
}

function deriveDifficultyFromTarget(targetPercent) {
  // simple rule: higher target -> more difficult
  if (targetPercent >= 85) return 3
  if (targetPercent >= 65) return 2
  return 1
}

function getCurrentUserId() {
  const raw = localStorage.getItem('user')
  if (!raw) return ''

  try {
    const parsed = JSON.parse(raw)
    return parsed?.id || parsed?._id || parsed?.email || ''
  } catch {
    return ''
  }
}

function toModuleDifficulty(level) {
  if (typeof level === 'number') {
    if (level >= 4) return 'hard'
    if (level <= 2) return 'easy'
  }
  return 'medium'
}

function difficultyToWeakness(level) {
  if (level === 'hard') return 4
  if (level === 'easy') return 2
  return 3
}

function difficultyToPrep(level) {
  if (level === 'hard') return 2
  if (level === 'easy') return 4
  return 3
}

function difficultyToSemesterLevel(level) {
  if (typeof level === 'number' && Number.isFinite(level)) return level
  if (level === 'hard') return 4
  if (level === 'easy') return 2
  return 3
}

function parseGradeLikeValue(value) {
  const text = String(value || '').trim()
  if (/^(A\+|A|B\+|B|C\+|C|D|F)$/i.test(text)) return text.toUpperCase()
  return ''
}

function parseNumericLikeValue(value, fallback) {
  const parsed = Number(String(value || '').replace('%', ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getTargetProgressFromScheduleData(scheduleData) {
  let targetProgress = 70

  if (typeof scheduleData?.mark === 'number') {
    targetProgress = scheduleData.mark
  }

  if (typeof scheduleData?.grade === 'string' && scheduleData.grade) {
    targetProgress = gradeToTargetPercent(scheduleData.grade)
  }

  if (typeof scheduleData?.targetLabel === 'string') {
    const targetLabel = scheduleData.targetLabel.trim()
    const asNum = Number(targetLabel.replace('%', ''))
    if (!Number.isNaN(asNum) && asNum > 0) targetProgress = asNum
    if (['A+','A','B+','B','C+','C','D','F'].includes(targetLabel)) {
      targetProgress = gradeToTargetPercent(targetLabel)
    }
  }

  return targetProgress
}

function weaknessToDifficulty(weakness) {
  const value = Number(weakness)
  if (value >= 4) return 3
  if (value >= 3) return 2
  return 1
}

function getPlanScheduleType(plan) {
  if (plan?.uiScheduleType) return plan.uiScheduleType

  const title = String(plan?.title || '').toLowerCase()
  const scopeType = String(plan?.scopeType || '').toLowerCase()

  if (scopeType === 'assignment') return 'assignment'
  if (title.includes('mid exam') || title.includes('mid-exam')) return 'mid-exam'
  if (title.includes('final exam') || title.includes('final-exam')) return 'final-exam'
  if (title.includes('other exam') || title.includes('other-exam')) return 'other-exam'
  if (title.includes('whole semester') || title.includes('semester')) return 'whole-semester'
  if (title.includes('activity') || title.includes('goal')) return 'other-activity'
  return scopeType === 'semester' ? 'whole-semester' : 'other-exam'
}

function getPlanStudyTime(plan) {
  const preferred = plan?.preferences?.preferredFocusBlocks?.[0]
  if (preferred === 'morning' || preferred === 'night') return preferred
  if (plan?.uiScheduleData?.studyTime === 'morning' || plan?.uiScheduleData?.studyTime === 'night') {
    return plan.uiScheduleData.studyTime
  }
  return 'morning'
}

function getPlanHoursPerDay(plan) {
  const hours = Number(plan?.availability?.defaultDailyHours)
  if (Number.isFinite(hours) && hours > 0) return hours

  const totalDays = Number(plan?.summary?.totalDays) || 1
  const totalHours = Number(plan?.summary?.totalStudyHours) || 3
  return Number((totalHours / totalDays).toFixed(2)) || 3
}

function getPlanHoursPerWeek(plan) {
  const totalHours = Number(plan?.summary?.totalStudyHours)
  const totalDays = Number(plan?.summary?.totalDays) || 1
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7))
  if (Number.isFinite(totalHours) && totalHours > 0) {
    return Math.max(1, Math.round(totalHours / totalWeeks))
  }

  return Math.max(1, Math.round(getPlanHoursPerDay(plan) * 3))
}

function getPlanPerformanceType(plan) {
  return parseGradeLikeValue(plan?.targetGrade) ? 'grade' : 'mark'
}

function getPlanGrade(plan) {
  const target = parseGradeLikeValue(plan?.targetGrade)
  return target || 'B'
}

function getPlanMark(plan) {
  return parseNumericLikeValue(plan?.targetGrade, 70)
}

function getPlanPrimaryModule(plan) {
  return Array.isArray(plan?.modules) && plan.modules.length > 0 ? plan.modules[0] : null
}

function getPlanFallbackTitle(plan) {
  return String(plan?.title || 'Saved Schedule').replace(/\s*plan\s*$/i, '').trim() || 'Saved Schedule'
}

function getPlanExams(plan) {
  const modules = Array.isArray(plan?.modules) ? plan.modules : []
  const fallbackName = getPlanFallbackTitle(plan)
  const source = modules.length > 0 ? modules : [{ name: fallbackName, dueDate: plan?.targetDate, difficulty: 'medium' }]

  return source.map((module, index) => ({
    id: module?._id || module?.id || `${index}`,
    subject: module?.name || fallbackName,
    date: module?.dueDate || plan?.targetDate || new Date(),
    weakness: difficultyToWeakness(module?.difficulty),
    prep: difficultyToPrep(module?.difficulty),
    notes: module?.notes || '',
  }))
}

function getPlanModulesForSemester(plan) {
  const modules = Array.isArray(plan?.modules) ? plan.modules : []
  const fallbackName = getPlanFallbackTitle(plan)
  return (modules.length > 0 ? modules : [{ name: fallbackName, dueDate: plan?.targetDate, difficulty: 'medium' }]).map((module, index) => ({
    id: module?._id || module?.id || `${index}`,
    name: module?.name || fallbackName,
    examDate: module?.dueDate || plan?.targetDate || new Date(),
    difficulty: difficultyToSemesterLevel(module?.difficulty),
  }))
}

function buildScheduleFromPlan(plan) {
  if (!plan) return null

  if (plan.uiScheduleType && plan.uiScheduleData) {
    return { type: plan.uiScheduleType, data: plan.uiScheduleData }
  }

  const type = getPlanScheduleType(plan)
  const hoursPerDay = getPlanHoursPerDay(plan)
  const studyTime = getPlanStudyTime(plan)
  const performanceType = getPlanPerformanceType(plan)
  const grade = getPlanGrade(plan)
  const mark = getPlanMark(plan)
  const primaryModule = getPlanPrimaryModule(plan)
  const targetDate = plan?.targetDate || primaryModule?.dueDate || new Date()
  const startDate = plan?.startDate || new Date()

  switch (type) {
    case 'assignment':
      return {
        type,
        data: generateAssignmentSchedule({
          subject: primaryModule?.name || getPlanFallbackTitle(plan),
          dueDate: targetDate,
          hoursPerDay,
          studyTime,
          performanceType,
          grade,
          mark,
        }),
      }

    case 'mid-exam':
      return {
        type,
        data: generateMidExamSchedule({
          exams: getPlanExams(plan),
          hoursPerDay,
          studyTime,
          performanceType,
          grade,
          mark,
        }),
      }

    case 'final-exam':
      return {
        type,
        data: generateFinalExamSchedule({
          exams: getPlanExams(plan),
          hoursPerDay,
          studyTime,
          performanceType,
          grade,
          mark,
        }),
      }

    case 'whole-semester':
      return {
        type,
        data: generateWholeSemesterSchedule({
          semesterLabel: getPlanFallbackTitle(plan),
          semesterStart: startDate,
          semesterEnd: targetDate,
          modules: getPlanModulesForSemester(plan),
          hoursPerDay,
          studyDays: [0, 1, 2, 3, 4],
          studyTime,
          performanceType,
          grade,
          mark,
        }),
      }

    case 'other-activity':
      return {
        type,
        data: generateOtherActivitySchedule({
          goalId: 'custom',
          goalName: getPlanFallbackTitle(plan),
          goalCategoryName: 'Saved Goal',
          targetDate,
          currentStatus: 0,
          hoursPerWeek: getPlanHoursPerWeek(plan),
          weeklyCommitmentDays: [1, 3, 5],
          milestones: (plan?.summary?.moduleBreakdown || plan?.modules || [])
            .map((entry) => entry.moduleName || entry.name)
            .filter(Boolean)
            .slice(0, 6),
          isSavingsGoal: false,
          targetAmount: null,
          currentSavedAmount: 0,
          currency: '$',
          studyTime,
        }),
      }

    case 'other-exam':
    default:
      return {
        type: 'other-exam',
        data: generateOtherExamSchedule({
          examTypeName: getPlanFallbackTitle(plan),
          exams: getPlanExams(plan),
          hoursPerDay,
          studyTime,
          currentProgress: 0,
          performanceType,
          grade,
          mark,
        }),
      }
  }
}

function buildStudyPlanPayload(type, scheduleData, userId) {
  const now = new Date()
  const scopeType =
    type === 'assignment' ? 'assignment' :
    (type === 'whole-semester' || type === 'other-activity') ? 'semester' :
    'exam'

  const title =
    type === 'assignment' ? `${scheduleData?.subject || 'Assignment'} Plan` :
    type === 'mid-exam' ? 'Mid Exam Plan' :
    type === 'final-exam' ? 'Final Exam Plan' :
    type === 'whole-semester' ? `${scheduleData?.semesterLabel || 'Whole Semester'} Plan` :
    type === 'other-exam' ? `${scheduleData?.examTypeName || 'Other Exam'} Plan` :
    `${scheduleData?.goalName || 'Other Activity'} Plan`

  const modules =
    type === 'assignment'
      ? [
          {
            name: scheduleData?.subject || 'Assignment',
            type: 'assignment',
            dueDate: scheduleData?.dueDate || now,
            estimatedHours: scheduleData?.totalHours || scheduleData?.hoursPerDay || 1,
            difficulty: 'medium',
            priority: 4,
          },
        ]
      : type === 'whole-semester'
      ? (scheduleData?.modules || []).map((module) => ({
          name: module?.name || 'Module',
          type: 'semester',
          dueDate: module?.examDate || scheduleData?.semesterEnd || now,
          estimatedHours: module?.totalHours || scheduleData?.hoursPerDay || 2,
          difficulty: toModuleDifficulty(module?.difficulty),
          priority: 3,
        }))
      : type === 'other-activity'
      ? [
          {
            name: scheduleData?.goalName || 'Activity Goal',
            type: 'semester',
            dueDate: scheduleData?.targetDate || now,
            estimatedHours: scheduleData?.totalHours || scheduleData?.hoursPerWeek || 2,
            difficulty: 'medium',
            priority: 3,
          },
        ]
      : (scheduleData?.exams || []).map((exam) => ({
          name: exam?.subject || 'Exam',
          type: 'exam',
          dueDate: exam?.date || now,
          estimatedHours: scheduleData?.hoursPerDay || 2,
          difficulty: toModuleDifficulty(exam?.weakness),
          priority: 4,
        }))

  const startDate =
    scheduleData?.semesterStart ||
    scheduleData?.weeks?.[0]?.weekStart ||
    scheduleData?.days?.[0]?.date ||
    now

  const targetDate =
    scheduleData?.targetDate ||
    scheduleData?.semesterEnd ||
    scheduleData?.dueDate ||
    scheduleData?.days?.[scheduleData?.days?.length - 1]?.date ||
    now

  return {
    user: userId,
    title,
    scopeType,
    uiScheduleType: type,
    uiScheduleData: scheduleData,
    targetGrade: scheduleData?.targetLabel || undefined,
    startDate,
    targetDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    availability: {
      defaultDailyHours:
        scheduleData?.hoursPerDay ||
        (scheduleData?.hoursPerWeek ? Number((scheduleData.hoursPerWeek / 7).toFixed(2)) : 3),
      weekendDailyHours: scheduleData?.hoursPerDay || 4,
      blackoutDates: [],
      dailyOverrides: [],
    },
    preferences: {
      sessionLengthMinutes: 60,
      maxDailySessions: 4,
      fatigueSensitivity: 'medium',
      includeBufferDays: 1,
      preferredFocusBlocks: scheduleData?.studyTime ? [scheduleData.studyTime] : [],
    },
    modules: modules.length > 0 ? modules : [
      {
        name: title,
        type: scopeType,
        dueDate: targetDate,
        estimatedHours: 2,
        difficulty: 'medium',
        priority: 3,
      },
    ],
  }
}

async function predictTaskDuration({ current_progress, target_progress, past_study_pace, difficulty, daily_hours }) {
  const baseUrl = (
    import.meta?.env?.VITE_API_BASE_URL ||
    import.meta?.env?.VITE_API_URL ||
    'http://localhost:5001'
  ).replace(/\/$/, '')

  const res = await fetch(`${baseUrl}/api/ml/task-duration/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_progress,
      target_progress,
      past_study_pace,
      difficulty,
      daily_hours,
    }),
  })

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = payload?.message || payload?.error || 'Prediction failed'
    throw new Error(msg)
  }

  // expected: { predicted_minutes: number }
  return payload
}

function SmartSchedule() {
  const userId = getCurrentUserId()
  const [modalOpen, setModalOpen] = useState(false)
  const [midExamModalOpen, setMidExamModalOpen] = useState(false)
  const [finalExamModalOpen, setFinalExamModalOpen] = useState(false)
  const [wholeSemesterModalOpen, setWholeSemesterModalOpen] = useState(false)
  const [otherExamModalOpen, setOtherExamModalOpen] = useState(false)
  const [otherActivityModalOpen, setOtherActivityModalOpen] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState(null)
  const [scheduleType, setScheduleType] = useState(null)

  // optional UI state (won't break anything)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [pastLoading, setPastLoading] = useState(false)
  const [pastSchedules, setPastSchedules] = useState([])
  const [showPastSchedules, setShowPastSchedules] = useState(false)
  const [pastScheduleSearch, setPastScheduleSearch] = useState('')
  const [openingPlanId, setOpeningPlanId] = useState('')
  const [deletingPlanId, setDeletingPlanId] = useState('')

  const filteredPastSchedules = pastSchedules.filter((plan) => {
    const query = pastScheduleSearch.trim().toLowerCase()
    if (!query) return true

    return [
      plan.title,
      plan.scopeType,
      plan.targetGrade,
      plan.uiScheduleType,
      plan.uiScheduleData?.subject,
      plan.uiScheduleData?.examTypeName,
      plan.uiScheduleData?.goalName,
      plan.uiScheduleData?.semesterLabel,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  const loadPastSchedules = async () => {
    setPastLoading(true)
    try {
      const plans = await getStudyPlans(userId)
      setPastSchedules(Array.isArray(plans) ? plans : [])
    } catch (error) {
      setSaveError(error?.message || 'Failed to load past schedules')
    } finally {
      setPastLoading(false)
    }
  }

  const persistSchedule = async (type, scheduleData) => {
    if (!userId) {
      setSaveError('Please login first. Could not save this schedule.')
      setSaveMessage('')
      return
    }

    setSaveLoading(true)
    setSaveError('')
    setSaveMessage('')

    try {
      const payload = buildStudyPlanPayload(type, scheduleData, userId)
      const savedPlan = await createStudyPlan(payload)
      setSaveMessage('Schedule saved to database.')
      if (savedPlan?._id) {
        setGeneratedSchedule((prev) => (prev ? { ...prev, studyPlanId: savedPlan._id } : prev))
      }
      if (showPastSchedules) {
        await loadPastSchedules()
      }
    } catch (error) {
      setSaveError(error?.message || 'Failed to save schedule')
    } finally {
      setSaveLoading(false)
    }
  }

  const handlePastSchedulesToggle = async () => {
    const next = !showPastSchedules
    setShowPastSchedules(next)
    if (next) setPastScheduleSearch('')

    if (!next) return
    if (!userId) {
      setSaveError('Please login to view your past schedules.')
      return
    }

    await loadPastSchedules()
  }

  const handleOpenPastSchedule = async (id) => {
    setOpeningPlanId(id)
    setSaveError('')

    try {
      const plan = await getStudyPlanById(id)
      const rebuilt = buildScheduleFromPlan(plan)
      if (!rebuilt?.type || !rebuilt?.data) {
        setSaveError('This schedule could not be reopened.')
        return
      }

      setScheduleType(rebuilt.type)
      setGeneratedSchedule({ ...rebuilt.data, studyPlanId: plan._id })
      setShowPastSchedules(false)
      setPastScheduleSearch('')
    } catch (error) {
      setSaveError(error?.message || 'Failed to open schedule details')
    } finally {
      setOpeningPlanId('')
    }
  }

  const handleDeletePastSchedule = async (id, event) => {
    event.stopPropagation()

    const isConfirmed = window.confirm('Are you sure you want to delete this schedule?')
    if (!isConfirmed) return

    setDeletingPlanId(id)
    setSaveError('')

    try {
      await deleteStudyPlanById(id)
      setSaveMessage('Schedule deleted successfully.')
      await loadPastSchedules()
    } catch (error) {
      setSaveError(error?.message || 'Failed to delete schedule')
    } finally {
      setDeletingPlanId('')
    }
  }

  const handleClosePastSchedules = () => {
    setShowPastSchedules(false)
    setPastScheduleSearch('')
  }

  const handleTypeSelect = (type) => {
    if (!type.available) return
    if (type.id === 'assignment') setModalOpen(true)
    if (type.id === 'mid-exam') setMidExamModalOpen(true)
    if (type.id === 'final-exam') setFinalExamModalOpen(true)
    if (type.id === 'whole-semester') setWholeSemesterModalOpen(true)
    if (type.id === 'other-exam') setOtherExamModalOpen(true)
    if (type.id === 'other-activity') setOtherActivityModalOpen(true)
  }

  // ✅ assignment generate (now includes ML prediction)
  const handleGenerate = async (scheduleData) => {
    setModalOpen(false)
    setMidExamModalOpen(false)
    setScheduleType('assignment')
    setMlError('')
    setGeneratedSchedule(scheduleData)
    let scheduleToPersist = scheduleData

    // --- derive ML inputs from modal form (scheduleData usually contains these) ---
    // NOTE: scheduleEngine output should include subject, hoursPerDay, targetLabel etc.
    // If your scheduleEngine doesn’t return mark/grade, we still can infer a target.
    const hoursPerDay = Number(scheduleData?.hoursPerDay ?? 3)

    const target_progress = getTargetProgressFromScheduleData(scheduleData)

    const current_progress = 0 // starting point
    const difficulty = deriveDifficultyFromTarget(target_progress)

    // until you have real stopwatch pace in DB, we use a default
    // (later you will replace this by reading the student's history)
    const past_study_pace = 25 // minutes per 1% progress (reasonable baseline)
    const daily_hours = hoursPerDay

    // --- call ML endpoint and attach result into scheduleData ---
    setMlLoading(true)
    try {
      const pred = await predictTaskDuration({
        current_progress,
        target_progress,
        past_study_pace,
        difficulty,
        daily_hours,
      })

      const predicted_minutes = Number(pred?.predicted_minutes ?? pred?.predictedMinutes ?? 0)
      const predicted_hours = predicted_minutes ? Number((predicted_minutes / 60).toFixed(2)) : 0
      const predicted_days = (predicted_hours && daily_hours) ? Math.ceil(predicted_hours / daily_hours) : 0

      setGeneratedSchedule((prev) => ({
        ...prev,
        ml: {
          predicted_minutes,
          predicted_hours,
          predicted_days,
          inputs: { current_progress, target_progress, past_study_pace, difficulty, daily_hours },
        },
      }))
      scheduleToPersist = {
        ...scheduleData,
        studyPlanId: scheduleData?.studyPlanId || null,
        ml: {
          predicted_minutes,
          predicted_hours,
          predicted_days,
          inputs: { current_progress, target_progress, past_study_pace, difficulty, daily_hours },
        },
      }
    } catch (e) {
      setMlError(e?.message || 'ML prediction failed')
      // keep schedule usable even if ML fails
    } finally {
      setMlLoading(false)
    }

    await persistSchedule('assignment', scheduleToPersist)
  }

  const handleMidExamGenerate = async (scheduleData) => {
    setMidExamModalOpen(false)
    setScheduleType('mid-exam')
    setMlError('')
    setGeneratedSchedule(scheduleData)
    let scheduleToPersist = scheduleData

    const target_progress = getTargetProgressFromScheduleData(scheduleData)
    const current_progress = Math.max(0, Number(scheduleData?.currentProgress || 0))
    const past_study_pace = 25
    const daily_hours = Number(scheduleData?.hoursPerDay || 3)
    const exams = Array.isArray(scheduleData?.exams) ? scheduleData.exams : []

    setMlLoading(true)
    try {
      const predictions = await Promise.all(
        exams.map(async (exam) => {
          const difficulty = weaknessToDifficulty(exam?.weakness)
          const pred = await predictTaskDuration({
            current_progress,
            target_progress,
            past_study_pace,
            difficulty,
            daily_hours,
          })

          const predicted_minutes = Number(pred?.predicted_minutes ?? pred?.predictedMinutes ?? 0)
          const predicted_hours = predicted_minutes ? Number((predicted_minutes / 60).toFixed(2)) : 0
          const predicted_days = (predicted_hours && daily_hours) ? Math.ceil(predicted_hours / daily_hours) : 0

          return {
            subject: exam?.subject || 'Exam',
            predicted_minutes,
            predicted_hours,
            predicted_days,
            inputs: { current_progress, target_progress, past_study_pace, difficulty, daily_hours },
          }
        })
      )

      const predicted_minutes = predictions.reduce((sum, exam) => sum + Number(exam.predicted_minutes || 0), 0)
      const predicted_hours = Number((predicted_minutes / 60).toFixed(2))
      const predicted_days = daily_hours ? Math.ceil(predicted_hours / daily_hours) : 0

      const ml = {
        predicted_minutes,
        predicted_hours,
        predicted_days,
        inputs: { current_progress, target_progress, past_study_pace, daily_hours },
        exams: predictions,
      }

      setGeneratedSchedule((prev) => ({ ...prev, ml }))
      scheduleToPersist = {
        ...scheduleData,
        studyPlanId: scheduleData?.studyPlanId || null,
        ml,
      }
    } catch (error) {
      setMlError(error?.message || 'AI prediction failed for mid exam schedule')
    } finally {
      setMlLoading(false)
    }

    await persistSchedule('mid-exam', scheduleToPersist)
  }

  const handleFinalExamGenerate = async (scheduleData) => {
    setFinalExamModalOpen(false)
    setScheduleType('final-exam')
    setMlError('')
    setGeneratedSchedule(scheduleData)
    let scheduleToPersist = scheduleData

    const target_progress = getTargetProgressFromScheduleData(scheduleData)
    const current_progress = Math.max(0, Number(scheduleData?.currentProgress || 0))
    const past_study_pace = 25
    const daily_hours = Number(scheduleData?.hoursPerDay || 3)
    const exams = Array.isArray(scheduleData?.exams) ? scheduleData.exams : []

    setMlLoading(true)
    try {
      const predictions = await Promise.all(
        exams.map(async (exam) => {
          const difficulty = weaknessToDifficulty(exam?.weakness)
          const pred = await predictTaskDuration({
            current_progress,
            target_progress,
            past_study_pace,
            difficulty,
            daily_hours,
          })

          const predicted_minutes = Number(pred?.predicted_minutes ?? pred?.predictedMinutes ?? 0)
          const predicted_hours = predicted_minutes ? Number((predicted_minutes / 60).toFixed(2)) : 0
          const predicted_days = (predicted_hours && daily_hours) ? Math.ceil(predicted_hours / daily_hours) : 0

          return {
            subject: exam?.subject || 'Exam',
            predicted_minutes,
            predicted_hours,
            predicted_days,
            inputs: { current_progress, target_progress, past_study_pace, difficulty, daily_hours },
          }
        })
      )

      const predicted_minutes = predictions.reduce((sum, exam) => sum + Number(exam.predicted_minutes || 0), 0)
      const predicted_hours = Number((predicted_minutes / 60).toFixed(2))
      const predicted_days = daily_hours ? Math.ceil(predicted_hours / daily_hours) : 0

      const ml = {
        predicted_minutes,
        predicted_hours,
        predicted_days,
        inputs: { current_progress, target_progress, past_study_pace, daily_hours },
        exams: predictions,
      }

      setGeneratedSchedule((prev) => ({ ...prev, ml }))
      scheduleToPersist = {
        ...scheduleData,
        studyPlanId: scheduleData?.studyPlanId || null,
        ml,
      }
    } catch (error) {
      setMlError(error?.message || 'AI prediction failed for final exam schedule')
    } finally {
      setMlLoading(false)
    }

    await persistSchedule('final-exam', scheduleToPersist)
  }

  const handleWholeSemesterGenerate = async (scheduleData) => {
    setWholeSemesterModalOpen(false)
    setScheduleType('whole-semester')
    setGeneratedSchedule(scheduleData)
    await persistSchedule('whole-semester', scheduleData)
  }

  const handleOtherExamGenerate = async (scheduleData) => {
    setOtherExamModalOpen(false)
    setScheduleType('other-exam')
    setGeneratedSchedule(scheduleData)
    await persistSchedule('other-exam', scheduleData)
  }

  const handleOtherActivityGenerate = async (scheduleData) => {
    setOtherActivityModalOpen(false)
    setScheduleType('other-activity')
    setGeneratedSchedule(scheduleData)
    await persistSchedule('other-activity', scheduleData)
  }

  const handleReset = () => {
    setGeneratedSchedule(null)
    setScheduleType(null)
    setFinalExamModalOpen(false)
    setWholeSemesterModalOpen(false)
    setOtherExamModalOpen(false)
    setOtherActivityModalOpen(false)
    setMlLoading(false)
    setMlError('')
  }

  if (generatedSchedule && scheduleType === 'assignment') {
    return (
      <div>
        {/* Optional lightweight ML status (won’t affect your UI much) */}
        {(mlLoading || mlError) && (
          <div style={{ maxWidth: 900, margin: '0 auto 1rem' }}>
            {mlLoading && (
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#888',
              }}>
                ⏳ Calculating AI time estimate…
              </div>
            )}
            {mlError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#ef4444',
              }}>
                ⚠️ AI estimate unavailable: {mlError}
              </div>
            )}
          </div>
        )}

        <ScheduleResult data={generatedSchedule} onBack={handleReset} />
      </div>
    )
  }

  if (generatedSchedule && scheduleType === 'mid-exam') {
    return (
      <div>
        {(mlLoading || mlError) && (
          <div style={{ maxWidth: 900, margin: '0 auto 1rem' }}>
            {mlLoading && (
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#888',
              }}>
                ⏳ Calculating AI time estimate for your mid exams...
              </div>
            )}
            {mlError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#ef4444',
              }}>
                ⚠️ AI estimate unavailable: {mlError}
              </div>
            )}
          </div>
        )}
        <MidExamResult data={generatedSchedule} onBack={handleReset} />
      </div>
    )
  }

  if (generatedSchedule && scheduleType === 'final-exam') {
    return (
      <div>
        {(mlLoading || mlError) && (
          <div style={{ maxWidth: 900, margin: '0 auto 1rem' }}>
            {mlLoading && (
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#888',
              }}>
                ⏳ Calculating AI time estimate for your final exams...
              </div>
            )}
            {mlError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 12,
                color: '#ef4444',
              }}>
                ⚠️ AI estimate unavailable: {mlError}
              </div>
            )}
          </div>
        )}
        <FinalExamResult data={generatedSchedule} onBack={handleReset} />
      </div>
    )
  }

  if (generatedSchedule && scheduleType === 'whole-semester') {
    return <WholeSemesterResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'other-exam') {
    return <OtherExamResult data={generatedSchedule} onBack={handleReset} />
  }

  if (generatedSchedule && scheduleType === 'other-activity') {
    return <OtherActivityResult data={generatedSchedule} onBack={handleReset} />
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        borderRadius: 20,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', right: 100, bottom: -50,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI-Powered
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Smart Schedule
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
          Select a schedule type below. Our AI will generate a personalised, day-by-day study plan tailored to your goals.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handlePastSchedulesToggle}
            style={{
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.16)',
              color: '#fff',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {showPastSchedules ? 'Hide Past Schedules' : 'View Past Schedules'}
          </button>

          {saveLoading && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Saving schedule...</span>}
          {!saveLoading && saveMessage && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{saveMessage}</span>}
          {!saveLoading && saveError && <span style={{ fontSize: 12, color: '#fee2e2' }}>{saveError}</span>}
        </div>
      </div>

      {showPastSchedules && (
        <div
          onClick={handleClosePastSchedules}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 860,
              maxHeight: '88vh',
              overflow: 'hidden',
              background: '#ffffff',
              borderRadius: 18,
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '1rem 1.15rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Past Schedules</h3>
                <div style={{ marginTop: 3, fontSize: 12, color: '#6b7280' }}>Search, open, or delete saved schedules</div>
              </div>
              <button
                type="button"
                onClick={handleClosePastSchedules}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1rem 1.15rem 0.75rem' }}>
              <input
                value={pastScheduleSearch}
                onChange={(event) => setPastScheduleSearch(event.target.value)}
                placeholder="Search by title, type, subject, or goal..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: 12,
                  padding: '11px 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ padding: '0 1.15rem 1.15rem', overflowY: 'auto' }}>
              {pastLoading && <div style={{ fontSize: 13, color: '#6b7280', padding: '0.5rem 0' }}>Loading...</div>}

              {!pastLoading && pastSchedules.length === 0 && (
                <div style={{ fontSize: 13, color: '#6b7280', padding: '0.5rem 0' }}>No schedules saved yet.</div>
              )}

              {!pastLoading && pastSchedules.length > 0 && filteredPastSchedules.length === 0 && (
                <div style={{ fontSize: 13, color: '#6b7280', padding: '0.5rem 0' }}>No schedules match your search.</div>
              )}

              {!pastLoading && filteredPastSchedules.length > 0 && (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {filteredPastSchedules.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() => handleOpenPastSchedule(plan._id)}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 14,
                        padding: '0.85rem 0.95rem',
                        background: '#fafafa',
                        cursor: openingPlanId === plan._id ? 'wait' : 'pointer',
                        transition: 'border-color 0.15s ease, transform 0.15s ease',
                      }}
                      onMouseEnter={(event) => {
                        if (openingPlanId === plan._id || deletingPlanId === plan._id) return
                        event.currentTarget.style.borderColor = '#cbd5e1'
                        event.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.borderColor = '#e5e7eb'
                        event.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{plan.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleOpenPastSchedule(plan._id)
                            }}
                            disabled={openingPlanId === plan._id || deletingPlanId === plan._id}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              color: '#111827',
                              borderRadius: 8,
                              padding: '5px 9px',
                              cursor: 'pointer',
                            }}
                          >
                            {openingPlanId === plan._id ? 'Opening...' : 'Open'}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleDeletePastSchedule(plan._id, event)}
                            disabled={deletingPlanId === plan._id || openingPlanId === plan._id}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              border: '1px solid rgba(239,68,68,0.25)',
                              background: 'rgba(239,68,68,0.08)',
                              color: '#ef4444',
                              borderRadius: 8,
                              padding: '5px 9px',
                              cursor: 'pointer',
                            }}
                          >
                            {deletingPlanId === plan._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                        <span>Type: {plan.scopeType}</span>
                        <span>Modules: {Array.isArray(plan.modules) ? plan.modules.length : 0}</span>
                        <span>Created: {new Date(plan.createdAt).toLocaleString()}</span>
                        <span>Target: {plan.targetDate ? new Date(plan.targetDate).toLocaleDateString() : '-'}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: '#9ca3af' }}>
                        Click card or Open to view full details
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule type grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        {scheduleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type)}
            disabled={!type.available}
            style={{
              background: '#ffffff',
              border: `1.5px solid ${type.available ? '#e8ecf4' : '#f0f2f8'}`,
              borderRadius: 18,
              padding: '1.5rem',
              cursor: type.available ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              opacity: type.available ? 1 : 0.5,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = `1.5px solid ${type.color}55`
              e.currentTarget.style.background = `${type.color}06`
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}20`
            }}
            onMouseLeave={(e) => {
              if (!type.available) return
              e.currentTarget.style.border = '1.5px solid #e8ecf4'
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Available badge */}
            {type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 700,
                background: 'rgba(249,115,22,0.1)',
                color: '#f97316', padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
                border: '1px solid rgba(249,115,22,0.2)',
              }}>AVAILABLE</div>
            )}
            {!type.available && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 10, fontWeight: 600,
                background: '#f0f2f8', color: '#9ca3af',
                padding: '2px 8px', borderRadius: 20,
                letterSpacing: '0.05em',
                border: '1px solid #e8ecf4',
              }}>COMING SOON</div>
            )}

            {/* Icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 14,
              background: `${type.color}18`,
              border: `1.5px solid ${type.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: type.color,
              marginBottom: '1rem',
            }}>
              {type.icon}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>
              {type.label}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
              {type.description}
            </div>

            {type.available && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: '1rem' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: type.color }}>Get Started</span>
                <svg width="14" height="14" fill="none" stroke={type.color} strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Assignment modal */}
      {modalOpen && (
        <AssignmentModal
          onClose={() => setModalOpen(false)}
          onGenerate={handleGenerate}
        />
      )}

      {/* Mid Exam modal */}
      {midExamModalOpen && (
        <MidExamModal
          onClose={() => setMidExamModalOpen(false)}
          onGenerate={handleMidExamGenerate}
        />
      )}

      {/* Final Exam modal */}
      {finalExamModalOpen && (
        <FinalExamModal
          onClose={() => setFinalExamModalOpen(false)}
          onGenerate={handleFinalExamGenerate}
        />
      )}

      {/* Whole Semester modal */}
      {wholeSemesterModalOpen && (
        <WholeSemesterModal
          onClose={() => setWholeSemesterModalOpen(false)}
          onGenerate={handleWholeSemesterGenerate}
        />
      )}

      {/* Other Exam modal */}
      {otherExamModalOpen && (
        <OtherExamModal
          onClose={() => setOtherExamModalOpen(false)}
          onGenerate={handleOtherExamGenerate}
        />
      )}

      {/* Other Activity modal */}
      {otherActivityModalOpen && (
        <OtherActivityModal
          onClose={() => setOtherActivityModalOpen(false)}
          onGenerate={handleOtherActivityGenerate}
        />
      )}
    </div>
  )
}

export default SmartSchedule