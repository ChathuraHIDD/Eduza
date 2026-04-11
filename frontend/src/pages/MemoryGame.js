import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MemoryGame.css'

const MemoryGame = () => {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const symbols = ['🎵', '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲']

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameWon(true)
    }
  }, [matched, cards])

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      if (cards[first]?.symbol === cards[second]?.symbol) {
        setMatched([...matched, first, second])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 600)
      }
      setMoves(moves + 1)
    }
  }, [flipped])

  const toggleCard = (index) => {
    if (flipped.includes(index) || matched.includes(index)) return
    if (flipped.length < 2) {
      setFlipped([...flipped, index])
    }
  }

  return (
    <div className="memory-game-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <div className="game-header">
        <h1>🧩 Memory Match</h1>
        <p>Find matching pairs!</p>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span className="label">Moves</span>
          <span className="value">{moves}</span>
        </div>
        <div className="stat">
          <span className="label">Matched</span>
          <span className="value">{matched.length / 2} / {cards.length / 2}</span>
        </div>
      </div>

      {gameWon ? (
        <div className="win-screen">
          <div className="win-content">
            <h2>🎉 You Won!</h2>
            <p>Completed in {moves} moves</p>
            <button className="play-again-btn" onClick={initializeGame}>
              Play Again
            </button>
          </div>
        </div>
      ) : (
        <div className="memory-grid">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`memory-card ${
                flipped.includes(index) || matched.includes(index) ? 'flipped' : ''
              }`}
              onClick={() => toggleCard(index)}
            >
              <div className="card-inner">
                <div className="card-front">?</div>
                <div className="card-back">{card.symbol}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemoryGame
