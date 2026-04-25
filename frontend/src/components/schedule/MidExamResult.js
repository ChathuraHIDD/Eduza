import { useState } from 'react'
import { downloadSchedulePdf } from '../../utils/schedulePdf'
import StudySessionTracker from '../study/StudySessionTracker'

const WEAKNESS_LABELS = { 1: 'Very Strong', 2: 'Strong', 3: 'Average', 4: 'Weak', 5: 'Very Weak' }
const PREP_LABELS     = { 1: "Haven't Started", 2: 'Just Started', 3: 'Getting There', 4: 'Well Prepared', 5: 'Fully Ready' }
const ACCENT = '#f97316'
const ACCENT_DARK = '#c2410c'
const ACCENT_RGBA = (a) => `rgba(249,115,22,${a})`
const THEME = {
  page: '#fffaf5',
  paper: '#ffffff',
  paperSoft: '#fff7ed',
  border: '#fed7aa',
  text: '#1f2937',
  textSoft: '#6b7280',
  textFaint: '#9ca3af',
  orange: '#f97316',
  orangeDark: '#c2410c',
  orangeDeep: '#9a3412',
}

function toDate(value) {
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function formatShortDate(value) {
  return toDate(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatMonthShort(value) {
  return toDate(value).toLocaleDateString('en-US', { month: 'short' })
}

function formatLongDate(value) {
  return toDate(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function MidExamResult({ data, onBack }) {
  const [expandedDay, setExpandedDay] = useState(0)
  const [activeSubject, setActiveSubject] = useState(null)

  const handleDownloadPdf = async () => {
    await downloadSchedulePdf({ planType: 'mid-exam', data })
  }

  const { exams, totalDays, hoursPerDay, studyTime, targetLabel, totalHours, days } = data
  const mlEstimate = data?.ml
  const plannedMinutesToday = Math.max(0, Math.round((hoursPerDay || 0) * 60))

  const filteredDays = activeSubject
    ? days.filter((d) => d.subject === activeSubject || d.isExamDay)
    : days

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', background: THEME.page, borderRadius: 22, padding: '1rem', border: `1px solid ${THEME.border}` }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{
          background: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: 10,
          padding: '8px 14px', cursor: 'pointer', color: THEME.orangeDark, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: THEME.text, letterSpacing: '-0.4px' }}>
            Mid Exam Study Plan
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: THEME.textSoft }}>Priority-driven · personalised to your exam dates</p>
        </div>
      </div>

      <StudySessionTracker
        label="Mid Exam Study Plan"
        moduleName={exams?.[0]?.subject || 'Mid Exam'}
        sessionType="revision"
        studyPlanId={data?.studyPlanId || null}
        plannedMinutesToday={plannedMinutesToday}
      />

      {/* Summary banner */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.orangeDeep} 0%, ${THEME.orangeDark} 55%, ${THEME.orange} 100%)`,
        border: `1px solid ${THEME.orangeDark}`,
        borderRadius: 18, padding: '1.5rem 2rem',
        marginBottom: '1.25rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -50, top: -50,
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${ACCENT_RGBA(0.12)} 0%, transparent 70%)`,
        }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Semester Mid Exams
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
              {exams.length} Exam{exams.length > 1 ? 's' : ''} · {totalDays} Day Plan
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
              Study time: <span style={{ color: ACCENT, fontWeight: 600 }}>
                {studyTime === 'morning' ? '🌅 Morning sessions' : '🌙 Night sessions'}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Subjects', value: exams.length },
              { label: 'Hrs/Day', value: `${hoursPerDay}h` },
              { label: 'Total', value: `${totalHours}h` },
              { label: 'Target', value: targetLabel },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70,
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.86)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mlEstimate?.predicted_minutes > 0 && (
        <div style={{
          background: THEME.paper,
          border: `1px solid ${THEME.border}`,
          borderRadius: 16,
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>AI Time Estimate</div>
          <div style={{ fontSize: 13, color: THEME.textSoft, marginBottom: 8 }}>
            Estimated study effort for your mid exams: <span style={{ color: THEME.orangeDark, fontWeight: 700 }}>{mlEstimate.predicted_hours}h</span>
            {' '}({mlEstimate.predicted_minutes} mins)
            {Number.isFinite(mlEstimate.predicted_days) && mlEstimate.predicted_days > 0 ? ` ~ ${mlEstimate.predicted_days} day(s)` : ''}
          </div>
          {Array.isArray(mlEstimate.exams) && mlEstimate.exams.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {mlEstimate.exams.map((item) => (
                <span
                  key={item.subject}
                  style={{
                    fontSize: 11,
                    color: THEME.orangeDark,
                    background: THEME.paperSoft,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 999,
                    padding: '4px 9px',
                  }}
                >
                  {item.subject}: {item.predicted_hours}h
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exam timeline */}
      <div style={{
        background: THEME.paper, border: `1px solid ${THEME.border}`,
        borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text, marginBottom: '1rem' }}>Exam Timeline</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {exams.map((exam) => (
            <div key={exam.subject} style={{
              background: THEME.paperSoft,
              border: `1.5px solid ${exam.color}33`,
              borderLeft: `4px solid ${exam.color}`,
              borderRadius: 12, padding: '0.75rem 1rem',
              flex: '1 1 200px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: exam.color, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: exam.daysFromToday <= 3 ? '#b91c1c' : exam.daysFromToday <= 7 ? ACCENT_DARK : ACCENT,
                  background: exam.daysFromToday <= 3 ? 'rgba(239,68,68,0.1)' : exam.daysFromToday <= 7 ? 'rgba(249,115,22,0.1)' : ACCENT_RGBA(0.1),
                  padding: '2px 7px', borderRadius: 20,
                }}>
                  {exam.daysFromToday <= 3 ? 'URGENT' : exam.daysFromToday <= 7 ? 'SOON' : `${exam.daysFromToday}d`}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text, marginBottom: 2 }}>{exam.subject}</div>
              <div style={{ fontSize: 11, color: THEME.textSoft }}>
                {formatShortDate(exam.date)}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, padding: '1px 7px', borderRadius: 20,
                  background: '#fff', color: THEME.orangeDark,
                }}>{WEAKNESS_LABELS[exam.weakness]}</span>
                <span style={{
                  fontSize: 10, padding: '1px 7px', borderRadius: 20,
                  background: '#fff', color: THEME.orangeDark,
                }}>{PREP_LABELS[exam.prep]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject filter */}
      <div style={{
        display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: THEME.textSoft, marginRight: 4 }}>Filter:</span>
        <button
          onClick={() => setActiveSubject(null)}
          style={filterBtn(activeSubject === null, ACCENT)}
        >All Subjects</button>
        {exams.map((e) => (
          <button key={e.subject}
            onClick={() => setActiveSubject(activeSubject === e.subject ? null : e.subject)}
            style={filterBtn(activeSubject === e.subject, e.color)}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: e.color, display: 'inline-block', marginRight: 5 }} />
            {e.subject}
          </button>
        ))}
      </div>

      {/* Day-by-day schedule */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredDays.map((day) => {
          const globalIdx = days.indexOf(day)
          const isOpen = expandedDay === globalIdx

          // Exam day row
          if (day.isExamDay) {
            return (
              <div key={globalIdx} style={{
                background: THEME.paper,
                border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${ACCENT_DARK}`,
                borderRadius: 14, padding: '0.9rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: THEME.paperSoft,
                    border: `1.5px solid ${THEME.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: 10, color: ACCENT_DARK, fontWeight: 700 }}>
                    {formatMonthShort(day.date)}
                  </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: ACCENT_DARK }}>{toDate(day.date).getDate()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT_DARK }}>🎓 Exam Day</span>
                    {day.examSubjects.map((s) => (
                      <span key={s.subject} style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                        background: `${s.color}22`, color: s.color,
                      }}>{s.subject}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: THEME.textSoft, marginTop: 2 }}>
                    {formatLongDate(day.date)}
                    {' · '}<span style={{ color: ACCENT_DARK, fontWeight: 600 }}>No study planned — rest and be fresh!</span>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={globalIdx} style={{
              background: THEME.paper,
              border: isOpen ? `1px solid ${day.subjectColor}44` : `1px solid ${THEME.border}`,
              borderLeft: `4px solid ${isOpen ? day.subjectColor : THEME.border}`,
              borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <button
                onClick={() => setExpandedDay(isOpen ? null : globalIdx)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '0.9rem 1.25rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left',
                }}
              >
                {/* Date circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: isOpen ? `${day.subjectColor}15` : THEME.paperSoft,
                  border: `1.5px solid ${isOpen ? day.subjectColor + '55' : THEME.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: isOpen ? day.subjectColor : THEME.textSoft, fontWeight: 700, lineHeight: 1 }}>
                    {formatShortDate(day.date)}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: isOpen ? day.subjectColor : THEME.text, lineHeight: 1 }}>
                    {toDate(day.date).getDate()}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: THEME.text }}>
                      Day {day.dayNumber}
                    </span>
                    {/* Subject dot + name */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: day.subjectColor, display: 'inline-block' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: day.subjectColor }}>{day.subject}</span>
                    </span>
                    {/* Phase */}
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: `${day.color}18`, color: day.color,
                    }}>{day.phaseLabel}</span>
                    {/* Urgency if exam tomorrow */}
                    {day.daysToExam <= 2 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(249,115,22,0.12)', color: ACCENT_DARK,
                      }}>⚠ {day.daysToExam === 0 ? 'EXAM TODAY' : day.daysToExam === 1 ? 'EXAM TOMORROW' : 'EXAM SOON'}</span>
                    )}
                    {/* Alert if another exam also close */}
                    {day.nearExams && day.nearExams.length > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(249,115,22,0.10)', color: ACCENT,
                      }}>⚡ {day.nearExams[0].subject} also near</span>
                    )}
                    {/* Another subject has exam today */}
                    {day.examsTodayList && day.examsTodayList.length > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(249,115,22,0.12)', color: ACCENT_DARK,
                      }}>🎓 {day.examsTodayList[0].subject} exam today</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textSoft }}>
                    {formatLongDate(day.date)}
                    {' · '}{day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                    {' · '}{day.hoursPlanned}h
                    {' · '}{day.daysToExam}d till exam
                  </div>
                </div>

                <svg width="16" height="16" fill="none" stroke="#c2a58e" strokeWidth="2" viewBox="0 0 24 24"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${day.subjectColor}22`, padding: '0.75rem 1.25rem 1.25rem', background: '#fffefc' }}>

                  {/* Exam-today alert — another subject has an exam today */}
                  {day.examsTodayList && day.examsTodayList.length > 0 && (
                    <div style={{
                      marginBottom: '0.75rem',
                      display: 'flex', gap: 8, alignItems: 'center',
                      background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)',
                      borderRadius: 10, padding: '8px 12px',
                    }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>🎓</span>
                      <span style={{ fontSize: 12, color: ACCENT_DARK, lineHeight: 1.5 }}>
                        <strong>{day.examsTodayList.map((e) => e.subject).join(', ')}</strong> exam is today —
                        complete that first, then study {day.subject} for your next exam.
                      </span>
                    </div>
                  )}

                  {/* Weakness / prep reminder */}
                  {(day.weaknessLevel >= 4 || day.prepLevel <= 2) && (
                    <div style={{
                      marginBottom: '0.75rem',
                      display: 'flex', gap: 8, alignItems: 'center',
                      background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)',
                      borderRadius: 10, padding: '8px 12px',
                    }}>
                      <span style={{ fontSize: 14 }}>⚡</span>
                      <span style={{ fontSize: 12, color: THEME.orangeDark }}>
                        {day.weaknessLevel >= 4 && `You rated yourself weak in ${day.subject} — `}
                        {day.prepLevel <= 2 && `Preparation is low — `}
                        extra focus is scheduled today.
                        {day.notes && ` Focus areas: "${day.notes}"`}
                      </span>
                    </div>
                  )}

                  {/* Sessions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {day.sessions.map((s, si) => (
                      <div key={si} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '1rem',
                        background: THEME.paperSoft, borderRadius: 10, padding: '10px 14px',
                        border: `1px solid ${THEME.border}`,
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: `${day.subjectColor}18`, border: `1.5px solid ${day.subjectColor}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: day.subjectColor, marginTop: 1,
                        }}>{si + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, marginBottom: 3 }}>{s.task}</div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 11, color: THEME.textSoft }}>🕐 {s.time}</span>
                            <span style={{ fontSize: 11, color: THEME.textSoft }}>⏱ {s.duration}h</span>
                          </div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${THEME.border}`, flexShrink: 0, marginTop: 2, background: '#fff' }} />
                      </div>
                    ))}
                  </div>

                  {/* Tip */}
                  <div style={{
                    background: THEME.paperSoft, border: `1px solid ${day.color}22`,
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <svg width="14" height="14" fill="none" stroke={day.color} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span style={{ fontSize: 11, color: THEME.textSoft, lineHeight: 1.6 }}>
                      {examTip(day.phase, day.daysToExam, day.subject)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '1.5rem', background: THEME.paper, border: `1px solid ${THEME.border}`,
        borderRadius: 14, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: THEME.text, marginBottom: 3 }}>
            Mid Exam Plan Ready ✓
          </div>
          <div style={{ fontSize: 12, color: THEME.textSoft }}>
            {exams.length} exams tracked · Target: {targetLabel}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={handleDownloadPdf} style={{
            background: '#fff',
            border: `1px solid ${ACCENT_RGBA(0.35)}`,
            borderRadius: 10,
            color: ACCENT_DARK,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}>Download PDF</button>
          <button onClick={onBack} style={{
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
            border: 'none', borderRadius: 10, color: '#fff',
            padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: `0 4px 18px ${ACCENT_RGBA(0.3)}`,
          }}>Create Another Plan</button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function filterBtn(active, color) {
  return {
    padding: '5px 12px', borderRadius: 20,
    border: active ? `1px solid ${color}55` : `1px solid ${THEME.border}`,
    background: active ? `${color}14` : THEME.paper,
    color: active ? color : THEME.textSoft,
    fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', alignItems: 'center',
  }
}

function examTip(phase, daysToExam, subject) {
  if (daysToExam <= 1) return `Exam is tomorrow! Do a light review only — no heavy cramming. Get 8 hours of sleep and stay hydrated.`
  if (daysToExam <= 3 && phase === 'revise') return `You're in the final stretch for ${subject}. Focus on weak points and key formulas — not new content.`
  if (phase === 'learn') return `This is the deep learning phase. Understanding the material now makes revision far easier later.`
  if (phase === 'practice') return `Attempt past papers under timed conditions. This is the best exam preparation technique.`
  if (phase === 'revise') return `Compress your notes to a single page. If you can recall it from memory, you know it.`
  return `Stay consistent. Even 30 minutes of focused study beats hours of distracted reviewing.`
}

export default MidExamResult
