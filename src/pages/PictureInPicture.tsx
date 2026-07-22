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
    setSpeed, setBrightness, togglePause,
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
        speak('已退出画中画')
      } else if (document.pictureInPictureEnabled) {
        const video = document.createElement('video')
        video.srcObject = (navigator as any).mediaDevices?.getDisplayMedia?.({
          video: { cursor: 'always' },
          audio: false
        }) as any
        
        await video.play()
        await video.requestPictureInPicture()
        setIsPipActive(true)
        speak('画中画已开启')
        
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
        speak('已进入全屏')
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
        speak('已退出全屏')
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

  const speedPresets = [
    { value: 0.5, label: '慢' },
    { value: 1.0, label: '中' },
    { value: 2.0, label: '快' },
  ]

  const brightnessPresets = [
    { value: 0.5, label: '暗' },
    { value: 0.8, label: '中' },
    { value: 1.0, label: '亮' },
  ]

  return (
    <div className="h-screen w-screen bg-dark relative flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center text-white/30 px-4">
          <div className="text-7xl mb-6">📺</div>
          <div className="text-2xl font-medium mb-3">画中画模式</div>
          <div className="text-lg text-white/50 leading-relaxed">
            正在电视上显示{modeLabels[mode] || '训练'}内容
          </div>
          <div className="text-base text-white/30 mt-4">
            {isPipActive ? '画中画已激活' : '点击下方按钮启用画中画'}
          </div>
        </div>
      </div>

      <div className="bg-black/90 backdrop-blur-xl border-t-2 border-white/10 p-5">
        <div className="max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                speak('返回首页')
                navigate('/')
              }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-lg"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>返回</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-6 h-6" />
                ) : (
                  <Maximize2 className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={enterPictureInPicture}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-colors text-lg font-medium ${
                  isPipActive
                    ? 'bg-neon-cyan/30 text-neon-cyan border-2 border-neon-cyan/40'
                    : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-2 border-transparent'
                }`}
              >
                <Maximize2 className="w-6 h-6" />
                <span className="hidden sm:inline">{isPipActive ? '退出画中画' : '画中画'}</span>
                <span className="sm:hidden">{isPipActive ? '退出' : '画中画'}</span>
              </button>
            </div>
          </div>

          {timerActive && (
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-5 py-4 border-2 border-white/10">
              <div className="flex items-center gap-3">
                <div className="text-neon-cyan text-xl font-mono font-bold">
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-white/40 text-base">
                  / {formatTime(settings.timerMinutes * 60)}
                </div>
              </div>
              <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-cyan rounded-full transition-all"
                  style={{
                    width: `${Math.min((timerSeconds / (settings.timerMinutes * 60)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {timerCompleted && (
            <div className="flex items-center justify-between gap-4 bg-neon-cyan/10 text-neon-cyan rounded-2xl px-5 py-4 border-2 border-neon-cyan/20">
              <span className="text-lg font-medium">🎉 训练完成</span>
              <button
                onClick={() => {
                  resetTimer()
                  speak('已确认')
                }}
                className="px-5 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 rounded-xl text-base font-medium transition-colors"
              >
                确定
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border-2 border-white/10">
              <div className="text-white/70 text-base mb-3">速度</div>
              <div className="flex items-center gap-2">
                {speedPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setSpeed(p.value)
                      speak(`速度${p.label}`)
                    }}
                    className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${
                      Math.abs(speed - p.value) < 0.15
                        ? 'bg-neon-cyan/30 text-neon-cyan border-2 border-neon-cyan/40'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-transparent'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border-2 border-white/10">
              <div className="text-white/70 text-base mb-3">亮度</div>
              <div className="flex items-center gap-2">
                {brightnessPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setBrightness(p.value)
                      speak(`亮度${p.label}`)
                    }}
                    className={`flex-1 py-3 rounded-xl text-lg font-medium transition-colors ${
                      Math.abs(brightness - p.value) < 0.15
                        ? 'bg-neon-gold/30 text-neon-gold border-2 border-neon-gold/40'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-transparent'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              togglePause()
              speak(isPaused ? '继续训练' : '暂停训练')
            }}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl transition-colors font-medium text-lg"
          >
            {isPaused ? (
              <>
                <Play className="w-6 h-6" />
                <span>继续训练</span>
              </>
            ) : (
              <>
                <Pause className="w-6 h-6" />
                <span>暂停训练</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
