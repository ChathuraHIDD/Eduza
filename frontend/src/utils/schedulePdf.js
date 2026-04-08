import { jsPDF } from 'jspdf'
import { drawEduzaLogo } from './pdfBranding'

const ORANGE = [234, 88, 12]
const ORANGE_DARK = [154, 52, 18]
const ORANGE_PALE = [255, 237, 213]
const WHITE = [255, 255, 255]
const TEXT_DARK = [30, 41, 59]
const TEXT_MID = [71, 85, 105]

function drawFrame(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  doc.setDrawColor(...ORANGE)
  doc.setLineWidth(1.5)
  doc.rect(8, 8, w - 16, h - 16)

  doc.setDrawColor(...ORANGE_DARK)
  doc.setLineWidth(0.4)
  doc.rect(10, 10, w - 20, h - 20)
}

async function drawHeader(doc, title) {
  const w = doc.internal.pageSize.getWidth()

  doc.setFillColor(...ORANGE_DARK)
  doc.rect(10, 10, w - 20, 22, 'F')

  doc.setTextColor(...WHITE)
  const hasLogo = await drawEduzaLogo(doc, 14, 12, 24, 18)
  if (!hasLogo) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('EDUZA', 14, 19)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Smart Schedule', hasLogo ? 40 : 14, 26)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title, w - 14, 20, { align: 'right' })

  doc.setTextColor(...TEXT_DARK)
}

async function newPageWithHeader(doc, title) {
  doc.addPage()
  drawFrame(doc)
  await drawHeader(doc, title)
  return 40
}

function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatWeekday(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function examSubjects(day) {
  if (!Array.isArray(day?.examSubjects)) return 'Exam Day'
  const names = day.examSubjects.map((item) => item?.subject).filter(Boolean)
  if (names.length === 0) return 'Exam Day'
  return `Exam: ${names.join(', ')}`
}

function getPlanTitle(planType) {
  if (planType === 'assignment') return 'Assignment Plan'
  if (planType === 'mid-exam') return 'Mid Exam Plan'
  return 'Final Exam Plan'
}

function getSummaryRows(planType, data) {
  if (planType === 'assignment') {
    return [
      ['Subject', data?.subject || '-'],
      ['Due Date', formatDate(data?.dueDate)],
      ['Target', data?.targetLabel || '-'],
      ['Total Days', data?.totalDays ?? '-'],
      ['Hours per Day', data?.hoursPerDay ? `${data.hoursPerDay}h` : '-'],
      ['Total Workload', data?.totalHours ? `${data.totalHours}h` : '-'],
    ]
  }

  return [
    ['Total Exams', Array.isArray(data?.exams) ? data.exams.length : '-'],
    ['Target', data?.targetLabel || '-'],
    ['Total Days', data?.totalDays ?? '-'],
    ['Hours per Day', data?.hoursPerDay ? `${data.hoursPerDay}h` : '-'],
    ['Total Workload', data?.totalHours ? `${data.totalHours}h` : '-'],
    ['Study Time', data?.studyTime === 'morning' ? 'Morning' : data?.studyTime === 'night' ? 'Night' : '-'],
  ]
}

function getFocusLabel(day) {
  if (day?.isExamDay) return examSubjects(day)
  if (day?.subject) return day.subject
  if (day?.phaseLabel) return day.phaseLabel
  return 'Study'
}

function getSessionTimeLabel(session) {
  if (session?.time) return String(session.time)
  return '-'
}

function getSessionTaskLabel(session, day) {
  if (session?.task) return String(session.task)
  if (day?.isExamDay) return examSubjects(day)
  return 'Study session'
}

function getSessionDuration(session, day) {
  if (typeof session?.duration === 'number') return `${session.duration}h`
  if (typeof day?.hoursPlanned === 'number') return `${day.hoursPlanned}h`
  return '-'
}

function buildTimetableRows(days) {
  const rows = []

  days.forEach((day, idx) => {
    const dateText = formatDate(day?.date)
    const weekday = formatWeekday(day?.date)
    const focus = getFocusLabel(day)
    const dayLabel = `Day ${day?.dayNumber ?? idx + 1}`

    if (day?.isExamDay && (!Array.isArray(day?.sessions) || day.sessions.length === 0)) {
      rows.push({
        date: dateText,
        day: dayLabel,
        focus,
        time: 'Exam',
        task: examSubjects(day),
        workload: '0h',
      })
      return
    }

    const sessions = Array.isArray(day?.sessions) ? day.sessions : []
    if (sessions.length === 0) {
      rows.push({
        date: dateText,
        day: dayLabel,
        focus,
        time: '-',
        task: 'No sessions planned',
        workload: typeof day?.hoursPlanned === 'number' ? `${day.hoursPlanned}h` : '-',
      })
      return
    }

    sessions.forEach((session, sessionIdx) => {
      rows.push({
        date: sessionIdx === 0 ? `${dateText} (${weekday})` : '',
        day: sessionIdx === 0 ? dayLabel : '',
        focus: sessionIdx === 0 ? focus : '',
        time: getSessionTimeLabel(session),
        task: getSessionTaskLabel(session, day),
        workload: getSessionDuration(session, day),
      })
    })

    rows.push({
      date: '',
      day: '',
      focus: '',
      time: 'Day total',
      task: 'Total planned workload',
      workload: typeof day?.hoursPlanned === 'number' ? `${day.hoursPlanned}h` : '-',
      isSummary: true,
    })
  })

  return rows
}

function drawSummaryCard(doc, y, rows) {
  const x = 14
  const width = 182
  const lineHeight = 6
  const cardHeight = 10 + rows.length * lineHeight

  doc.setFillColor(...ORANGE_PALE)
  doc.setDrawColor(253, 186, 116)
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'FD')

  let currentY = y + 7
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...TEXT_DARK)
    doc.text(`${label}:`, x + 4, currentY)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_MID)
    doc.text(String(value ?? '-'), x + 48, currentY)
    currentY += lineHeight
  })

  return y + cardHeight + 6
}

