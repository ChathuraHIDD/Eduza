import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MusicPlayer.css'

const MusicPlayer = () => {
  const navigate = useNavigate()
  const [selectedTrack, setSelectedTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const tracks = [
    {
      id: 1,
      name: 'Lofi Hip Hop',
      artist: 'Chill Beats',
      subtitle: 'Study Mode',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      emoji: '🎵',
    },
    {
      id: 2,
      name: 'Rain Ambience',
      artist: 'Nature Sounds',
      subtitle: 'Nature Sounds',
      gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
      emoji: '🌧️',
    },
    {
      id: 3,
      name: 'Piano Melodies',
      artist: 'Classical Music',
      subtitle: 'Classical',
      gradient: 'linear-gradient(135deg, #FA8BFF 0%, #F78CE0 100%)',
      emoji: '🎹',
    },
    {
      id: 4,
      name: 'Forest Sounds',
      artist: 'Nature Vibes',
      subtitle: 'Relaxation',
      gradient: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
      emoji: '🌲',
    },
  ]

  return (
    <div className="music-player-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <div className="player-wrapper">
        {/* Large Player Card */}
        <div
          className="player-card"
          style={{ background: tracks[selectedTrack].gradient }}
        >
          <div className="card-circle"></div>
          <div className="player-content">
            <div className="player-emoji">{tracks[selectedTrack].emoji}</div>
            <h1 className="player-title">{tracks[selectedTrack].name}</h1>
            <p className="player-artist">{tracks[selectedTrack].artist}</p>
            <p className="player-subtitle">{tracks[selectedTrack].subtitle}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="controls">
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
          <div className="time-display">
            <span>2:45</span>
            <span>5:30</span>
          </div>

          <div className="buttons">
            <button className="control-btn">
              <span>⏮</span>
            </button>
            <button
              className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
            </button>
            <button className="control-btn">
              <span>⏭</span>
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div className="playlist-section">
          <h2>Playlist</h2>
          <div className="playlist-grid">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`playlist-card ${index === selectedTrack ? 'active' : ''}`}
                style={{ background: track.gradient }}
                onClick={() => setSelectedTrack(index)}
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
