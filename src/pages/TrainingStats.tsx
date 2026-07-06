import { useState, useRef, useEffect, useMemo } from 'react'
import { ArrowLeft, TrendingUp, Clock, Activity, Flame, Target, Calendar, BarChart3, PieChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingHistory, formatDuration } from '@/hooks/useTrainingHistory'
import { ShareButton } from '@/components/ShareButton'

type Period = 'week' | 'month'

const CHART_COLORS = {
  primary: '#00e5ff',
  secondary: '#ff00ff',
  accent: '#ffd700',
  bg: 'rgba(255, 255, 255, 0.05)',
  grid: 'rgba(255, 255, 255, 0.08)',
}

export default function TrainingStats() {
  const navigate = useNavigate()
  const { history, getStreak, getAverageDuration, getTotalDuration, getWeekSessions, getMonthSessions, getModeDistribution, getLongestSession } = useTrainingHistory()
  const [period, setPeriod] = useState<Period>('week')

  const streak = getStreak()
  const averageDuration = getAverageDuration()
  const totalDuration = getTotalDuration()
  const weekSessions = getWeekSessions()
  const monthSessions = getMonthSessions()
  const modeDistribution = getModeDistribution()
  const longestSession = getLongestSession()

  const chartData = useMemo(() => {
    const days = period === 'week' ? 7 : 30
    const sessions = period === 'week' ? weekSessions : monthSessions
    const data: { date: string; duration: number; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.timestamp)
        sessionDate.setHours(0, 0, 0, 0)
        return sessionDate.getTime() === date.getTime()
      })

      data.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
        count: daySessions.length,
      })
    }

    return data
  }, [period, weekSessions, monthSessions])

  const maxDuration = Math.max(...chartData.map(d => d.duration), 1)

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-neon-magenta/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="text-white text-xl font-bold">数据统计</h1>
            <div className="flex items-center gap-2">
              <ShareButton />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              label="连续打卡"
              value={`${streak}天`}
              color="from-orange-500/20 to-red-500/10"
              borderColor="border-orange-400/20"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-neon-cyan" />}
              label="累计时长"
              value={formatDuration(totalDuration)}
              color="from-cyan-500/20 to-blue-500/10"
              borderColor="border-cyan-400/20"
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-neon-magenta" />}
              label="训练次数"
              value={`${history.length}次`}
              color="from-fuchsia-500/20 to-purple-500/10"
              borderColor="border-fuchsia-400/20"
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-neon-gold" />}
              label="平均时长"
              value={formatDuration(averageDuration)}
              color="from-amber-500/20 to-yellow-500/10"
              borderColor="border-amber-400/20"
            />
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-white font-bold">训练趋势</h2>
              </div>
              <div className="flex bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === 'week'
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  周
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === 'month'
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  月
                </button>
              </div>
            </div>
            <BarChart data={chartData} maxValue={maxDuration} />
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta" />
                <span className="text-white/50 text-xs">训练时长</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">
                  {period === 'week' ? '近7天' : '近30天'}总时长: {formatDuration(chartData.reduce((sum, d) => sum + d.duration, 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-neon-magenta" />
                <h2 className="text-white font-bold">模式分布</h2>
              </div>
              <ModePieChart distribution={modeDistribution} totalSessions={history.length} />
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-neon-gold" />
                <h2 className="text-white font-bold">训练洞察</h2>
              </div>
              <div className="space-y-4">
                <InsightItem
                  title="最活跃时段"
                  value={getMostActiveTime(history)}
                  icon="⏰"
                />
                <InsightItem
                  title="单次最长"
                  value={longestSession ? formatDuration(longestSession.duration) : '暂无'}
                  icon="🏆"
                />
                <InsightItem
                  title="本周完成率"
                  value={`${Math.min(Math.round((weekSessions.length / 5) * 100), 100)}%`}
                  icon="📊"
                />
                <InsightItem
                  title="坚持指数"
                  value={streak > 7 ? '优秀' : streak > 3 ? '良好' : '加油'}
                  icon="💪"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-gold/10 border border-white/10 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="text-white font-medium mb-1">训练建议</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  {generateAdvice(streak, weekSessions.length, averageDuration)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-white/20 text-xs pb-6">
            数据仅保存在本设备 · 保护您的隐私
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, borderColor }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  borderColor: string
}) {
  return (
    <div className={`bg-gradient-to-br ${color} backdrop-blur-sm border ${borderColor} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-white/50 text-xs">{label}</div>
      </div>
      <div className="text-white text-xl font-bold">{value}</div>
    </div>
  )
}

function BarChart({ data, maxValue }: { data: { date: string; duration: number; count: number }[]; maxValue: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = 200

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 20, right: 10, bottom: 30, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const barCount = data.length
    const gap = barCount > 15 ? 2 : 8
    const barWidth = (chartWidth - gap * (barCount - 1)) / barCount

    ctx.strokeStyle = CHART_COLORS.grid
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    data.forEach((item, index) => {
      const x = padding.left + index * (barWidth + gap)
      const barHeight = (item.duration / maxValue) * chartHeight
      const y = padding.top + chartHeight - barHeight

      const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight)
      gradient.addColorStop(0, CHART_COLORS.primary)
      gradient.addColorStop(1, CHART_COLORS.secondary)

      ctx.fillStyle = gradient
      ctx.beginPath()
      const radius = Math.min(barWidth / 2, 4)
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0])
      ctx.fill()

      if (barCount <= 7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(item.date, x + barWidth / 2, height - 10)
      }
    })
  }, [data, maxValue])

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  )
}

function ModePieChart({ distribution, totalSessions }: {
  distribution: Record<string, { count: number; totalDuration: number }>
  totalSessions: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const modes = Object.entries(distribution)
  const colors = ['#00e5ff', '#ff00ff', '#ffd700', '#00ff88', '#ff6b6b', '#8b5cf6']

  const MODE_NAMES: Record<string, string> = {
    tracking: '视觉追踪',
    carousel: '颜色轮播',
    calm: '舒缓模式',
    excite: '兴奋模式',
    'eye-movement': '眼球运动',
    focus: '视觉聚焦',
    'red-blue': '红蓝刺激',
    cognitive: '认知训练',
    sensory: '多感官刺激',
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const size = 160

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)

    const centerX = size / 2
    const centerY = size / 2
    const radius = 65
    const innerRadius = 45

    if (modes.length === 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 20
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius + innerRadius) / 2, 0, Math.PI * 2)
      ctx.stroke()
      return
    }

    let startAngle = -Math.PI / 2

    modes.forEach(([, data], index) => {
      const sliceAngle = (data.count / totalSessions) * Math.PI * 2
      const endAngle = startAngle + sliceAngle

      ctx.fillStyle = colors[index % colors.length]
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fill()

      startAngle = endAngle
    })

    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${totalSessions}`, centerX, centerY - 8)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '11px system-ui'
    ctx.fillText('总次数', centerX, centerY + 12)
  }, [distribution, totalSessions, modes.length])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
      <div className="flex-1 space-y-2 w-full">
        {modes.map(([mode, data], index) => (
          <div key={mode} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-white/70 text-sm">{MODE_NAMES[mode] || mode}</span>
            </div>
            <div className="text-white/50 text-xs">
              {data.count}次 · {Math.round((data.count / totalSessions) * 100)}%
            </div>
          </div>
        ))}
        {modes.length === 0 && (
          <div className="text-white/40 text-center py-4 text-sm">
            暂无训练数据
          </div>
        )}
      </div>
    </div>
  )
}

