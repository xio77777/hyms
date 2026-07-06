import { useEffect } from 'react'
import { ArrowLeft, Pause, Play, Maximize, Eye, CloudRain, Zap, Palette, Timer, Volume2, VolumeX, Clock, RotateCcw, Music } from 'lucide-react'
import { useTrainingStore, type TrainingMode } from '@/store/trainingStore'
import { useNavigate } from 'react-router-dom'
import CastButton from '@/components/CastButton'
import { useCast } from '@/hooks/useCast'
import { useAmbientSound, AMBIENT_SOUNDS } from '@/hooks/useAmbientSound'

interface ModeOption {
  key: TrainingMode
  label: string
  icon: React.ReactNode
  color: string
}

const MODES: ModeOption[] = [
  { key: 'carousel', label: '轮播', icon: <Palette className="w-4 h-4" />, color: 'text-green-400' },
  { key: 'tracking', label: '追踪', icon: <Eye className="w-4 h-4" />, color: 'text-neon-cyan' },
  { key: 'calm', label: '舒缓', icon: <CloudRain className="w-4 h-4" />, color: 'text-calm-lavender' },
  { key: 'excite', label: '兴奋', icon: <Zap className="w-4 h-4" />, color: 'text-neon-gold' },
]

const TIMER_OPTIONS = [
  { label: '3分钟', minutes: 3 },
  { label: '5分钟', minutes: 5 },
  { label: '10分钟', minutes: 10 },
  { label: '15分钟', minutes: 15 },
  { label: '20分钟', minutes: 20 },
  { label: '30分钟', minutes: 30 },
]

interface ControlBarProps {
  onQuickStart?: (minutes: number) => void
}

export default function ControlBar({ onQuickStart }: ControlBarProps) {
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
  const { currentSound, volume, enabled, selectSound, setVolume, toggleEnabled } = useAmbientSound()

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

  const handleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const toggleVoice = () => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled })
    if (!settings.voiceEnabled) {
      speak('语音播报已开启')
    }
  }

  const startTimer = (minutes: number) => {
    if (onQuickStart) {
      onQuickStart(minutes)
      return
    }
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

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {timerActive && (
        <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-2 py-1">
          <div className="flex items-center gap-3 max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-white/70 text-xs font-mono">
                {formatTime(timerSeconds)} / {formatTime(settings.timerMinutes * 60)}
              </span>
            </div>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-1000"
                style={{ width: `${getElapsedPercent()}%` }}
              />
            </div>
            <button
              onClick={stopTimer}
              className="p-1 text-white/50 hover:text-white transition-colors"
              title="停止计时"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {timerCompleted && (
        <div className="bg-neon-cyan/10 backdrop-blur-sm border-b border-neon-cyan/20 px-2 py-2">
          <div className="flex items-center justify-center gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>🎉 训练完成！用时 {formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={stopTimer}
              className="px-3 py-1 bg-neon-cyan/20 hover:bg-neon-cyan/30 rounded-lg text-neon-cyan text-xs transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      )}

      <div className="bg-black/70 backdrop-blur-xl border-t border-white/10 px-2 py-2 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 max-w-5xl mx-auto">
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors px-1.5 py-1 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">返回</span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`
                    flex items-center justify-center gap-0.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all min-w-[28px] sm:min-w-0
                    ${mode === m.key
                      ? `${m.color} bg-white/10 border border-white/20`
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4">{m.icon}</span>
                  <span className="hidden sm:inline ml-1">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-center flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-white/40 text-[10px] sm:text-xs w-5 sm:w-8">速度</span>
              <input
                type="range"
                min="0.2"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-14 sm:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
              />
              <span className="text-white/60 text-[10px] sm:text-xs w-6 sm:w-8">{speed.toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-white/40 text-[10px] sm:text-xs w-5 sm:w-8">亮度</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-14 sm:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 sm:[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-gold
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
              <span className="text-white/60 text-[10px] sm:text-xs w-6 sm:w-8">{Math.round(brightness * 100)}%</span>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={togglePause}
                className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
                title={isPaused ? '继续' : '暂停'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFullscreen}
                className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
                title="全屏"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                onClick={toggleVoice}
                className={`transition-colors p-1 sm:p-2 rounded-lg ${
                  settings.voiceEnabled
                    ? 'text-neon-cyan hover:bg-neon-cyan/10'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                }`}
                title={settings.voiceEnabled ? '关闭语音' : '开启语音'}
              >
                {settings.voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <div className="relative group">
                <button
                  className={`text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10 ${
                    timerActive ? 'text-neon-cyan bg-neon-cyan/10' : ''
                  }`}
                  title="训练计时器"
                >
                  <Clock className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-gray-900 border border-white/10 rounded-xl p-3 shadow-xl min-w-[200px]">
                    <div className="text-white/60 text-xs mb-2">训练计时</div>
                    <div className="grid grid-cols-3 gap-2">
                      {TIMER_OPTIONS.map((opt) => (
                        <button
                          key={opt.minutes}
                          onClick={() => startTimer(opt.minutes)}
                          disabled={timerActive}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            timerActive
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={toggleEnabled}
                  className={`transition-colors p-1 sm:p-2 rounded-lg ${
                    enabled
                      ? 'text-neon-magenta hover:bg-neon-magenta/10'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                  }`}
                  title={enabled ? '关闭环境音' : '环境音效'}
                >
                  <Music className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50">
                  <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[220px]">
                    <div className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                      <Music className="w-4 h-4 text-neon-magenta" />
                      环境音效
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {AMBIENT_SOUNDS.filter(s => s.id !== 'none').map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => selectSound(sound.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                            currentSound === sound.id && enabled
                              ? 'bg-neon-magenta/20 border border-neon-magenta/40 text-neon-magenta'
                              : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent'
                          }`}
                        >
                          <span className="text-xl">{sound.icon}</span>
                          <span className="text-xs">{sound.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <VolumeX className="w-3.5 h-3.5 text-white/40" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-magenta
                          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,0,255,0.5)]"
                      />
                      <Volume2 className="w-3.5 h-3.5 text-white/40" />
                    </div>
                    <div className="text-center text-white/40 text-xs mt-1">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              <CastButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
