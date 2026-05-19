import { useRef, useEffect, useCallback } from 'react'
import { useTrainingStore } from '@/store/trainingStore'

/**
 * Canvas 动画 Hook
 * 管理 Canvas 元素的初始化、尺寸适配和动画循环
 * @param renderFn 每帧调用的渲染函数，接收 canvas 2d 上下文和时间戳
 */
export function useCanvas(
  renderFn: (ctx: CanvasRenderingContext2D, timestamp: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const renderFnRef = useRef(renderFn)

  renderFnRef.current = renderFn

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1

    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = 0
    const animate = (timestamp: number) => {
      const { isPaused } = useTrainingStore.getState()
      if (!isPaused) {
        renderFnRef.current(ctx, timestamp)
      }
      lastTime = timestamp
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [resize])

  return canvasRef
}
