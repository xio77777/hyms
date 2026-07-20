import { useCallback, useEffect, useState } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderTracking } from '@/renderers/TrackingRenderer'
import { renderCalm } from '@/renderers/CalmRenderer'
import { renderExcite } from '@/renderers/ExciteRenderer'
import { renderColorCarousel } from '@/renderers/ColorCarouselRenderer'
import ControlBar from '@/components/ControlBar'
import CountdownOverlay from '@/components/CountdownOverlay'

const MODE_LABELS = {
  tracking: '视觉追踪训练',
  carousel: '颜色轮播',
  calm: '舒缓模式',
  excite: '兴奋模式',
}

export default function SensoryTraining() {
  const mode = useTrainingStore((s) => s.mode)
  const setMode = useTrainingStore((s) => s.setMode)
  const setSpeed = useTrainingStore((s) => s.setSpeed)
  const setBrightness = useTrainingStore((s) => s.setBrightness)
  const setIsPaused = useTrainingStore((s) => s.setIsPaused)
  const speak = useTrainingStore((s) => s.speak)
  const [showControls, setShowControls] = useState(true)
  const [showCountdown, setShowCountdown] = useState(true)

  const isCastMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('cast') === 'true'

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    setIsPaused(false)
    return () => {
      setIsPaused(false)
    }
  }, [setIsPaused])

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
      setIsPaused(newIsPaused)
    }
  }, [isCastMode, setMode, setSpeed, setBrightness, setIsPaused])

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

  const handleCanvasClick = () => {
    if (!isCastMode && !showCountdown) {
      setShowControls((prev) => {
        const next = !prev
        speak(next ? '控制面板已显示' : '进入专注模式')
        return next
      })
    }
  }

  return (
    <div className="h-screen w-screen bg-dark relative m-0 p-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {showCountdown && !isCastMode && (
        <CountdownOverlay
          trainingName={MODE_LABELS[mode]}
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {!isCastMode && showControls && !showCountdown && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
            <span className="text-white/80 text-lg font-medium">
              {MODE_LABELS[mode]}
            </span>
          </div>
        </div>
      )}

      {!isCastMode && !showCountdown && (
        <div style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }} className="transition-opacity duration-300">
          <ControlBar />
        </div>
      )}
    </div>
  )
}
