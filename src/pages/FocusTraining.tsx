import { useCallback } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderFocus } from '@/renderers/FocusRenderer'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * 视觉聚焦训练页
 * 中心目标在远近之间缩放，引导视线切换聚焦
 */
export default function FocusTraining() {
  const navigate = useNavigate()
  const { isPaused, togglePause, speed, setSpeed, brightness, setBrightness } = useTrainingStore()

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, timestamp: number) => {
      const canvas = ctx.canvas
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      renderFocus(ctx, timestamp, width, height)
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
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-white/70 text-sm font-medium">
            视觉聚焦训练
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-center gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs">速度</span>
              <input
                type="range"
                min="0.3"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
              />
              <span className="text-white/60 text-xs w-10">{speed.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-xs">亮度</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-32 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-gold
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              />
              <span className="text-white/60 text-xs w-10">{Math.round(brightness * 100)}%</span>
            </div>
            <button
              onClick={togglePause}
              className="text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              {isPaused ? '继续' : '暂停'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
