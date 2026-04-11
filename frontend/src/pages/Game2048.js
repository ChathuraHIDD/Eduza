import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Game2048.css'

const Game2048 = () => {
  const navigate = useNavigate()
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const newGrid = Array(16).fill(0)
    addNewTile(addNewTile(newGrid))
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }

  const addNewTile = (currentGrid) => {
    const emptyCells = currentGrid
      .map((cell, index) => (cell === 0 ? index : null))
      .filter((index) => index !== null)

    if (emptyCells.length === 0) return currentGrid

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const newValue = Math.random() < 0.9 ? 2 : 4
    const newGrid = [...currentGrid]
    newGrid[randomIndex] = newValue
    return newGrid
  }

  const move = (direction) => {
    if (gameOver || won) return

    let newGrid = JSON.parse(JSON.stringify(grid))
    let moved = false
    let newScore = score

    if (direction === 'left' || direction === 'right') {
      const reverse = direction === 'right'
      for (let i = 0; i < 4; i++) {
        const row = newGrid.slice(i * 4, (i + 1) * 4)
        const [movedRow, rowScore, didMove] = slideAndMerge(row, reverse)
        newGrid.splice(i * 4, 4, ...movedRow)
        newScore += rowScore
        if (didMove) moved = true
      }
    } else {
      for (let i = 0; i < 4; i++) {
        const column = [newGrid[i], newGrid[i + 4], newGrid[i + 8], newGrid[i + 12]]
        const [movedCol, colScore, didMove] = slideAndMerge(column, direction === 'down')
        newGrid[i] = movedCol[0]
        newGrid[i + 4] = movedCol[1]
        newGrid[i + 8] = movedCol[2]
        newGrid[i + 12] = movedCol[3]
        newScore += colScore
        if (didMove) moved = true
      }
    }

    if (moved) {
      newGrid = addNewTile(newGrid)
      setGrid(newGrid)
      setScore(newScore)

      if (newGrid.some((cell) => cell === 2048)) {
        setWon(true)
      }

      if (isGameOver(newGrid)) {
        setGameOver(true)
      }
    }
  }

  const slideAndMerge = (line, reverse) => {
    if (reverse) line = line.reverse()

    let merged = [...line]
    let score = 0

    merged = merged.filter((cell) => cell !== 0)

    for (let i = 0; i < merged.length - 1; i++) {
      if (merged[i] === merged[i + 1]) {
        merged[i] *= 2
        score += merged[i]
        merged.splice(i + 1, 1)
      }
    }

    merged = [...merged, ...Array(4 - merged.length).fill(0)]

    if (reverse) merged = merged.reverse()

    const didMove = JSON.stringify(line) !== JSON.stringify(merged)
    return [merged, score, didMove]
  }

  const isGameOver = (currentGrid) => {
    if (currentGrid.some((cell) => cell === 0)) return false

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = currentGrid[i * 4 + j]
        if (
          (j < 3 && cell === currentGrid[i * 4 + j + 1]) ||
          (i < 3 && cell === currentGrid[(i + 1) * 4 + j])
        ) {
          return false
        }
      }
    }
    return true
  }

  const getTileColor = (value) => {
    const colors = {
      0: '#cdc1b5',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    }
    return colors[value] || '#3c3c2f'
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left')
      if (e.key === 'ArrowRight' || e.key === 'd') move('right')
      if (e.key === 'ArrowUp' || e.key === 'w') move('up')
      if (e.key === 'ArrowDown' || e.key === 's') move('down')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, won, grid])

  return (
    <div className="game-2048-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <div className="game-header">
        <h1>🎲 2048</h1>
        <p>Combine tiles to reach 2048!</p>
      </div>

      <div className="game-info">
        <div className="score-box">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <button className="new-game-btn" onClick={initializeGame}>
          New Game
        </button>
      </div>

      <div className="game-grid">
        {grid.map((value, index) => (
          <div
            key={index}
            className="tile"
            style={{ backgroundColor: getTileColor(value) }}
          >
            {value > 0 && <span className="tile-value">{value}</span>}
          </div>
        ))}
      </div>

      <div className="controls">
        <p>Use arrow keys or WASD to move</p>
        <div className="button-grid">
          <button onClick={() => move('up')}>⬆ Up</button>
          <button onClick={() => move('left')}>⬅ Left</button>
          <button onClick={() => move('down')}>⬇ Down</button>
          <button onClick={() => move('right')}>➡ Right</button>
        </div>
      </div>

      {gameOver && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button onClick={initializeGame}>Play Again</button>
          </div>
        </div>
      )}

      {won && !gameOver && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 You Won!</h2>
            <p>You reached 2048!</p>
            <p className="small-text">Score: {score}</p>
            <button onClick={initializeGame}>New Game</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game2048
