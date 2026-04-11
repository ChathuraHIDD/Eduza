import { useState } from 'react'
import { downloadSchedulePdf } from '../../utils/schedulePdf'
import StudySessionTracker from '../study/StudySessionTracker'

const INTENSITY_LABELS = { 4: 'Very High', 3: 'High', 2: 'Moderate', 1: 'Basic' }
const INTENSITY_COLORS = { 4: '#c2410c', 3: '#ea580c', 2: '#f59e0b', 1: '#16a34a' }

const THEME = {
  orange: '#ea580c',
  orangeDark: '#9a3412',
  white: '#ffffff',
  ink: '#1f2937',
  inkSoft: '#4b5563',
  border: '#fed7aa',
  paper: '#fff7ed',
}

function toDate(value) {
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function formatLongDate(value) {
  return toDate(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function ScheduleResult({ data, onBack }) {
  const [expandedDay, setExpandedDay] = useState(0)

  const handleDownloadPdf = async () => {
    await downloadSchedulePdf({ planType: 'assignment', data })
  }

  const {
    subject,
    dueDate,
    totalDays,
    hoursPerDay,
    studyTime,
    targetLabel,
    intensity,
    totalHours,
    phases,
    days,
    ml,
  } = data

  const dueDateStr = formatLongDate(dueDate)

  const mlMinutes = Number(ml?.predicted_minutes ?? 0)
  const mlHours = Number(ml?.predicted_hours ?? (mlMinutes ? mlMinutes / 60 : 0))
  const mlDays = Number(ml?.predicted_days ?? (mlHours && hoursPerDay ? Math.ceil(mlHours / hoursPerDay) : 0))
  const mlDaily = hoursPerDay ? Number((mlHours / Number(hoursPerDay)).toFixed(2)) : 0
  const plannedMinutesToday = Math.max(0, Math.round((hoursPerDay || 0) * 60))

  return (
    <div
      style={{
        maxWidth: 940,
        margin: '0 auto',
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
        border: `1px solid ${THEME.border}`,
        borderRadius: 20,
        padding: '1.1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onBack}
          style={{
            background: THEME.white,
            border: `1px solid ${THEME.border}`,
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            color: THEME.orangeDark,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.4px' }}>
            Your Assignment Schedule
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: THEME.inkSoft }}>
            Easy-to-follow timeline with daily workload
          </p>
        </div>
      </div>

      <StudySessionTracker
        label={subject}
        moduleName={subject}
        sessionType="assessment"
        studyPlanId={data?.studyPlanId || null}
        plannedMinutesToday={plannedMinutesToday}
      />

      <div
        style={{
          background: 'linear-gradient(120deg, #7c2d12 0%, #9a3412 45%, #c2410c 100%)',
          border: '1px solid rgba(255,255,255,0.24)',
          borderRadius: 18,
          padding: '1.25rem 1.4rem',
          marginBottom: '1rem',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            right: -60,
            top: -90,
            background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 74%)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 500 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Assignment
            </div>
            <h3 style={{ margin: '4px 0 6px', fontSize: 30, lineHeight: 1.2, fontWeight: 900 }}>{subject}</h3>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.95 }}>Due: {dueDateStr}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(94px, 1fr))', gap: 10, minWidth: 230 }}>
            {[
              { label: 'Days', value: totalDays },
              { label: 'Hours/day', value: `${hoursPerDay}h` },
              { label: 'Total hours', value: `${totalHours}h` },
              { label: 'Target', value: targetLabel },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 900 }}>{item.value}</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <Tag color="#fff" textColor={THEME.orangeDark} label={`${studyTime === 'morning' ? 'Morning' : 'Night'} sessions`} />
          <Tag color="#fff" textColor={INTENSITY_COLORS[intensity] || THEME.orangeDark} label={`${INTENSITY_LABELS[intensity]} intensity`} />
          <Tag color="#fff" textColor={THEME.orangeDark} label={`${phases.length} study phases`} />
        </div>
      </div>

      <div
        style={{
          background: THEME.white,
          border: `1px solid ${THEME.border}`,
          borderRadius: 16,
          padding: '1rem 1.15rem',
          marginBottom: '0.9rem',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: THEME.ink, marginBottom: 12 }}>Study phase overview</div>

        <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
          {phases.map((phase) => (
            <div key={phase.phase} style={{ flex: phase.dayCount, background: phase.color, opacity: 0.95 }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {phases.map((phase) => (
            <div key={phase.phase} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 4, background: phase.color }} />
              <span style={{ fontSize: 12, color: THEME.inkSoft }}>
                {phase.label} ({phase.dayCount}d)
              </span>
            </div>
          ))}
        </div>
      </div>

      {ml && mlMinutes > 0 && (
        <div
          style={{
            background: '#fffaf5',
            border: `1px solid ${THEME.border}`,
            borderRadius: 16,
            padding: '1rem 1.15rem',
            marginBottom: '0.9rem',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.ink, marginBottom: 8 }}>
            AI workload estimate
          </div>
          <div style={{ fontSize: 12, color: THEME.inkSoft, lineHeight: 1.6 }}>
            If you follow about {hoursPerDay}h/day, you can reach {ml?.inputs?.target_progress ?? 70}% in around {mlDays}{' '}
            day{mlDays !== 1 ? 's' : ''}.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <StatPill label="Total time" value={`${Number(mlHours.toFixed(2))}h`} />
            <StatPill label="In days" value={`${mlDays} days`} />
            <StatPill label="Per day" value={mlDaily ? `${mlDaily}h/day` : '-'} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {days.map((day, index) => {
          const isOpen = expandedDay === index
          const dayDate = toDate(day.date)

          return (
            <div
              key={index}
              style={{
                background: THEME.white,
                border: `1px solid ${isOpen ? '#fdba74' : THEME.border}`,
                borderLeft: `5px solid ${isOpen ? THEME.orange : '#fdba74'}`,
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedDay(isOpen ? null : index)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '0.95rem 1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: day.bg || THEME.paper,
                    border: `1.5px solid ${day.color || '#fdba74'}55`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 10, color: THEME.inkSoft, lineHeight: 1 }}>
                    {dayDate.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: THEME.orangeDark, lineHeight: 1 }}>
                    {dayDate.getDate()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: THEME.ink }}>
                      Day {day.dayNumber}
                      {day.isToday && <span style={{ marginLeft: 6, fontSize: 11, color: THEME.orange }}>(Today)</span>}
                      {day.isLast && <span style={{ marginLeft: 6, fontSize: 11, color: '#dc2626' }}>(Deadline)</span>}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 9px',
                        borderRadius: 999,
                        background: day.bg || '#ffedd5',
                        color: day.color || THEME.orangeDark,
                      }}
                    >
                      {day.phaseLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: THEME.inkSoft, marginTop: 2 }}>
                    {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {' | '}
                    {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                    {' | '}
                    {day.hoursPlanned}h workload
                  </div>
                </div>

                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke={THEME.orangeDark}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${THEME.border}`, padding: '0.75rem 1.05rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {day.sessions.map((session, sessionIndex) => (
                      <div
                        key={sessionIndex}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '30px 1fr auto',
                          alignItems: 'center',
                          gap: 10,
                          background: '#fffaf5',
                          border: `1px solid ${THEME.border}`,
                          borderRadius: 10,
                          padding: '9px 12px',
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: '#ffedd5',
                            border: `1px solid ${THEME.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 800,
                            color: THEME.orangeDark,
                          }}
                        >
                          {sessionIndex + 1}
                        </div>

                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.ink, marginBottom: 2 }}>{session.task}</div>
                          <div style={{ fontSize: 11, color: THEME.inkSoft }}>
                            Time: {session.time} | Duration: {session.duration}h
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: THEME.orangeDark,
                            background: '#ffedd5',
                            border: `1px solid ${THEME.border}`,
                            borderRadius: 999,
                            padding: '3px 8px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {session.duration}h
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      background: '#fff7ed',
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 11,
                      color: THEME.inkSoft,
                      lineHeight: 1.6,
                    }}
                  >
                    {getDailyTip(day.phase, day.dayNumber, day.isLast)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div
        style={{
          marginTop: '1rem',
          background: THEME.white,
          border: `1px solid ${THEME.border}`,
          borderRadius: 14,
          padding: '1rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: THEME.ink }}>Schedule generated successfully</div>
          <div style={{ fontSize: 12, color: THEME.inkSoft }}>Follow this timetable to reach your target of {targetLabel}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadPdf}
            style={{
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 10,
              color: THEME.orangeDark,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Download Timetable PDF
          </button>

          <button
            onClick={onBack}
            style={{
              background: `linear-gradient(135deg, ${THEME.orange}, ${THEME.orangeDark})`,
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Create Another Plan
          </button>
        </div>
      </div>
    </div>
  )
}

function Tag({ color, textColor, label }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 999,
        background: color,
        color: textColor,
      }}
    >
      {label}
    </span>
  )
}

function StatPill({ label, value }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: '10px 12px',
        minWidth: 92,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 900, color: THEME.orangeDark }}>{value}</div>
      <div style={{ fontSize: 11, color: THEME.inkSoft, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function getDailyTip(phase, dayNum, isLast) {
  if (isLast) {
    return 'Final day: submit before deadline. Complete a final quality check for formatting, references, and file naming.'
  }

  const tips = {
    research: [
      'Use 3 or more credible sources. Focus on quality over quantity.',
      'Take concise notes with citations while researching to save time later.',
      'Set a limit for research time so writing can start early.',
    ],
    understanding: [
      'Explain the concept in simple words to confirm your understanding.',
      'Map your content directly to each marking criterion.',
    ],
    core: [
      'Draft first, edit after. Separate writing from polishing.',
      'Use focused time blocks and short breaks to maintain consistency.',
      'Track progress per section to avoid end-day overload.',
    ],
    review: [
      'Read your draft aloud and fix unclear sentences.',
      'Check every rubric point has clear evidence in your work.',
    ],
    polish: [
      'Verify headings, references, and formatting requirements.',
      'Keep a safe time buffer before submission for technical issues.',
    ],
  }

  const pool = tips[phase] || tips.core
  return pool[dayNum % pool.length]
}

export default ScheduleResult
