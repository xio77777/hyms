import { useTrainingStore } from '@/store/trainingStore'

const EXCITE_COLORS = ['#ff0055', '#ff6600', '#ffdd00', '#00ff88', '#00ccff', '#cc00ff']

interface Shape {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  type: 'triangle' | 'diamond' | 'circle' | 'hexagon'
  color: string
  alpha: number
  scale: number
  scaleSpeed: number
}

/**
 * 创建初始几何图形
 */
function createShapes(width: number, height: number): Shape[] {
  const types: Shape['type'][] = ['triangle', 'diamond', 'circle', 'hexagon']
  return Array.from({ length: 12 }, (_, i) => ({
    x: width * (0.1 + Math.random() * 0.8),
    y: height * (0.1 + Math.random() * 0.8),
    size: 40 + Math.random() * 60,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1),
    type: types[i % types.length],
    color: EXCITE_COLORS[i % EXCITE_COLORS.length],
    alpha: 0.6 + Math.random() * 0.4,
    scale: 0.8 + Math.random() * 0.4,
    scaleSpeed: 0.5 + Math.random() * 1,
  }))
}

/**
 * 绘制几何图形
 */
function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save()
  ctx.translate(shape.x, shape.y)
  ctx.rotate(shape.rotation)
  ctx.scale(shape.scale, shape.scale)

  ctx.beginPath()
  const s = shape.size

  switch (shape.type) {
    case 'triangle':
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.866, s * 0.5)
      ctx.lineTo(-s * 0.866, s * 0.5)
      ctx.closePath()
      break
    case 'diamond':
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.6, 0)
      ctx.lineTo(0, s)
      ctx.lineTo(-s * 0.6, 0)
      ctx.closePath()
      break
    case 'circle':
      ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2)
      break
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6
        const px = Math.cos(angle) * s * 0.7
        const py = Math.sin(angle) * s * 0.7
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
  }

  ctx.strokeStyle = shape.color
  ctx.lineWidth = 3
  ctx.stroke()

  const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.5)
  glowGradient.addColorStop(0, shape.color + '40')
  glowGradient.addColorStop(1, shape.color + '00')
  ctx.fillStyle = glowGradient
  ctx.fill()

  ctx.restore()
}

/**
 * 兴奋模式渲染器
 * 高饱和度色块快速变换，脉冲式闪烁，几何图形旋转和缩放
 * 优化：移除重复的亮度计算，使用 CSS filter 统一处理
 */
export function renderExcite(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number
) {
  const { speed } = useTrainingStore.getState()

  if (!(ctx as unknown as Record<string, Shape[]>).__shapes) {
    ;(ctx as unknown as Record<string, Shape[]>).__shapes = createShapes(width, height)
  }
  const shapes = (ctx as unknown as Record<string, Shape[]>).__shapes

  const t = timestamp * 0.001 * speed

  const pulseCycle = (Math.sin(t * 3) + 1) / 2

  const bgAlpha = 0.12 + pulseCycle * 0.08
  ctx.fillStyle = `rgba(10, 10, 26, ${bgAlpha})`
  ctx.fillRect(0, 0, width, height)

  const colorFlashIndex = Math.floor(t * 2) % EXCITE_COLORS.length
  const flashColor = EXCITE_COLORS[colorFlashIndex]
  const flashAlpha = pulseCycle * 0.05

  const flashGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.6
  )
  flashGrad.addColorStop(0, flashColor + Math.round(flashAlpha * 255).toString(16).padStart(2, '0'))
  flashGrad.addColorStop(1, flashColor + '00')
  ctx.fillStyle = flashGrad
  ctx.fillRect(0, 0, width, height)

  for (const shape of shapes) {
    shape.rotation += shape.rotationSpeed * 0.02 * speed
    shape.scale = 0.8 + Math.sin(t * shape.scaleSpeed) * 0.3
    shape.alpha = (0.4 + pulseCycle * 0.4)

    const moveX = Math.sin(t * 0.5 + shape.rotation) * 30 * speed
    const moveY = Math.cos(t * 0.3 + shape.rotation) * 30 * speed
    shape.x += moveX * 0.01
    shape.y += moveY * 0.01

    if (shape.x < -100) shape.x = width + 100
    if (shape.x > width + 100) shape.x = -100
    if (shape.y < -100) shape.y = height + 100
    if (shape.y > height + 100) shape.y = -100

    ctx.globalAlpha = shape.alpha
    drawShape(ctx, shape)
    ctx.globalAlpha = 1
  }

  const lineCount = 6
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2 + t * 0.5
    const lineLen = Math.max(width, height)
    const cx = width / 2
    const cy = height / 2

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(
      cx + Math.cos(angle) * lineLen,
      cy + Math.sin(angle) * lineLen
    )
    ctx.strokeStyle = EXCITE_COLORS[i % EXCITE_COLORS.length] + Math.round(pulseCycle * 40).toString(16).padStart(2, '0')
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
