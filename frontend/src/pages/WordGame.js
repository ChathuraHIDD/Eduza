import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './WordGame.css'

const WordGame = () => {
  const navigate = useNavigate()
  const [wordList] = useState([
    { word: 'REACT', hint: 'JavaScript library' },
    { word: 'PUZZLE', hint: 'Brain teaser' },
    { word: 'RELAX', hint: 'Chill out' },
    { word: 'STUDY', hint: 'Learn something' },
    { word: 'BRAIN', hint: 'Think with this' },
  ])

  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [gameLost, setGameLost] = useState(false)
  const [score, setScore] = useState(0)

  const currentWord = wordList[currentWordIndex].word
  const currentHint = wordList[currentWordIndex].hint
  const maxWrongGuesses = 6
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter) || gameComplete || gameLost) return

    const newGuesses = [...guessedLetters, letter]
    setGuessedLetters(newGuesses)

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameLost(true)
      }
    } else {
      checkWin(newGuesses)
    }
  }

  const checkWin = (guesses) => {
    const wordLetters = currentWord.split('')
    const allGuessed = wordLetters.every((letter) => guesses.includes(letter))

    if (allGuessed) {
      setScore(score + 1)
      setGameComplete(true)
    }
  }

  const nextWord = () => {
    if (currentWordIndex < wordList.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setGuessedLetters([])
      setWrongGuesses(0)
      setGameComplete(false)
    } else {
      setGameComplete(false)
    }
  }

  const resetGame = () => {
    setCurrentWordIndex(0)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameComplete(false)
    setGameLost(false)
    setScore(0)
  }

  const displayWord = currentWord
    .split('')
    .map((letter) => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ')

  const isWordSolved = currentWord
    .split('')
    .every((letter) => guessedLetters.includes(letter))

  return (
    <div className="word-game-container">
      <button className="back-btn" onClick={() => navigate('/get-break')}>
        ← Back
      </button>

      <div className="game-header">
        <h1>🔤 Word Game</h1>
        <p>Guess the word!</p>
      </div>

      <div className="game-stats">
        <div className="stat">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div className="stat">
          <span className="label">Wrong</span>
          <span className="value">
            {wrongGuesses} / {maxWrongGuesses}
          </span>
        </div>
        <div className="stat">
          <span className="label">Progress</span>
          <span className="value">
            {currentWordIndex + 1} / {wordList.length}
          </span>
        </div>
      </div>

      {!gameLost ? (
        <>
          <div className="hint-box">
            <p>
              <strong>Hint:</strong> {currentHint}
            </p>
          </div>

          <div className="word-display">{displayWord}</div>

          <div className="hangman-visual">
            {wrongGuesses > 0 && <div className="head"></div>}
            {wrongGuesses > 1 && <div className="body"></div>}
            {wrongGuesses > 2 && <div className="left-arm"></div>}
            {wrongGuesses > 3 && <div className="right-arm"></div>}
            {wrongGuesses > 4 && <div className="left-leg"></div>}
            {wrongGuesses > 5 && <div className="right-leg"></div>}
          </div>

          <div className="keyboard">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`letter-btn ${
                  guessedLetters.includes(letter) ? 'guessed' : ''
                } ${
                  guessedLetters.includes(letter) &&
                  !currentWord.includes(letter)
                    ? 'wrong'
                    : ''
                }`}
                onClick={() => guessLetter(letter)}
                disabled={guessedLetters.includes(letter) || gameComplete || gameLost}
              >
                {letter}
              </button>
            ))}
          </div>

          {gameComplete && !isWordSolved && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>🎉 Correct!</h2>
                <p>You found the word: {currentWord}</p>
                <button
                  onClick={nextWord}
                  disabled={currentWordIndex >= wordList.length - 1}
                >
                  {currentWordIndex >= wordList.length - 1
                    ? 'Game Complete!'
                    : 'Next Word'}
                </button>
              </div>
            </div>
          )}

          {gameComplete && isWordSolved && currentWordIndex >= wordList.length - 1 && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>🏆 Game Complete!</h2>
                <p>Final Score: {score} / {wordList.length}</p>
                <button onClick={resetGame}>Play Again</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Game Over!</h2>
            <p>The word was: <strong>{currentWord}</strong></p>
            <p>Final Score: {score} / {wordList.length}</p>
            <button onClick={resetGame}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordGame
