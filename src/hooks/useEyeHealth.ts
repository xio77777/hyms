import { useState, useEffect, useCallback, useRef } from 'react'

export interface EyeHealthSettings {
  enabled: boolean
  intervalMinutes: number
  breakDuration: number
  soundEnabled: boolean
}

const STORAGE_KEY = 'hyms_eye_health'

const defaultSettings: EyeHealthSettings = {
  enabled: true,
  intervalMinutes: 20,
  breakDuration: 20,
  soundEnabled: true,
}

function loadSettings(): EyeHealthSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.warn('Failed to load eye health settings:', e)
  }
  return defaultSettings
}

function saveSettings(settings: EyeHealthSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save eye health settings:', e)
  }
}

export function useEyeHealth() {
  const [settings, setSettings] = useState<EyeHealthSettings>(() => loadSettings())
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [breakCountdown, setBreakCountdown] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [todayTotalMinutes, setTodayTotalMinutes] = useState(0)
  
  const breakTimerRef = useRef<number | null>(null)
  const sessionTimerRef = useRef<number | null>(null)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('hyms_daily_usage')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.date === today) {
        setTodayTotalMinutes(data.minutes || 0)
      }
    }
  }, [])

  const updateTodayUsage = useCallback((minutes: number) => {
    const today = new Date().toDateString()
    const newTotal = minutes
    setTodayTotalMinutes(newTotal)
    localStorage.setItem('hyms_daily_usage', JSON.stringify({
      date: today,
      minutes: newTotal,
    }))
  }, [])

  const startSession = useCallback(() => {
    if (!settings.enabled) return
    setSessionStartTime(Date.now())
  }, [settings.enabled])

  const stopSession = useCallback(() => {
    if (sessionStartTime) {
      const sessionMinutes = Math.floor((Date.now() - sessionStartTime) / 60000)
      const newTotal = todayTotalMinutes + sessionMinutes
      updateTodayUsage(newTotal)
    }
    setSessionStartTime(null)
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current)
    }
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current)
    }
  }, [sessionStartTime, todayTotalMinutes, updateTodayUsage])

  const checkBreakReminder = useCallback(() => {
    if (!settings.enabled || !sessionStartTime) return

    const elapsedMinutes = (Date.now() - sessionStartTime) / 60000
    if (elapsedMinutes >= settings.intervalMinutes && !showBreakReminder) {
      setShowBreakReminder(true)
      setBreakCountdown(settings.breakDuration)
      
      if (settings.soundEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('护眼提醒：请看向20英尺外的物体，休息20秒')
        utterance.lang = 'zh-CN'
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
      }

      let remaining = settings.breakDuration
      breakTimerRef.current = window.setInterval(() => {
        remaining--
        setBreakCountdown(remaining)
        if (remaining <= 0) {
          if (breakTimerRef.current) {
            clearInterval(breakTimerRef.current)
          }
          setShowBreakReminder(false)
          setSessionStartTime(Date.now())
        }
      }, 1000)
    }
  }, [settings.enabled, settings.intervalMinutes, settings.breakDuration, settings.soundEnabled, sessionStartTime, showBreakReminder])

  useEffect(() => {
    if (sessionStartTime && settings.enabled) {
      sessionTimerRef.current = window.setInterval(checkBreakReminder, 10000)
    }
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [sessionStartTime, settings.enabled, checkBreakReminder])

  const dismissBreak = useCallback(() => {
    setShowBreakReminder(false)
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current)
    }
    setSessionStartTime(Date.now())
  }, [])

  const updateSettings = useCallback((updates: Partial<EyeHealthSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    settings,
    showBreakReminder,
    breakCountdown,
    todayTotalMinutes,
    startSession,
    stopSession,
    dismissBreak,
    updateSettings,
  }
}