function InsightItem({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-white/60 text-sm">{title}</span>
      </div>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  )
}

function getMostActiveTime(sessions: { timestamp: number }[]): string {
  if (sessions.length === 0) return '暂无'

  const hourCounts: Record<number, number> = {}
  sessions.forEach(s => {
    const hour = new Date(s.timestamp).getHours()
    const period = Math.floor(hour / 4) * 4
    hourCounts[period] = (hourCounts[period] || 0) + 1
  })

  let maxHour = 0
  let maxCount = 0
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxHour = parseInt(hour)
    }
  })

  const periodNames: Record<number, string> = {
    0: '凌晨',
    4: '清晨',
    8: '上午',
    12: '中午',
    16: '下午',
    20: '晚上',
  }

  return periodNames[maxHour] || '全天'
}

function generateAdvice(streak: number, weekSessions: number, avgDuration: number): string {
  if (weekSessions === 0) {
    return '您还没有开始训练，建议从每天5分钟的舒缓模式开始，循序渐进建立训练习惯。'
  }
  if (streak < 3) {
    return '坚持是康复的关键！建议设置每天固定的训练时间，形成习惯后效果会更明显。'
  }
  if (avgDuration < 300) {
    return '每次训练时间可以适当延长，建议每次训练10-15分钟，效果更佳。'
  }
  if (weekSessions >= 5) {
    return '您的训练频率非常棒！可以尝试不同的训练模式，全面锻炼视神经功能。'
  }
  return '您正在稳步前进！继续保持这个节奏，康复效果会越来越好。'
}
