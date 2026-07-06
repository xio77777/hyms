import { useEffect, useState } from 'react'
import { X, Sparkles, Gift } from 'lucide-react'
import { Achievement, RARITY_COLORS, RARITY_LABELS } from '@/hooks/useAchievements'

interface AchievementUnlockModalProps {
  achievements: Achievement[]
  onClose: () => void
}

export default function AchievementUnlockModal({ achievements, onClose }: AchievementUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setIsExiting(true)
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setIsExiting(false)
      }, 200)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setShowContent(false)
    setTimeout(onClose, 300)
  }

  if (achievements.length === 0) return null

  const current = achievements[currentIndex]
  const rarityStyle = RARITY_COLORS[current.rarity]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className={`
          relative w-[320px] transform transition-all duration-500 ease-out
          ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}
      >
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 rounded-3xl blur-xl animate-pulse" />
        
        <div
          className={`
            relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 text-center
            border ${rarityStyle.border} ${rarityStyle.glow}
            transition-all duration-300
            ${isExiting ? 'scale-95 opacity-0 -translate-x-4' : 'scale-100 opacity-100 translate-x-0'}
          `}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold">成就解锁</span>
            </div>
          </div>

          <div className="mt-6 mb-4">
            <div className={`
              w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl
              ${rarityStyle.bg} border ${rarityStyle.border}
              transform transition-transform duration-500
              ${showContent ? 'scale-100 rotate-0' : 'scale-50 rotate-12'}
            `}>
              {current.icon}
            </div>
          </div>

          <h3 className="text-white text-xl font-bold mb-1">{current.title}</h3>
          <p className="text-white/50 text-sm mb-4">{current.description}</p>

          <div className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
            ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}
          `}>
            {RARITY_LABELS[current.rarity]}成就
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">+{current.reward} 经验值</span>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all active:scale-95"
          >
            {currentIndex < achievements.length - 1 ? '下一个' : '太棒了！'}
          </button>

          {achievements.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {achievements.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-amber-400 w-4'
                      : idx < currentIndex
                      ? 'bg-amber-400/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/60 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
