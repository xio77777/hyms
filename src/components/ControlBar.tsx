import { useEffect } from 'react'
import { ArrowLeft, Pause, Play, Maximize, Eye, CloudRain, Zap, Palette } from 'lucide-react'
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
  { key: 'carousel', label: '轮播', icon: <Palette className="w-4 h-4" />, color: 'text-green-400' },
  { key: 'tracking', label: '追踪', icon: <Eye className="w-4 h-4" />, color: 'text-neon-cyan' },
  { key: 'calm', label: '舒缓', icon: <CloudRain className="w-4 h-4" />, color: 'text-calm-lavender' },
  { key: 'excite', label: '兴奋', icon: <Zap className="w-4 h-4" />, color: 'text-neon-gold' },
]

/**
 * 底部控制栏组件
 * 移动端适配：小屏幕下按钮简化、滑块缩短
 */
export default function ControlBar() {
  const navigate = useNavigate()
  const { mode, speed, brightness, isPaused, setMode, setSpeed, setBrightness, togglePause } = useTrainingStore()
  const { isConnected, sendUpdate } = useCast()

  useEffect(() => {
    if (isConnected) {
      sendUpdate({ mode, speed, brightness, isPaused })
    }
  }, [mode, speed, brightness, isPaused, isConnected, sendUpdate])

  const handleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="bg-black/70 backdrop-blur-xl border-t border-white/10 px-2 py-2 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 max-w-5xl mx-auto">
          
          {/* 顶部行：返回 + 模式切换 */}
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

          {/* 底部行：控制项 */}
          <div className="flex items-center gap-2 sm:gap-6 w-full sm:w-auto justify-center">
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
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={handleFullscreen}
                className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <CastButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
