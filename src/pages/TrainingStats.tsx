import { ArrowLeft, Clock, Activity, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'
import { ShareButton } from '@/components/ShareButton'

export default function TrainingStats() {
  const navigate = useNavigate()
  const { stats, resetTimer, settings } = useTrainingStore()

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

  const getWeeklyGoal = () => {
    return 5
  }

  const getWeeklyProgress = () => {
    return Math.min(stats.sessions, 10)
  }

  return (
    <div className="h-full w-full bg-dark flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <h1 className="text-white/80 text-lg font-semibold">训练统计</h1>

        <div className="flex items-center gap-2">
          <ShareButton />
          <button
            onClick={() => navigate('/history')}
            className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors"
          >
            查看历史
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-white/50 text-xs">总训练时长</div>
                <div className="text-white text-2xl font-bold">
                  {formatDuration(stats.totalTime)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-neon-magenta" />
                <div className="text-white/50 text-xs">训练次数</div>
              </div>
              <div className="text-white text-3xl font-bold">{stats.sessions}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-neon-gold" />
                <div className="text-white/50 text-xs">最近训练</div>
              </div>
              <div className="text-white text-lg font-medium">
                {formatDate(stats.lastSession)}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-medium">本周进度</div>
              <div className="text-white/50 text-sm">
                {getWeeklyProgress()} / {getWeeklyGoal()} 次
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-500"
                style={{
                  width: `${Math.min((getWeeklyProgress() / getWeeklyGoal()) * 100, 100)}%`
                }}
              />
            </div>
            {getWeeklyProgress() >= getWeeklyGoal() && (
              <div className="mt-3 text-neon-cyan text-sm font-medium text-center">
                🎉 本周目标已完成！
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="text-white/50 text-xs mb-3">当前设置</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-sm">语音播报</div>
                <div className={`text-sm font-medium ${
                  settings.voiceEnabled ? 'text-neon-cyan' : 'text-white/40'
                }`}>
                  {settings.voiceEnabled ? '已开启' : '已关闭'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-sm">默认训练时长</div>
                <div className="text-white/70 text-sm">
                  {settings.timerEnabled ? `${settings.timerMinutes}分钟` : '未设置'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-white/70 text-sm">训练速度</div>
                <div className="text-white/70 text-sm">1.0x</div>
              </div>
            </div>
          </div>

          <div className="text-center text-white/30 text-xs">
            数据仅保存在本设备
          </div>
        </div>
      </div>
    </div>
  )
}
