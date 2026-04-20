import { useState } from 'react'
import StudySessionTracker from '../study/StudySessionTracker'

const ACCENT      = '#06b6d4'
const ACCENT_DARK = '#0891b2'
const ACCENT_RGBA = (a) => `rgba(6,182,212,${a})`
const GRADIENT    = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`

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
    border: `1.5px solid ${active ? color : '#2a2a2a'}`,
    background: active ? `${color}18` : '#1a1a1a',
    color: active ? color : '#555',
    fontSize: 11, fontWeight: active ? 700 : 400,
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

  const filteredWeeks = activePhase
    ? weeks.filter((w) => w.phase === activePhase)
    : weeks

  const doneWeeks = weeks.filter((w) => new Date(w.weekEnd) < new Date()).length
  const progressPct = Math.min(100, currentStatus + Math.round((doneWeeks / totalWeeks) * (100 - currentStatus)))
  const plannedMinutesToday = Math.max(0, Math.round(((hoursPerWeek || 0) / Math.max(1, data?.weeklyCommitmentDays?.length || 3)) * 60))

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: '#aaa', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.4px' }}>
            Personal Goal Plan
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
            Week-by-week · {goalCategoryName} · action-driven
          </p>
        </div>
        <div style={{ padding: '5px 14px', background: ACCENT_RGBA(0.12), border: `1px solid ${ACCENT_RGBA(0.3)}`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
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
      <div style={{ background: 'linear-gradient(135deg, #0a1419 0%, #0c1618 100%)', border: '1px solid #0f2027', borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT_RGBA(0.1)} 0%, transparent 70%)` }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {goalCategoryName}
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.4px' }}>
              {goalName}
            </h3>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: '#555' }}>Overall progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>{progressPct}%</span>
              </div>
              <div style={{ height: 6, background: '#1a2a2e', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: GRADIENT, borderRadius: 99, transition: 'width 0.5s' }} />
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
              Deadline: <span style={{ color: ACCENT, fontWeight: 600 }}>
                {new Date(targetDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {' · '}<span style={{ color: '#555' }}>
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
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT, letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Savings tracker (financial goals) ── */}
      {isSavingsGoal && targetAmount > 0 && (
        <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: '1rem' }}>💰 Savings Progress</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { label: 'Target',        value: `${currency}${Number(targetAmount).toLocaleString()}` },
              { label: 'Saved so far',  value: `${currency}${Number(currentSavedAmount).toLocaleString()}` },
              { label: 'Still needed',  value: `${currency}${Number(remaining).toLocaleString()}` },
              { label: 'Per week',      value: weeklySavingsTarget ? `${currency}${weeklySavingsTarget.toLocaleString()}` : '—' },
            ].map((s) => (
              <div key={s.label} style={{ flex: '1 1 120px', background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, background: '#111', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round((currentSavedAmount / targetAmount) * 100))}%`, background: GRADIENT, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#555' }}>{currency}0</span>
            <span style={{ fontSize: 10, color: ACCENT, fontWeight: 600 }}>{Math.round((currentSavedAmount / targetAmount) * 100)}% saved</span>
            <span style={{ fontSize: 10, color: '#555' }}>{currency}{Number(targetAmount).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Milestones ── */}
      {milestones && milestones.length > 0 && (
        <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: '1rem' }}>🎯 Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {milestones.map((m, i) => {
              const pct = Math.round(((i + 1) / milestones.length) * 100)
              const done = progressPct >= pct
              return (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? ACCENT_RGBA(0.15) : '#1e1e1e', border: `2px solid ${done ? ACCENT : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
                    {done
                      ? <svg width="12" height="12" fill="none" stroke={ACCENT} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      : <span style={{ fontSize: 10, fontWeight: 700, color: '#555' }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? '#f0f0f0' : '#888' }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: '#444', marginLeft: 8 }}>week ~{m.week}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: done ? ACCENT : '#444', background: done ? ACCENT_RGBA(0.08) : '#1e1e1e', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Phase filter ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555', marginRight: 4 }}>Phase:</span>
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
            <div key={wIdx} style={{ background: '#1a1a1a', border: isOpen ? `1px solid ${week.color}44` : '1px solid #222', borderLeft: `4px solid ${isOpen ? week.color : '#2a2a2a'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <button
                onClick={() => { setExpandedWeek(isOpen ? null : wIdx); setExpandedDay(null) }}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.9rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
              >
                {/* Week badge */}
                <div style={{ width: 52, height: 48, borderRadius: 12, flexShrink: 0, background: isOpen ? `${week.color}15` : '#1e1e1e', border: `1.5px solid ${isOpen ? week.color + '55' : '#2a2a2a'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: isOpen ? week.color : '#555', fontWeight: 600, lineHeight: 1 }}>WK</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: isOpen ? week.color : '#888', lineHeight: 1.1 }}>{week.weekNumber}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>Week {week.weekNumber}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: week.color, background: `${week.color}18`, padding: '2px 8px', borderRadius: 20 }}>
                      {week.phaseIcon} {week.phaseLabel}
                    </span>
                    {week.isMilestoneWeek && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${ACCENT_RGBA(0.12)}`, color: ACCENT }}>
                        🎯 {week.milestone}
                      </span>
                    )}
                    {week.isDeadlineWeek && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                        🏁 Goal Deadline
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>
                    {fmtShort(week.weekStart)} – {fmtShort(week.weekEnd)}
                    {' · '}{week.days.length} action day{week.days.length !== 1 ? 's' : ''}
                    {' · '}{week.weeksLeft} week{week.weeksLeft !== 1 ? 's' : ''} left
                    {week.weeklySavingsTarget ? ` · Save ${currency}${week.weeklySavingsTarget.toLocaleString()} this week` : ''}
                  </div>
                </div>

                <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded week */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${week.color}22`, padding: '0.75rem 1.25rem 1.25rem' }}>

                  {/* Phase tip */}
                  <div style={{ background: `${week.color}08`, border: `1px solid ${week.color}22`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{week.phaseIcon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: week.color, marginBottom: 2 }}>{week.phaseLabel} — {week.phaseDesc}</div>
                      <span style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>
                        {activityTip(week.phase, week.weeksLeft, goalName)}
                      </span>
                    </div>
                  </div>

                  {/* Savings reminder for financial goals */}
                  {week.weeklySavingsTarget && (
                    <div style={{ background: ACCENT_RGBA(0.07), border: `1px solid ${ACCENT_RGBA(0.2)}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: 15 }}>💰</span>
                      <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>
                        Save <strong>{currency}{week.weeklySavingsTarget.toLocaleString()}</strong> this week to stay on track
                      </span>
                    </div>
                  )}

                  {/* Milestone banner */}
                  {week.isMilestoneWeek && (
                    <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: 15 }}>🎯</span>
                      <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 600 }}>
                        Milestone this week: <strong>{week.milestone}</strong>
                      </span>
                    </div>
                  )}

                  {/* Action days */}
                  {week.days.length === 0 && (
                    <div style={{ fontSize: 12, color: '#555', padding: '0.5rem 0' }}>No action days this week — rest or catch up.</div>
                  )}
                  {week.days.map((day) => {
                    const dKey   = `${wIdx}-${day.dayNumber}`
                    const dOpen  = expandedDay === dKey
                    return (
                      <div key={day.dayNumber} style={{ background: '#111', border: dOpen ? `1px solid ${week.color}44` : '1px solid #1e1e1e', borderRadius: 12, marginBottom: '0.4rem', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                        <button
                          onClick={() => setExpandedDay(dOpen ? null : dKey)}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '0.7rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: dOpen ? `${week.color}18` : '#1a1a1a', border: `1.5px solid ${dOpen ? week.color + '55' : '#2a2a2a'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: dOpen ? week.color : '#555', fontWeight: 600, lineHeight: 1 }}>{day.dayName}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: dOpen ? week.color : '#777', lineHeight: 1 }}>{fmtShort(day.date).split(' ')[0]}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 2 }}>
                              Day {day.dayNumber} · {fmtFull(day.date)}
                            </div>
                            <div style={{ fontSize: 11, color: '#555' }}>
                              {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''} · {day.hoursPlanned}h
                            </div>
                          </div>
                          <svg width="14" height="14" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: dOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {dOpen && (
                          <div style={{ borderTop: `1px solid ${week.color}22`, padding: '0.6rem 1rem 0.9rem' }}>
                            {day.sessions.map((s, si) => (
                              <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#161616', borderRadius: 10, padding: '9px 12px', marginBottom: '0.35rem' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: `${week.color}18`, border: `1.5px solid ${week.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: week.color, marginTop: 1 }}>{si + 1}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 3 }}>{s.task}</div>
                                  <div style={{ display: 'flex', gap: 12 }}>
                                    <span style={{ fontSize: 11, color: '#555' }}>🕐 {s.time}</span>
                                    <span style={{ fontSize: 11, color: '#555' }}>⏱ {s.duration}h</span>
                                  </div>
                                </div>
                                <div style={{ width: 20, height: 20, borderRadius: 6, border: '1.5px solid #333', flexShrink: 0, marginTop: 2 }} />
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
      <div style={{ marginTop: '1.5rem', background: '#1a1a1a', border: '1px solid #242424', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>
            {goalName} — Plan Ready ✓
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            {totalWeeks} weeks · {hoursPerWeek}h/week · {milestones.length} milestones
            {isSavingsGoal && weeklySavingsTarget ? ` · Save ${currency}${weeklySavingsTarget.toLocaleString()}/week` : ''}
          </div>
        </div>
        <button onClick={onBack} style={{ background: GRADIENT, border: 'none', borderRadius: 10, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 4px 18px ${ACCENT_RGBA(0.3)}` }}>
          Create Another Plan
        </button>
      </div>
    </div>
  )
}

export default OtherActivityResult
