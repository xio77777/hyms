import { useCallback, useEffect, useState } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderEyeMovement } from '@/renderers/EyeMovementRenderer'
import ControlBar from '@/components/ControlBar'
import CountdownOverlay from '@/components/CountdownOverlay'

export default function EyeMovementTraining() {
  const { speak } = useTrainingStore()
  const [showControls, setShowControls] = useState(true)
  const [showCountdown, setShowCountdown] = useState(true)

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
  }, [])

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      renderEyeMovement(ctx, timestamp, width, height)
    },
    []
  )

  const canvasRef = useCanvas(render)

  const handleCanvasClick = () => {
    if (!showCountdown) {
      setShowControls((prev) => !prev)
    }
  }

  return (
    <div className="h-screen w-screen bg-dark relative m-0 p-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {showCountdown && (
        <CountdownOverlay
          trainingName="眼球运动训练"
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {showControls && !showCountdown && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
            <span className="text-white/80 text-lg font-medium">
              眼球运动引导
            </span>
          </div>
        </div>
      )}

      {!showCountdown && (
        <div style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }} className="transition-opacity duration-300">
          <ControlBar />
        </div>
      )}
    </div>
  )
}
