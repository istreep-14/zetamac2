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
  
  // Track attempts for current problem
  const currentAttemptDataRef = useRef({
    keystrokes: 0,
    backspaces: 0,
    fullAttempts: 0, // Number of times answer reached expected digit length
    lastInputTime: null,
    attemptTimestamps: [],
    inputHistory: [] // Track all inputs for analysis
  })

  useEffect(() => {
    generateNewProblem()
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
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
    
    // Reset attempt tracking for new problem
    currentAttemptDataRef.current = {
      keystrokes: 0,
      backspaces: 0,
      fullAttempts: 0,
      lastInputTime: Date.now(),
      attemptTimestamps: [],
      inputHistory: []
    }
  }

  const randomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const handleAnswerChange = (e) => {
    const value = e.target.value
    const previousValue = answer
    const now = Date.now()
    
    // Track this input
    const attemptData = currentAttemptDataRef.current
    
    // Detect backspace (value got shorter)
    if (value.length < previousValue.length) {
      attemptData.backspaces++
    } else if (value.length > previousValue.length) {
      // New character typed
      attemptData.keystrokes++
    }
    
    // Track if we've reached a full attempt (matching digit length)
    if (currentProblem && value.length === currentProblem.answer.toString().length) {
      // Check if enough time passed (500ms) to consider it a new attempt
      const timeSinceLastInput = attemptData.lastInputTime ? now - attemptData.lastInputTime : 0
      
      if (timeSinceLastInput > 500 || attemptData.fullAttempts === 0) {
        attemptData.fullAttempts++
        attemptData.attemptTimestamps.push(now)
      }
    }
    
    attemptData.lastInputTime = now
    attemptData.inputHistory.push({
      value,
      timestamp: now,
      wasBackspace: value.length < previousValue.length
    })
    
    if (value === '' || /^-?\d+$/.test(value)) {
      setAnswer(value)
      
      // Check if answer is correct immediately
      if (value !== '' && currentProblem && parseInt(value) === currentProblem.answer) {
        setTimeout(() => {
          checkAnswer(value)
        }, 0)
      }
    }
  }

  const calculateAttemptMetrics = () => {
    const attemptData = currentAttemptDataRef.current
    const expectedLength = currentProblem.answer.toString().length
    
    // Calculate attempts based on:
    // 1. Number of times we had full-length input
    // 2. Backspace clusters (consecutive backspaces count as rethinking)
    let backspaceClusters = 0
    let consecutiveBackspaces = 0
    
    for (const input of attemptData.inputHistory) {
      if (input.wasBackspace) {
        consecutiveBackspaces++
      } else {
        if (consecutiveBackspaces > 0) {
          backspaceClusters++
          consecutiveBackspaces = 0
        }
      }
    }
    
    if (consecutiveBackspaces > 0) backspaceClusters++
    
    // Estimate attempts: either full-length attempts or backspace clusters
    const estimatedAttempts = Math.max(
      attemptData.fullAttempts,
      backspaceClusters,
      1 // At least 1 attempt
    )
    
    return {
      attempts: estimatedAttempts,
      keystrokes: attemptData.keystrokes,
      backspaces: attemptData.backspaces,
      firstTryCorrect: estimatedAttempts === 1
    }
  }

  const checkAnswer = (answerValue) => {
    if (answerValue === '' || !currentProblem) return

    const isCorrect = parseInt(answerValue) === currentProblem.answer
    const timeTaken = Date.now() - currentProblem.timestamp
    const metrics = calculateAttemptMetrics()

    const newProblem = {
      ...currentProblem,
      userAnswer: parseInt(answerValue),
      correct: isCorrect,
      timeTaken,
      ...metrics // Add attempt metrics
    }

    // Update refs
    problemHistoryRef.current = [...problemHistoryRef.current, newProblem]
    // Only count as correct if it was first try
    if (isCorrect && metrics.firstTryCorrect) correctCountRef.current += 1
    totalAttemptsRef.current += 1

    // Update state
    setProblemHistory(prev => [...prev, newProblem])
    if (isCorrect && metrics.firstTryCorrect) setCorrectCount(prev => prev + 1)
    setTotalAttempts(prev => prev + 1)
    
    setAnswer('')
    generateNewProblem()
  }

  const endGame = () => {
    // Calculate first-try accuracy
    const firstTryCorrect = problemHistoryRef.current.filter(p => p.firstTryCorrect).length
    const totalProblems = totalAttemptsRef.current
    
    const results = {
      totalProblems,
      correctAnswers: correctCountRef.current, // First-try correct
      firstTryCorrect, // Should be same as correctAnswers
      eventuallyCorrect: problemHistoryRef.current.filter(p => p.correct).length,
      accuracy: totalProblems > 0 
        ? (firstTryCorrect / totalProblems * 100).toFixed(1) 
        : 0,
      duration: config.duration,
      problemHistory: problemHistoryRef.current,
      config
    }
    console.log('Ending game with results:', results)
    onFinish(results)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentAccuracy = totalAttempts > 0 ? ((correctCount / totalAttempts) * 100).toFixed(0) : 0

  return (
    <div className="test-game">
      <div className="game-header">
        <div className="timer">{formatTime(timeLeft)}</div>
        <div className="stats">
          <span className="stat correct">{correctCount} first-try</span>
          <span className="stat total">{totalAttempts} total</span>
          <span className="stat accuracy">
            {currentAccuracy}% first-try
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
