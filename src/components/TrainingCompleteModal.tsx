import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Activity, Flame, Star, Share2, Home, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from '@/hooks/useTrainingHistory'

interface TrainingCompleteModalProps {
  duration: number
  mode: string
  modeLabel: string
  onClose: () => void
  onRestart: () => void
  newAchievements?: { title: string; icon: string }[]
}

export default function TrainingCompleteModal({
  duration,
  mode,
  modeLabel,
  onClose,
  onRestart,
  newAchievements = []
}: TrainingCompleteModalProps) {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = () => {
    const text = `我在HYMS完成了${formatDuration(duration)}的${modeLabel}训练！坚持就是胜利 💪`
    if (navigator.share) {
      navigator.share({ title: 'HYMS训练完成', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#00e5ff', '#ff00ff', '#ffd700', '#00ff88'][i % 4],
              opacity: 0.6,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`
          relative w-[340px] sm:w-[380px] transform transition-all duration-700 ease-out
          ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8'}
        `}
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-neon-cyan/20 via-neon-magenta/20 to-neon-gold/20 rounded-3xl blur-xl animate-pulse" />

        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-neon-gold rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-black fill-black" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-1">训练完成！</h2>
            <p className="text-white/50 text-sm">{modeLabel}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatMini
              icon={<Clock className="w-4 h-4 text-neon-cyan" />}
              label="时长"
              value={formatDuration(duration)}
            />
            <StatMini
              icon={<Activity className="w-4 h-4 text-neon-magenta" />}
              label="模式"
              value={modeLabel.slice(0, 2)}
            />
            <StatMini
              icon={<Flame className="w-4 h-4 text-neon-gold" />}
              label="坚持"
              value="棒棒哒"
            />
          </div>

          {newAchievements.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-4 mb-6">
              <div className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400" />
                解锁新成就
              </div>
              <div className="flex flex-wrap gap-2">
                {newAchievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 rounded-full">
                    <span className="text-sm">{a.icon}</span>
                    <span className="text-amber-300 text-xs font-medium">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              再来一次
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleShare}
                className="py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button
                onClick={() => {
                  onClose()
                  navigate('/')
                }}
                className="py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Home className="w-4 h-4" />
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatMini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-white/40 text-[10px]">{label}</div>
    </div>
  )
}
