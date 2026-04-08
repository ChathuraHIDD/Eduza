import { useState } from 'react'
import StudySessionTracker from '../study/StudySessionTracker'

const ACCENT      = '#22c55e'
const ACCENT_DARK = '#16a34a'
const ACCENT_RGBA = (a) => `rgba(34,197,94,${a})`

const PHASE_COLORS = {
  intro:    '#3b82f6',
  core:     '#22c55e',
  practice: '#f97316',
  revise:   '#a855f7',
  exam:     '#ef4444',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function fmtShort(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function fmtFull(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtLong(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function filterBtn(active, color) {
  return {
    padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${active ? color : '#2a2a2a'}`,
    background: active ? `${color}18` : '#1a1a1a', color: active ? color : '#555',
    fontSize: 11, fontWeight: active ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
  }
}

function WholeSemesterResult({ data, onBack }) {
  const {
    semesterLabel, semesterStart, semesterEnd, isMidSemester,
    totalSemesterWeeks, totalWeeks, currentWeekNum,
    modules, moduleStats, hoursPerDay, studyDays,
    studyTime, targetLabel, totalHours, weeks,
  } = data

  // Which week is expanded
  const [expandedWeek, setExpandedWeek] = useState(0)
  // Which module to filter (null = all)
  const [activeModule, setActiveModule] = useState(null)
  // Which day is expanded inside a week
  const [expandedDay, setExpandedDay] = useState(null)

  const filteredWeeks = activeModule
    ? weeks.map((w) => ({ ...w, days: w.days.filter((d) => d.moduleId === activeModule) }))
    : weeks

  const studyDayLabels = studyDays.map((d) => DAY_NAMES[d]).join(', ')
  const plannedMinutesToday = Math.max(0, Math.round((hoursPerDay || 0) * 60))

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#aaa', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.4px' }}>Whole Semester Study Plan</h2>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
            Week-by-week · {modules.length} module{modules.length !== 1 ? 's' : ''} · prioritised by difficulty &amp; exam proximity
          </p>
        </div>
      </div>

      <StudySessionTracker
        label={semesterLabel}
        moduleName={modules?.[0]?.name || semesterLabel}
        sessionType="learn"
        studyPlanId={data?.studyPlanId || null}
        plannedMinutesToday={plannedMinutesToday}
      />

      {/* ── Summary banner ── */}
      <div style={{ background: 'linear-gradient(135deg, #0d1a0f 0%, #0f1a12 100%)', border: '1px solid #1a2e1d', borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT_RGBA(0.1)} 0%, transparent 70%)` }} />

        {isMidSemester && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT_RGBA(0.1), border: `1px solid ${ACCENT_RGBA(0.25)}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: ACCENT, marginBottom: '0.75rem' }}>
            📅 Mid-semester plan — starting from today
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {semesterLabel}
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.4px' }}>
              {modules.length} Module{modules.length !== 1 ? 's' : ''} · {totalWeeks}-Week Plan
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              {fmtShort(semesterStart)} → {fmtShort(semesterEnd)} ·&nbsp;
              <span style={{ color: ACCENT, fontWeight: 600 }}>{studyTime === 'morning' ? '🌅 Morning' : '🌙 Night'} sessions</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Weeks',     value: totalWeeks },
              { label: 'Modules',   value: modules.length },
              { label: 'Hrs/Day',   value: `${hoursPerDay}h` },
              { label: 'Days/Wk',   value: studyDays.length },
              { label: 'Total Hrs', value: `${totalHours}h` },
              { label: 'Target',    value: targetLabel },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 68 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: ACCENT, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Module legend & distribution ── */}
      <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: '1rem' }}>Module Overview</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {moduleStats.map((m) => {
            const maxDays = Math.max(...moduleStats.map((s) => s.totalDays), 1)
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#ddd', fontWeight: 500, minWidth: 200, flex: '0 0 200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                <div style={{ flex: 1, height: 6, background: '#242424', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(m.totalDays / maxDays) * 100}%`, background: m.color, borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: 12, color: m.color, fontWeight: 600, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                  {m.totalDays}d · {m.totalHours}h
                </span>
                {m.examDate && m.examDate.toDateString() !== semesterEnd.toDateString() && (
                  <span style={{ fontSize: 10, background: `${m.color}18`, color: m.color, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                    Exam {fmtShort(m.examDate)}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Study days info */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #242424' }}>
          <span style={{ fontSize: 12, color: '#555', marginRight: 4 }}>Study days:</span>
          {DAY_NAMES.map((d, i) => {
            const active = studyDays.includes(i)
            return (
              <span key={d} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: active ? ACCENT_RGBA(0.12) : '#1e1e1e', color: active ? ACCENT : '#444', fontWeight: active ? 600 : 400 }}>
                {d}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Module filter ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555', marginRight: 4 }}>Filter:</span>
        <button onClick={() => setActiveModule(null)} style={filterBtn(activeModule === null, ACCENT)}>All Modules</button>
        {modules.map((m) => (
          <button key={m.id} onClick={() => setActiveModule(activeModule === m.id ? null : m.id)} style={filterBtn(activeModule === m.id, m.color)}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
            {m.name}
          </button>
        ))}
      </div>

      {/* ── Week-by-week timeline ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filteredWeeks.map((week) => {
          const isOpen = expandedWeek === week.weekIndex
          const hasDays = week.days.length > 0
          const hasExams = week.examDays.length > 0

          return (
            <div key={week.weekIndex} style={{
              background: '#1a1a1a',
              border: week.isCurrent
                ? `1.5px solid ${ACCENT_RGBA(0.45)}`
                : isOpen ? '1px solid #333' : '1px solid #222',
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}>
              {/* Week header */}
              <button
                onClick={() => setExpandedWeek(isOpen ? null : week.weekIndex)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.9rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}
              >
                {/* Week number badge */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: week.isCurrent ? ACCENT_RGBA(0.15) : '#1e1e1e',
                  border: `1.5px solid ${week.isCurrent ? ACCENT_RGBA(0.5) : '#2a2a2a'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 9, color: week.isCurrent ? ACCENT : '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wk</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: week.isCurrent ? ACCENT : '#888', lineHeight: 1 }}>{week.weekNumber}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>{week.weekLabel}</span>
                    {week.isCurrent && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: ACCENT_RGBA(0.15), color: ACCENT, padding: '2px 9px', borderRadius: 20, letterSpacing: '0.04em' }}>CURRENT</span>
                    )}
                    {hasExams && week.examDays.map((e) => (
                      <span key={e.subject} style={{ fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 9px', borderRadius: 20 }}>
                        🎓 {e.subject}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', align: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#555' }}>
                      {week.daysCount} study day{week.daysCount !== 1 ? 's' : ''} · {week.weekTotalHrs}h
                    </span>
                    {/* Mini module colour dots */}
                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      {[...new Set(week.days.map((d) => d.moduleId))].map((mid) => {
                        const m = modules.find((x) => x.id === mid)
                        return m ? <span key={mid} style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} /> : null
                      })}
                    </div>
                  </div>
                </div>

                {/* Expand chevron */}
                <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded week content */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #222', padding: '0.75rem 1rem 1rem' }}>
                  {!hasDays && !hasExams && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#444', fontSize: 13 }}>No study days this week</div>
                  )}

                  {hasExams && (
                    <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {week.examDays.map((e) => (
                        <div key={e.subject} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderLeft: '4px solid #ef4444', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 200px' }}>
                          <span style={{ fontSize: 22 }}>🎓</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{e.subject} — Exam Day</div>
                            <div style={{ fontSize: 11, color: '#666' }}>{fmtFull(e.date)} · Rest and be confident!</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {week.days.map((day, di) => {
                      const dayKey = `${week.weekIndex}-${di}`
                      const dayOpen = expandedDay === dayKey
                      return (
                        <div key={di} style={{
                          background: '#111',
                          border: dayOpen ? `1px solid ${day.moduleColor}44` : '1px solid #1e1e1e',
                          borderLeft: `3px solid ${day.moduleColor}`,
                          borderRadius: 12,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s',
                        }}>
                          <button
                            onClick={() => setExpandedDay(dayOpen ? null : dayKey)}
                            style={{ width: '100%', background: 'none', border: 'none', padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}
                          >
                            {/* Date badge */}
                            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: dayOpen ? `${day.moduleColor}12` : '#1a1a1a', border: `1px solid ${dayOpen ? day.moduleColor + '44' : '#2a2a2a'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 9, color: dayOpen ? day.moduleColor : '#555', fontWeight: 600, lineHeight: 1 }}>
                                {day.date.toLocaleDateString('en-GB', { month: 'short' })}
                              </span>
                              <span style={{ fontSize: 15, fontWeight: 800, color: dayOpen ? day.moduleColor : '#777', lineHeight: 1 }}>{day.date.getDate()}</span>
                            </div>

                            {/* Day info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{fmtFull(day.date)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: day.moduleColor, display: 'inline-block' }} />
                                  <span style={{ fontSize: 12, fontWeight: 700, color: day.moduleColor }}>{day.module}</span>
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: `${PHASE_COLORS[day.phase]}18`, color: PHASE_COLORS[day.phase] }}>
                                  {day.phaseLabel}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {day.task}
                              </div>
                            </div>

                            {/* Hours badge */}
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', flexShrink: 0 }}>{day.hours}h</span>
                            <svg width="13" height="13" fill="none" stroke="#555" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: dayOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>

                          {/* Expanded day task */}
                          {dayOpen && (
                            <div style={{ borderTop: '1px solid #1e1e1e', padding: '0.9rem 1rem 1rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${PHASE_COLORS[day.phase]}18`, border: `1px solid ${PHASE_COLORS[day.phase]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {day.phase === 'intro'    && <svg width="15" height="15" fill="none" stroke={PHASE_COLORS.intro}    strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                                  {day.phase === 'core'     && <svg width="15" height="15" fill="none" stroke={PHASE_COLORS.core}     strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>}
                                  {day.phase === 'practice' && <svg width="15" height="15" fill="none" stroke={PHASE_COLORS.practice} strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                                  {day.phase === 'revise'   && <svg width="15" height="15" fill="none" stroke={PHASE_COLORS.revise}   strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                                  {day.phase === 'exam'     && <svg width="15" height="15" fill="none" stroke={PHASE_COLORS.exam}     strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: PHASE_COLORS[day.phase], marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day.phaseLabel}</div>
                                  <div style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.55, fontWeight: 500 }}>{day.task}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '3px 10px', color: '#666' }}>
                                  ⏱ {day.hours}h study
                                </span>
                                <span style={{ fontSize: 11, background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '3px 10px', color: '#666' }}>
                                  {studyTime === 'morning' ? '🌅 ~8:00 AM' : '🌙 ~7:00 PM'}
                                </span>
                                <span style={{ fontSize: 11, background: `${day.moduleColor}12`, border: `1px solid ${day.moduleColor}33`, borderRadius: 8, padding: '3px 10px', color: day.moduleColor }}>
                                  {day.module}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Phase legend */}
      <div style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 14, padding: '1rem 1.25rem', marginTop: '1.25rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Study Phases</div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { phase: 'intro',    label: 'Introduction',  desc: 'Get familiar with topics' },
            { phase: 'core',     label: 'Core Study',    desc: 'Deep dive into content' },
            { phase: 'practice', label: 'Practice',      desc: 'Exercises & past papers' },
            { phase: 'revise',   label: 'Revision',      desc: 'Consolidate knowledge' },
            { phase: 'exam',     label: 'Exam Prep',     desc: 'Final preparation' },
          ].map((p) => (
            <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: PHASE_COLORS[p.phase], display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{p.label}</span>
              <span style={{ fontSize: 11, color: '#444' }}>— {p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WholeSemesterResult
