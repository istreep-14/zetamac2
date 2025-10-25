// Database utility for MonkeyMath game results
const DB_NAME = 'MonkeyMathDB'
const DB_VERSION = 1
const STORE_NAME = 'gameResults'

// Initialize the database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject('Database failed to open')
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        })

        // Create indexes for querying
        objectStore.createIndex('timestamp', 'timestamp', { unique: false })
        objectStore.createIndex('difficulty', 'difficulty', { unique: false })
        objectStore.createIndex('accuracy', 'accuracy', { unique: false })
      }
    }
  })
}

// Save a game result
export const saveGameResult = async (results) => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)

    // Add timestamp to the result
    const resultWithTimestamp = {
      ...results,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      difficulty: results.config.difficulty,
      duration: results.config.duration,
      operators: results.config.operators
    }

    const request = objectStore.add(resultWithTimestamp)

    request.onsuccess = () => {
      resolve(request.result) // Returns the ID
    }

    request.onerror = () => {
      reject('Failed to save game result')
    }
  })
}

// Get all game results
export const getAllGameResults = async () => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject('Failed to get game results')
    }
  })
}

// Get recent game results (limit)
export const getRecentGameResults = async (limit = 10) => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const index = objectStore.index('timestamp')
    
    // Get all and sort by timestamp descending
    const request = index.openCursor(null, 'prev')
    const results = []

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor && results.length < limit) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }

    request.onerror = () => {
      reject('Failed to get recent results')
    }
  })
}

// Get a single game result by ID
export const getGameResultById = async (id) => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject('Failed to get game result')
    }
  })
}

// Delete a game result
export const deleteGameResult = async (id) => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject('Failed to delete game result')
    }
  })
}

// Clear all game results
export const clearAllGameResults = async () => {
  const db = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject('Failed to clear game results')
    }
  })
}

// Get statistics
export const getStatistics = async () => {
  const results = await getAllGameResults()

  if (results.length === 0) {
    return {
      totalGames: 0,
      totalProblems: 0,
      totalCorrect: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      averageProblemsPerMinute: 0
    }
  }

  const totalGames = results.length
  const totalProblems = results.reduce((sum, r) => sum + r.totalProblems, 0)
  const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0)
  const averageAccuracy = (totalCorrect / totalProblems * 100).toFixed(1)
  const bestAccuracy = Math.max(...results.map(r => parseFloat(r.accuracy)))
  
  const totalProblemsPerMinute = results.map(r => {
    return (r.totalProblems / r.duration) * 60
  })
  const averageProblemsPerMinute = (
    totalProblemsPerMinute.reduce((sum, ppm) => sum + ppm, 0) / totalGames
  ).toFixed(1)

  return {
    totalGames,
    totalProblems,
    totalCorrect,
    averageAccuracy: parseFloat(averageAccuracy),
    bestAccuracy,
    averageProblemsPerMinute: parseFloat(averageProblemsPerMinute)
  }
}

export default {
  initDB,
  saveGameResult,
  getAllGameResults,
  getRecentGameResults,
  getGameResultById,
  deleteGameResult,
  clearAllGameResults,
  getStatistics
}
