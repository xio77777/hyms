import { create } from 'zustand'

export type TrainingMode = 'tracking' | 'calm' | 'excite' | 'carousel'

interface TrainingState {
  mode: TrainingMode
  speed: number
  brightness: number
  isPaused: boolean
  setMode: (mode: TrainingMode) => void
  setSpeed: (speed: number) => void
  setBrightness: (brightness: number) => void
  togglePause: () => void
}

/**
 * 训练状态管理 Store
 * 管理当前训练模式、速度、亮度和暂停状态
 */
export const useTrainingStore = create<TrainingState>((set) => ({
  mode: 'carousel',
  speed: 1,
  brightness: 1,
  isPaused: false,
  setMode: (mode) => set({ mode }),
  setSpeed: (speed) => set({ speed: Math.max(0.2, Math.min(5, speed)) }),
  setBrightness: (brightness) => set({ brightness: Math.max(0.3, Math.min(1, brightness)) }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}))
