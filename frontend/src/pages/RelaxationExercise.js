import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './RelaxationExercise.css'

const EXERCISES = {
  breathing: {
    title: 'Breathing',
    subtitle: 'Box breathing exercise',
    emoji: '🫁',
    duration: 180,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    phases: [
      { label: 'Breathe in', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Breathe out', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
    steps: ['Sit comfortably', 'Relax your shoulders', 'Follow the breathing circle'],
  },
  meditation: {
    title: 'Meditation',
    subtitle: 'Mindfulness timer',
    emoji: '🧘',
    duration: 300,
    gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    phases: [
      { label: 'Notice your breath', seconds: 20 },
      { label: 'Let thoughts pass', seconds: 20 },
      { label: 'Return gently', seconds: 20 },
    ],
    steps: ['Keep your gaze soft', 'Let your breathing settle', 'Return attention without judging'],
  },
  'eye-rest': {
    title: 'Eye Rest',
    subtitle: '20-20-20 visual care',
    emoji: '👁️',
    duration: 120,
    gradient: 'linear-gradient(135deg, #FA8BFF 0%, #F78CE0 100%)',
    phases: [
      { label: 'Look far away', seconds: 20 },
      { label: 'Close your eyes', seconds: 10 },
      { label: 'Blink slowly', seconds: 10 },
    ],
    steps: ['Look at something distant', 'Soften your face', 'Blink naturally before returning'],
  },
  'progressive-relax': {
    title: 'Progressive Relax',
    subtitle: 'Body relaxation',
    emoji: '🌬️',
    duration: 240,
    gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    phases: [
      { label: 'Relax your jaw', seconds: 20 },
      { label: 'Drop your shoulders', seconds: 20 },
      { label: 'Release your hands', seconds: 20 },
      { label: 'Soften your legs', seconds: 20 },
    ],
    steps: ['Tense gently for a moment', 'Release slowly', 'Notice the difference'],
  },
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getCurrentPhase = (exercise, elapsedSeconds) => {
  const cycleLength = exercise.phases.reduce((total, phase) => total + phase.seconds, 0)
  const cycleSecond = elapsedSeconds % cycleLength
  let cursor = 0

  for (const phase of exercise.phases) {
    cursor += phase.seconds
    if (cycleSecond < cursor) {
      return phase.label
    }
  }

  return exercise.phases[0].label
}

const RelaxationExercise = () => {
  const navigate = useNavigate()
  const { exerciseSlug } = useParams()
  const exercise = EXERCISES[exerciseSlug] || EXERCISES.breathing
  const [remainingSeconds, setRemainingSeconds] = useState(exercise.duration)
  const [isRunning, setIsRunning] = useState(false)

  const elapsedSeconds = exercise.duration - remainingSeconds
  const progressPercent = ((elapsedSeconds / exercise.duration) * 100).toFixed(2)
  const currentPhase = useMemo(
    () => getCurrentPhase(exercise, elapsedSeconds),
    [elapsedSeconds, exercise],
  )

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer)
          setIsRunning(false)
          return 0
        }

        return seconds - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning])

  const resetExercise = () => {
    setIsRunning(false)
    setRemainingSeconds(exercise.duration)
  }

  const toggleExercise = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(exercise.duration)
    }
    setIsRunning((running) => !running)
  }

  return (
    <div className="relaxation-page">
      <button className="relaxation-back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <main className="relaxation-panel" style={{ background: exercise.gradient }}>
        <div className="relaxation-orb" style={{ transform: isRunning ? 'scale(1.14)' : 'scale(1)' }}>
          <span>{exercise.emoji}</span>
        </div>

        <p className="relaxation-kicker">{exercise.subtitle}</p>
        <h1>{exercise.title}</h1>
        <div className="relaxation-phase">{remainingSeconds === 0 ? 'Complete' : currentPhase}</div>
        <div className="relaxation-time">{formatTime(remainingSeconds)}</div>

        <div className="relaxation-progress" aria-label="Exercise progress">
          <div style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="relaxation-steps">
          {exercise.steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>

        <div className="relaxation-actions">
          <button onClick={toggleExercise}>
            {isRunning ? 'Pause' : remainingSeconds === 0 ? 'Restart' : 'Start'}
          </button>
          <button onClick={resetExercise}>Reset</button>
        </div>
      </main>
    </div>
  )
}

export default RelaxationExercise
