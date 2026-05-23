import { useTrainingStore } from '@/store/trainingStore'

const PALETTE = [
  '#ff4d4d',
  '#ff9a3c',
  '#ffd93d',
  '#6bcf6b',
  '#4dc3ff',
  '#4d7bff',
  '#9b4dff',
  '#ff4db8',
]

const SCROLL_DURATION_MS = 8000

/**
 * 颜色轮播渲染器
 * 8种颜色并排显示，整体向右平滑滚动轮询
 * 优化：移除重复的亮度计算，使用 CSS filter 统一处理
 */
export function renderColorCarousel(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed } = useTrainingStore.getState()

  const colorWidth = width / PALETTE.length

  const cycleMs = SCROLL_DURATION_MS / speed
  const offset = ((timestamp % cycleMs) / cycleMs) * width

  for (let repeat = -1; repeat < 2; repeat++) {
    for (let i = 0; i < PALETTE.length; i++) {
      const x = i * colorWidth + offset + repeat * width
      ctx.fillStyle = PALETTE[i]
      ctx.fillRect(x, 0, colorWidth, height)
    }
  }
}
