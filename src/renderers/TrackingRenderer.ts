import { useTrainingStore } from '@/store/trainingStore'

interface LightOrb {
  x: number
  y: number
  targetX: number
  targetY: number
  radius: number
  color: string
  trail: Array<{ x: number; y: number; alpha: number }>
  speed: number
  phase: number
}

const COLORS = ['#00e5ff', '#ff00e5', '#ffd700', '#00ff88', '#ff6b35']
const ORB_COUNT = 4
const TRAIL_LENGTH = 30

/**
 * 创建初始光球
 */
function createOrbs(width: number, height: number): LightOrb[] {
  return Array.from({ length: ORB_COUNT }, (_, i) => ({
    x: width * (0.2 + Math.random() * 0.6),
    y: height * (0.2 + Math.random() * 0.6),
    targetX: width * Math.random(),
    targetY: height * Math.random(),
    radius: 30 + Math.random() * 20,
    color: COLORS[i % COLORS.length],
    trail: [],
    speed: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  }))
}

/**
 * 视觉追踪渲染器
 * 绘制移动的彩色光球，带发光拖尾效果，吸引目光追随
 */
export function renderTracking(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed, brightness } = useTrainingStore.getState()

  if (!(ctx as unknown as Record<string, LightOrb[]>).__orbs) {
    ;(ctx as unknown as Record<string, LightOrb[]>).__orbs = createOrbs(width, height)
  }
  const orbs = (ctx as unknown as Record<string, LightOrb[]>).__orbs

  ctx.fillStyle = `rgba(10, 10, 26, ${0.15 * speed})`
  ctx.fillRect(0, 0, width, height)

  const t = timestamp * 0.001 * speed

  for (const orb of orbs) {
    orb.targetX = width * 0.5 + Math.cos(t * orb.speed + orb.phase) * width * 0.35
    orb.targetY = height * 0.5 + Math.sin(t * orb.speed * 0.7 + orb.phase) * height * 0.35

    orb.x += (orb.targetX - orb.x) * 0.02 * speed
    orb.y += (orb.targetY - orb.y) * 0.02 * speed

    orb.trail.unshift({ x: orb.x, y: orb.y, alpha: 1 })
    if (orb.trail.length > TRAIL_LENGTH) {
      orb.trail.pop()
    }

    for (let i = orb.trail.length - 1; i >= 0; i--) {
      const point = orb.trail[i]
      const alpha = (1 - i / TRAIL_LENGTH) * 0.6 * brightness
      const trailRadius = orb.radius * (1 - i / TRAIL_LENGTH) * 0.8

      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, trailRadius
      )
      gradient.addColorStop(0, orb.color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
      gradient.addColorStop(1, orb.color + '00')

      ctx.beginPath()
      ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    const glowGradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, orb.radius * 3
    )
    glowGradient.addColorStop(0, orb.color + Math.round(brightness * 180).toString(16).padStart(2, '0'))
    glowGradient.addColorStop(0.3, orb.color + Math.round(brightness * 60).toString(16).padStart(2, '0'))
    glowGradient.addColorStop(1, orb.color + '00')

    ctx.beginPath()
    ctx.arc(orb.x, orb.y, orb.radius * 3, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()

    const coreGradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, orb.radius
    )
    coreGradient.addColorStop(0, '#ffffff' + Math.round(brightness * 255).toString(16).padStart(2, '0'))
    coreGradient.addColorStop(0.4, orb.color + Math.round(brightness * 255).toString(16).padStart(2, '0'))
    coreGradient.addColorStop(1, orb.color + '00')

    ctx.beginPath()
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
    ctx.fillStyle = coreGradient
    ctx.fill()
  }
}
