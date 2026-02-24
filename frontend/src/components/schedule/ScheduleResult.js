import { useState } from 'react'

const INTENSITY_LABELS = { 4: 'Very High', 3: 'High', 2: 'Moderate', 1: 'Basic' }
const INTENSITY_COLORS = { 4: '#ef4444', 3: '#f97316', 2: '#eab308', 1: '#22c55e' }

function ScheduleResult({ data, onBack }) {
  const [expandedDay, setExpandedDay] = useState(0)

  const {
    subject, dueDate, totalDays, hoursPerDay,
    studyTime, targetLabel, intensity,
    totalHours, phases, days,
  } = data

  const dueDateStr = dueDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            color: '#aaa', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.4px' }}>
            Your Assignment Schedule
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>AI-generated · personalised to your goals</p>
        </div>
      </div>

      {/* Summary banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #1e1408 100%)',
        border: '1px solid #2a2010',
        borderRadius: 18,
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Assignment
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.5px' }}>
              {subject}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
              Due: <span style={{ color: '#f97316', fontWeight: 600 }}>{dueDateStr}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Days', value: totalDays },
              { label: 'Hrs/Day', value: `${hoursPerDay}h` },
              { label: 'Total', value: `${totalHours}h` },
              { label: 'Target', value: targetLabel },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '10px 16px', textAlign: 'center',
                minWidth: 70,
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Tag color="#f97316" label={`${studyTime === 'morning' ? '🌅 Morning' : '🌙 Night'} sessions`} />
          <Tag
            color={INTENSITY_COLORS[intensity]}
            label={`${INTENSITY_LABELS[intensity]} intensity`}
          />
          <Tag color="#3b82f6" label={`${phases.length} study phases`} />
        </div>
      </div>

      {/* Phase overview */}
      <div style={{
        background: '#1a1a1a', border: '1px solid #242424',
        borderRadius: 16, padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: '1rem' }}>
          Study Phase Breakdown
        </div>

        {/* Phase bar */}
        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: '1rem', gap: 2 }}>
          {phases.map((p) => (
            <div key={p.phase} style={{
              flex: p.dayCount,
              background: p.color,
              opacity: 0.85,
            }} />
          ))}
        </div>

        {/* Phase legend */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {phases.map((p) => (
            <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
              <span style={{ fontSize: 12, color: '#888' }}>
                {p.label}
                <span style={{ color: '#555', marginLeft: 4 }}>({p.dayCount}d)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day schedule */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {days.map((day, i) => {
          const isOpen = expandedDay === i

          return (
            <div
              key={i}
              style={{
                background: '#1a1a1a',
                border: isOpen ? `1px solid ${day.color}44` : '1px solid #222',
                borderLeft: `4px solid ${isOpen ? day.color : '#2a2a2a'}`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Day header — always visible */}
              <button
                onClick={() => setExpandedDay(isOpen ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '1rem 1.25rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  textAlign: 'left',
                }}
              >
                {/* Day number circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: isOpen ? day.bg : '#1e1e1e',
                  border: `1.5px solid ${isOpen ? day.color + '55' : '#2a2a2a'}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: isOpen ? day.color : '#555', fontWeight: 600, lineHeight: 1 }}>
                    {day.date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: isOpen ? day.color : '#888', lineHeight: 1 }}>
                    {day.date.getDate()}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>
                      Day {day.dayNumber}
                      {day.isToday && <span style={{ fontSize: 11, color: '#f97316', marginLeft: 6 }}>(Today)</span>}
                      {day.isLast && <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 6 }}>(Deadline)</span>}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                      background: day.bg, color: day.color,
                    }}>{day.phaseLabel}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                    {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {' · '}{day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                    {' · '}{day.hoursPlanned}h planned
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  width="16" height="16" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded sessions */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${day.color}22`, padding: '0.75rem 1.25rem 1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {day.sessions.map((session, si) => (
                      <div key={si} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '1rem',
                        background: '#111', borderRadius: 10, padding: '10px 14px',
                      }}>
                        {/* Session number */}
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: day.bg, border: `1.5px solid ${day.color}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: day.color,
                          marginTop: 1,
                        }}>{si + 1}</div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginBottom: 3 }}>
                            {session.task}
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: 11, color: '#555' }}>
                              🕐 {session.time}
                            </span>
                            <span style={{ fontSize: 11, color: '#555' }}>
                              ⏱ {session.duration}h
                            </span>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <div style={{
                          width: 20, height: 20, borderRadius: 6,
                          border: `1.5px solid #333`, flexShrink: 0,
                          marginTop: 2,
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Daily tip */}
                  <div style={{
                    marginTop: '0.75rem',
                    background: `${day.color}08`,
                    border: `1px solid ${day.color}22`,
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <svg width="14" height="14" fill="none" stroke={day.color} strokeWidth="2" viewBox="0 0 24 24" style={{ marginTop: 1, flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>
                      {getDailyTip(day.phase, day.dayNumber, day.isLast)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{
        marginTop: '1.5rem',
        background: '#1a1a1a', border: '1px solid #242424',
        borderRadius: 14, padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>
            Schedule generated successfully ✓
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            Follow this plan consistently to reach your target of {targetLabel}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            border: 'none', borderRadius: 10,
            color: '#fff', padding: '10px 20px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(249,115,22,0.3)',
          }}
        >
          Create Another Plan
        </button>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function Tag({ color, label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      background: `${color}18`, color: color,
    }}>{label}</span>
  )
}

function getDailyTip(phase, dayNum, isLast) {
  if (isLast) return 'Final day — submit your work before the deadline. Do a last read-through and ensure the file is properly named and formatted.'
  const tips = {
    research: [
      'Use at least 3 credible sources. Academic journals and official documentation are ideal.',
      'Take notes as you research — highlight quotes you may want to cite later.',
      'Don\'t get lost in research. Set a timer and move on when the session ends.',
    ],
    understanding: [
      'Explaining concepts to yourself out loud is one of the most effective ways to truly understand them.',
      'Compare your understanding against the marking criteria — are you covering all required areas?',
    ],
    core: [
      'Write first, edit later. Getting ideas on paper is more important than perfection in early drafts.',
      'Use the Pomodoro technique — 25 min focus, 5 min break — to maintain concentration.',
      'Check your word count regularly but don\'t let it restrict your thinking.',
    ],
    review: [
      'Reading your work aloud helps catch awkward phrasing and logical gaps.',
      'Use the assignment rubric as a checklist — every mark criterion should be addressed.',
    ],
    polish: [
      'Check file format requirements before submitting. PDF vs DOCX matters.',
      'Submit a few hours early — never wait until the last minute in case of technical issues.',
    ],
  }
  const pool = tips[phase] || tips.core
  return pool[dayNum % pool.length]
}

export default ScheduleResult
