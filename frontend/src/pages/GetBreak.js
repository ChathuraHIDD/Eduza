import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './GetBreak.css'

const GetBreak = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('music')
  const [breaksElapsed, setBreaksElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [pomodoroStudyTime, setPomodoroStudyTime] = useState(25 * 60)
  const [pomodoroBreakTime, setPomodoroBreakTime] = useState(5 * 60)
  const [pomodoroMode, setPomodoroMode] = useState('study')
  const [currentTime, setCurrentTime] = useState(pomodoroStudyTime)
  const timerIntervalRef = useRef(null)

  const musicTracks = [
    { id: 1, name: 'Lofi Hip Hop', subtitle: 'Study Mode', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '🎵' },
    { id: 2, name: 'Rain Ambience', subtitle: 'Nature Sounds', gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', emoji: '🌧️' },
    { id: 3, name: 'Piano Melodies', subtitle: 'Classical', gradient: 'linear-gradient(135deg, #FA8BFF 0%, #F78CE0 100%)', emoji: '🎹' },
    { id: 4, name: 'Forest Sounds', subtitle: 'Relaxation', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)', emoji: '🌲' },
  ]

  const miniGames = [
    { id: 1, name: 'Memory Match', subtitle: 'Brain Teaser', emoji: '🧩', gradient: 'linear-gradient(135deg, #FFD89B 0%, #FF9E64 100%)' },
    { id: 2, name: 'Quick Puzzle', subtitle: 'Brain Game', emoji: '🎯', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)' },
    { id: 3, name: '2048 Game', subtitle: 'Tile Puzzle', emoji: '🎲', gradient: 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)' },
    { id: 4, name: 'Word Game', subtitle: 'Word Search', emoji: '🔤', gradient: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)' },
  ]

  const relaxationTools = [
    { id: 1, name: 'Breathing', subtitle: 'Meditation', emoji: '🫁', slug: 'breathing', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, name: 'Meditation', subtitle: 'Mindfulness', emoji: '🧘', slug: 'meditation', gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)' },
    { id: 3, name: 'Eye Rest', subtitle: 'Visual Care', emoji: '👁️', slug: 'eye-rest', gradient: 'linear-gradient(135deg, #FA8BFF 0%, #F78CE0 100%)' },
    { id: 4, name: 'Progressive Relax', subtitle: 'Body Relax', emoji: '🌬️', slug: 'progressive-relax', gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)' },
  ]

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setTimerRunning(!timerRunning)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setCurrentTime(pomodoroMode === 'study' ? pomodoroStudyTime : pomodoroBreakTime)
  }

  useEffect(() => {
    if (!timerRunning) return undefined

    timerIntervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current)
          setTimerRunning(false)

          if (pomodoroMode === 'study') {
            alert('📚 Study session complete! Time for a break!\n\n✨ Great work! Take a 5-minute break to recharge.')
            setPomodoroMode('break')
            setCurrentTime(pomodoroBreakTime)
          } else {
            alert('⏰ Break time over! Ready to study again?')
            setPomodoroMode('study')
            setCurrentTime(pomodoroStudyTime)
            setBreaksElapsed((prevBreaks) => prevBreaks + 1)
          }
          return prev
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerIntervalRef.current)
  }, [timerRunning, pomodoroMode, pomodoroStudyTime, pomodoroBreakTime])

  return (
    <div className="get-break-container">
      <div className="header-section">
        <h1>Take a Break</h1>
        <p>Recharge your mind with relaxing activities</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
        >
          <span className="tab-icon">🎵</span> Music
        </button>
        <button
          className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          <span className="tab-icon">🎮</span> Games
        </button>
        <button
          className={`tab-btn ${activeTab === 'relaxation' ? 'active' : ''}`}
          onClick={() => setActiveTab('relaxation')}
        >
          <span className="tab-icon">🧘</span> Relaxation
        </button>
        <button
          className={`tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <span className="tab-icon">⏱️</span> Timer
        </button>
      </div>

      <div className="content-wrapper">
        {activeTab === 'music' && (
          <div className="cards-container">
            <div className="cards-grid">
              {musicTracks.map((track) => (
                <div
                  key={track.id}
                  className="premium-card"
                  style={{ background: track.gradient }}
                  onClick={() => navigate('/music-player')}
                >
                  <div className="card-circle"></div>
                  <div className="card-text">
                    <h3>{track.name}</h3>
                    <p>{track.subtitle}</p>
                  </div>
                  <div className="card-emoji">{track.emoji}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="cards-container">
            <div className="cards-grid">
              {miniGames.map((game) => (
                <div
                  key={game.id}
                  className="premium-card"
                  style={{ background: game.gradient }}
                  onClick={() => {
                    if (game.id === 1) navigate('/memory-game')
                    else if (game.id === 2) navigate('/puzzle-game')
                    else if (game.id === 3) navigate('/2048-game')
                    else if (game.id === 4) navigate('/word-game')
                  }}
                >
                  <div className="card-circle"></div>
                  <div className="card-text">
                    <h3>{game.name}</h3>
                    <p>{game.subtitle}</p>
                  </div>
                  <div className="card-emoji">{game.emoji}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'relaxation' && (
          <div className="cards-container">
            <div className="cards-grid">
              {relaxationTools.map((tool) => (
                <div
                  key={tool.id}
                  className="premium-card"
                  style={{ background: tool.gradient }}
                  onClick={() => navigate(`/relaxation/${tool.slug}`)}
                >
                  <div className="card-circle"></div>
                  <div className="card-text">
                    <h3>{tool.name}</h3>
                    <p>{tool.subtitle}</p>
                  </div>
                  <div className="card-emoji">{tool.emoji}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="timer-wrapper">
            <div className="timer-card">
              <div className="timer-mode">
                {pomodoroMode === 'study' ? '📚 Study Time' : '🌟 Break Time'}
              </div>
              <div className="timer-display">{formatTime(currentTime)}</div>
              <p className="timer-description">
                {pomodoroMode === 'study' ? 'Focus on your goals' : 'Relax and recharge'}
              </p>
              <div className="timer-buttons">
                <button className="timer-btn" onClick={startTimer}>
                  {timerRunning ? '⏸ Pause' : '▶ Start'}
                </button>
                <button className="timer-btn reset-btn" onClick={resetTimer}>
                  🔄 Reset
                </button>
              </div>
              <div className="timer-inputs">
                <div className="input-group">
                  <label>Study</label>
                  <input
                    type="number"
                    value={pomodoroStudyTime / 60}
                    onChange={(e) => setPomodoroStudyTime(e.target.value * 60)}
                    disabled={timerRunning}
                    min="1"
                    max="60"
                  />
                  <span>min</span>
                </div>
                <div className="input-group">
                  <label>Break</label>
                  <input
                    type="number"
                    value={pomodoroBreakTime / 60}
                    onChange={(e) => setPomodoroBreakTime(e.target.value * 60)}
                    disabled={timerRunning}
                    min="1"
                    max="30"
                  />
                  <span>min</span>
                </div>
              </div>
              <p className="timer-count">Breaks completed: {breaksElapsed}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GetBreak
