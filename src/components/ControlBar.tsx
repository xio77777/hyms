import { useEffect, useState } from 'react'
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Clock, RotateCcw, Sun, Zap, Timer, ChevronUp, ChevronDown, Disc } from 'lucide-react'
import { useTrainingStore, type TrainingMode } from '@/store/trainingStore'
import { useNavigate } from 'react-router-dom'
import CastButton from '@/components/CastButton'
import { useCast } from '@/hooks/useCast'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'

interface ModeOption {
  key: TrainingMode
  label: string
  icon: React.ReactNode
  color: string
}

const MODES: ModeOption[] = [
  { key: 'tracking', label: '追踪', icon: <Zap className="w-6 h-6" />, color: 'border-neon-cyan text-neon-cyan' },
  { key: 'carousel', label: '轮播', icon: <Disc className="w-6 h-6" />, color: 'border-neon-magenta text-neon-magenta' },
  { key: 'calm', label: '舒缓', icon: <Sun className="w-6 h-6" />, color: 'border-calm-lavender text-calm-lavender' },
  { key: 'excite', label: '兴奋', icon: <Zap className="w-6 h-6" />, color: 'border-neon-gold text-neon-gold' },
]

const SPEED_PRESETS = [
  { label: '慢', value: 0.5 },
  { label: '中', value: 1 },
  { label: '快', value: 2 },
]

const BRIGHTNESS_PRESETS = [
  { label: '暗', value: 0.5 },
  { label: '中', value: 0.8 },
  { label: '亮', value: 1 },
]

const TIMER_OPTIONS = [
  { label: '3分', minutes: 3 },
  { label: '5分', minutes: 5 },
  { label: '10分', minutes: 10 },
  { label: '15分', minutes: 15 },
]

