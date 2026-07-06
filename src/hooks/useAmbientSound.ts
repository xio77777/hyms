import { useState, useEffect, useCallback, useRef } from 'react'

export interface AmbientSound {
  id: string
  name: string
  icon: string
  type: 'white_noise' | 'nature' | 'music'
  frequency?: number
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'none', name: '无', icon: '🔇', type: 'music' },
  { id: 'white_noise', name: '白噪音', icon: '🌊', type: 'white_noise', frequency: 1000 },
  { id: 'pink_noise', name: '粉噪音', icon: '🌸', type: 'white_noise', frequency: 800 },
  { id: 'brown_noise', name: '棕噪音', icon: '🍂', type: 'white_noise', frequency: 500 },
  { id: 'rain', name: '雨声', icon: '🌧️', type: 'nature', frequency: 600 },
  { id: 'ocean', name: '海浪', icon: '🌊', type: 'nature', frequency: 400 },
  { id: 'forest', name: '森林', icon: '🌲', type: 'nature', frequency: 300 },
]

const STORAGE_KEY = 'hyms_ambient_settings'

interface AmbientSettings {
  currentSoundId: string
  volume: number
  enabled: boolean
}

function loadSettings(): AmbientSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load ambient settings:', e)
  }
  return {
    currentSoundId: 'none',
    volume: 0.3,
    enabled: false,
  }
}

function saveSettings(settings: AmbientSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save ambient settings:', e)
  }
}

export function useAmbientSound() {
  const [settings, setSettings] = useState<AmbientSettings>(() => loadSettings())
  const audioContextRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioBufferSourceNode | OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const createNoise = useCallback((audioContext: AudioContext, type: string, frequency: number) => {
    const bufferSize = 2 * audioContext.sampleRate
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    if (type === 'white_noise') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }
    } else if (type === 'pink_noise') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }
    } else if (type === 'brown_noise') {
      let lastOut = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        output[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = output[i]
        output[i] *= 3.5
      }
    } else if (type === 'nature') {
      for (let i = 0; i < bufferSize; i++) {
        const base = Math.random() * 2 - 1
        const modulation = Math.sin(i / audioContext.sampleRate * frequency) * 0.3
        output[i] = base * (0.5 + modulation * 0.5) * 0.6
      }
    }

    const noiseSource = audioContext.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true

    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = frequency

    const gainNode = audioContext.createGain()
    gainNode.gain.value = settings.volume

    noiseSource.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)

    noiseNodeRef.current = noiseSource
    filterNodeRef.current = filter
    gainNodeRef.current = gainNode

    noiseSource.start()
  }, [settings.volume])

  const startSound = useCallback((soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId)
    if (!sound || sound.id === 'none') {
      stopSound()
      return
    }

    stopSound()

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const type = sound.type === 'nature' ? 'nature' : sound.type
    createNoise(ctx, type, sound.frequency || 500)
    isPlayingRef.current = true
  }, [createNoise])

  const stopSound = useCallback(() => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop()
      } catch (e) {}
      noiseNodeRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null
    }
    if (filterNodeRef.current) {
      filterNodeRef.current = null
    }
    isPlayingRef.current = false
  }, [])

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume }))
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [])

  const selectSound = useCallback((soundId: string) => {
    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId)
    if (!sound) return

    const newEnabled = sound.id !== 'none'
    setSettings(prev => ({
      ...prev,
      currentSoundId: soundId,
      enabled: newEnabled,
    }))

    if (newEnabled) {
      startSound(soundId)
    } else {
      stopSound()
    }
  }, [startSound, stopSound])

  const toggleEnabled = useCallback(() => {
    if (settings.enabled) {
      stopSound()
      setSettings(prev => ({ ...prev, enabled: false }))
    } else {
      if (settings.currentSoundId !== 'none') {
        startSound(settings.currentSoundId)
      }
      setSettings(prev => ({ ...prev, enabled: true }))
    }
  }, [settings.enabled, settings.currentSoundId, startSound, stopSound])

  useEffect(() => {
    return () => {
      stopSound()
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [stopSound])

  return {
    currentSound: settings.currentSoundId,
    volume: settings.volume,
    enabled: settings.enabled,
    selectSound,
    setVolume,
    toggleEnabled,
  }
}
