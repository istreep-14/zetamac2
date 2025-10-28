import { useEffect, useRef } from 'react'
import './Results.css'

function Results({ results, onRestart, onDashboard }) {
  const qpmChartRef = useRef(null)
  const attemptsChartRef = useRef(null)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        onRestart()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onRestart])

  useEffect(() => {
    if (results && results.problemHistory.length > 0) {
      drawQPMChart()
      drawAttemptsChart()
    }
  }, [results])

  const drawQPMChart = () => {
    const canvas = qpmChartRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    const history = results.problemHistory
    const qpmData = []
    const errorsData = []
    
    for (let i = 0; i < history.length; i++) {
      const elapsedTime = (history[i].timestamp - history[0].timestamp) / 1000 / 60
      const problemsCompleted = i + 1
      const currentQPM = elapsedTime > 0 ? problemsCompleted / elapsedTime : 0
      qpmData.push(currentQPM)
      errorsData.push(history[i].attempts > 1 ? 1 : 0)
    }

    const maxQPM = Math.max(...qpmData)
    const minQPM = Math.min(...qpmData)
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw QPM line
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let i = 0; i < qpmData.length; i++) {
      const x = padding + (chartWidth / (qpmData.length - 1)) * i
      const normalizedQPM = maxQPM > minQPM ? (qpmData[i] - minQPM) / (maxQPM - minQPM) : 0.5
      const y = padding + chartHeight - normalizedQPM * chartHeight
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw error markers
    ctx.fillStyle = '#f87171'
    for (let i = 0; i < errorsData.length; i++) {
      if (errorsData[i] > 0) {
        const x = padding + (chartWidth / (qpmData.length - 1)) * i
        const normalizedQPM = maxQPM > minQPM ? (qpmData[i] - minQPM) / (maxQPM - minQPM) : 0.5
        const y = padding + chartHeight - normalizedQPM * chartHeight
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw labels
    ctx.fillStyle = '#888'
    ctx.font = '12px monospace'
    ctx.fillText(`${maxQPM.toFixed(0)}`, 5, padding + 5)
    ctx.fillText(`${minQPM.toFixed(0)}`, 5, height - padding + 5)
  }

  const drawAttemptsChart = () => {
    const canvas = attemptsChartRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    const history = results.problemHistory
    const attemptsData = history.map(p => p.attempts || 1)
    const maxAttempts = Math.max(...attemptsData, 3)

    // Draw grid
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    for (let i = 0; i <= maxAttempts; i++) {
      const y = padding + (chartHeight / maxAttempts) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw bars
    const barWidth = Math.max(2, chartWidth / attemptsData.length - 2)
    for (let i = 0; i < attemptsData.length; i++) {
      const x = padding + (chartWidth / attemptsData.length) * i
      const normalizedAttempts = attemptsData[i] / maxAttempts
      const barHeight = normalizedAttempts * chartHeight
      const y = height - padding - barHeight

      if (attemptsData[i] === 1) {
        ctx.fillStyle = '#4ade80'
      } else if (attemptsData[i] === 2) {
        ctx.fillStyle = '#fbbf24'
      } else {
        ctx.fillStyle = '#f87171'
      }

      ctx.fillRect(x, y, barWidth, barHeight)
    }

    // Draw labels
    ctx.fillStyle = '#888'
    ctx.font = '12px monospace'
    ctx.fillText(`${maxAttempts}`, 5, padding + 5)
    ctx.fillText('1', 5, height - padding + 5)
  }

  if (!results) return null

  const avgTime = results.problemHistory.length > 0
    ? (results.problemHistory.reduce((sum, p) => sum + p.timeTaken, 0) / results.problemHistory.length / 1000).toFixed(2)
    : 0

  const qpm = results.totalProblems > 0
    ? ((results.totalProblems / results.duration) * 60).toFixed(1)
    : 0
  
  const totalKeystrokes = results.problemHistory.reduce((sum, p) => sum + (p.keystrokes || 0), 0)
  const totalBackspaces = results.problemHistory.reduce((sum, p) => sum + (p.backspaces || 0), 0)
  const avgAttempts = results.problemHistory.length > 0
    ? (results.problemHistory.reduce((sum, p) => sum + (p.attempts || 1), 0) / results.problemHistory.length).toFixed(1)
    : 0

  return (
    <div className="results">
      <div className="results-container">
        <h1 className="results-title">Test Complete!</h1>
        
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-value">{qpm}</div>
            <div className="stat-label">QPM</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value highlight">{results.accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{avgTime}s</div>
            <div className="stat-label">Avg Time</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{avgAttempts}</div>
            <div className="stat-label">Avg Attempts</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{totalKeystrokes}</div>
            <div className="stat-label">Keystrokes</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{totalBackspaces}</div>
            <div className="stat-label">Backspaces</div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h3 className="chart-title">QPM Over Time</h3>
            <canvas ref={qpmChartRef} width="600" height="200"></canvas>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{background: '#60a5fa'}}></span>
                QPM
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{background: '#f87171'}}></span>
                Errors (attempts &gt; 1)
              </span>
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Attempts per Problem</h3>
            <canvas ref={attemptsChartRef} width="600" height="200"></canvas>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{background: '#4ade80'}}></span>
                First Try
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{background: '#fbbf24'}}></span>
                2 Attempts
              </span>
              <span className="legend-item">
                <span className="legend-color" style={{background: '#f87171'}}></span>
                3+ Attempts
              </span>
            </div>
          </div>
        </div>

        <div className="problem-history">
          <h2 className="history-title">Problem History ({results.problemHistory.length} questions)</h2>
          <div className="history-grid">
            {results.problemHistory.map((problem, index) => (
              <div 
                key={index} 
                className={`history-card ${problem.firstTryCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="card-header">
                  <span className="problem-number">Q{index + 1}</span>
                  <span className="status-icon">
                    {problem.firstTryCorrect ? '✓' : problem.correct ? '○' : '✗'}
                  </span>
                </div>
                
                <div className="problem-text">{problem.display}</div>
                
                <div className="answer-row">
                  <span className="user-answer">{problem.userAnswer}</span>
                  {!problem.correct && (
                    <span className="correct-answer">({problem.answer})</span>
                  )}
                </div>
                
                <div className="card-stats">
                  <span className="attempt-count">
                    {problem.attempts === 1 ? '1st try' : `${problem.attempts} tries`}
                  </span>
                  <span className="time-taken">
                    {(problem.timeTaken / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button className="action-button active" onClick={onRestart}>
            New Test
          </button>
          <button className="action-button" onClick={onDashboard}>
            Dashboard
          </button>
        </div>
        
        <p className="hint">Press <kbd>Space</kbd> for new test</p>
      </div>
    </div>
  )
}

export default Results
