import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import TestConfig from './components/TestConfig'
import TestGame from './components/TestGame'
import Results from './components/Results'
import { saveGameResult } from './utils/db'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [gameConfig, setGameConfig] = useState(null)
  const [gameResults, setGameResults] = useState(null)
  const [viewingResult, setViewingResult] = useState(null)

  const handleStartTest = (config) => {
    setGameConfig(config)
    setCurrentPage('game')
    setViewingResult(null)
  }

  const handleGameFinish = async (results) => {
    console.log('Game finished with results:', results)
    setGameResults(results)
    
    // Save to database
    try {
      await saveGameResult(results)
      console.log('Results saved to database')
    } catch (error) {
      console.error('Failed to save results:', error)
    }
    
    setCurrentPage('result')
  }

  const handleRestart = () => {
    setGameResults(null)
    setViewingResult(null)
    setCurrentPage('config')
  }

  const handleBackToDashboard = () => {
    setGameResults(null)
    setViewingResult(null)
    setCurrentPage('dashboard')
  }

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setViewingResult={setViewingResult}
          />
        )}
        {currentPage === 'config' && (
          <TestConfig onStartTest={handleStartTest} />
        )}
        {currentPage === 'game' && gameConfig && (
          <TestGame 
            config={gameConfig} 
            onFinish={handleGameFinish}
          />
        )}
        {currentPage === 'result' && (
          <Results 
            results={viewingResult || gameResults}
            onRestart={handleRestart}
            onDashboard={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  )
}

export default App
