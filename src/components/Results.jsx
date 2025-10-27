import { useEffect } from 'react'
import './Results.css'

function Results({ results, onRestart, onDashboard }) {
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

  if (!results) return null

  const avgTime = results.problemHistory.length > 0
    ? (results.problemHistory.reduce((sum, p) => sum + p.timeTaken, 0) / results.problemHistory.length / 1000).toFixed(2)
    : 0

  const problemsPerMinute = results.totalProblems > 0
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
            <div className="stat-value">{results.firstTryCorrect}/{results.totalProblems}</div>
            <div className="stat-label">First-Try Correct</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value highlight">{results.accuracy}%</div>
            <div className="stat-label">First-Try Accuracy</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{avgTime}s</div>
            <div className="stat-label">Avg Time</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{problemsPerMinute}</div>
            <div className="stat-label">Problems/Min</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{avgAttempts}</div>
            <div className="stat-label">Avg Attempts</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{totalKeystrokes}</div>
            <div className="stat-label">Total Keystrokes</div>
          </div>
        </div>

        <div className="problem-history">
          <h2 className="history-title">Problem History</h2>
          <div className="history-list">
            {results.problemHistory.map((problem, index) => (
              <div 
                key={index} 
                className={`history-item ${problem.firstTryCorrect ? 'correct' : 'incorrect'}`}
              >
                <span className="problem-number">#{index + 1}</span>
                <span className="problem-text">{problem.display}</span>
                <span className="user-answer">
                  {problem.userAnswer}
                </span>
                {!problem.correct && (
                  <span className="correct-answer">
                    (correct: {problem.answer})
                  </span>
                )}
                <span className="attempt-info">
                  {problem.attempts > 1 && `${problem.attempts} tries`}
                  {problem.attempts === 1 && 'First try'}
                  {problem.backspaces > 0 && ` (${problem.backspaces} ⌫)`}
                </span>
                <span className="time-taken">
                  {(problem.timeTaken / 1000).toFixed(2)}s
                </span>
                <span className="status-icon">
                  {problem.firstTryCorrect ? '✓' : problem.correct ? '○' : '✗'}
                </span>
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
