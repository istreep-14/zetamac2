import { useState, useEffect } from 'react'
import './TestConfig.css'

const DIFFICULTY_RANGES = {
  easy: {
    addition: { minA: 1, maxA: 10, minB: 1, maxB: 10 },
    multiplication: { minA: 1, maxA: 5, minB: 1, maxB: 5 }
  },
  normal: {
    addition: { minA: 1, maxA: 50, minB: 1, maxB: 50 },
    multiplication: { minA: 1, maxA: 12, minB: 1, maxB: 12 }
  },
  hard: {
    addition: { minA: 1, maxA: 100, minB: 1, maxB: 100 },
    multiplication: { minA: 1, maxA: 25, minB: 1, maxB: 25 }
  }
}

const PRESET_TIMES = {
  quick: [15, 30, 60],
  standard: [120, 180, 300],
  long: [600, 900, 1800]
}

function TestConfig({ onStart }) {
  const [duration, setDuration] = useState(60)
  const [difficulty, setDifficulty] = useState('normal')
  const [operators, setOperators] = useState({
    addition: true,
    subtraction: true,
    multiplication: false,
    division: false
  })
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false)
  const [showOperatorsDropdown, setShowOperatorsDropdown] = useState(false)
  const [customTime, setCustomTime] = useState('')

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        handleStart()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [duration, difficulty, operators])

  const handleStart = () => {
    const activeOperators = Object.values(operators).some(v => v)
    if (!activeOperators) {
      alert('Please select at least one operator')
      return
    }

    const config = {
      duration,
      difficulty,
      operators,
      ranges: DIFFICULTY_RANGES[difficulty]
    }
    onStart(config)
  }

  const toggleOperator = (op) => {
    setOperators(prev => ({ ...prev, [op]: !prev[op] }))
  }

  const setPresetTime = (time) => {
    setDuration(time)
    setShowTimeDropdown(false)
  }

  const handleCustomTime = () => {
    const time = parseInt(customTime)
    if (time && time > 0 && time <= 3600) {
      setDuration(time)
      setCustomTime('')
      setShowTimeDropdown(false)
    }
  }

  const getOperatorsPreview = () => {
    const activeOps = []
    if (operators.addition) activeOps.push('+')
    if (operators.subtraction) activeOps.push('−')
    if (operators.multiplication) activeOps.push('×')
    if (operators.division) activeOps.push('÷')
    return activeOps.join('  ') || 'None'
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  return (
    <div className="test-config">
      <div className="config-container chess-style">
        <h1 className="config-title">Configure Test</h1>

        {/* Time Control */}
        <div className="config-section time-control-header">
          <button 
            className="dropdown-trigger"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            <span className="category-badge">⏱️ Time</span>
            <span className="selected-time">{formatTime(duration)}</span>
            <span className="dropdown-arrow">{showTimeDropdown ? '▲' : '▼'}</span>
          </button>

          {showTimeDropdown && (
            <div className="dropdown-panel">
              <div className="time-category">
                <div className="category-header">Quick</div>
                <div className="time-options">
                  {PRESET_TIMES.quick.map(time => (
                    <button
                      key={time}
                      className={`time-btn ${duration === time ? 'active' : ''}`}
                      onClick={() => setPresetTime(time)}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-category">
                <div className="category-header">Standard</div>
                <div className="time-options">
                  {PRESET_TIMES.standard.map(time => (
                    <button
                      key={time}
                      className={`time-btn ${duration === time ? 'active' : ''}`}
                      onClick={() => setPresetTime(time)}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="time-category">
                <div className="category-header">Long</div>
                <div className="time-options">
                  {PRESET_TIMES.long.map(time => (
                    <button
                      key={time}
                      className={`time-btn ${duration === time ? 'active' : ''}`}
                      onClick={() => setPresetTime(time)}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-time-section">
                <input
                  type="number"
                  className="custom-time-input"
                  placeholder="Custom (seconds)"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  max="3600"
                />
                <button 
                  className="custom-time-btn"
                  onClick={handleCustomTime}
                  disabled={!customTime || parseInt(customTime) <= 0}
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div className="config-section">
          <button 
            className="dropdown-trigger"
            onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
          >
            <span className="category-badge">🎯</span>
            <span className="difficulty-label">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
            <span className="dropdown-arrow">{showDifficultyDropdown ? '▲' : '▼'}</span>
          </button>

          {showDifficultyDropdown && (
            <div className="dropdown-panel">
              <div className="difficulty-section">
                <div className="difficulty-buttons">
                  <button
                    className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => {
                      setDifficulty('easy')
                      setShowDifficultyDropdown(false)
                    }}
                  >
                    Easy
                  </button>
                  <button
                    className={`diff-btn ${difficulty === 'normal' ? 'active' : ''}`}
                    onClick={() => {
                      setDifficulty('normal')
                      setShowDifficultyDropdown(false)
                    }}
                  >
                    Normal
                  </button>
                  <button
                    className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => {
                      setDifficulty('hard')
                      setShowDifficultyDropdown(false)
                    }}
                  >
                    Hard
                  </button>
                </div>

                <div className="difficulty-info">
                  <div className="range-display">
                    <span className="range-label">Addition/Subtraction:</span>
                    <span className="range-value">
                      {DIFFICULTY_RANGES[difficulty].addition.minA}-{DIFFICULTY_RANGES[difficulty].addition.maxA}
                    </span>
                  </div>
                  <div className="range-display">
                    <span className="range-label">Multiplication/Division:</span>
                    <span className="range-value">
                      {DIFFICULTY_RANGES[difficulty].multiplication.minA}-{DIFFICULTY_RANGES[difficulty].multiplication.maxA}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operators */}
        <div className="config-section">
          <button 
            className="dropdown-trigger"
            onClick={() => setShowOperatorsDropdown(!showOperatorsDropdown)}
          >
            <span className="category-badge">🔢</span>
            <span className="operators-preview">{getOperatorsPreview()}</span>
            <span className="dropdown-arrow">{showOperatorsDropdown ? '▲' : '▼'}</span>
          </button>

          {showOperatorsDropdown && (
            <div className="dropdown-panel">
              <div className="operators-section">
                <div className="section-label">Select Operators</div>
                <div className="operators-grid">
                  <label className="operator-checkbox">
                    <input
                      type="checkbox"
                      checked={operators.addition}
                      onChange={() => toggleOperator('addition')}
                    />
                    <span className="operator-symbol">+</span>
                    <span className="operator-name">Addition</span>
                  </label>

                  <label className="operator-checkbox">
                    <input
                      type="checkbox"
                      checked={operators.subtraction}
                      onChange={() => toggleOperator('subtraction')}
                    />
                    <span className="operator-symbol">−</span>
                    <span className="operator-name">Subtraction</span>
                  </label>

                  <label className="operator-checkbox">
                    <input
                      type="checkbox"
                      checked={operators.multiplication}
                      onChange={() => toggleOperator('multiplication')}
                    />
                    <span className="operator-symbol">×</span>
                    <span className="operator-name">Multiplication</span>
                  </label>

                  <label className="operator-checkbox">
                    <input
                      type="checkbox"
                      checked={operators.division}
                      onChange={() => toggleOperator('division')}
                    />
                    <span className="operator-symbol">÷</span>
                    <span className="operator-name">Division</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="start-section">
          <button className="start-button active" onClick={handleStart}>
            Start Test
          </button>
          <p className="hint">Press <kbd>Space</kbd> or <kbd>Enter</kbd> to start</p>
        </div>
      </div>
    </div>
  )
}

export default TestConfig
