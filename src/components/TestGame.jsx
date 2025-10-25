import { useState, useEffect, useRef } from 'react'
import './TestGame.css'

function TestGame({ config, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [currentProblem, setCurrentProblem] = useState(null)
  const [answer, setAnswer] = useState('')
  const [problemHistory, setProblemHistory] = useState([])
  const [correctCount, setCorrectCount] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  
  // Refs to track current values for endGame
  const problemHistoryRef = useRef([])
  const correctCountRef = useRef(0)
  const totalAttemptsRef = useRef(0)

  useEffect(() => {
    generateNewProblem()
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Defer the finish call to avoid setState during render
          setTimeout(() => {
            endGame()
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const generateNewProblem = () => {
    const activeOperators = Object.keys(config.operators).filter(
      op => config.operators[op]
    )
    
    if (activeOperators.length === 0) return null

    const operator = activeOperators[Math.floor(Math.random() * activeOperators.length)]
    const ranges = config.ranges
    
    let problem
    
    if (operator === 'addition') {
      const a = randomInRange(ranges.addition.minA, ranges.addition.maxA)
      const b = randomInRange(ranges.addition.minB, ranges.addition.maxB)
      problem = {
        type: 'addition',
        display: `${a} + ${b}`,
        answer: a + b,
        timestamp: Date.now()
      }
    } else if (operator === 'subtraction') {
      const a = randomInRange(ranges.addition.minA, ranges.addition.maxA)
      const b = randomInRange(ranges.addition.minB, ranges.addition.maxB)
      const c = a + b
      problem = {
        type: 'subtraction',
        display: `${c} - ${a}`,
        answer: b,
        timestamp: Date.now()
      }
    } else if (operator === 'multiplication') {
      const a = randomInRange(ranges.multiplication.minA, ranges.multiplication.maxA)
      const b = randomInRange(ranges.multiplication.minB, ranges.multiplication.maxB)
      problem = {
        type: 'multiplication',
        display: `${a} × ${b}`,
        answer: a * b,
        timestamp: Date.now()
      }
    } else if (operator === 'division') {
      const a = randomInRange(ranges.multiplication.minA, ranges.multiplication.maxA)
      const b = randomInRange(ranges.multiplication.minB, ranges.multiplication.maxB)
      const c = a * b
      problem = {
        type: 'division',
        display: `${c} ÷ ${a}`,
        answer: b,
        timestamp: Date.now()
      }
    }
    
    setCurrentProblem(problem)
  }

  const randomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const handleAnswerChange = (e) => {
    const value = e.target.value
    if (value === '' || /^-?\d+$/.test(value)) {
      setAnswer(value)
      
      // Check if answer is correct immediately
      if (value !== '' && currentProblem && parseInt(value) === currentProblem.answer) {
        // Use setTimeout to defer the state update
        setTimeout(() => {
          checkAnswer(value)
        }, 0)
      }
    }
  }

  const checkAnswer = (answerValue) => {
    if (answerValue === '' || !currentProblem) return

    const isCorrect = parseInt(answerValue) === currentProblem.answer
    const timeTaken = Date.now() - currentProblem.timestamp

    const newProblem = {
      ...currentProblem,
      userAnswer: parseInt(answerValue),
      correct: isCorrect,
      timeTaken
    }

    // Update refs
    problemHistoryRef.current = [...problemHistoryRef.current, newProblem]
    if (isCorrect) correctCountRef.current += 1
    totalAttemptsRef.current += 1

    // Update state
    setProblemHistory(prev => [...prev, newProblem])
    if (isCorrect) setCorrectCount(prev => prev + 1)
    setTotalAttempts(prev => prev + 1)
    
    setAnswer('')
    generateNewProblem()
  }

  const endGame = () => {
    // Use ref values which have the most current data
    const results = {
      totalProblems: totalAttemptsRef.current,
      correctAnswers: correctCountRef.current,
      accuracy: totalAttemptsRef.current > 0 
        ? (correctCountRef.current / totalAttemptsRef.current * 100).toFixed(1) 
        : 0,
      duration: config.duration,
      problemHistory: problemHistoryRef.current,
      config
    }
    console.log('Ending game with results:', results) // Debug log
    onFinish(results)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="test-game">
      <div className="game-header">
        <div className="timer">{formatTime(timeLeft)}</div>
        <div className="stats">
          <span className="stat correct">{correctCount} correct</span>
          <span className="stat total">{totalAttempts} total</span>
          <span className="stat accuracy">
            {totalAttempts > 0 ? ((correctCount / totalAttempts) * 100).toFixed(0) : 0}% accuracy
          </span>
        </div>
      </div>

      <div className="game-content">
        {currentProblem && (
          <>
            <div className="problem-display">
              {currentProblem.display}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={handleAnswerChange}
              className="answer-input"
              placeholder="?"
              autoFocus
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TestGame