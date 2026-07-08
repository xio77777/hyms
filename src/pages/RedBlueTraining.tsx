import { useCallback } from 'react'
import { useCanvas } from '@/hooks/useCanvas'
import { useTrainingStore } from '@/store/trainingStore'
import { renderRedBlue } from '@/renderers/RedBlueRenderer'
import ControlBar from '@/components/ControlBar'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function RedBlueTraining() {
  const navigate = useNavigate()
  const { speak } = useTrainingStore()

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

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => {
            speak('返回首页')
            navigate('/')
          }}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/70"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-base">返回</span>
        </button>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
          <span className="text-white/80 text-lg font-medium">
            红蓝光交替刺激
          </span>
        </div>
      </div>

      <ControlBar />
    </div>
  )
}
