import { useEffect, useState } from 'react'
import { useTrainingStore } from '@/store/trainingStore'

interface CountdownOverlayProps {
  trainingName: string
  onComplete: () => void
}

export default function CountdownOverlay({ trainingName, onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const speak = useTrainingStore((s) => s.speak)
  const togglePause = useTrainingStore((s) => s.togglePause)

  useEffect(() => {
    togglePause()

    speak(`${trainingName}准备，3`)
    
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1
        if (next > 0) {
          speak(next.toString())
        } else if (next === 0) {
          speak('开始')
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (count < 0) {
      togglePause()
      onComplete()
    }
  }, [count])

  if (count < 0) return null

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-white/60 text-2xl mb-4">{trainingName}</div>
      <div className="text-white text-[200px] font-black leading-none animate-pulse">
        {count > 0 ? count : '开始'}
      </div>
      <div className="text-white/40 text-lg mt-4">请注视屏幕中心</div>
    </div>
  )
}
