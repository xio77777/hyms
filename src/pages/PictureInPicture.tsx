import { useEffect, useState } from 'react'
import { ArrowLeft, Maximize2, Minimize2, Pause, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'

export default function PictureInPicture() {
  const navigate = useNavigate()
  const {
    mode, speed, brightness, isPaused,
    timerSeconds, timerActive, timerCompleted,
    settings, speak,
    setMode, setSpeed, setBrightness, togglePause,
    resetTimer
  } = useTrainingStore()
  
  const [isPipActive, setIsPipActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
  }, [])

  const enterPictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPipActive(false)
      } else if (document.pictureInPictureEnabled) {
        const video = document.createElement('video')
        video.srcObject = (navigator as any).mediaDevices?.getDisplayMedia?.({
          video: { cursor: 'always' },
          audio: false
        }) as any
        
        await video.play()
        await video.requestPictureInPicture()
        setIsPipActive(true)
        
        video.addEventListener('leavepictureinpicture', () => {
          setIsPipActive(false)
        })
      }
    } catch (err) {
      console.error('PiP error:', err)
      speak('画中画模式不可用')
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const modeLabels: Record<string, string> = {
    carousel: '颜色轮播',
    tracking: '视觉追踪',
    calm: '舒缓模式',
    excite: '兴奋模式'
  }

  return (
    <div className="h-screen w-screen bg-dark relative flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center text-white/30">
          <div className="text-6xl mb-4">📺</div>
          <div className="text-xl font-medium mb-2">画中画模式</div>
          <div className="text-sm text-white/50">
            正在电视上显示训练内容
          </div>
          <div className="text-xs text-white/30 mt-4">
            {isPipActive ? '画中画已激活' : '点击下方按钮启用画中画'}
          </div>
        </div>
      </div>

      <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                title={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={enterPictureInPicture}
                className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors text-sm font-medium"
              >
                <Maximize2 className="w-4 h-4" />
                <span>{isPipActive ? '退出画中画' : '启用画中画'}</span>
              </button>
            </div>
          </div>

          {timerActive && (
            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="text-neon-cyan text-sm font-mono">
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-white/40 text-xs">
                  / {formatTime(settings.timerMinutes * 60)}
                </div>
              </div>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-cyan"
                  style={{
                    width: `${Math.min((timerSeconds / (settings.timerMinutes * 60)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {timerCompleted && (
            <div className="flex items-center justify-center gap-2 bg-neon-cyan/10 text-neon-cyan rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🎉 训练完成</span>
              <button
                onClick={resetTimer}
                className="text-xs bg-neon-cyan/20 px-2 py-1 rounded hover:bg-neon-cyan/30"
              >
                确定
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-white/50 text-xs mb-1.5">速度</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-cyan"
                />
                <span className="text-white/70 text-xs w-8">{speed.toFixed(1)}x</span>
              </div>
            </div>

            <div>
              <div className="text-white/50 text-xs mb-1.5">亮度</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-gold"
                />
                <span className="text-white/70 text-xs w-8">{Math.round(brightness * 100)}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={togglePause}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors font-medium"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                <span>继续训练</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                <span>暂停训练</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
