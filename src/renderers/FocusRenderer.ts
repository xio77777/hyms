import { useTrainingStore } from '@/store/trainingStore'

const FOCUS_CYCLE_MS = 6000
const TARGET_COLOR = '#00e5ff'
const RINGS = [60, 120, 200, 300]

/**
 * 视觉聚焦训练渲染器
 * 中心目标在远近之间缩放变化，引导患者视线切换聚焦
 * 改善视力模糊和聚焦能力
 * 优化：移除重复的亮度计算，使用 CSS filter 统一处理
 */
export function renderFocus(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed } = useTrainingStore.getState()

  const cycleMs = FOCUS_CYCLE_MS / speed
  const t = (timestamp % cycleMs) / cycleMs

  const focusPhase = (Math.sin(t * Math.PI * 2) + 1) / 2

  ctx.fillStyle = `rgba(10, 10, 26, 0.25)`
  ctx.fillRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const minScale = 0.3
  const maxScale = 1.2
  const currentScale = minScale + focusPhase * (maxScale - minScale)

  for (let i = RINGS.length - 1; i >= 0; i--) {
    const baseRadius = RINGS[i]
    const radius = baseRadius * currentScale
    const alpha = (0.08 + (1 - i / RINGS.length) * 0.12)

    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  const crossSize = 20 * currentScale
  const crossAlpha = 0.3
  ctx.strokeStyle = `rgba(0, 229, 255, ${crossAlpha})`
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - crossSize, cy)
  ctx.lineTo(cx + crossSize, cy)
  ctx.moveTo(cx, cy - crossSize)
  ctx.lineTo(cx, cy + crossSize)
  ctx.stroke()

  const targetRadius = 30 * currentScale
  const outerGlow = ctx.createRadialGradient(
    cx, cy, 0,
    cx, cy, targetRadius * 3
  )
  outerGlow.addColorStop(0, `rgba(0, 229, 255, ${0.25})`)
  outerGlow.addColorStop(0.5, `rgba(0, 229, 255, ${0.06})`)
  outerGlow.addColorStop(1, `rgba(0, 229, 255, 0)`)

  ctx.beginPath()
  ctx.arc(cx, cy, targetRadius * 3, 0, Math.PI * 2)
  ctx.fillStyle = outerGlow
  ctx.fill()

  const coreGradient = ctx.createRadialGradient(
    cx, cy, 0,
    cx, cy, targetRadius
  )
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9})`)
  coreGradient.addColorStop(0.5, `rgba(0, 229, 255, ${0.7})`)
  coreGradient.addColorStop(1, `rgba(0, 229, 255, 0)`)

  ctx.beginPath()
  ctx.arc(cx, cy, targetRadius, 0, Math.PI * 2)
  ctx.fillStyle = coreGradient
  ctx.fill()

  const dotRadius = 4 * currentScale
  ctx.beginPath()
  ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255, 255, 255, ${0.95})`
  ctx.fill()

  const isNear = focusPhase > 0.5
  const label = isNear ? '近处聚焦' : '远处聚焦'
  const subLabel = isNear ? '注视近处目标' : '放松视线看远处'

  ctx.font = '600 22px "Noto Sans SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = `rgba(0, 229, 255, ${0.7})`
  ctx.fillText(label, cx, cy - targetRadius * 3 - 20)

  ctx.font = '400 16px "Noto Sans SC", sans-serif'
  ctx.fillStyle = `rgba(255, 255, 255, ${0.35})`
  ctx.fillText(subLabel, cx, cy - targetRadius * 3 + 8)

  const particleCount = 12
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + timestamp * 0.0003 * speed
    const dist = (150 + Math.sin(timestamp * 0.001 * speed + i * 0.5) * 50) * currentScale
    const px = cx + Math.cos(angle) * dist
    const py = cy + Math.sin(angle) * dist
    const pAlpha = (0.15 + Math.sin(timestamp * 0.002 + i) * 0.1)

    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 229, 255, ${pAlpha})`
    ctx.fill()
  }

  const barWidth = width * 0.3
  const barX = (width - barWidth) / 2
  const barY = height - 50
  ctx.fillStyle = `rgba(255, 255, 255, 0.08)`
  ctx.fillRect(barX, barY, barWidth, 4)
  ctx.fillStyle = `rgba(0, 229, 255, ${0.5})`
  ctx.fillRect(barX, barY, barWidth * focusPhase, 4)

  ctx.font = '400 14px "Noto Sans SC", sans-serif'
  ctx.fillStyle = `rgba(255, 255, 255, ${0.3})`
  ctx.fillText(`聚焦深度: ${Math.round(focusPhase * 100)}%`, cx, barY + 22)
}
