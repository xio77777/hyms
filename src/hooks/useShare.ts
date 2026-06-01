import { useTrainingHistory, formatDuration, formatFullTime } from './useTrainingHistory'
import { useTrainingStore } from '@/store/trainingStore'

export function useShare() {
  const {
    history,
    getTotalDuration,
    getStreak,
    getAverageDuration,
    getModeDistribution
  } = useTrainingHistory()
  const { stats } = useTrainingStore()

  const generateTextReport = () => {
    const streak = getStreak()
    const totalDuration = getTotalDuration()
    const averageDuration = getAverageDuration()
    const modeDistribution = getModeDistribution()

    const lines = [
      '🌟 康复视神经训练报告',
      '═══════════════════════',
      '',
      '📊 训练数据概览',
      `• 总训练时长: ${formatDuration(totalDuration)}`,
      `• 训练次数: ${history.length}次`,
      `• 平均时长: ${formatDuration(averageDuration)}`,
      `• 连续训练: ${streak}天`,
      '',
      '🎯 训练模式分布',
    ]

    Object.entries(modeDistribution).forEach(([mode, data]) => {
      const modeLabels: Record<string, string> = {
        carousel: '颜色轮播',
        tracking: '视觉追踪',
        calm: '舒缓放松',
        excite: '兴奋刺激'
      }
      const modeLabel = modeLabels[mode] || mode
      lines.push(`• ${modeLabel}: ${data.count}次 (${formatDuration(data.totalDuration)})`)
    })

    lines.push('')
    lines.push('💪 坚持训练，促进康复！')
    lines.push('')
    lines.push('— 来自 HYMS 康复视神经训练系统')

    return lines.join('\n')
  }

  const generateImageReport = async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = 800
    canvas.height = 600

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#00e5ff'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🌟 康复视神经训练报告', canvas.width / 2, 60)

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(50, 90)
    ctx.lineTo(canvas.width - 50, 90)
    ctx.stroke()

    const streak = getStreak()
    const totalDuration = getTotalDuration()
    const averageDuration = getAverageDuration()
    const modeDistribution = getModeDistribution()

    const stats = [
      { label: '总训练时长', value: formatDuration(totalDuration), icon: '⏱️' },
      { label: '训练次数', value: `${history.length}次`, icon: '📊' },
      { label: '平均时长', value: formatDuration(averageDuration), icon: '⏰' },
      { label: '连续训练', value: `${streak}天`, icon: '🔥' },
    ]

    const startY = 140
    const boxWidth = 160
    const boxHeight = 100
    const gap = 20
    const totalWidth = stats.length * boxWidth + (stats.length - 1) * gap
    const startX = (canvas.width - totalWidth) / 2

    stats.forEach((stat, index) => {
      const x = startX + index * (boxWidth + gap)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(x, startY, boxWidth, boxHeight, 12)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(stat.icon, x + boxWidth / 2, startY + 35)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.fillText(stat.value, x + boxWidth / 2, startY + 65)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '12px Arial'
      ctx.fillText(stat.label, x + boxWidth / 2, startY + 90)
    })

    const modeY = 280
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('🎯 训练模式分布', 50, modeY)

    const modeLabels: Record<string, { label: string; icon: string }> = {
      carousel: { label: '颜色轮播', icon: '🎨' },
      tracking: { label: '视觉追踪', icon: '👁️' },
      calm: { label: '舒缓放松', icon: '🧘' },
      excite: { label: '兴奋刺激', icon: '⚡' }
    }

    Object.entries(modeDistribution).forEach(([mode, data], index) => {
      const info = modeLabels[mode] || { label: mode, icon: '📋' }
      const y = modeY + 40 + index * 50

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.beginPath()
      ctx.roundRect(50, y, canvas.width - 100, 40, 8)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = '24px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(info.icon, 70, y + 27)

      ctx.fillText(info.label, 110, y + 27)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${data.count}次 · ${formatDuration(data.totalDuration)}`, canvas.width - 70, y + 27)

      const progressWidth = (data.count / history.length) * (canvas.width - 140)
      const progressGradient = ctx.createLinearGradient(70, 0, 70 + progressWidth, 0)
      progressGradient.addColorStop(0, '#00e5ff')
      progressGradient.addColorStop(1, '#ff00e5')
      ctx.fillStyle = progressGradient
      ctx.fillRect(70, y + 33, progressWidth, 3)
    })

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('💪 坚持训练，促进康复！', canvas.width / 2, canvas.height - 60)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.font = '12px Arial'
    ctx.fillText('— 来自 HYMS 康复视神经训练系统', canvas.width / 2, canvas.height - 35)

    return canvas.toDataURL('image/png')
  }

  const shareText = async () => {
    const text = generateTextReport()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '康复视神经训练报告',
          text: text
        })
        return true
      } catch (e) {
        console.log('Share cancelled or failed:', e)
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }

    return false
  }

  const shareImage = async () => {
    const dataUrl = await generateImageReport()
    if (!dataUrl) return false

    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], 'training-report.png', { type: 'image/png' })
        
        await navigator.share({
          title: '康复视神经训练报告',
          files: [file]
        })
        return true
      } catch (e) {
        console.log('Share cancelled or failed:', e)
      }
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `hyms-training-report-${Date.now()}.png`
    link.click()
    
    return true
  }

  const copyToClipboard = async () => {
    const text = generateTextReport()
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
    return false
  }

  return {
    generateTextReport,
    generateImageReport,
    shareText,
    shareImage,
    copyToClipboard
  }
}
