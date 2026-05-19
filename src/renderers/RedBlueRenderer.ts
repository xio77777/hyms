import { useTrainingStore } from '@/store/trainingStore'

const RED = { r: 255, g: 40, b: 40 }
const BLUE = { r: 40, g: 100, b: 255 }
const BASE_CYCLE_MS = 3000

/**
 * 红蓝光交替刺激渲染器
 * 红光激活视觉通路，蓝光舒缓神经
 * 专业文献推荐的视神经激活方法
 */
export function renderRedBlue(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed, brightness } = useTrainingStore.getState()

  const cycleMs = BASE_CYCLE_MS / speed
  const t = (timestamp % cycleMs) / cycleMs

  const smoothT = (Math.cos(t * Math.PI * 2) + 1) / 2

  const currentColor = {
    r: Math.round(RED.r * smoothT + BLUE.r * (1 - smoothT)),
    g: Math.round(RED.g * smoothT + BLUE.g * (1 - smoothT)),
    b: Math.round(RED.b * smoothT + BLUE.b * (1 - smoothT)),
  }

  const bgGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.7
  )
  const centerAlpha = 0.35 * brightness
  const edgeAlpha = 0.15 * brightness
  bgGradient.addColorStop(0, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${centerAlpha})`)
  bgGradient.addColorStop(1, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${edgeAlpha})`)

  ctx.fillStyle = `rgba(10, 10, 26, 0.3)`
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  const pulseScale = 0.6 + smoothT * 0.4
  const ringCount = 5
  for (let i = 0; i < ringCount; i++) {
    const ringProgress = (i + 1) / ringCount
    const ringRadius = Math.max(width, height) * 0.15 * ringProgress * pulseScale
    const ringAlpha = (1 - ringProgress * 0.7) * 0.3 * brightness

    ctx.beginPath()
    ctx.arc(width / 2, height / 2, ringRadius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${ringAlpha})`
    ctx.lineWidth = 3 - i * 0.4
    ctx.stroke()
  }

  const coreRadius = 80 * pulseScale
  const coreGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, coreRadius
  )
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * brightness})`)
  coreGradient.addColorStop(0.3, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${0.5 * brightness})`)
  coreGradient.addColorStop(1, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0)`)

  ctx.beginPath()
  ctx.arc(width / 2, height / 2, coreRadius, 0, Math.PI * 2)
  ctx.fillStyle = coreGradient
  ctx.fill()

  const isRedPhase = smoothT > 0.5
  const label = isRedPhase ? '红光刺激 · 激活视觉通路' : '蓝光舒缓 · 放松视神经'
  const labelColor = isRedPhase
    ? `rgba(255, 100, 100, ${0.7 * brightness})`
    : `rgba(100, 150, 255, ${0.7 * brightness})`

  ctx.font = '600 22px "Noto Sans SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = labelColor
  ctx.fillText(label, width / 2, height / 2 + coreRadius + 50)

  ctx.font = '400 16px "Noto Sans SC", sans-serif'
  ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * brightness})`
  ctx.fillText('请注视中心光点', width / 2, height / 2 - coreRadius - 30)

  const barWidth = width * 0.4
  const barX = (width - barWidth) / 2
  const barY = height - 50
  ctx.fillStyle = `rgba(255, 255, 255, 0.08)`
  ctx.fillRect(barX, barY, barWidth, 6)

  const redWidth = barWidth * smoothT
  const barGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0)
  barGradient.addColorStop(0, `rgba(40, 100, 255, ${0.6 * brightness})`)
  barGradient.addColorStop(1, `rgba(255, 40, 40, ${0.6 * brightness})`)
  ctx.fillStyle = barGradient
  ctx.fillRect(barX, barY, redWidth, 6)
}
