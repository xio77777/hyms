class AudioContextClass {
  private context: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.3

  init() {
    if (!this.context && typeof window !== 'undefined') {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.context
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  isEnabled() {
    return this.enabled
  }

  getVolume() {
    return this.volume
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.context) return

    try {
      if (this.context.state === 'suspended') {
        this.context.resume()
      }

      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime)

      gainNode.gain.setValueAtTime(this.volume, this.context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)

      oscillator.start(this.context.currentTime)
      oscillator.stop(this.context.currentTime + duration)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }

  playClick() {
    this.playTone(800, 0.05, 'sine')
  }

  playSuccess() {
    this.playTone(523.25, 0.1, 'sine')
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100)
    setTimeout(() => this.playTone(783.99, 0.15, 'sine'), 200)
  }

  playModeSwitch() {
    this.playTone(440, 0.08, 'sine')
    setTimeout(() => this.playTone(550, 0.08, 'sine'), 80)
  }

  playCountdown() {
    this.playTone(660, 0.1, 'sine')
  }

  playComplete() {
    this.playTone(523.25, 0.15, 'sine')
    setTimeout(() => this.playTone(659.25, 0.15, 'sine'), 150)
    setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 300)
    setTimeout(() => this.playTone(1046.50, 0.3, 'sine'), 450)
  }

  playCapture() {
    this.playTone(1200, 0.05, 'sine')
    setTimeout(() => this.playTone(1400, 0.08, 'sine'), 50)
  }

  playError() {
    this.playTone(200, 0.2, 'square')
  }

  playPause() {
    this.playTone(440, 0.1, 'triangle')
    setTimeout(() => this.playTone(330, 0.1, 'triangle'), 100)
  }

  playResume() {
    this.playTone(330, 0.1, 'triangle')
    setTimeout(() => this.playTone(440, 0.1, 'triangle'), 100)
  }

  playBreathing() {
    const duration = 2
    if (!this.enabled || !this.context) return

    try {
      if (this.context.state === 'suspended') {
        this.context.resume()
      }

      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(200, this.context.currentTime)
      oscillator.frequency.linearRampToValueAtTime(400, this.context.currentTime + duration / 2)
      oscillator.frequency.linearRampToValueAtTime(200, this.context.currentTime + duration)

      gainNode.gain.setValueAtTime(0, this.context.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.context.currentTime + duration / 2)
      gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)

      oscillator.start(this.context.currentTime)
      oscillator.stop(this.context.currentTime + duration)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }

  playAmbient(mode: 'calm' | 'excite' | 'focus') {
    if (!this.enabled || !this.context) return

    try {
      if (this.context.state === 'suspended') {
        this.context.resume()
      }

      const oscillator1 = this.context.createOscillator()
      const oscillator2 = this.context.createOscillator()
      const gainNode = this.context.createGain()

      const baseFreq = mode === 'calm' ? 150 : mode === 'focus' ? 200 : 250

      oscillator1.type = 'sine'
      oscillator1.frequency.setValueAtTime(baseFreq, this.context.currentTime)
      oscillator1.frequency.linearRampToValueAtTime(baseFreq * 1.5, this.context.currentTime + 1)
      oscillator1.frequency.linearRampToValueAtTime(baseFreq, this.context.currentTime + 2)

      oscillator2.type = 'sine'
      oscillator2.frequency.setValueAtTime(baseFreq * 1.5, this.context.currentTime)
      oscillator2.frequency.linearRampToValueAtTime(baseFreq, this.context.currentTime + 1)
      oscillator2.frequency.linearRampToValueAtTime(baseFreq * 1.5, this.context.currentTime + 2)

      gainNode.gain.setValueAtTime(this.volume * 0.1, this.context.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, this.context.currentTime + 1)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.context.currentTime + 2)

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(this.context.destination)

      oscillator1.start(this.context.currentTime)
      oscillator1.stop(this.context.currentTime + 2)
      oscillator2.start(this.context.currentTime)
      oscillator2.stop(this.context.currentTime + 2)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }
}

export const AudioContext = new AudioContextClass()

export function useAudio() {
  return {
    playClick: () => AudioContext.playClick(),
    playSuccess: () => AudioContext.playSuccess(),
    playModeSwitch: () => AudioContext.playModeSwitch(),
    playCountdown: () => AudioContext.playCountdown(),
    playComplete: () => AudioContext.playComplete(),
    playCapture: () => AudioContext.playCapture(),
    playError: () => AudioContext.playError(),
    playPause: () => AudioContext.playPause(),
    playResume: () => AudioContext.playResume(),
    playBreathing: () => AudioContext.playBreathing(),
    playAmbient: (mode: 'calm' | 'excite' | 'focus') => AudioContext.playAmbient(mode),
    setEnabled: (enabled: boolean) => AudioContext.setEnabled(enabled),
    setVolume: (volume: number) => AudioContext.setVolume(volume),
    isEnabled: () => AudioContext.isEnabled(),
    getVolume: () => AudioContext.getVolume()
  }
}
