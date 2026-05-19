import { useTrainingStore } from '@/store/trainingStore'

const CALM_COLORS = [
  { r: 179, g: 136, b: 255 },
  { r: 255, g: 128, b: 171 },
  { r: 128, g: 216, b: 255 },
  { r: 167, g: 255, b: 235 },
]

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  color: { r: number; g: number; b: number }
}

/**
 * 舒缓模式渲染器
 * 全屏渐变色缓慢过渡，呼吸般的明暗脉动，柔和水波纹效果
 */
export function renderCalm(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed, brightness } = useTrainingStore.getState()

  const t = timestamp * 0.001 * speed

  const breathCycle = (Math.sin(t * 0.4) + 1) / 2

  const colorIndex = (t * 0.1) % CALM_COLORS.length
  const ci = Math.floor(colorIndex)
  const cf = colorIndex - ci
  const nextCi = (ci + 1) % CALM_COLORS.length

  const currentColor = {
    r: CALM_COLORS[ci].r + (CALM_COLORS[nextCi].r - CALM_COLORS[ci].r) * cf,
    g: CALM_COLORS[ci].g + (CALM_COLORS[nextCi].g - CALM_COLORS[ci].g) * cf,
    b: CALM_COLORS[ci].b + (CALM_COLORS[nextCi].b - CALM_COLORS[ci].b) * cf,
  }

  const bgAlpha = (0.15 + breathCycle * 0.15) * brightness
  ctx.fillStyle = `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, ${bgAlpha})`
  ctx.fillRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const maxDim = Math.max(width, height)

  if (!(ctx as unknown as Record<string, Ripple[]>).__ripples) {
    ;(ctx as unknown as Record<string, Ripple[]>).__ripples = []
  }
  const ripples = (ctx as unknown as Record<string, Ripple[]>).__ripples

  if (Math.random() < 0.02 * speed) {
    ripples.push({
      x: centerX + (Math.random() - 0.5) * width * 0.6,
      y: centerY + (Math.random() - 0.5) * height * 0.6,
      radius: 0,
      maxRadius: 100 + Math.random() * 200,
      alpha: 0.3 * brightness,
      color: CALM_COLORS[Math.floor(Math.random() * CALM_COLORS.length)],
    })
  }

  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i]
    ripple.radius += 0.8 * speed
    ripple.alpha -= 0.002 * speed

    if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
      ripples.splice(i, 1)
      continue
    }

    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${ripple.color.r}, ${ripple.color.g}, ${ripple.color.b}, ${ripple.alpha})`
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const glowRadius = maxDim * 0.4 * (0.8 + breathCycle * 0.2)
  const centerGlow = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, glowRadius
  )
  const glowAlpha = (0.08 + breathCycle * 0.08) * brightness
  centerGlow.addColorStop(0, `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, ${glowAlpha})`)
  centerGlow.addColorStop(1, `rgba(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)}, 0)`)

  ctx.beginPath()
  ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
  ctx.fillStyle = centerGlow
  ctx.fill()

  const particleCount = 20
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + t * 0.2
    const dist = maxDim * 0.15 + Math.sin(t * 0.3 + i) * maxDim * 0.1
    const px = centerX + Math.cos(angle) * dist
    const py = centerY + Math.sin(angle) * dist
    const pAlpha = (0.2 + Math.sin(t + i) * 0.15) * brightness

    const pColor = CALM_COLORS[i % CALM_COLORS.length]
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${pAlpha})`
    ctx.fill()
  }
}
