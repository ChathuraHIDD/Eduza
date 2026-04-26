import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MusicPlayer.css'

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')

  return `${minutes}:${remainingSeconds}`
}

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  return new AudioContextClass()
}

const makeNoiseBuffer = (audioContext, seconds, filter = 1) => {
  const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * seconds,
    audioContext.sampleRate,
  )
  const data = buffer.getChannelData(0)
  let previous = 0

  for (let index = 0; index < data.length; index += 1) {
    previous = previous * filter + (Math.random() * 2 - 1) * (1 - filter)
    data[index] = previous
  }

  return buffer
}

const startTone = (audioContext, destination, frequency, type, gainValue) => {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = gainValue

  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start()

  return oscillator
}

const scheduleNote = (
  audioContext,
  destination,
  frequency,
  startTime,
  duration,
  gainValue,
  type = 'sine',
) => {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.05)

  return oscillator
}

const createAudioEngine = (track) => {
  const audioContext = getAudioContext()
  const masterGain = audioContext.createGain()
  const activeNodes = []
  let intervalId = null

  masterGain.gain.value = 0.18
  masterGain.connect(audioContext.destination)

  if (track.sound === 'rain') {
    const noise = audioContext.createBufferSource()
    const filter = audioContext.createBiquadFilter()
    const rumble = startTone(audioContext, masterGain, 90, 'sine', 0.08)

    noise.buffer = makeNoiseBuffer(audioContext, 4, 0.72)
    noise.loop = true
    filter.type = 'lowpass'
    filter.frequency.value = 1200
    filter.Q.value = 0.9
    noise.connect(filter)
    filter.connect(masterGain)
    noise.start()
    activeNodes.push(noise, rumble)
  }

  if (track.sound === 'forest') {
    const air = audioContext.createBufferSource()
    const filter = audioContext.createBiquadFilter()
    const drone = startTone(audioContext, masterGain, 196, 'triangle', 0.04)

    air.buffer = makeNoiseBuffer(audioContext, 5, 0.88)
    air.loop = true
    filter.type = 'bandpass'
    filter.frequency.value = 780
    filter.Q.value = 0.45
    air.connect(filter)
    filter.connect(masterGain)
    air.start()
    activeNodes.push(air, drone)

    intervalId = window.setInterval(() => {
      const now = audioContext.currentTime
      const tones = [523.25, 659.25, 783.99, 987.77]
      const frequency = tones[Math.floor(Math.random() * tones.length)]

      activeNodes.push(scheduleNote(audioContext, masterGain, frequency, now, 1.6, 0.03))
    }, 1800)
  }

  if (track.sound === 'lofi' || track.sound === 'piano') {
    const chords =
      track.sound === 'lofi'
        ? [
            [261.63, 329.63, 392],
            [220, 277.18, 329.63],
            [246.94, 311.13, 369.99],
            [196, 246.94, 293.66],
          ]
        : [
            [261.63, 329.63, 392, 523.25],
            [293.66, 349.23, 440, 587.33],
            [329.63, 392, 493.88, 659.25],
            [246.94, 329.63, 392, 493.88],
          ]
    let chordIndex = 0

    const playChord = () => {
      const now = audioContext.currentTime

      chords[chordIndex].forEach((frequency, noteIndex) => {
        activeNodes.push(
          scheduleNote(
            audioContext,
            masterGain,
            frequency,
            now + noteIndex * 0.08,
            track.sound === 'lofi' ? 1.45 : 2.2,
            track.sound === 'lofi' ? 0.045 : 0.06,
            track.sound === 'lofi' ? 'triangle' : 'sine',
          ),
        )
      })
      chordIndex = (chordIndex + 1) % chords.length
    }

    playChord()
    intervalId = window.setInterval(playChord, track.sound === 'lofi' ? 1500 : 2300)
  }

  return {
    stop: () => {
      window.clearInterval(intervalId)
      masterGain.gain.cancelScheduledValues(audioContext.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

      window.setTimeout(() => {
        activeNodes.forEach((node) => {
          try {
            node.stop()
          } catch {
            // Scheduled notes may have already ended.
          }
        })
        audioContext.close()
      }, 180)
    },
  }
}

const MusicPlayer = () => {
  const navigate = useNavigate()
  const [selectedTrack, setSelectedTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const engineRef = useRef(null)
  const startedAtRef = useRef(0)
  const pausedAtRef = useRef(0)
  const animationRef = useRef(null)

  const tracks = useMemo(
    () => [
      {
        id: 1,
        name: 'Lofi Hip Hop',
        artist: 'Chill Beats',
        subtitle: 'Study Mode',
        duration: 330,
        sound: 'lofi',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        emoji: '🎵',
      },
      {
        id: 2,
        name: 'Rain Ambience',
        artist: 'Nature Sounds',
        subtitle: 'Nature Sounds',
        duration: 420,
        sound: 'rain',
        gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
        emoji: '🌧️',
      },
      {
        id: 3,
        name: 'Piano Melodies',
        artist: 'Classical Music',
        subtitle: 'Classical',
        duration: 360,
        sound: 'piano',
        gradient: 'linear-gradient(135deg, #FA8BFF 0%, #F78CE0 100%)',
        emoji: '🎹',
      },
      {
        id: 4,
        name: 'Forest Sounds',
        artist: 'Nature Vibes',
        subtitle: 'Relaxation',
        duration: 390,
        sound: 'forest',
        gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
        emoji: '🌲',
      },
    ],
    [],
  )

  const currentTrack = tracks[selectedTrack]
  const progressPercent = (elapsedSeconds / currentTrack.duration) * 100

  const stopAudio = () => {
    if (engineRef.current) {
      engineRef.current.stop()
      engineRef.current = null
    }
    window.cancelAnimationFrame(animationRef.current)
  }

  const startAudio = (track = currentTrack) => {
    stopAudio()
    engineRef.current = createAudioEngine(track)
    startedAtRef.current = Date.now() - pausedAtRef.current * 1000
    setIsPlaying(true)
  }

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const updateProgress = () => {
      const elapsed = ((Date.now() - startedAtRef.current) / 1000) % currentTrack.duration
      pausedAtRef.current = elapsed
      setElapsedSeconds(elapsed)
      animationRef.current = window.requestAnimationFrame(updateProgress)
    }

    animationRef.current = window.requestAnimationFrame(updateProgress)

    return () => window.cancelAnimationFrame(animationRef.current)
  }, [currentTrack.duration, isPlaying])

  useEffect(() => {
    return () => stopAudio()
  }, [])

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio()
      setIsPlaying(false)
      return
    }

    startAudio()
  }

  const selectTrack = (index) => {
    const shouldKeepPlaying = isPlaying

    stopAudio()
    pausedAtRef.current = 0
    setElapsedSeconds(0)
    setSelectedTrack(index)

    if (shouldKeepPlaying) {
      window.setTimeout(() => startAudio(tracks[index]), 0)
    }
  }

  const goToTrack = (direction) => {
    const nextTrack = (selectedTrack + direction + tracks.length) % tracks.length
    selectTrack(nextTrack)
  }

  return (
    <div className="music-player-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <div className="player-wrapper">
        <div className="player-card" style={{ background: currentTrack.gradient }}>
          <div className="card-circle"></div>
          <div className="player-content">
            <div className="player-emoji">{currentTrack.emoji}</div>
            <h1 className="player-title">{currentTrack.name}</h1>
            <p className="player-artist">{currentTrack.artist}</p>
            <p className="player-subtitle">{currentTrack.subtitle}</p>
          </div>
        </div>

        <div className="controls">
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${progressPercent}%`,
                background: currentTrack.gradient,
              }}
            ></div>
          </div>
          <div className="time-display">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>

          <div className="buttons">
            <button className="control-btn" onClick={() => goToTrack(-1)}>
              <span>⏮</span>
            </button>
            <button
              className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayPause}
              style={{ background: currentTrack.gradient }}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
            </button>
            <button className="control-btn" onClick={() => goToTrack(1)}>
              <span>⏭</span>
            </button>
          </div>
        </div>

        <div className="playlist-section">
          <h2>Playlist</h2>
          <div className="playlist-grid">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`playlist-card ${index === selectedTrack ? 'active' : ''}`}
                style={{ background: track.gradient }}
                onClick={() => selectTrack(index)}
              >
                <div className="playlist-circle"></div>
                <div className="playlist-text">
                  <h3>{track.name}</h3>
                  <p>{track.subtitle}</p>
                </div>
                <div className="playlist-emoji">{track.emoji}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer
