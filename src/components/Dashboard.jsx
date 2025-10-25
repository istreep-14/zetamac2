import { useState, useEffect } from 'react'
import './Dashboard.css'
import { getStatistics, getRecentGameResults } from '../utils/db'

function Dashboard({ setCurrentPage }) {
  const [stats, setStats] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statistics, recent] = await Promise.all([
        getStatistics(),
        getRecentGameResults(5)
      ])
      setStats(statistics)
      setRecentGames(recent)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <h1 className="title">MonkeyMath</h1>
          <p className="subtitle">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="title">MonkeyMath</h1>
        <p className="subtitle">Master arithmetic with speed and precision</p>
      </div>

      {stats && stats.totalGames > 0 ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.totalProblems}</div>
              <div className="stat-label">Total Problems</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value highlight">{stats.averageAccuracy}%</div>
              <div className="stat-label">Avg Accuracy</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.bestAccuracy}%</div>
              <div className="stat-label">Best Accuracy</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.averageProblemsPerMinute}</div>
              <div className="stat-label">Avg Problems/Min</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{stats.totalCorrect}</div>
              <div className="stat-label">Total Correct</div>
            </div>
          </div>

          {recentGames.length > 0 && (
            <div className="recent-games">
              <h2 className="section-title">Recent Games</h2>
              <div className="games-list">
                {recentGames.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-header">
                      <span className="game-date">
                        {new Date(game.timestamp).toLocaleDateString()} at{' '}
                        {new Date(game.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`game-difficulty ${game.difficulty}`}>
                        {game.difficulty}
                      </span>
                    </div>
                    <div className="game-stats">
                      <div className="game-stat">
                        <span className="label">Score:</span>
                        <span className="value">
                          {game.correctAnswers}/{game.totalProblems}
                        </span>
                      </div>
                      <div className="game-stat">
                        <span className="label">Accuracy:</span>
                        <span className="value highlight">{game.accuracy}%</span>
                      </div>
                      <div className="game-stat">
                        <span className="label">Duration:</span>
                        <span className="value">{game.duration}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No games played yet!</p>
          <button 
            className="start-button active"
            onClick={() => setCurrentPage('config')}
          >
            Start Your First Game
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard