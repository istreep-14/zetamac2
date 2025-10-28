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
  }

  const handleGameFinish = async (results) => {
    try {
      await saveGameResult(results)
      setGameResults(results)
      setCurrentPage('result')
    } catch (error) {
      console.error('Failed to save game results:', error)
      setGameResults(results)
      setCurrentPage('result')
    }
  }

  const handleRestart = () => {
    setGameConfig(null)
    setGameResults(null)
    setViewingResult(null)
    setCurrentPage('config')
  }

  const handleDashboard = () => {
    setGameConfig(null)
    setGameResults(null)
    setViewingResult(null)
    setCurrentPage('dashboard')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage}
            setViewingResult={setViewingResult}
          />
        )
      
      case 'config':
        return <TestConfig onStart={handleStartTest} />
      
      case 'game':
        return gameConfig ? (
          <TestGame 
            config={gameConfig} 
            onFinish={handleGameFinish} 
          />
        ) : (
          <TestConfig onStart={handleStartTest} />
        )
      
      case 'result':
        const resultsToShow = viewingResult || gameResults
        return resultsToShow ? (
          <Results 
            results={resultsToShow}
            onRestart={handleRestart}
            onDashboard={handleDashboard}
          />
        ) : (
          <Dashboard 
            setCurrentPage={setCurrentPage}
            setViewingResult={setViewingResult}
          />
        )
      
      default:
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage}
            setViewingResult={setViewingResult}
          />
        )
    }
  }

  return (
    <div className="app">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default App
