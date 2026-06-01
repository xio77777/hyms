import { useState, useEffect } from 'react'

export interface TrainingSession {
  id: string
  timestamp: number
  duration: number
  mode: string
  modeLabel: string
  steps?: TrainingStep[]
  completed: boolean
}

export interface TrainingStep {
  mode: string
  modeLabel: string
  duration: number
}

const STORAGE_KEY = 'hyms_training_history'

function loadHistory(): TrainingSession[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load history:', e)
  }
  return []
}

function saveHistory(history: TrainingSession[]) {
  try {
    const dataToSave = history.slice(0, 100)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (e) {
    console.warn('Failed to save history:', e)
  }
}

export function useTrainingHistory() {
  const [history, setHistory] = useState<TrainingSession[]>(() => loadHistory())

  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addSession = (session: Omit<TrainingSession, 'id'>) => {
    const newSession: TrainingSession = {
      ...session,
      id: Date.now().toString()
    }
    setHistory(prev => [newSession, ...prev].slice(0, 100))
    return newSession
  }

  const deleteSession = (id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getTodaySessions = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return history.filter(s => s.timestamp >= today.getTime())
  }

  const getWeekSessions = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return history.filter(s => s.timestamp >= weekAgo)
  }

  const getMonthSessions = () => {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return history.filter(s => s.timestamp >= monthAgo)
  }

  const getTotalDuration = (sessions?: TrainingSession[]) => {
    const targetSessions = sessions || history
    return targetSessions.reduce((sum, s) => sum + s.duration, 0)
  }

  const getModeDistribution = () => {
    const distribution: Record<string, { count: number; totalDuration: number }> = {}
    history.forEach(session => {
      if (!distribution[session.mode]) {
        distribution[session.mode] = { count: 0, totalDuration: 0 }
      }
      distribution[session.mode].count++
      distribution[session.mode].totalDuration += session.duration
    })
    return distribution
  }

  const getStreak = () => {
    if (history.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dates = new Set(
      history.map(s => {
        const date = new Date(s.timestamp)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
    )
    
    let currentDate = today.getTime()
    while (dates.has(currentDate)) {
      streak++
      currentDate -= 24 * 60 * 60 * 1000
    }
    
    return streak
  }

  const getAverageDuration = () => {
    if (history.length === 0) return 0
    return Math.round(getTotalDuration() / history.length)
  }

  const getLongestSession = () => {
    if (history.length === 0) return null
    return history.reduce((max, s) => s.duration > max.duration ? s : max, history[0])
  }

  const getRecentSessions = (limit: number = 7) => {
    return history.slice(0, limit)
  }

  return {
    history,
    addSession,
    deleteSession,
    clearHistory,
    getTodaySessions,
    getWeekSessions,
    getMonthSessions,
    getTotalDuration,
    getModeDistribution,
    getStreak,
    getAverageDuration,
    getLongestSession,
    getRecentSessions
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}小时${remainingMins}分钟`
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function formatFullTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
