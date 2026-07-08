import { useEffect } from 'react'
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Clock, RotateCcw, Sun, Zap, Timer } from 'lucide-react'
import { useTrainingStore, type TrainingMode } from '@/store/trainingStore'
import { useNavigate } from 'react-router-dom'
import CastButton from '@/components/CastButton'
import { useCast } from '@/hooks/useCast'

interface ModeOption {
  key: TrainingMode
  label: string
  icon: React.ReactNode
  color: string
}

const MODES: ModeOption[] = [
  { key: 'tracking', label: '追踪', icon: <Zap className="w-6 h-6" />, color: 'border-neon-cyan text-neon-cyan' },
  { key: 'calm', label: '舒缓', icon: <Sun className="w-6 h-6" />, color: 'border-calm-lavender text-calm-lavender' },
  { key: 'excite', label: '兴奋', icon: <Zap className="w-6 h-6" />, color: 'border-neon-gold text-neon-gold' },
]

const TIMER_OPTIONS = [
  { label: '3分', minutes: 3 },
  { label: '5分', minutes: 5 },
  { label: '10分', minutes: 10 },
  { label: '15分', minutes: 15 },
]

export default function ControlBar() {
  const navigate = useNavigate()
  const {
    mode, speed, brightness, isPaused,
    timerSeconds, timerActive, timerCompleted,
    settings,
    setMode, setSpeed, setBrightness, togglePause,
    setTimerSeconds, setTimerActive, setTimerCompleted, resetTimer,
    updateSettings, speak
  } = useTrainingStore()
  const { isConnected, sendUpdate } = useCast()

  useEffect(() => {
    if (isConnected) {
      sendUpdate({ mode, speed, brightness, isPaused })
    }
  }, [mode, speed, brightness, isPaused, isConnected, sendUpdate])

  useEffect(() => {
    if (!timerActive || timerCompleted) return

    const interval = setInterval(() => {
      setTimerSeconds(timerSeconds + 1)
      
      if (timerSeconds > 0 && timerSeconds % 60 === 0) {
        const remainingMinutes = Math.ceil((settings.timerMinutes * 60 - timerSeconds) / 60)
        if (remainingMinutes > 0) {
          speak(`${remainingMinutes}分钟`)
        }
      }
      
      if (timerSeconds >= settings.timerMinutes * 60) {
        setTimerActive(false)
        setTimerCompleted(true)
        speak('训练完成')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timerCompleted, timerSeconds, settings.timerMinutes, setTimerSeconds, setTimerActive, setTimerCompleted, speak])

  const toggleVoice = () => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled })
    if (!settings.voiceEnabled) {
      speak('语音播报已开启')
    }
  }

  const startTimer = (minutes: number) => {
    updateSettings({ timerMinutes: minutes, timerEnabled: true })
    setTimerSeconds(0)
    setTimerActive(true)
    setTimerCompleted(false)
    speak(`${minutes}分钟训练开始`)
  }

  const stopTimer = () => {
    setTimerActive(false)
    setTimerCompleted(false)
    resetTimer()
    speak('计时器已停止')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getElapsedPercent = () => {
    if (!settings.timerEnabled) return 0
    return Math.min((timerSeconds / (settings.timerMinutes * 60)) * 100, 100)
  }

  const handleBack = () => {
    speak('返回首页')
    navigate('/')
  }

  const handlePause = () => {
    togglePause()
    speak(isPaused ? '训练继续' : '训练暂停')
  }

  const handleModeChange = (newMode: TrainingMode, label: string) => {
    setMode(newMode)
    speak(`${label}模式`)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {timerActive && (
        <div className="bg-black/60 backdrop-blur-sm border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-mono text-xl min-w-[120px]">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-1000"
                style={{ width: `${getElapsedPercent()}%` }}
              />
            </div>
            <button
              onClick={stopTimer}
              className="p-2 text-white/60 hover:text-white transition-colors bg-white/10 rounded-xl hover:bg-white/20"
              title="停止计时"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {timerCompleted && (
        <div className="bg-neon-cyan/20 backdrop-blur-sm border-b border-neon-cyan/40 px-4 py-4">
          <div className="flex items-center justify-center gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 text-neon-cyan text-xl font-medium">
              <Clock className="w-6 h-6" />
              <span>训练完成！用时 {formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={stopTimer}
              className="px-6 py-3 bg-neon-cyan/30 hover:bg-neon-cyan/40 rounded-xl text-neon-cyan text-lg font-medium transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      )}

      <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-4">
        <div className="flex flex-col items-center gap-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 w-full">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key, m.label)}
                className={`
                  flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-lg font-medium transition-all min-w-[100px]
                  ${mode === m.key
                    ? `${m.color} bg-white/10 border-2`
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border-2 border-transparent'
                  }
                `}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
              <span className="text-white/60 text-sm w-10">速度</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-32 h-3 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan
                  [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(0,229,255,0.6)]"
              />
              <span className="text-white font-mono text-sm w-10">{speed.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
              <span className="text-white/60 text-sm w-10">亮度</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-32 h-3 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-gold
                  [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,215,0,0.6)]"
              />
              <span className="text-white font-mono text-sm w-10">{Math.round(brightness * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-base">返回</span>
            </button>

            <button
              onClick={handlePause}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-xl font-bold transition-all ${
                isPaused
                  ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40 hover:bg-neon-cyan/30'
                  : 'bg-neon-gold/20 text-neon-gold border-2 border-neon-gold/40 hover:bg-neon-gold/30'
              }`}
            >
              {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
              <span>{isPaused ? '继续' : '暂停'}</span>
            </button>

            <button
              onClick={toggleVoice}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
                settings.voiceEnabled
                  ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40 hover:bg-neon-cyan/30'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              {settings.voiceEnabled ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
              <span className="text-base">{settings.voiceEnabled ? '语音开' : '语音关'}</span>
            </button>

            <div className="relative">
              <button
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all ${
                  timerActive
                    ? 'bg-neon-magenta/20 text-neon-magenta border-2 border-neon-magenta/40'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-6 h-6" />
                <span className="text-base">计时</span>
              </button>
              
              {!timerActive && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                  <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
                    <div className="text-white/60 text-sm mb-3 text-center">选择时长</div>
                    <div className="grid grid-cols-2 gap-2">
                      {TIMER_OPTIONS.map((opt) => (
                        <button
                          key={opt.minutes}
                          onClick={() => startTimer(opt.minutes)}
                          className="px-4 py-3 rounded-xl text-white font-medium transition-all bg-white/10 hover:bg-white/20 hover:text-white"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <CastButton />
          </div>
        </div>
      </div>
    </div>
  )
}
