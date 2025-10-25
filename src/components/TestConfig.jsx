import { useState, useEffect } from 'react'
import './TestConfig.css'

const DIFFICULTY_PRESETS = {
  easy: {
    addition: { minA: 2, maxA: 60, minB: 2, maxB: 60 },
    multiplication: { minA: 2, maxA: 12, minB: 2, maxB: 20 }
  },
  normal: {
    addition: { minA: 2, maxA: 100, minB: 2, maxB: 100 },
    multiplication: { minA: 2, maxA: 12, minB: 2, maxB: 100 }
  },
  hard: {
    addition: { minA: 2, maxA: 300, minB: 2, maxB: 300 },
    multiplication: { minA: 2, maxA: 20, minB: 2, maxB: 200 }
  }
}

const DURATION_OPTIONS = [10, 30, 60, 120, 300, 600]

function TestConfig({ onStartTest }) {
  const [difficulty, setDifficulty] = useState('normal')
  const [duration, setDuration] = useState(120)
  const [operators, setOperators] = useState({
    addition: true,
    subtraction: true,
    multiplication: true,
    division: true
  })

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleStart()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [difficulty, duration, operators])

  const handleStart = () => {
    const config = {
      difficulty,
      duration,
      operators,
      ranges: DIFFICULTY_PRESETS[difficulty]
    }
    onStartTest(config)
  }

  const toggleOperator = (op) => {
    setOperators(prev => ({ ...prev, [op]: !prev[op] }))
  }

  return (
    <div className="test-config">
      <div className="config-container">
        <h1 className="config-title">Test Configuration</h1>
        
        <div className="config-section">
          <h3 className="section-title">Operators</h3>
          <div className="operators-grid">
            <label className="operator-option">
              <input
                type="checkbox"
                checked={operators.addition}
                onChange={() => toggleOperator('addition')}
              />
              <span>Addition</span>
            </label>
            
            <label className="operator-option">
              <input
                type="checkbox"
                checked={operators.subtraction}
                onChange={() => toggleOperator('subtraction')}
              />
              <span>Subtraction</span>
            </label>
            
            <label className="operator-option">
              <input
                type="checkbox"
                checked={operators.multiplication}
                onChange={() => toggleOperator('multiplication')}
              />
              <span>Multiplication</span>
            </label>
            
            <label className="operator-option">
              <input
                type="checkbox"
                checked={operators.division}
                onChange={() => toggleOperator('division')}
              />
              <span>Division</span>
            </label>
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title">Difficulty</h3>
          <div className="difficulty-buttons">
            <button
              className={difficulty === 'easy' ? 'active' : ''}
              onClick={() => setDifficulty('easy')}
            >
              Easy
            </button>
            <button
              className={difficulty === 'normal' ? 'active' : ''}
              onClick={() => setDifficulty('normal')}
            >
              Normal
            </button>
            <button
              className={difficulty === 'hard' ? 'active' : ''}
              onClick={() => setDifficulty('hard')}
            >
              Hard
            </button>
          </div>
          
          <div className="difficulty-info">
            <div className="range-display">
              <span className="range-label">Addition:</span>
              <span className="range-value">
                {DIFFICULTY_PRESETS[difficulty].addition.minA}-{DIFFICULTY_PRESETS[difficulty].addition.maxA}
                {' + '}
                {DIFFICULTY_PRESETS[difficulty].addition.minB}-{DIFFICULTY_PRESETS[difficulty].addition.maxB}
              </span>
            </div>
            <div className="range-display">
              <span className="range-label">Multiplication:</span>
              <span className="range-value">
                {DIFFICULTY_PRESETS[difficulty].multiplication.minA}-{DIFFICULTY_PRESETS[difficulty].multiplication.maxA}
                {' × '}
                {DIFFICULTY_PRESETS[difficulty].multiplication.minB}-{DIFFICULTY_PRESETS[difficulty].multiplication.maxB}
              </span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3 className="section-title">Duration</h3>
          <div className="duration-buttons">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d}
                className={duration === d ? 'active' : ''}
                onClick={() => setDuration(d)}
              >
                {d < 60 ? `${d}s` : `${d / 60}m`}
              </button>
            ))}
          </div>
        </div>

        <div className="start-section">
          <button className="start-button active" onClick={handleStart}>
            Start Test
          </button>
          <p className="hint">or press <kbd>Space</kbd></p>
        </div>
      </div>
    </div>
  )
}

export default TestConfig