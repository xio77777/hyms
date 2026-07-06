import { useCallback, useEffect, useRef, useState } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { renderBreathing, BREATHING_PATTERNS, type BreathingPattern, getBreathingPhase } from '@/renderers/BreathingRenderer'
import CountdownOverlay from '@/components/CountdownOverlay'
import TrainingCompleteModal from '@/components/TrainingCompleteModal'
import AchievementUnlockModal from '@/components/AchievementUnlockModal'
import { ArrowLeft, Play, Pause, Wind, Volume2, VolumeX, Clock, RotateCcw, Maximize } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingHistory } from '@/hooks/useTrainingHistory'
import { useAchievements } from '@/hooks/useAchievements'
import { useAmbientSound, AMBIENT_SOUNDS } from '@/hooks/useAmbientSound'
import { useTrainingStore } from '@/store/trainingStore'

const TIMER_OPTIONS = [
  { label: '3分钟', minutes: 3 },
  { label: '5分钟', minutes: 5 },
  { label: '10分钟', minutes: 10 },
  { label: '15分钟', minutes: 15 },
  { label: '20分钟', minutes: 20 },
  { label: '30分钟', minutes: 30 },
]

export default function BreathingTraining() {
  const navigate = useNavigate()
  const { speak, settings, updateSettings } = useTrainingStore()
  const { addSession, getStreak } = useTrainingHistory()
  const { recordTraining, newlyUnlocked, clearNewlyUnlocked } = useAchievements()
  const { currentSound, volume, enabled, selectSound, setVolume, toggleEnabled } = useAmbientSound()

  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0])
  const [isRunning, setIsRunning] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showCountdown, setShowCountdown] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [completedDuration, setCompletedDuration] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerActive, setTimerActive] = useState(false)
  const [showPatternSelector, setShowPatternSelector] = useState(false)
  const [showTimerSelector, setShowTimerSelector] = useState(false)
  const [showSoundSelector, setShowSoundSelector] = useState(false)

  const elapsedRef = useRef(0)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const updateElapsed = useCallback(() => {
    if (isRunning) {
      const now = performance.now()
      elapsedRef.current = (now - startTimeRef.current) / 1000
      setElapsedSeconds(Math.floor(elapsedRef.current))

      if (timerActive && elapsedRef.current >= timerMinutes * 60) {
        setIsRunning(false)
        setTimerActive(false)
        setCompletedDuration(timerMinutes * 60)

        if (!hasRecorded) {
          setHasRecorded(true)
          const streak = getStreak()
          recordTraining('breathing', timerMinutes * 60, streak)
          addSession({
            timestamp: Date.now(),
            duration: timerMinutes * 60,
            mode: 'breathing',
            modeLabel: `呼吸训练 - ${selectedPattern.name}`,
            completed: true,
          })
        }

        setShowComplete(true)
        speak('呼吸训练完成')
        return
      }

      animFrameRef.current = requestAnimationFrame(updateElapsed)
    }
  }, [isRunning, timerActive, timerMinutes, hasRecorded, selectedPattern.name, recordTraining, addSession, getStreak, speak])

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedRef.current * 1000
      animFrameRef.current = requestAnimationFrame(updateElapsed)
    } else {
      cancelAnimationFrame(animFrameRef.current)
    }
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isRunning, updateElapsed])

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr

      renderBreathing(ctx, timestamp, width, height, selectedPattern, elapsedRef.current)
    },
    [selectedPattern]
  )

  const canvasRef = useCanvas(render)

  const handleCanvasClick = () => {
    if (!showCountdown && !showComplete) {
      setShowControls((prev) => !prev)
    }
  }

  const handleStart = () => {
    setShowCountdown(true)
  }

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    setHasRecorded(false)
    setElapsedSeconds(0)
    elapsedRef.current = 0
    setIsRunning(true)
    setTimerActive(true)
    speak(`${selectedPattern.name}开始`)
  }

  const togglePause = () => {
    setIsRunning((prev) => !prev)
    speak(isRunning ? '已暂停' : '继续')
  }

  const handleRestart = () => {
    setShowComplete(false)
    setHasRecorded(false)
    setElapsedSeconds(0)
    elapsedRef.current = 0
    setShowCountdown(true)
  }

  const handleCloseComplete = () => {
    setShowComplete(false)
    setElapsedSeconds(0)
    elapsedRef.current = 0
    setHasRecorded(false)
    setTimerActive(false)
  }

  const handleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getElapsedPercent = () => {
    if (!timerActive) return 0
    return Math.min((elapsedSeconds / (timerMinutes * 60)) * 100, 100)
  }

  const currentPhaseInfo = getBreathingPhase(selectedPattern, elapsedRef.current)

  return (
    <div className="h-screen w-screen bg-dark relative m-0 p-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {showControls && (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <div className="text-white/90 text-sm font-medium flex items-center gap-2">
              <Wind className="w-4 h-4" style={{ color: selectedPattern.color }} />
              {selectedPattern.name}
            </div>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <span className="text-white/70 text-sm font-mono">
              {formatTime(elapsedSeconds)} / {formatTime(timerMinutes * 60)}
            </span>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {timerActive && isRunning && (
            <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-2 py-1">
              <div className="flex items-center gap-3 max-w-5xl mx-auto">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${getElapsedPercent()}%`,
                      backgroundColor: selectedPattern.color,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/70 backdrop-blur-xl border-t border-white/10 px-6 py-4">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPatternSelector(!showPatternSelector)
                      setShowTimerSelector(false)
                      setShowSoundSelector(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 transition-colors"
                  >
                    <Wind className="w-4 h-4" />
                    <span className="text-sm">呼吸模式</span>
                  </button>

                  {showPatternSelector && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[280px] z-50">
                      <div className="text-white/80 text-sm font-medium mb-3">选择呼吸模式</div>
                      <div className="space-y-2">
                        {BREATHING_PATTERNS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPattern(p)
                              setShowPatternSelector(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              selectedPattern.id === p.id
                                ? 'bg-white/10 border border-white/20'
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-white font-medium text-sm">{p.name}</span>
                            </div>
                            <div className="text-white/50 text-xs pl-5">{p.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowTimerSelector(!showTimerSelector)
                      setShowPatternSelector(false)
                      setShowSoundSelector(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{timerMinutes}分钟</span>
                  </button>

                  {showTimerSelector && (
                    <div className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[200px] z-50">
                      <div className="text-white/80 text-sm font-medium mb-3">训练时长</div>
                      <div className="grid grid-cols-3 gap-2">
                        {TIMER_OPTIONS.map((opt) => (
                          <button
                            key={opt.minutes}
                            onClick={() => {
                              setTimerMinutes(opt.minutes)
                              setShowTimerSelector(false)
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              timerMinutes === opt.minutes
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSoundSelector(!showSoundSelector)
                      setShowPatternSelector(false)
                      setShowTimerSelector(false)
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      enabled
                        ? 'text-neon-magenta bg-neon-magenta/10'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                    }`}
                    title="环境音效"
                  >
                    {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  {showSoundSelector && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl min-w-[220px] z-50">
                      <div className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-neon-magenta" />
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
                  )}
                </div>

                <button
                  onClick={handleFullscreen}
                  className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="全屏"
                >
                  <Maximize className="w-5 h-5" />
                </button>

                {isRunning ? (
                  <button
                    onClick={togglePause}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white font-medium transition-all"
                  >
                    <Pause className="w-5 h-5" />
                    <span>暂停</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-6 py-2.5 text-black font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: selectedPattern.color }}
                  >
                    <Play className="w-5 h-5 fill-black" />
                    <span>开始</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCountdown && (
        <CountdownOverlay
          label={`${selectedPattern.name}即将开始`}
          onComplete={handleCountdownComplete}
        />
      )}

      {showComplete && (
        <TrainingCompleteModal
          duration={completedDuration}
          mode="breathing"
          modeLabel={`呼吸训练 - ${selectedPattern.name}`}
          onClose={handleCloseComplete}
          onRestart={handleRestart}
        />
      )}

      {newlyUnlocked.length > 0 && !showComplete && (
        <AchievementUnlockModal
          achievements={newlyUnlocked}
          onClose={clearNewlyUnlocked}
        />
      )}

      {!isRunning && !showCountdown && !showComplete && showControls && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-white/80 text-2xl font-bold mb-2">
              {selectedPattern.name}
            </div>
            <div className="text-white/50 text-sm mb-4">
              {selectedPattern.description}
            </div>
            <div className="text-white/30 text-sm">
              点击下方「开始」按钮开始训练
            </div>
          </div>
        </div>
      )}

      {!isRunning && !showCountdown && !showComplete && isRunning === false && elapsedSeconds > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-white/80 text-4xl font-bold mb-2">已暂停</div>
            <div className="text-white/40 text-sm">点击画面或按空格键继续</div>
          </div>
        </div>
      )}
    </div>
  )
}