export default function ControlBar() {
  const navigate = useNavigate()
  const [showTimerMenu, setShowTimerMenu] = useState(false)
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const {
    mode, speed, brightness, isPaused,
    timerSeconds, timerActive, timerCompleted,
    settings,
    setMode, setSpeed, setBrightness, setIsPaused, togglePause,
    setTimerSeconds, setTimerActive, setTimerCompleted, resetTimer,
    updateSettings, speak
  } = useTrainingStore()
  const { isConnected, sendUpdate } = useCast()

  const handleBack = () => {
    speak('返回首页')
    navigate('/')
  }

  useKeyboardNav(() => {
    if (showTimerMenu) {
      setShowTimerMenu(false)
    } else if (controlsExpanded) {
      setControlsExpanded(false)
    } else {
      handleBack()
    }
  })

  useEffect(() => {
    if (isConnected) {
      sendUpdate({ mode, speed, brightness, isPaused })
    }
  }, [mode, speed, brightness, isPaused, isConnected, sendUpdate])

  useEffect(() => {
    if (!timerActive || timerCompleted) return

    const interval = setInterval(() => {
      setTimerSeconds((prev: number) => {
        const next = prev + 1
        const totalSeconds = settings.timerMinutes * 60

        if (next > 0 && next % 60 === 0) {
          const remainingMinutes = Math.ceil((totalSeconds - next) / 60)
          if (remainingMinutes > 0) {
            speak(`${remainingMinutes}分钟`)
          }
        }

        if (next >= totalSeconds) {
          setTimerActive(false)
          setTimerCompleted(true)
          speak('训练完成，按返回键回到首页')
        }

        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timerCompleted, settings.timerMinutes, setTimerSeconds, setTimerActive, setTimerCompleted, speak])

  const toggleVoice = () => {
    if (settings.voiceEnabled) {
      speak('语音播报已关闭')
      setTimeout(() => updateSettings({ voiceEnabled: false }), 500)
    } else {
      updateSettings({ voiceEnabled: true })
      setTimeout(() => speak('语音播报已开启'), 100)
    }
  }

  const startTimer = (minutes: number) => {
    updateSettings({ timerMinutes: minutes, timerEnabled: true })
    setTimerSeconds(0)
    setTimerActive(true)
    setTimerCompleted(false)
    setShowTimerMenu(false)
    speak(`${minutes}分钟训练开始`)
  }

  const handleSpeedChange = (value: number, label: string) => {
    setSpeed(value)
    speak(`速度${label}`)
  }

  const handleBrightnessChange = (value: number, label: string) => {
    setBrightness(value)
    speak(`亮度${label}`)
  }

  const continueTraining = () => {
    setTimerActive(false)
    setTimerCompleted(false)
    resetTimer()
    setIsPaused(false)
    speak('继续训练')
  }

  const stopTimer = () => {
    if (window.confirm('确定停止计时吗？')) {
      setTimerActive(false)
      setTimerCompleted(false)
      resetTimer()
      speak('计时器已停止')
    }
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

  const handlePause = () => {
    togglePause()
    speak(isPaused ? '训练继续' : '训练暂停')
  }

  const handleModeChange = (newMode: TrainingMode, label: string) => {
    setMode(newMode)
    speak(`${label}模式`)
  }

  const toggleExpand = () => {
    const newExpanded = !controlsExpanded
    setControlsExpanded(newExpanded)
    speak(newExpanded ? '控制面板已展开' : '控制面板已收起')
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {timerActive && !timerCompleted && (
        <div className="bg-black/60 backdrop-blur-sm border-b-2 border-white/10 px-4 py-3">
          <div className="flex items-center gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6 text-neon-cyan" />
              <span className="text-white font-mono text-2xl font-bold min-w-[140px]">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-1000 rounded-full"
                style={{ width: `${getElapsedPercent()}%` }}
              />
            </div>
            <button
              onClick={stopTimer}
              className="w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors bg-white/10 rounded-2xl hover:bg-white/20"
              title="停止计时"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {timerCompleted && (
        <div className="bg-neon-cyan/20 backdrop-blur-sm border-b-2 border-neon-cyan/40 px-4 py-6">
          <div className="flex flex-col items-center gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 text-neon-cyan text-2xl font-bold">
              <Clock className="w-8 h-8" />
              <span>训练完成！用时 {formatTime(timerSeconds)}</span>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={continueTraining}
                className="px-8 py-4 bg-neon-cyan/30 hover:bg-neon-cyan/40 rounded-2xl text-neon-cyan text-xl font-bold transition-colors border-2 border-neon-cyan/40"
              >
                继续训练
              </button>
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-xl font-bold transition-colors border-2 border-white/20"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}

      {!timerCompleted && (
        <div className="bg-black/80 backdrop-blur-xl border-t-2 border-white/10">
          {!controlsExpanded ? (
            <div className="flex items-center justify-center gap-4 px-4 py-3 flex-wrap">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl hover:bg-white/10 text-lg"
              >
                <ArrowLeft className="w-6 h-6" />
                <span>返回</span>
              </button>

              <button
                onClick={handlePause}
                className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-2xl font-bold transition-all ${
                  isPaused
                    ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40 hover:bg-neon-cyan/30'
                    : 'bg-neon-gold/20 text-neon-gold border-2 border-neon-gold/40 hover:bg-neon-gold/30'
                }`}
              >
                {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
                <span>{isPaused ? '继续' : '暂停'}</span>
              </button>

              <button
                onClick={toggleExpand}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl hover:bg-white/10 text-lg"
              >
                <ChevronUp className="w-6 h-6" />
                <span>更多</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 py-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-center gap-3 w-full flex-wrap">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleModeChange(m.key, m.label)}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-lg font-medium transition-all min-w-[100px]
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

              <div className="flex items-center justify-center gap-4 w-full flex-wrap">
                <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3 border-2 border-white/10">
                  <span className="text-white/70 text-lg w-12">速度</span>
                  {SPEED_PRESETS.map((preset) => {
                    const isActive = Math.abs(speed - preset.value) < 0.15
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handleSpeedChange(preset.value, preset.label)}
                        className={`
                          px-6 py-3 rounded-xl text-lg font-medium transition-all min-w-[64px]
                          ${isActive
                            ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40'
                            : 'text-white/50 hover:text-white/80 border-2 border-transparent hover:bg-white/5'
                          }
                        `}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3 border-2 border-white/10">
                  <span className="text-white/70 text-lg w-12">亮度</span>
                  {BRIGHTNESS_PRESETS.map((preset) => {
                    const isActive = Math.abs(brightness - preset.value) < 0.1
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handleBrightnessChange(preset.value, preset.label)}
                        className={`
                          px-6 py-3 rounded-xl text-lg font-medium transition-all min-w-[64px]
                          ${isActive
                            ? 'bg-neon-gold/20 text-neon-gold border-2 border-neon-gold/40'
                            : 'text-white/50 hover:text-white/80 border-2 border-transparent hover:bg-white/5'
                          }
                        `}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 w-full flex-wrap">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl hover:bg-white/10 text-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                  <span>返回</span>
                </button>

                <button
                  onClick={handlePause}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xl font-bold transition-all ${
                    isPaused
                      ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40 hover:bg-neon-cyan/30'
                      : 'bg-neon-gold/20 text-neon-gold border-2 border-neon-gold/40 hover:bg-neon-gold/30'
                  }`}
                >
                  {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
                  <span>{isPaused ? '继续' : '暂停'}</span>
                </button>

                <button
                  onClick={toggleVoice}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all text-lg ${
                    settings.voiceEnabled
                      ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40 hover:bg-neon-cyan/30'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  {settings.voiceEnabled ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <VolumeX className="w-6 h-6" />
                  )}
                  <span>{settings.voiceEnabled ? '语音开' : '语音关'}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => {
                      if (!timerActive) {
                        setShowTimerMenu(!showTimerMenu)
                        speak('计时')
                      }
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all text-lg ${
                      timerActive
                        ? 'bg-neon-magenta/20 text-neon-magenta border-2 border-neon-magenta/40'
                        : showTimerMenu
                          ? 'bg-neon-magenta/20 text-neon-magenta border-2 border-neon-magenta/40'
                          : 'text-white/70 hover:text-white hover:bg-white/10 border-2 border-transparent'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                    <span>{timerActive ? `${Math.ceil((settings.timerMinutes * 60 - timerSeconds) / 60)}分` : '计时'}</span>
                  </button>

                  {showTimerMenu && !timerActive && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowTimerMenu(false)}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
                        <div className="bg-black/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-4 shadow-2xl min-w-[200px]">
                          <div className="text-white/70 text-lg mb-3 text-center">选择时长</div>
                          <div className="grid grid-cols-2 gap-3">
                            {TIMER_OPTIONS.map((opt) => (
                              <button
                                key={opt.minutes}
                                onClick={() => startTimer(opt.minutes)}
                                className="px-6 py-4 rounded-xl text-white text-xl font-bold transition-all bg-white/10 hover:bg-white/20 hover:text-white border-2 border-transparent hover:border-neon-magenta/40"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <CastButton />

                <button
                  onClick={toggleExpand}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl hover:bg-white/10 text-lg"
                >
                  <ChevronDown className="w-6 h-6" />
                  <span>收起</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
