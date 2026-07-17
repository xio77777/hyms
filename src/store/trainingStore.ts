import { create } from 'zustand'

export type TrainingMode = 'tracking' | 'calm' | 'excite' | 'carousel'

interface TrainingStats {
  totalTime: number
  sessions: number
  lastSession: number
}

interface TrainingSettings {
  voiceEnabled: boolean
  timerEnabled: boolean
  timerMinutes: number
  autoResume: boolean
  highContrast: boolean
  largeFont: boolean
}

interface TrainingState {
  mode: TrainingMode
  speed: number
  brightness: number
  isPaused: boolean
  setMode: (mode: TrainingMode) => void
  setSpeed: (speed: number) => void
  setBrightness: (brightness: number) => void
  setIsPaused: (paused: boolean) => void
  togglePause: () => void
  
  timerSeconds: number
  timerActive: boolean
  timerCompleted: boolean
  setTimerSeconds: (seconds: number | ((prev: number) => number)) => void
  setTimerActive: (active: boolean) => void
  setTimerCompleted: (completed: boolean) => void
  resetTimer: () => void
  
  stats: TrainingStats
  settings: TrainingSettings
  updateStats: (updates: Partial<TrainingStats>) => void
  updateSettings: (updates: Partial<TrainingSettings>) => void
  
  speak: (text: string) => void
}

const STORAGE_KEY = 'hyms_training'

function loadFromStorage(): Partial<TrainingState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load training data:', e)
  }
  return {}
}

function saveToStorage(state: Partial<TrainingState>) {
  try {
    const data = {
      stats: state.stats,
      settings: state.settings,
      speed: state.speed,
      brightness: state.brightness,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save training data:', e)
  }
}

const defaultStats: TrainingStats = {
  totalTime: 0,
  sessions: 0,
  lastSession: 0,
}

const defaultSettings: TrainingSettings = {
  voiceEnabled: true,
  timerEnabled: false,
  timerMinutes: 5,
  autoResume: false,
  highContrast: false,
  largeFont: false,
}

const loaded = loadFromStorage()

export const useTrainingStore = create<TrainingState>((set, get) => ({
  mode: 'tracking',
  speed: (loaded.speed as number) || 1,
  brightness: (loaded.brightness as number) || 1,
  isPaused: false,
  setMode: (mode) => {
    set({ mode })
    const state = get()
    saveToStorage({ ...state, mode })
  },
  setSpeed: (speed) => {
    const clampedSpeed = Math.max(0.2, Math.min(5, speed))
    set({ speed: clampedSpeed })
    const state = get()
    saveToStorage({ ...state, speed: clampedSpeed })
  },
  setBrightness: (brightness) => {
    const clampedBrightness = Math.max(0.3, Math.min(1, brightness))
    set({ brightness: clampedBrightness })
    const state = get()
    saveToStorage({ ...state, brightness: clampedBrightness })
  },
  setIsPaused: (paused: boolean) => set({ isPaused: paused }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  timerSeconds: 0,
  timerActive: false,
  timerCompleted: false,
  setTimerSeconds: (seconds: number | ((prev: number) => number)) => set((state) => ({
    timerSeconds: typeof seconds === 'function' ? seconds(state.timerSeconds) : seconds
  })),
  setTimerActive: (active) => set({ timerActive: active }),
  setTimerCompleted: (completed) => set({ timerCompleted: completed }),
  resetTimer: () => set({ timerSeconds: 0, timerActive: false, timerCompleted: false }),
  
  stats: (loaded.stats as TrainingStats) || defaultStats,
  settings: (loaded.settings as TrainingSettings) || defaultSettings,
  updateStats: (updates: Partial<TrainingStats>) => {
    set((state) => {
      const newStats = { ...state.stats, ...updates }
      const newState = { stats: newStats }
      saveToStorage({ ...state, ...newState })
      return newState
    })
  },
  updateSettings: (updates: Partial<TrainingSettings>) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates }
      const newState = { settings: newSettings }
      saveToStorage({ ...state, ...newState })
      return newState
    })
  },
  
  speak: (text: string) => {
    const state = get()
    if (!state.settings.voiceEnabled) return
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  },
}))
