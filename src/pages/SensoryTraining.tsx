import { useCallback, useEffect, useState } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderTracking } from '@/renderers/TrackingRenderer'
import { renderCalm } from '@/renderers/CalmRenderer'
import { renderExcite } from '@/renderers/ExciteRenderer'
import { renderColorCarousel } from '@/renderers/ColorCarouselRenderer'
import ControlBar from '@/components/ControlBar'
import CountdownOverlay from '@/components/CountdownOverlay'
import TrainingCompleteModal from '@/components/TrainingCompleteModal'
import AchievementUnlockModal from '@/components/AchievementUnlockModal'
import EyeBreakReminder from '@/components/EyeBreakReminder'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingHistory } from '@/hooks/useTrainingHistory'
import { useAchievements } from '@/hooks/useAchievements'
import { useEyeHealth } from '@/hooks/useEyeHealth'
import { useKeyboardShortcuts, useSwipeToChangeMode } from '@/hooks/useGestures'

const MODE_LABELS = {
  tracking: '视觉追踪训练',
  carousel: '颜色轮播',
  calm: '舒缓模式',
  excite: '兴奋模式',
}

export default function SensoryTraining() {
  const navigate = useNavigate()
  const mode = useTrainingStore((s) => s.mode)
  const setMode = useTrainingStore((s) => s.setMode)
  const speed = useTrainingStore((s) => s.speed)
  const setSpeed = useTrainingStore((s) => s.setSpeed)
  const setBrightness = useTrainingStore((s) => s.setBrightness)
  const togglePause = useTrainingStore((s) => s.togglePause)
  const isPaused = useTrainingStore((s) => s.isPaused)
  const timerSeconds = useTrainingStore((s) => s.timerSeconds)
  const timerCompleted = useTrainingStore((s) => s.timerCompleted)
  const timerActive = useTrainingStore((s) => s.timerActive)
  const settings = useTrainingStore((s) => s.settings)
  const setTimerCompleted = useTrainingStore((s) => s.setTimerCompleted)
  const resetTimer = useTrainingStore((s) => s.resetTimer)
  const setTimerActive = useTrainingStore((s) => s.setTimerActive)
  const setTimerSeconds = useTrainingStore((s) => s.setTimerSeconds)
  
  const [showControls, setShowControls] = useState(true)
  const [showCountdown, setShowCountdown] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [completedDuration, setCompletedDuration] = useState(0)
  const [hasRecorded, setHasRecorded] = useState(false)
  
  const { addSession, getStreak } = useTrainingHistory()
  const { recordTraining, newlyUnlocked, clearNewlyUnlocked } = useAchievements()
  const { showBreakReminder, breakCountdown, startSession, stopSession, dismissBreak } = useEyeHealth()
  const { goToNextMode, goToPrevMode } = useSwipeToChangeMode()

  const isCastMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('cast') === 'true'

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!isCastMode) return
    ;(window as any).__castUpdate = (
      newMode: string,
      newSpeed: number,
      newBrightness: number,
      newIsPaused: boolean,
      _page: string
    ) => {
      setMode(newMode as any)
      setSpeed(newSpeed)
      setBrightness(newBrightness)
      const currentPaused = useTrainingStore.getState().isPaused
      if (newIsPaused !== currentPaused) {
        togglePause()
      }
    }
  }, [isCastMode, setMode, setSpeed, setBrightness, togglePause])

  useEffect(() => {
    if (timerCompleted && !hasRecorded && !isCastMode) {
      setHasRecorded(true)
      setCompletedDuration(timerSeconds)
      
      const streak = getStreak()
      const newAchievements = recordTraining('sensory', timerSeconds, streak)
      
      addSession({
        timestamp: Date.now(),
        duration: timerSeconds,
        mode: mode,
        modeLabel: MODE_LABELS[mode],
        completed: true,
      })
      
      setShowComplete(true)
    }
  }, [timerCompleted, hasRecorded, timerSeconds, isCastMode, mode, recordTraining, addSession, getStreak])

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr

      switch (mode) {
        case 'tracking':
          renderTracking(ctx, timestamp, width, height)
          break
        case 'carousel':
          renderColorCarousel(ctx, timestamp, width, height)
          break
        case 'calm':
          renderCalm(ctx, timestamp, width, height)
          break
        case 'excite':
          renderExcite(ctx, timestamp, width, height)
          break
      }
    },
    [mode]
  )

  const canvasRef = useCanvas(render)

  const handleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleCanvasClick = () => {
    if (!isCastMode && !showCountdown && !showComplete) {
      setShowControls((prev) => !prev)
    }
  }

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    setHasRecorded(false)
    if (settings.timerEnabled) {
      setTimerSeconds(0)
      setTimerActive(true)
      setTimerCompleted(false)
    }
    startSession()
  }

  const handleStartWithTimer = (minutes: number) => {
    setHasRecorded(false)
    setShowCountdown(true)
    useTrainingStore.getState().updateSettings({ timerMinutes: minutes, timerEnabled: true })
  }

  useKeyboardShortcuts({
    enabled: !showCountdown && !showComplete && !isCastMode,
    onSpace: togglePause,
    onArrowLeft: goToPrevMode,
    onArrowRight: goToNextMode,
    onArrowUp: () => setSpeed(Math.min(speed + 0.2, 5)),
    onArrowDown: () => setSpeed(Math.max(speed - 0.2, 0.2)),
    onKeyF: handleFullscreen,
    onEscape: () => navigate('/'),
    onDigit: (digit) => {
      const timerPresets = [5, 10, 15, 20, 25, 30, 35, 40, 45, 60]
      const minutes = timerPresets[digit]
      if (minutes && !timerActive) {
        handleStartWithTimer(minutes)
      }
    },
  })

  const handleRestart = () => {
    setShowComplete(false)
    setHasRecorded(false)
    resetTimer()
    setShowCountdown(true)
  }

  const handleCloseComplete = () => {
    setShowComplete(false)
    resetTimer()
    setHasRecorded(false)
    stopSession()
  }

  const brightness = useTrainingStore((s) => s.brightness)

  return (
    <div className="h-screen w-screen bg-dark relative m-0 p-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer transition-all duration-300"
        onClick={handleCanvasClick}
        style={{
          filter: `brightness(${brightness})`,
          transform: isPaused ? 'scale(1)' : 'scale(1)',
        }}
      />

      {!isCastMode && showControls && (
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <span className="text-white/70 text-sm font-medium">
              {MODE_LABELS[mode]}
            </span>
          </div>
        </div>
      )}

      {!isCastMode && showControls && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
        </div>
      )}

      {!isCastMode && showControls && <ControlBar onQuickStart={handleStartWithTimer} />}

      {showCountdown && (
        <CountdownOverlay
          label={`${MODE_LABELS[mode]}即将开始`}
          onComplete={handleCountdownComplete}
        />
      )}

      {showComplete && (
        <TrainingCompleteModal
          duration={completedDuration}
          mode={mode}
          modeLabel={MODE_LABELS[mode]}
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

      {isPaused && !showCountdown && !showComplete && !isCastMode && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-white/80 text-4xl font-bold mb-2">已暂停</div>
            <div className="text-white/40 text-sm">点击画面或按空格键继续</div>
          </div>
        </div>
      )}

      {showBreakReminder && (
        <EyeBreakReminder
          countdown={breakCountdown}
          onDismiss={dismissBreak}
        />
      )}
    </div>
  )
}