function drawTableHeader(doc, x, y, columns) {
  let cursorX = x

  doc.setFillColor(...ORANGE_DARK)
  doc.rect(x, y, 180, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...WHITE)

  columns.forEach((col) => {
    doc.text(col.label, cursorX + 1.5, y + 5.3)
    cursorX += col.width
  })

  doc.setTextColor(...TEXT_DARK)
}

function splitValue(doc, value, width) {
  const text = value == null ? '-' : String(value)
  return doc.splitTextToSize(text, Math.max(4, width - 2))
}

function computeRowHeight(doc, row, columns) {
  let maxLines = 1
  columns.forEach((col) => {
    const lines = splitValue(doc, row[col.key], col.width)
    maxLines = Math.max(maxLines, lines.length)
  })
  return Math.max(7, maxLines * 4.2 + 2.4)
}

function drawRow(doc, x, y, row, columns, even) {
  const height = computeRowHeight(doc, row, columns)

  doc.setFillColor(...(row.isSummary ? [255, 247, 237] : even ? [255, 255, 255] : [250, 250, 250]))
  doc.rect(x, y, 180, height, 'F')

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  doc.rect(x, y, 180, height)

  let cursorX = x
  columns.forEach((col) => {
    doc.setDrawColor(226, 232, 240)
    doc.line(cursorX, y, cursorX, y + height)

    const lines = splitValue(doc, row[col.key], col.width)
    doc.setFont('helvetica', row.isSummary && col.key === 'workload' ? 'bold' : 'normal')
    doc.setFontSize(8.7)
    doc.setTextColor(...(row.isSummary ? ORANGE_DARK : TEXT_MID))
    doc.text(lines, cursorX + 1.2, y + 4.4)

    cursorX += col.width
  })

  doc.setDrawColor(226, 232, 240)
  doc.line(x + 180, y, x + 180, y + height)

  return y + height
}

export async function downloadSchedulePdf({ planType, data }) {
  const planTitle = getPlanTitle(planType)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  drawFrame(doc)
  await drawHeader(doc, planTitle)

  let y = 42

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${planTitle} Summary`, 14, y)
  y += 4

  const summaryRows = getSummaryRows(planType, data)
  y = drawSummaryCard(doc, y, summaryRows)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXT_DARK)
  doc.text('Timetable', 14, y)
  y += 4

  const columns = [
    { key: 'date', label: 'Date', width: 33 },
    { key: 'day', label: 'Day', width: 16 },
    { key: 'focus', label: 'Focus', width: 26 },
    { key: 'time', label: 'Time', width: 30 },
    { key: 'task', label: 'Work / Task', width: 57 },
    { key: 'workload', label: 'Workload', width: 18 },
  ]

  const rows = buildTimetableRows(Array.isArray(data?.days) ? data.days : [])

  const x = 14
  drawTableHeader(doc, x, y, columns)
  y += 8

  for (let idx = 0; idx < rows.length; idx += 1) {
    const row = rows[idx]
    const rowHeight = computeRowHeight(doc, row, columns)

    if (y + rowHeight > 283) {
      y = await newPageWithHeader(doc, planTitle)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...TEXT_DARK)
      doc.text('Timetable (continued)', 14, y)
      y += 4
      drawTableHeader(doc, x, y, columns)
      y += 8
    }

    y = drawRow(doc, x, y, row, columns, idx % 2 === 0)
  }

  const stampY = doc.internal.pageSize.getHeight() - 14
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...TEXT_MID)
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, stampY)

  const filePrefix =
    planType === 'assignment'
      ? 'assignment'
      : planType === 'mid-exam'
        ? 'mid-exam'
        : 'final-exam'

  doc.save(`eduza-${filePrefix}-timetable.pdf`)
}
