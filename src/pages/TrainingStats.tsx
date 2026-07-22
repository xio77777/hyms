import { ArrowLeft, Clock, Activity, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'
import { ShareButton } from '@/components/ShareButton'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export default function TrainingStats() {
  const navigate = useNavigate()
  const { stats, settings, speed, speak } = useTrainingStore()

  const handleBack = () => {
    speak('返回首页')
    navigate('/')
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}分钟`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}小时${remainingMins}分钟`
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '暂无记录'
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const weeklyGoal = 5
  const weeklyProgress = Math.min(stats.sessions, 10)

  return (
    <div className="h-full w-full bg-dark flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>返回</span>
        </button>

        <h1 className="text-white/80 text-lg sm:text-xl font-semibold">训练统计</h1>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <ShareButton />
          <button
            onClick={() => { speak('训练历史'); navigate('/history') }}
            className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-colors text-base"
          >
            历史记录
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-neon-cyan/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-7 h-7 text-neon-cyan" />
              </div>
              <div>
                <div className="text-white/50 text-base">总训练时长</div>
                <div className="text-white text-3xl sm:text-4xl font-bold">
                  {formatDuration(stats.totalTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-6 h-6 text-neon-magenta" />
                <div className="text-white/50 text-base">训练次数</div>
              </div>
              <div className="text-white text-4xl font-bold">{stats.sessions}</div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-neon-gold" />
                <div className="text-white/50 text-base">最近训练</div>
              </div>
              <div className="text-white text-2xl font-medium">
                {formatDate(stats.lastSession)}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white text-lg font-medium">本周进度</div>
              <div className="text-white/60 text-base">
                {weeklyProgress} / {weeklyGoal} 次
              </div>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-500"
                style={{
                  width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%`
                }}
              />
            </div>
            {weeklyProgress >= weeklyGoal && (
              <div className="mt-4 text-neon-cyan text-lg font-medium text-center">
                本周目标已完成，太棒了！
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-white/50 text-base mb-4">当前设置</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-lg">语音播报</div>
                <div className={`text-lg font-medium ${
                  settings.voiceEnabled ? 'text-neon-cyan' : 'text-white/40'
                }`}>
                  {settings.voiceEnabled ? '已开启' : '已关闭'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-lg">默认训练时长</div>
                <div className="text-white/70 text-lg">
                  {settings.timerEnabled ? `${settings.timerMinutes}分钟` : '未设置'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-lg">训练速度</div>
                <div className="text-white/70 text-lg">{speed.toFixed(1)}x</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-lg">高对比度</div>
                <div className={`text-lg font-medium ${
                  settings.highContrast ? 'text-neon-gold' : 'text-white/40'
                }`}>
                  {settings.highContrast ? '已开启' : '已关闭'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-lg">大字体</div>
                <div className={`text-lg font-medium ${
                  settings.largeFont ? 'text-neon-gold' : 'text-white/40'
                }`}>
                  {settings.largeFont ? '已开启' : '已关闭'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-white/30 text-sm pb-4">
            数据仅保存在本设备
          </div>
        </div>
      </div>
    </div>
  )
}
