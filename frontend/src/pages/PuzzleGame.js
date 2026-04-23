import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PuzzleGame.css'

const PuzzleGame = () => {
  const navigate = useNavigate()
  const [currentPuzzle, setCurrentPuzzle] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  const puzzles = [
    {
      question: 'What comes next? 2, 4, 8, ?',
      options: ['10', '12', '16', '20'],
      correct: 2,
    },
    {
      question: 'If you have 3 apples and take 2, how many do you have?',
      options: ['1', '3', '2', '5'],
      correct: 2,
    },
    {
      question: 'What is 15 ÷ 3?',
      options: ['3', '5', '6', '8'],
      correct: 1,
    },
    {
      question: 'Complete: All men are __, Socrates is a man, Therefore Socrates is __?',
      options: ['smart', 'mortal', 'wise', 'tall'],
      correct: 1,
    },
    {
      question: 'What number comes next? 1, 1, 2, 3, 5, 8?',
      options: ['10', '11', '12', '13'],
      correct: 3,
    },
  ]

  const handleAnswer = (index) => {
    setSelected(index)
    setAnswered(true)
    if (index === puzzles[currentPuzzle].correct) {
      setCorrectAnswers(correctAnswers + 1)
    }
  }

  const handleNext = () => {
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle(currentPuzzle + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setGameComplete(true)
    }
  }

  const resetGame = () => {
    setCurrentPuzzle(0)
    setCorrectAnswers(0)
    setSelected(null)
    setAnswered(false)
    setGameComplete(false)
  }

  return (
    <div className="puzzle-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      {!gameComplete ? (
        <>
          <div className="puzzle-header">
            <h1>🎯 Quick Puzzle</h1>
            <p>Test your brain!</p>
            <div className="progress">
              <span>
                {currentPuzzle + 1} / {puzzles.length}
              </span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentPuzzle + 1) / puzzles.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="puzzle-content">
            <div className="question">
              <h2>{puzzles[currentPuzzle].question}</h2>
            </div>

            <div className="options">
              {puzzles[currentPuzzle].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selected === index ? 'selected' : ''} ${
                    answered && index === puzzles[currentPuzzle].correct ? 'correct' : ''
                  } ${answered && selected === index && index !== puzzles[currentPuzzle].correct ? 'wrong' : ''}`}
                  onClick={() => !answered && handleAnswer(index)}
                  disabled={answered}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {answered && (
              <>
                <div className={`feedback ${selected === puzzles[currentPuzzle].correct ? 'correct' : 'wrong'}`}>
                  {selected === puzzles[currentPuzzle].correct ? (
                    <>✓ Correct!</>
                  ) : (
                    <>✗ Wrong! The correct answer is {puzzles[currentPuzzle].options[puzzles[currentPuzzle].correct]}</>
                  )}
                </div>
                <button className="next-btn" onClick={handleNext}>
                  {currentPuzzle === puzzles.length - 1 ? 'Finish' : 'Next'}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="completion-screen">
          <div className="result-card">
            <h2>🎉 Quiz Complete!</h2>
            <div className="score-circle">
              <div className="score-text">
                <span className="score-number">{correctAnswers}</span>
                <span className="score-total">/ {puzzles.length}</span>
              </div>
            </div>
            <p className="score-message">
              {correctAnswers === puzzles.length
                ? '🌟 Perfect Score!'
                : correctAnswers >= 4
                ? '😊 Great Job!'
                : correctAnswers >= 2
                ? '👍 Good Try!'
                : '💪 Keep Practicing!'}
            </p>
            <button className="play-again-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PuzzleGame
