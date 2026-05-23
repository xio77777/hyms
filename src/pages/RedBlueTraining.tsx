import { useCallback } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderRedBlue } from '@/renderers/RedBlueRenderer'
import ControlBar from '@/components/ControlBar'
import { ArrowLeft, Pause, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * 红蓝光交替刺激训练页
 * 红光激活视觉通路，蓝光舒缓神经
 */
export default function RedBlueTraining() {
  const navigate = useNavigate()
  const { isPaused, togglePause } = useTrainingStore()

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      renderRedBlue(ctx, timestamp, width, height)
    },
    []
  )

  const canvasRef = useCanvas(render)

  return (
    <div className="h-full w-full bg-dark relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-white/70 text-sm font-medium">
            红蓝光交替刺激
          </span>
        </div>
        <button
          onClick={togglePause}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" />
              <span className="text-sm">继续</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              <span className="text-sm">暂停</span>
            </>
          )}
        </button>
      </div>

      <ControlBar />
    </div>
  )
}
