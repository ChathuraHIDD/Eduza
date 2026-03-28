import { jsPDF } from 'jspdf'
import { drawEduzaLogo } from './pdfBranding'

const ORANGE = [249, 115, 22]
const ORANGE_DARK = [194, 65, 12]
const WHITE = [255, 255, 255]
const TEXT_DARK = [25, 25, 25]
const TEXT_MID = [95, 95, 95]

function drawFrame(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  doc.setDrawColor(...ORANGE)
  doc.setLineWidth(1.6)
  doc.rect(8, 8, w - 16, h - 16)

  doc.setDrawColor(...ORANGE_DARK)
  doc.setLineWidth(0.4)
  doc.rect(10, 10, w - 20, h - 20)
}

async function drawHeader(doc, title) {
  const w = doc.internal.pageSize.getWidth()

  doc.setFillColor(...ORANGE)
  doc.rect(10, 10, w - 20, 22, 'F')

  doc.setTextColor(...WHITE)
  const hasLogo = await drawEduzaLogo(doc, 14, 12, 24, 18)
  if (!hasLogo) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('EDUZA', 14, 19)
  }

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Smart Schedule', hasLogo ? 40 : 14, 26)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title, w - 14, 20, { align: 'right' })

  doc.setTextColor(...TEXT_DARK)
}

async function ensureSpace(doc, y, needed, title = 'Generated Plan') {
  const h = doc.internal.pageSize.getHeight()
  if (y + needed < h - 14) {
    return y
  }

  doc.addPage()
  drawFrame(doc)
  await drawHeader(doc, title)
  return 40
}

function writeLabelValue(doc, y, label, value) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...TEXT_DARK)
  doc.text(`${label}:`, 14, y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_MID)
  doc.text(String(value ?? '-'), 45, y)
}

function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

function examSubjects(day) {
  if (!Array.isArray(day?.examSubjects)) return 'Exam Day'
  const names = day.examSubjects.map((s) => s?.subject).filter(Boolean)
  if (names.length === 0) return 'Exam Day'
  return `Exam Day - ${names.join(', ')}`
}

function dayLine(day, index) {
  const dateText = formatDate(day?.date)
  if (day?.isExamDay) {
    return `Day ${index + 1} | ${dateText} | ${examSubjects(day)}`
  }

  const subject = day?.subject ? ` | Subject: ${day.subject}` : ''
  const hours = typeof day?.hoursPlanned === 'number' ? ` | ${day.hoursPlanned}h` : ''
  const phase = day?.phaseLabel ? ` | ${day.phaseLabel}` : ''
  return `Day ${day?.dayNumber ?? index + 1} | ${dateText}${subject}${hours}${phase}`
}

function sessionLines(day) {
  if (!Array.isArray(day?.sessions) || day.sessions.length === 0) {
    return ['- No sessions listed']
  }

  return day.sessions.map((s) => {
    const task = s?.task || 'Study task'
    const time = s?.time ? ` @ ${s.time}` : ''
    const duration = s?.duration ? ` (${s.duration}h)` : ''
    return `- ${task}${time}${duration}`
  })
}

export async function downloadSchedulePdf({ planType, data }) {
  const planTitle =
    planType === 'assignment'
      ? 'Assignment Plan'
      : planType === 'mid-exam'
        ? 'Mid Exam Plan'
        : 'Final Exam Plan'

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawFrame(doc)
  await drawHeader(doc, planTitle)

  let y = 42

  doc.setTextColor(...TEXT_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`${planTitle} Summary`, 14, y)
  y += 7

  const summaryRows = planType === 'assignment'
    ? [
      ['Subject', data?.subject || '-'],
      ['Due Date', formatDate(data?.dueDate)],
      ['Target', data?.targetLabel || '-'],
      ['Days', data?.totalDays ?? '-'],
      ['Hours Per Day', data?.hoursPerDay ? `${data.hoursPerDay}h` : '-'],
      ['Total Planned', data?.totalHours ? `${data.totalHours}h` : '-'],
    ]
    : [
      ['Exams', Array.isArray(data?.exams) ? data.exams.length : '-'],
      ['Target', data?.targetLabel || '-'],
      ['Days', data?.totalDays ?? '-'],
      ['Hours Per Day', data?.hoursPerDay ? `${data.hoursPerDay}h` : '-'],
      ['Total Planned', data?.totalHours ? `${data.totalHours}h` : '-'],
      ['Study Time', data?.studyTime === 'morning' ? 'Morning' : data?.studyTime === 'night' ? 'Night' : '-'],
    ]

  for (const [label, value] of summaryRows) {
    y = await ensureSpace(doc, y, 7, planTitle)
    writeLabelValue(doc, y, label, value)
    y += 6
  }

  y += 3
  y = await ensureSpace(doc, y, 12, planTitle)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXT_DARK)
  doc.text('Day-by-Day Plan', 14, y)
  y += 6

  const days = Array.isArray(data?.days) ? data.days : []
  for (let idx = 0; idx < days.length; idx += 1) {
    const day = days[idx]
    y = await ensureSpace(doc, y, 10, planTitle)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...ORANGE_DARK)
    const line = dayLine(day, idx)
    doc.text(doc.splitTextToSize(line, 180), 14, y)
    y += 5

    const lines = sessionLines(day)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...TEXT_MID)
    for (const item of lines) {
      y = await ensureSpace(doc, y, 6, planTitle)
      const wrapped = doc.splitTextToSize(item, 175)
      doc.text(wrapped, 18, y)
      y += wrapped.length * 4.4
    }

    y += 1.5
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

  doc.save(`eduza-${filePrefix}-schedule.pdf`)
}