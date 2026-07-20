import { useEffect, useState, useRef } from 'react'
import { useTrainingStore } from '@/store/trainingStore'

interface CountdownOverlayProps {
  trainingName: string
  onComplete: () => void
}

export default function CountdownOverlay({ trainingName, onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const completedRef = useRef(false)
  const setIsPaused = useTrainingStore((s) => s.setIsPaused)
  const speak = useTrainingStore((s) => s.speak)

  useEffect(() => {
    setIsPaused(true)
    speak(`${trainingName}准备，3`)

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1
        if (next > 0) {
          speak(next.toString())
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [trainingName, setIsPaused, speak])

  useEffect(() => {
    if (count <= 0 && !completedRef.current) {
      if (count === 0) {
        speak('开始')
      }
      completedRef.current = true
      setIsPaused(false)
      const t = setTimeout(() => onComplete(), 600)
      return () => clearTimeout(t)
    }
  }, [count, setIsPaused, onComplete, speak])

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
