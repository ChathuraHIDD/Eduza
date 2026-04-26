import { useState } from 'react'
import { downloadSchedulePdf } from '../../utils/schedulePdf'
import StudySessionTracker from '../study/StudySessionTracker'

const ACCENT      = '#f97316'
const ACCENT_DARK = '#c2410c'
const ACCENT_RGBA = (a) => `rgba(249,115,22,${a})`
const GRADIENT    = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`

const THEME = {
  page: '#fffaf5',
  paper: '#ffffff',
  paperSoft: '#fff7ed',
  border: '#fed7aa',
  text: '#1f2937',
  textSoft: '#6b7280',
  textFaint: '#9ca3af',
}

const PHASE_COLORS = {
  foundation: '#3b82f6',
  momentum:   '#f97316',
  push:       '#a855f7',
  final:      '#22c55e',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
    padding: '5px 12px', borderRadius: 20,
    border: `1.5px solid ${active ? color : THEME.border}`,
    background: active ? `${color}18` : THEME.paper,
    color: active ? color : THEME.textSoft,
    fontSize: 11, fontWeight: active ? 700 : 500,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
  }
}

function activityTip(phase, weeksLeft, goalName) {
  if (weeksLeft === 0) return `This is the final week — bring everything together and complete your goal. You've got this!`
  if (weeksLeft === 1 && phase !== 'final') return `One week left! Push hard — don't ease off now. Every action counts.`
  if (phase === 'foundation') return `You are in the foundation phase. Build habits and systems now — they carry the rest of the journey.`
  if (phase === 'momentum') return `Momentum phase — consistency is your superpower here. Show up even on the tough days.`
  if (phase === 'push') return `This is the push phase — intensity matters. Identify your highest-impact action and do that first.`
  return `Final sprint — stay focused, close the gap, and finish what you started.`
}

