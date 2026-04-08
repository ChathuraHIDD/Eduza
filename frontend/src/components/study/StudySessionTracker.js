import { useCallback, useEffect, useRef, useState } from 'react'
import { createNotification } from '../../utils/notificationApi'
import {
  getStudySessions,
  pauseStudySession,
  resumeStudySession,
  startStudySession,
  stopStudySession,
} from '../../utils/studySessionApi'

const ACTIVE_SESSION_STORAGE_KEY = 'eduza_active_study_session'
const ORANGE_DARK = '#c2410c'
const ORANGE_BASE = '#f97316'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function formatMinutes(totalMinutes) {
  const safeMinutes = Math.max(0, Math.round(totalMinutes || 0))
  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function buildNotificationMessage({ label, workedMinutes, plannedMinutes }) {
  if (!plannedMinutes) {
    return `${label}: worked ${formatMinutes(workedMinutes)} so far.`
  }

  const remainingMinutes = Math.max(0, plannedMinutes - workedMinutes)
  return `${label}: worked ${formatMinutes(workedMinutes)} of ${formatMinutes(plannedMinutes)} today, ${formatMinutes(remainingMinutes)} left today.`
}

export default function StudySessionTracker({
  label,
  moduleName,
  sessionType = 'learn',
  studyPlanId = null,
  moduleId = null,
  plannedMinutesToday = 0,
}) {
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('idle')
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const lastCheckpointBucketRef = useRef(0)
  const tickRef = useRef(null)
  const restoredRef = useRef(false)

  const sessionLabel = label || moduleName || 'Study session'
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const workedMinutes = Math.ceil(seconds / 60)
  const remainingMinutes = Math.max(0, Math.round(Number(plannedMinutesToday || 0) - workedMinutes))

  const buttonBaseStyle = {
    borderRadius: 10,
    padding: '9px 14px',
    fontWeight: 800,
    cursor: loading ? 'not-allowed' : 'pointer',
  }

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    background: `linear-gradient(135deg, ${ORANGE_BASE}, ${ORANGE_DARK})`,
    color: '#fff',
    border: 'none',
  }

  const secondaryButtonStyle = {
    ...buttonBaseStyle,
    background: '#fff',
    color: ORANGE_DARK,
    border: `1.5px solid ${ORANGE_BASE}`,
  }

  const sendNotification = useCallback(async (titleSuffix, effectiveSeconds) => {
    try {
      await createNotification({
        channel: 'IN_APP',
        title: `${sessionLabel} ${titleSuffix}`,
        message: buildNotificationMessage({
          label: sessionLabel,
          workedMinutes: Math.ceil(effectiveSeconds / 60),
          plannedMinutes: Number(plannedMinutesToday || 0),
        }),
      })
    } catch {
      // Notifications should never block study tracking.
    }
  }, [plannedMinutesToday, sessionLabel])

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
  }, [])

  const saveLocalSession = useCallback((next) => {
    const payload = {
      sessionId: next.sessionId,
      status: next.status,
      seconds: next.seconds,
      moduleName,
      studyPlanId,
      moduleId,
      sessionLabel,
      updatedAt: Date.now(),
    }
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload))
  }, [moduleId, moduleName, sessionLabel, studyPlanId])

  useEffect(() => {
    if (!isRunning) return undefined

    tickRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(tickRef.current)
  }, [isRunning])

  useEffect(() => {
    const bucket = Math.floor(seconds / 900)
    if (!isRunning) return
    if (bucket <= 0 || bucket === lastCheckpointBucketRef.current) return

    lastCheckpointBucketRef.current = bucket
    sendNotification('time update', seconds)
  }, [isRunning, seconds, sendNotification])

  useEffect(() => {
    if (!sessionId || status === 'idle' || status === 'completed') return
    saveLocalSession({ sessionId, status, seconds })
  }, [saveLocalSession, seconds, sessionId, status])

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    const restore = async () => {
      if (!moduleName) return

      try {
        const cached = JSON.parse(localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY) || 'null')
        const sameModule =
          cached &&
          cached.moduleName === moduleName &&
          String(cached.studyPlanId || '') === String(studyPlanId || '')

        if (sameModule && cached.sessionId) {
          setSessionId(cached.sessionId)
          setStatus(cached.status || 'idle')
          setSeconds(Math.max(0, Number(cached.seconds || 0)))
        }
      } catch {
        // Ignore invalid local cache
      }

      try {
        const sessions = await getStudySessions({ moduleName, studyPlanId, limit: 20 })
        const existing = Array.isArray(sessions)
          ? sessions.find((session) => session.status === 'running' || session.status === 'paused')
          : null

        if (!existing) {
          clearLocalSession()
          setSessionId('')
          setStatus('idle')
          setSeconds(0)
          return
        }

        const startedAt = new Date(existing.startTime).getTime()
        const pausedMinutes = Number(existing.totalPausedMinutes || 0)
        const currentMinutes = existing.status === 'paused'
          ? Number(existing.durationMinutes || 0)
          : Math.max(0, Math.round((Date.now() - startedAt) / 60000 - pausedMinutes))

        setSessionId(existing._id)
        setSeconds(Math.max(0, currentMinutes * 60))
        setStatus(existing.status)
        saveLocalSession({
          sessionId: existing._id,
          status: existing.status,
          seconds: Math.max(0, currentMinutes * 60),
        })
      } catch {
        // ignore restore failures
      }
    }

    restore()
  }, [clearLocalSession, moduleName, saveLocalSession, studyPlanId])

  const start = async () => {
    setError('')
    setLoading(true)
    try {
      const session = await startStudySession({
        moduleName,
        sessionType,
        studyPlanId,
        moduleId,
        plannedMinutesToday,
      })

      setSessionId(session._id)
      setSeconds(0)
      setStatus('running')
      lastCheckpointBucketRef.current = 0
      saveLocalSession({ sessionId: session._id, status: 'running', seconds: 0 })
      await sendNotification('started', 0)
    } catch (nextError) {
      setError(nextError?.message || 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const pause = async () => {
    if (!sessionId) return
    setError('')
    setLoading(true)
    try {
      const session = await pauseStudySession(sessionId)
      setSeconds(Math.max(0, Number(session?.durationMinutes || workedMinutes) * 60))
      setStatus('paused')
      saveLocalSession({
        sessionId,
        status: 'paused',
        seconds: Math.max(0, Number(session?.durationMinutes || workedMinutes) * 60),
      })
      await sendNotification('paused', Math.max(0, Number(session?.durationMinutes || workedMinutes) * 60))
    } catch (nextError) {
      setError(nextError?.message || 'Failed to pause session')
    } finally {
      setLoading(false)
    }
  }

  const resume = async () => {
    if (!sessionId) return
    setError('')
    setLoading(true)
    try {
      const session = await resumeStudySession(sessionId)
      const currentMinutes = Math.max(0, Number(session?.durationMinutes || workedMinutes))
      setSeconds(currentMinutes * 60)
      setStatus('running')
      lastCheckpointBucketRef.current = Math.floor(currentMinutes / 15)
      saveLocalSession({ sessionId, status: 'running', seconds: currentMinutes * 60 })
      await sendNotification('resumed', currentMinutes * 60)
    } catch (nextError) {
      setError(nextError?.message || 'Failed to resume session')
    } finally {
      setLoading(false)
    }
  }

  const stop = async () => {
    if (!sessionId) return
    setError('')
    setLoading(true)
    try {
      const stopped = await stopStudySession(sessionId, {
        createProgressLog: false,
      })

      const currentMinutes = Math.max(0, Number(stopped?.durationMinutes || workedMinutes))
      setSeconds(0)
      setStatus('idle')
      setSessionId('')
      lastCheckpointBucketRef.current = 0
      clearLocalSession()
      await sendNotification('completed', currentMinutes * 60)
    } catch (nextError) {
      setError(nextError?.message || 'Failed to stop session')
    } finally {
      setLoading(false)
    }
  }

  const startFromBeginning = async () => {
    setError('')
    setLoading(true)

    try {
      if (sessionId) {
        await stopStudySession(sessionId, { createProgressLog: false })
      }

      const freshSession = await startStudySession({
        moduleName,
        sessionType,
        studyPlanId,
        moduleId,
        plannedMinutesToday,
      })

      setSessionId(freshSession._id)
      setSeconds(0)
      setStatus('running')
      lastCheckpointBucketRef.current = 0
      saveLocalSession({ sessionId: freshSession._id, status: 'running', seconds: 0 })
      await sendNotification('started from beginning', 0)
    } catch (nextError) {
      setError(nextError?.message || 'Failed to restart session from beginning')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e8ecf4',
      borderRadius: 16,
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Study tracker</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{sessionLabel}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Planned today: <span style={{ color: '#f97316', fontWeight: 700 }}>{formatMinutes(plannedMinutesToday)}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e' }}>{formatDuration(seconds)}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            {isRunning ? 'Running' : isPaused ? 'Paused' : status === 'completed' ? 'Completed' : 'Ready'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {status === 'idle' || status === 'completed' ? (
          <button
            type="button"
            onClick={start}
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading ? 'Starting...' : 'Start'}
          </button>
        ) : null}

        {isRunning && (
          <button
            type="button"
            onClick={pause}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            {loading ? 'Pausing...' : 'Pause'}
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            onClick={resume}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            {loading ? 'Resuming...' : 'Resume'}
          </button>
        )}

        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={stop}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            {loading ? 'Stopping...' : 'Stop'}
          </button>
        )}

        <button
          type="button"
          onClick={startFromBeginning}
          disabled={loading}
          style={primaryButtonStyle}
        >
          {loading ? 'Please wait...' : 'Start from beginning'}
        </button>

        <div style={{ fontSize: 12, color: '#6b7280' }}>
          Remaining today: <span style={{ color: '#1a1a2e', fontWeight: 700 }}>{formatMinutes(remainingMinutes)}</span>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>{error}</div>
      )}

      {sessionId && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
          Session ID: {sessionId}
        </div>
      )}
    </div>
  )
}
