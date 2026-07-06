import { useState, useEffect } from 'react'

interface CountdownOverlayProps {
  onComplete: () => void
  label?: string
}

export default function CountdownOverlay({ onComplete, label = '训练即将开始' }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (count > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setCount(count - 1)
        setIsAnimating(false)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center">
        <div className="text-white/50 text-lg mb-6">{label}</div>
        
        <div
          className={`
            relative inline-block
            transition-all duration-300 ease-out
            ${isAnimating ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full blur-xl opacity-50 animate-pulse" />
          
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border-2 border-white/20 flex items-center justify-center">
            <span className="text-white text-7xl font-bold">
              {count > 0 ? count : 'GO!'}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {[3, 2, 1].map((num) => (
            <div
              key={num}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${count <= num
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta scale-125'
                  : 'bg-white/20'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
