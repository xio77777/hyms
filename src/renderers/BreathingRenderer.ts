export interface BreathingPhase {
  name: string
  duration: number
  label: string
}

export interface BreathingPattern {
  id: string
  name: string
  description: string
  phases: BreathingPhase[]
  color: string
  glowColor: string
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: '478',
    name: '4-7-8 呼吸法',
    description: '吸气4秒，屏息7秒，呼气8秒，快速放松',
    phases: [
      { name: 'inhale', duration: 4, label: '吸气' },
      { name: 'hold', duration: 7, label: '屏息' },
      { name: 'exhale', duration: 8, label: '呼气' },
    ],
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.3)',
  },
  {
    id: 'box',
    name: 'Box 呼吸',
    description: '吸4秒-停4秒-呼4秒-停4秒，提升专注力',
    phases: [
      { name: 'inhale', duration: 4, label: '吸气' },
      { name: 'hold', duration: 4, label: '屏息' },
      { name: 'exhale', duration: 4, label: '呼气' },
      { name: 'hold', duration: 4, label: '屏息' },
    ],
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    id: 'abdominal',
    name: '腹式呼吸',
    description: '深吸气-慢呼气，舒缓放松',
    phases: [
      { name: 'inhale', duration: 5, label: '吸气' },
      { name: 'exhale', duration: 6, label: '呼气' },
    ],
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: 'energizing',
    name: '活力呼吸',
    description: '快速呼吸节奏，唤醒身心',
    phases: [
      { name: 'inhale', duration: 2, label: '吸气' },
      { name: 'exhale', duration: 2, label: '呼气' },
    ],
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
]

export function getBreathingPhase(
  pattern: BreathingPattern,
  elapsed: number
): { phase: BreathingPhase; phaseProgress: number; cycleProgress: number } {
  const cycleDuration = pattern.phases.reduce((sum, p) => sum + p.duration, 0)
  const cycleTime = elapsed % cycleDuration
  const cycleProgress = cycleTime / cycleDuration

  let accumulated = 0
  for (const phase of pattern.phases) {
    if (cycleTime < accumulated + phase.duration) {
      const phaseProgress = (cycleTime - accumulated) / phase.duration
      return { phase, phaseProgress, cycleProgress }
    }
    accumulated += phase.duration
  }

  return {
    phase: pattern.phases[0],
    phaseProgress: 0,
    cycleProgress: 0,
  }
}

export function renderBreathing(
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  width: number,
  height: number,
  pattern: BreathingPattern,
  elapsed: number
) {
  const { phase, phaseProgress } = getBreathingPhase(pattern, elapsed)

  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(width, height) * 0.35
  const minRadius = maxRadius * 0.4

  let scale = 1
  if (phase.name === 'inhale') {
    scale = 0.4 + phaseProgress * 0.6
  } else if (phase.name === 'exhale') {
    scale = 1 - phaseProgress * 0.6
  } else if (phase.name === 'hold') {
    const prevPhase = pattern.phases[
      (pattern.phases.indexOf(phase) - 1 + pattern.phases.length) % pattern.phases.length
    ]
    if (prevPhase.name === 'inhale') {
      scale = 1
    } else {
      scale = 0.4
    }
  }

  const currentRadius = minRadius + (maxRadius - minRadius) * scale

  for (let i = 5; i >= 1; i--) {
    const rippleRadius = currentRadius + i * 30
    const rippleAlpha = (1 - i / 6) * 0.15
    ctx.beginPath()
    ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2)
    ctx.strokeStyle = pattern.color + Math.floor(rippleAlpha * 255).toString(16).padStart(2, '0')
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, currentRadius
  )
  gradient.addColorStop(0, pattern.color + '40')
  gradient.addColorStop(0.5, pattern.color + '20')
  gradient.addColorStop(1, pattern.color + '00')

  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius * 0.6, 0, Math.PI * 2)
  ctx.fillStyle = pattern.color + '60'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = pattern.color + 'aa'
  ctx.fill()

  ctx.save()
  ctx.shadowColor = pattern.color
  ctx.shadowBlur = 40
  ctx.beginPath()
  ctx.arc(centerX, centerY, currentRadius * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(phase.label, centerX, centerY - currentRadius * 0.5)

  const remainingInPhase = Math.ceil(phase.duration * (1 - phaseProgress))
  ctx.font = '24px system-ui, -apple-system, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText(`${remainingInPhase}s`, centerX, centerY + currentRadius * 0.5 + 30)

  const cycleDuration = pattern.phases.reduce((sum, p) => sum + p.duration, 0)
  const barWidth = Math.min(width * 0.6, 400)
  const barHeight = 6
  const barX = centerX - barWidth / 2
  const barY = centerY + currentRadius + 60

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2)
  ctx.fill()

  let progressX = barX
  pattern.phases.forEach((p, idx) => {
    const phaseWidth = (p.duration / cycleDuration) * barWidth
    const isCurrent = p === phase
    const isPast = pattern.phases.indexOf(p) < pattern.phases.indexOf(phase) || 
      (p === phase && phaseProgress > 0)
    
    let fillWidth = phaseWidth
    if (p === phase) {
      fillWidth = phaseWidth * phaseProgress
    } else if (!isPast) {
      fillWidth = 0
    }

    ctx.fillStyle = isCurrent || isPast ? pattern.color : 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.roundRect(progressX, barY, fillWidth, barHeight, barHeight / 2)
    ctx.fill()

    progressX += phaseWidth + 4
  })
}
