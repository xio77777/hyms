import { useTrainingStore } from '@/store/trainingStore'

type PatternType = 'horizontal' | 'vertical' | 'circular' | 'figure8' | 'diagonal'

const PATTERNS: PatternType[] = ['horizontal', 'vertical', 'circular', 'figure8', 'diagonal']
const PATTERN_DURATION = 8000
const GUIDE_RADIUS = 24
const TRAIL_LENGTH = 40

interface TrailPoint {
  x: number
  y: number
  alpha: number
}

/**
 * 根据运动模式和时间计算引导点位置
 */
function getGuidePosition(
  pattern: PatternType,
  t: number,
  width: number,
  height: number
): { x: number; y: number } {
  const cx = width / 2
  const cy = height / 2
  const rx = width * 0.35
  const ry = height * 0.3
  const progress = (t % 1)

  switch (pattern) {
    case 'horizontal':
      return { x: cx + Math.sin(progress * Math.PI * 2) * rx, y: cy }
    case 'vertical':
      return { x: cx, y: cy + Math.sin(progress * Math.PI * 2) * ry }
    case 'circular':
      return {
        x: cx + Math.cos(progress * Math.PI * 2) * rx,
        y: cy + Math.sin(progress * Math.PI * 2) * ry,
      }
    case 'figure8': {
      const angle = progress * Math.PI * 2
      return {
        x: cx + Math.sin(angle) * rx,
        y: cy + Math.sin(angle * 2) * ry * 0.5,
      }
    }
    case 'diagonal': {
      const phase = Math.sin(progress * Math.PI * 2)
      return {
        x: cx + phase * rx * 0.7,
        y: cy + phase * ry * 0.7,
      }
    }
  }
}

const PATTERN_LABELS: Record<PatternType, string> = {
  horizontal: '← 左右运动 →',
  vertical: '↑ 上下运动 ↓',
  circular: '○ 圆周运动',
  figure8: '∞ 8字运动',
  diagonal: '↗ 对角运动 ↙',
}

/**
 * 眼球运动引导渲染器
 * 引导光点按预设轨迹移动，引导患者眼球跟随运动
 * 锻炼眼肌力量和灵活性
 */
export function renderEyeMovement(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed, brightness } = useTrainingStore.getState()

  if (!(ctx as unknown as Record<string, TrailPoint[]>).__eyeTrail) {
    ;(ctx as unknown as Record<string, TrailPoint[]>).__eyeTrail = []
  }
  const trail = (ctx as unknown as Record<string, TrailPoint[]>).__eyeTrail

  ctx.fillStyle = `rgba(10, 10, 26, 0.2)`
  ctx.fillRect(0, 0, width, height)

  const t = (timestamp * speed) / PATTERN_DURATION
  const patternIndex = Math.floor(t / 2) % PATTERNS.length
  const pattern = PATTERNS[patternIndex]
  const patternT = (t % 2) / 2

  const pos = getGuidePosition(pattern, patternT, width, height)

  trail.unshift({ x: pos.x, y: pos.y, alpha: 1 })
  if (trail.length > TRAIL_LENGTH) trail.pop()

  for (let i = trail.length - 1; i >= 0; i--) {
    const point = trail[i]
    const alpha = (1 - i / TRAIL_LENGTH) * 0.4 * brightness
    const r = GUIDE_RADIUS * (1 - i / TRAIL_LENGTH) * 0.6

    const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, r)
    gradient.addColorStop(0, `rgba(0, 229, 255, ${alpha})`)
    gradient.addColorStop(1, `rgba(0, 229, 255, 0)`)

    ctx.beginPath()
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }

  const outerGlow = ctx.createRadialGradient(
    pos.x, pos.y, 0,
    pos.x, pos.y, GUIDE_RADIUS * 4
  )
  outerGlow.addColorStop(0, `rgba(0, 229, 255, ${0.3 * brightness})`)
  outerGlow.addColorStop(0.5, `rgba(0, 229, 255, ${0.08 * brightness})`)
  outerGlow.addColorStop(1, `rgba(0, 229, 255, 0)`)

  ctx.beginPath()
  ctx.arc(pos.x, pos.y, GUIDE_RADIUS * 4, 0, Math.PI * 2)
  ctx.fillStyle = outerGlow
  ctx.fill()

  const coreGlow = ctx.createRadialGradient(
    pos.x, pos.y, 0,
    pos.x, pos.y, GUIDE_RADIUS
  )
  coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.95 * brightness})`)
  coreGlow.addColorStop(0.3, `rgba(0, 229, 255, ${0.8 * brightness})`)
  coreGlow.addColorStop(1, `rgba(0, 229, 255, 0)`)

  ctx.beginPath()
  ctx.arc(pos.x, pos.y, GUIDE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = coreGlow
  ctx.fill()

  ctx.font = '600 20px "Noto Sans SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * brightness})`
  ctx.fillText(PATTERN_LABELS[pattern], width / 2, 50)

  const progressWidth = width * 0.3
  const progressX = (width - progressWidth) / 2
  const progressY = height - 60
  ctx.fillStyle = `rgba(255, 255, 255, 0.1)`
  ctx.fillRect(progressX, progressY, progressWidth, 4)
  ctx.fillStyle = `rgba(0, 229, 255, ${0.6 * brightness})`
  ctx.fillRect(progressX, progressY, progressWidth * patternT, 4)

  const nextPatternIndex = (patternIndex + 1) % PATTERNS.length
  ctx.font = '400 14px "Noto Sans SC", sans-serif'
  ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * brightness})`
  ctx.fillText(`下一个: ${PATTERN_LABELS[PATTERNS[nextPatternIndex]]}`, width / 2, progressY + 24)
}

export { PATTERN_LABELS, PATTERNS }
export type { PatternType }