function OtherActivityResult({ data, onBack }) {
  const {
    goalName, goalCategoryName,
    targetDate, totalWeeks, hoursPerWeek, studyTime,
    targetLabel, totalHours, currentStatus,
    isSavingsGoal, targetAmount, currentSavedAmount, currency, remaining, weeklySavingsTarget,
    milestones, weeks,
  } = data

  const [expandedWeek, setExpandedWeek]   = useState(0)
  const [expandedDay,  setExpandedDay]    = useState(null)
  const [activePhase,  setActivePhase]    = useState(null)

  const handleDownloadPdf = async () => {
    await downloadSchedulePdf({ planType: 'other-activity', data })
  }

  const filteredWeeks = activePhase
    ? weeks.filter((w) => w.phase === activePhase)
    : weeks

  const doneWeeks = weeks.filter((w) => new Date(w.weekEnd) < new Date()).length
  const progressPct = Math.min(100, currentStatus + Math.round((doneWeeks / totalWeeks) * (100 - currentStatus)))
  const plannedMinutesToday = Math.max(0, Math.round(((hoursPerWeek || 0) / Math.max(1, data?.weeklyCommitmentDays?.length || 3)) * 60))

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', background: THEME.page, borderRadius: 22, padding: '1rem', border: `1px solid ${THEME.border}` }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: ACCENT_DARK, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: THEME.text, letterSpacing: '-0.4px' }}>
            Personal Goal Plan
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: THEME.textSoft }}>
            Week-by-week · {goalCategoryName} · action-driven
          </p>
        </div>
        <div style={{ padding: '5px 14px', background: ACCENT_RGBA(0.08), border: `1px solid ${ACCENT_RGBA(0.25)}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: ACCENT_DARK, flexShrink: 0 }}>
          {goalName}
        </div>
      </div>

      <StudySessionTracker
        label={goalName || 'Other Activity'}
        moduleName={goalName || 'Other Activity'}
        sessionType="learn"
        studyPlanId={data?.studyPlanId || null}
        plannedMinutesToday={plannedMinutesToday}
      />

      {/* ── Summary banner ── */}
      <div style={{ background: `linear-gradient(135deg, #9a3412 0%, #c2410c 55%, #f97316 100%)`, border: `1px solid ${ACCENT_DARK}`, borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT_RGBA(0.1)} 0%, transparent 70%)` }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {goalCategoryName}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
              {goalName}
            </h3>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.86)' }}>Overall progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{progressPct}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: GRADIENT, borderRadius: 99, transition: 'width 0.5s' }} />
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
              Deadline: <span style={{ color: ACCENT, fontWeight: 600 }}>
                {new Date(targetDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {' · '}<span style={{ color: 'rgba(255,255,255,0.88)' }}>
                {studyTime === 'morning' ? '🌅 Morning sessions' : '🌙 Evening sessions'}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Weeks',    value: totalWeeks },
              { label: 'Hrs/Week', value: `${hoursPerWeek}h` },
              { label: 'Total',    value: `${totalHours}h` },
              { label: 'Target',   value: isSavingsGoal && targetAmount ? `${currency}${Number(targetAmount).toLocaleString()}` : targetLabel },
            ].map((s) => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.86)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Savings tracker (financial goals) ── */}
      {isSavingsGoal && targetAmount > 0 && (
        <div style={{ background: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text, marginBottom: '1rem' }}>💰 Savings Progress</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { label: 'Target',        value: `${currency}${Number(targetAmount).toLocaleString()}` },
              { label: 'Saved so far',  value: `${currency}${Number(currentSavedAmount).toLocaleString()}` },
              { label: 'Still needed',  value: `${currency}${Number(remaining).toLocaleString()}` },
              { label: 'Per week',      value: weeklySavingsTarget ? `${currency}${weeklySavingsTarget.toLocaleString()}` : '—' },
            ].map((s) => (
              <div key={s.label} style={{ flex: '1 1 120px', background: THEME.paperSoft, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{s.value}</div>
                <div style={{ fontSize: 11, color: THEME.textSoft, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, background: THEME.paperSoft, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round((currentSavedAmount / targetAmount) * 100))}%`, background: GRADIENT, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: THEME.textSoft }}>{currency}0</span>
            <span style={{ fontSize: 10, color: ACCENT, fontWeight: 600 }}>{Math.round((currentSavedAmount / targetAmount) * 100)}% saved</span>
            <span style={{ fontSize: 10, color: THEME.textSoft }}>{currency}{Number(targetAmount).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Milestones ── */}
      {milestones && milestones.length > 0 && (
        <div style={{ background: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text, marginBottom: '1rem' }}>🎯 Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {milestones.map((m, i) => {
              const pct = Math.round(((i + 1) / milestones.length) * 100)
              const done = progressPct >= pct
              return (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? ACCENT_RGBA(0.15) : THEME.paperSoft, border: `2px solid ${done ? ACCENT : THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
                    {done
                      ? <svg width="12" height="12" fill="none" stroke={ACCENT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      : <span style={{ fontSize: 10, fontWeight: 700, color: THEME.textSoft }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: done ? 700 : 500, color: done ? THEME.text : THEME.textSoft }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: THEME.textFaint, marginLeft: 8 }}>week ~{m.week}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: done ? ACCENT_DARK : THEME.textSoft, background: done ? ACCENT_RGBA(0.08) : THEME.paperSoft, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Phase filter ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: THEME.textSoft, marginRight: 4 }}>Phase:</span>
        <button onClick={() => setActivePhase(null)} style={filterBtn(activePhase === null, ACCENT)}>All Phases</button>
        {Object.entries({ foundation: '🏗️ Foundation', momentum: '🔥 Momentum', push: '⚡ Push', final: '🏁 Final Sprint' }).map(([id, label]) => (
          <button key={id} onClick={() => setActivePhase(activePhase === id ? null : id)} style={filterBtn(activePhase === id, PHASE_COLORS[id])}>
            <span style={{ marginRight: 2 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Week-by-week accordion ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredWeeks.map((week) => {
          const wIdx    = weeks.indexOf(week)
          const isOpen  = expandedWeek === wIdx

          return (
            <div key={wIdx} style={{ background: THEME.paper, border: isOpen ? `1px solid ${week.color}44` : `1px solid ${THEME.border}`, borderLeft: `4px solid ${isOpen ? week.color : THEME.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <button
                onClick={() => { setExpandedWeek(isOpen ? null : wIdx); setExpandedDay(null) }}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.9rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
              >
                {/* Week badge */}
                <div style={{ width: 52, height: 48, borderRadius: 12, flexShrink: 0, background: isOpen ? `${week.color}15` : THEME.paperSoft, border: `1.5px solid ${isOpen ? week.color + '55' : THEME.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: isOpen ? week.color : THEME.textSoft, fontWeight: 700, lineHeight: 1 }}>WK</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: isOpen ? week.color : THEME.text, lineHeight: 1.1 }}>{week.weekNumber}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: THEME.text }}>Week {week.weekNumber}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: week.color, background: `${week.color}18`, padding: '2px 8px', borderRadius: 20 }}>
                      {week.phaseIcon} {week.phaseLabel}
                    </span>
                    {week.isMilestoneWeek && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${ACCENT_RGBA(0.12)}`, color: ACCENT }}>
                        🎯 {week.milestone}
                      </span>
                    )}
                    {week.isDeadlineWeek && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(249,115,22,0.12)', color: ACCENT_DARK }}>
                        🏁 Goal Deadline
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textSoft }}>
                    {fmtShort(week.weekStart)} – {fmtShort(week.weekEnd)}
                    {' · '}{week.days.length} action day{week.days.length !== 1 ? 's' : ''}
                    {' · '}{week.weeksLeft} week{week.weeksLeft !== 1 ? 's' : ''} left
                    {week.weeklySavingsTarget ? ` · Save ${currency}${week.weeklySavingsTarget.toLocaleString()} this week` : ''}
                  </div>
                </div>

                <svg width="16" height="16" fill="none" stroke={THEME.textFaint} strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded week */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${week.color}22`, padding: '0.75rem 1.25rem 1.25rem' }}>

                  {/* Phase tip */}
                  <div style={{ background: THEME.paperSoft, border: `1px solid ${week.color}22`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{week.phaseIcon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: week.color, marginBottom: 2 }}>{week.phaseLabel} — {week.phaseDesc}</div>
                      <span style={{ fontSize: 11, color: THEME.textSoft, lineHeight: 1.6 }}>
                        {activityTip(week.phase, week.weeksLeft, goalName)}
                      </span>
                    </div>
                  </div>

                  {/* Savings reminder for financial goals */}
                  {week.weeklySavingsTarget && (
                    <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: 15 }}>💰</span>
                      <span style={{ fontSize: 12, color: ACCENT_DARK, fontWeight: 600 }}>
                        Save <strong>{currency}{week.weeklySavingsTarget.toLocaleString()}</strong> this week to stay on track
                      </span>
                    </div>
                  )}

                  {/* Milestone banner */}
                  {week.isMilestoneWeek && (
                    <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: 15 }}>🎯</span>
                      <span style={{ fontSize: 12, color: ACCENT_DARK, fontWeight: 600 }}>
                        Milestone this week: <strong>{week.milestone}</strong>
                      </span>
                    </div>
                  )}

                  {/* Action days */}
                  {week.days.length === 0 && (
                    <div style={{ fontSize: 12, color: THEME.textSoft, padding: '0.5rem 0' }}>No action days this week — rest or catch up.</div>
                  )}
                  {week.days.map((day) => {
                    const dKey   = `${wIdx}-${day.dayNumber}`
                    const dOpen  = expandedDay === dKey
                    return (
                      <div key={day.dayNumber} style={{ background: THEME.paperSoft, border: dOpen ? `1px solid ${week.color}44` : `1px solid ${THEME.border}`, borderRadius: 12, marginBottom: '0.4rem', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                        <button
                          onClick={() => setExpandedDay(dOpen ? null : dKey)}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: dOpen ? `${week.color}15` : THEME.paper, border: `1.5px solid ${dOpen ? week.color + '55' : THEME.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: dOpen ? week.color : THEME.textSoft, fontWeight: 700, lineHeight: 1 }}>{day.dayName}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: dOpen ? week.color : THEME.text, lineHeight: 1 }}>{fmtShort(day.date).split(' ')[0]}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, marginBottom: 2 }}>
                              Day {day.dayNumber} · {fmtFull(day.date)}
                            </div>
                            <div style={{ fontSize: 11, color: THEME.textSoft }}>
                              {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''} · {day.hoursPlanned}h
                            </div>
                          </div>
                          <svg width="14" height="14" fill="none" stroke={THEME.textFaint} strokeWidth="2" viewBox="0 0 24 24" style={{ transform: dOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {dOpen && (
                          <div style={{ borderTop: `1px solid ${week.color}22`, padding: '0.6rem 1rem 0.9rem' }}>
                            {day.sessions.map((s, si) => (
                              <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: THEME.paper, borderRadius: 10, padding: '9px 12px', marginBottom: '0.35rem' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: `${week.color}18`, border: `1.5px solid ${week.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: week.color, marginTop: 1 }}>{si + 1}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, marginBottom: 3 }}>{s.task}</div>
                                  <div style={{ display: 'flex', gap: 12 }}>
                                    <span style={{ fontSize: 11, color: THEME.textSoft }}>🕐 {s.time}</span>
                                    <span style={{ fontSize: 11, color: THEME.textSoft }}>⏱ {s.duration}h</span>
                                  </div>
                                </div>
                                <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${THEME.border}`, flexShrink: 0, marginTop: 2 }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: '1.5rem', background: THEME.paper, border: `1px solid ${THEME.border}`, borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: THEME.text, marginBottom: 3 }}>
            {goalName} — Plan Ready ✓
          </div>
          <div style={{ fontSize: 12, color: THEME.textSoft }}>
            {totalWeeks} weeks · {hoursPerWeek}h/week · {milestones.length} milestones
            {isSavingsGoal && weeklySavingsTarget ? ` · Save ${currency}${weeklySavingsTarget.toLocaleString()}/week` : ''}
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
            fontWeight: 700,
            cursor: 'pointer',
          }}>Download PDF</button>
          <button onClick={onBack} style={{ background: GRADIENT, border: 'none', borderRadius: 10, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 4px 18px ${ACCENT_RGBA(0.3)}` }}>
            Create Another Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtherActivityResult
