import { useMemo, useState } from 'react'
import { getStoredUser } from '../utils/api'

const QUESTIONS = [
  {
    id: 1,
    dimension: 'EI',
    text: 'You feel more energized after spending time alone than after socializing with many people.',
  },
  {
    id: 2,
    dimension: 'SN',
    text: 'You are more drawn to practical facts than abstract possibilities.',
  },
  {
    id: 3,
    dimension: 'TF',
    text: 'When making decisions, logic matters more to you than personal feelings.',
  },
  {
    id: 4,
    dimension: 'JP',
    text: 'You prefer plans and structure over keeping things open-ended.',
  },
  {
    id: 5,
    dimension: 'EI',
    text: 'Starting conversations with strangers feels easy and natural to you.',
  },
  {
    id: 6,
    dimension: 'SN',
    text: 'You enjoy theories and future ideas more than concrete examples.',
  },
  {
    id: 7,
    dimension: 'TF',
    text: 'You often put empathy ahead of strict fairness when judging a situation.',
  },
  {
    id: 8,
    dimension: 'JP',
    text: 'You work best when deadlines are planned well in advance.',
  },
  {
    id: 9,
    dimension: 'EI',
    text: 'You usually think quietly before sharing your opinion.',
  },
  {
    id: 10,
    dimension: 'SN',
    text: 'You trust intuition and patterns more than direct observation.',
  },
  {
    id: 11,
    dimension: 'TF',
    text: 'You find it easier to stay objective than emotionally involved.',
  },
  {
    id: 12,
    dimension: 'JP',
    text: 'Leaving decisions until the last minute makes you uncomfortable.',
  },
]

const SCALE = [-3, -2, -1, 0, 1, 2, 3]
const QUESTIONS_PER_LEVEL = 4

const TYPE_DETAILS = {
  INTJ: { title: 'Strategic Architect', summary: 'You tend to be future-focused, independent, and strong at building structured plans.' },
  INTP: { title: 'Curious Analyst', summary: 'You tend to explore ideas deeply and enjoy understanding systems and concepts.' },
  ENTJ: { title: 'Focused Commander', summary: 'You tend to be decisive, organized, and comfortable leading toward clear goals.' },
  ENTP: { title: 'Inventive Debater', summary: 'You tend to generate ideas quickly and enjoy challenging assumptions.' },
  INFJ: { title: 'Insightful Guide', summary: 'You tend to be reflective, purposeful, and attentive to deeper meaning.' },
  INFP: { title: 'Thoughtful Idealist', summary: 'You tend to be values-driven, imaginative, and personally authentic.' },
  ENFJ: { title: 'Supportive Mentor', summary: 'You tend to connect well with people and naturally encourage growth in others.' },
  ENFP: { title: 'Creative Explorer', summary: 'You tend to be enthusiastic, curious, and motivated by possibilities.' },
  ISTJ: { title: 'Reliable Organizer', summary: 'You tend to be steady, practical, and dependable in structured work.' },
  ISFJ: { title: 'Steady Supporter', summary: 'You tend to be careful, loyal, and attentive to helping people in practical ways.' },
  ESTJ: { title: 'Structured Executor', summary: 'You tend to be direct, organized, and strong at keeping systems running.' },
  ESFJ: { title: 'Community Builder', summary: 'You tend to be cooperative, people-aware, and committed to group stability.' },
  ISTP: { title: 'Calm Problem Solver', summary: 'You tend to be adaptable, hands-on, and effective under pressure.' },
  ISFP: { title: 'Quiet Creator', summary: 'You tend to be flexible, observant, and guided by your personal values.' },
  ESTP: { title: 'Action Driver', summary: 'You tend to respond quickly, act boldly, and engage well with real situations.' },
  ESFP: { title: 'Energetic Encourager', summary: 'You tend to be lively, social, and naturally engaging with others.' },
}

const STORAGE_PREFIX = 'mbti-measure-results'

function formatHistoryDate(date) {
  return new Date(date).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildStorageKey(user) {
  const identifier = user?._id || user?.id || user?.email || 'guest'
  return `${STORAGE_PREFIX}:${identifier}`
}

function calculateType(answers) {
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 }

  QUESTIONS.forEach((question) => {
    const value = Number(answers[question.id] || 0)
    scores[question.dimension] += value
  })

  const type = [
    scores.EI <= 0 ? 'I' : 'E',
    scores.SN <= 0 ? 'S' : 'N',
    scores.TF <= 0 ? 'T' : 'F',
    scores.JP <= 0 ? 'J' : 'P',
  ].join('')

  return { type, scores }
}

function MBTIMeasure() {
  const user = useMemo(() => getStoredUser(), [])
  const storageKey = useMemo(() => buildStorageKey(user), [user])
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === QUESTIONS.length
  const latestResult = results[0] || null
  const totalLevels = Math.ceil(QUESTIONS.length / QUESTIONS_PER_LEVEL)
  const currentQuestions = QUESTIONS.slice(
    currentLevelIndex * QUESTIONS_PER_LEVEL,
    (currentLevelIndex + 1) * QUESTIONS_PER_LEVEL
  )
  const currentLevelAnswered = currentQuestions.every((question) =>
    Object.prototype.hasOwnProperty.call(answers, question.id)
  )
  const isLastLevel = currentLevelIndex === totalLevels - 1

  const handleSelect = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  const handleGenerate = () => {
    if (!allAnswered) return

    const { type, scores } = calculateType(answers)
    const detail = TYPE_DETAILS[type]
    const record = {
      id: `mbti-${Date.now()}`,
      type,
      title: detail.title,
      summary: detail.summary,
      scores,
      createdAt: new Date().toISOString(),
    }

    const next = [record, ...results]
    setResults(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const handleReset = () => {
    setAnswers({})
    setCurrentLevelIndex(0)
  }

  return (
    <div
      style={{
        minHeight: '100%',
        background:
          'linear-gradient(180deg, #f9fafb 0%, #ffffff 18%, #fbfbfc 100%)',
        padding: '12px 0 36px',
      }}
    >
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 20px' }}>
        <section
          style={{
            textAlign: 'center',
            padding: '34px 0 26px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 16px',
              borderRadius: '999px',
              background: 'radial-gradient(circle at 30% 30%, #34d399 0 18%, transparent 19%), radial-gradient(circle at 68% 32%, #60a5fa 0 14%, transparent 15%), radial-gradient(circle at 33% 66%, #c084fc 0 14%, transparent 15%), radial-gradient(circle at 70% 70%, #f59e0b 0 14%, transparent 15%), #ffffff',
              border: '6px solid #eff6ff',
              boxShadow: '0 10px 24px rgba(148, 163, 184, 0.14)',
            }}
          />
          <h1 style={{ margin: 0, fontSize: '54px', lineHeight: 1.05, color: '#23324d', letterSpacing: '-0.05em', fontWeight: 500 }}>
            Free Personality Test
          </h1>
          <p style={{ margin: '12px 0 0', color: '#6b7280', fontSize: '14px', letterSpacing: '0.02em' }}>
            EDUZA MBTI Measure
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          {[
            {
              step: `Level ${currentLevelIndex + 1}`,
              title: 'Complete this section',
              text: 'Answer honestly and choose the option that feels most natural to you.',
              accent: '#2ea8df',
              bg: '#edf8fd',
            },
            {
              step: 'Level Flow',
              title: 'View detailed results',
              text: 'See your estimated type and a quick summary of your preferences.',
              accent: '#2fb678',
              bg: '#effbf5',
            },
            {
              step: 'Saved Data',
              title: 'Track past attempts',
              text: 'Your results stay saved on this device until you clear them.',
              accent: '#9b7bd3',
              bg: '#f5effc',
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                borderTop: `4px solid ${card.accent}`,
                borderRadius: '18px',
                background: `linear-gradient(180deg, ${card.bg} 0%, #ffffff 56%)`,
                boxShadow: '0 12px 30px rgba(148, 163, 184, 0.12)',
                padding: '18px',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '999px',
                  background: card.accent,
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {card.step}
              </div>
              <div style={{ marginTop: '14px', fontSize: '26px' }}>
                {card.title === 'Complete this section' ? '🧾' : card.title === 'View detailed results' ? '🧠' : '📚'}
              </div>
              <h2 style={{ margin: '10px 0 8px', fontSize: '24px', fontWeight: 500, color: '#1f2937' }}>
                {card.title}
              </h2>
              <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.7, fontSize: '14px' }}>
                {card.text}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            background: '#ffffff',
            borderRadius: '26px',
            boxShadow: '0 12px 34px rgba(148, 163, 184, 0.08)',
            padding: '8px 0 0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '24px 28px 10px',
              borderBottom: '1px solid #eef2f7',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#2ea8df', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Level {currentLevelIndex + 1} of {totalLevels}
                </div>
                <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '15px' }}>
                  Finish this group before moving to the next level.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {Array.from({ length: totalLevels }, (_, index) => {
                  const active = index === currentLevelIndex
                  const completed = QUESTIONS
                    .slice(index * QUESTIONS_PER_LEVEL, (index + 1) * QUESTIONS_PER_LEVEL)
                    .every((question) => Object.prototype.hasOwnProperty.call(answers, question.id))

                  return (
                    <div
                      key={index}
                      style={{
                        minWidth: '96px',
                        borderRadius: '999px',
                        padding: '10px 14px',
                        background: active ? '#edf8fd' : completed ? '#effbf5' : '#f8fafc',
                        border: `1px solid ${active ? '#2ea8df' : completed ? '#86efac' : '#e5e7eb'}`,
                        color: active ? '#2ea8df' : completed ? '#2fb678' : '#94a3b8',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      Level {index + 1}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {currentQuestions.map((question, index) => (
            <div
              key={question.id}
              style={{
                padding: '26px 28px',
                borderTop: index === 0 ? 'none' : '1px solid #eef2f7',
              }}
            >
              <div style={{ marginBottom: '18px', textAlign: 'center', color: '#4b5563', fontSize: '28px', lineHeight: 1.55, fontWeight: 400 }}>
                {question.text}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '74px 1fr 86px',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ textAlign: 'right', color: '#55b88b', fontSize: '18px' }}>Agree</div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '18px',
                    flexWrap: 'wrap',
                  }}
                >
                  {SCALE.map((value) => {
                    const active = answers[question.id] === value
                    const isLeft = value < 0
                    const isNeutral = value === 0
                    const size = Math.abs(value) === 3 ? 30 : Math.abs(value) === 2 ? 24 : 18
                    const borderColor = isNeutral ? '#cbd5e1' : isLeft ? '#55b88b' : '#a675c8'
                    const fillColor = isNeutral ? '#ffffff' : isLeft ? '#55b88b' : '#a675c8'

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleSelect(question.id, value)}
                        style={{
                          width: `${size * 2}px`,
                          height: `${size * 2}px`,
                          borderRadius: '999px',
                          border: `2px solid ${borderColor}`,
                          background: active ? fillColor : '#ffffff',
                          boxShadow: active ? `0 10px 22px ${isNeutral ? 'rgba(148,163,184,0.16)' : isLeft ? 'rgba(85,184,139,0.18)' : 'rgba(166,117,200,0.18)'}` : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        aria-label={`Select ${value} for question ${question.id}`}
                      />
                    )
                  })}
                </div>

                <div style={{ color: '#a675c8', fontSize: '18px' }}>Disagree</div>
              </div>
            </div>
          ))}

          <div
            style={{
              padding: '26px 28px 30px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: '15px' }}>
              {answeredCount}/{QUESTIONS.length} answered
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCurrentLevelIndex((current) => Math.max(0, current - 1))}
                disabled={currentLevelIndex === 0}
                style={{
                  border: '1px solid #e5e7eb',
                  background: currentLevelIndex === 0 ? '#f1f5f9' : '#ffffff',
                  color: currentLevelIndex === 0 ? '#94a3b8' : '#475569',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  cursor: currentLevelIndex === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  color: '#475569',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              {isLastLevel ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!allAnswered}
                  style={{
                    border: 'none',
                    background: allAnswered ? 'linear-gradient(135deg, #9b7bd3 0%, #7c5bb8 100%)' : '#cbd5e1',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    cursor: allAnswered ? 'pointer' : 'not-allowed',
                    boxShadow: allAnswered ? '0 14px 28px rgba(124, 91, 184, 0.18)' : 'none',
                  }}
                >
                  Generate Result
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentLevelIndex((current) => Math.min(totalLevels - 1, current + 1))}
                  disabled={!currentLevelAnswered}
                  style={{
                    border: 'none',
                    background: currentLevelAnswered ? 'linear-gradient(135deg, #9b7bd3 0%, #7c5bb8 100%)' : '#cbd5e1',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    cursor: currentLevelAnswered ? 'pointer' : 'not-allowed',
                    boxShadow: currentLevelAnswered ? '0 14px 28px rgba(124, 91, 184, 0.18)' : 'none',
                  }}
                >
                  Next Level
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginTop: '22px',
          }}
        >
          <div
            style={{
              borderRadius: '24px',
              background: '#ffffff',
              padding: '22px',
              boxShadow: '0 12px 30px rgba(148, 163, 184, 0.08)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Latest Result
            </div>
            {latestResult ? (
              <>
                <div style={{ marginTop: '12px', fontSize: '48px', color: '#2f6f97', fontWeight: 700, letterSpacing: '-0.04em' }}>
                  {latestResult.type}
                </div>
                <div style={{ marginTop: '6px', fontSize: '24px', color: '#1f2937', fontWeight: 600 }}>
                  {latestResult.title}
                </div>
                <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.7 }}>
                  {latestResult.summary}
                </p>
              </>
            ) : (
              <p style={{ margin: '12px 0 0', color: '#6b7280', lineHeight: 1.7 }}>
                Complete the test to see your MBTI estimate here.
              </p>
            )}
          </div>

          <div
            style={{
              borderRadius: '24px',
              background: '#ffffff',
              padding: '22px',
              boxShadow: '0 12px 30px rgba(148, 163, 184, 0.08)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Saved Attempts
            </div>
            <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
              {results.length ? (
                results.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '16px',
                      border: '1px solid #edf2f7',
                      padding: '12px 14px',
                      background: '#fbfcff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <strong style={{ color: '#1f2937' }}>{item.type}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        Attempt
                      </span>
                    </div>
                    <div style={{ marginTop: '4px', color: '#6b7280', fontSize: '14px' }}>{item.title}</div>
                    <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                      Saved on {formatHistoryDate(item.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#6b7280', lineHeight: 1.7 }}>
                  Your saved MBTI attempts will appear here.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MBTIMeasure
