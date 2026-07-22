import { ArrowLeft, Calendar, Clock, Flame, Award, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingHistory, formatDuration, formatFullTime } from '@/hooks/useTrainingHistory'
import { useState } from 'react'
import { useTrainingStore } from '@/store/trainingStore'

const MODE_LABELS: Record<string, string> = {
  carousel: '颜色轮播',
  tracking: '视觉追踪',
  calm: '舒缓放松',
  excite: '兴奋刺激'
}

export default function TrainingHistory() {
  const navigate = useNavigate()
  const { speak } = useTrainingStore()
  const {
    history,
    getTodaySessions,
    getWeekSessions,
    getMonthSessions,
    getStreak,
    getAverageDuration,
    getLongestSession,
    getModeDistribution,
    deleteSession,
    clearHistory
  } = useTrainingHistory()

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'all'>('week')

  const handleBack = () => {
    speak('返回首页')
    navigate('/')
  }

  const todaySessions = getTodaySessions()
  const weekSessions = getWeekSessions()
  const monthSessions = getMonthSessions()
  const streak = getStreak()
  const averageDuration = getAverageDuration()
  const longestSession = getLongestSession()
  const modeDistribution = getModeDistribution()

  const getDisplaySessions = () => {
    switch (activeTab) {
      case 'today': return todaySessions
      case 'week': return weekSessions
      case 'month': return monthSessions
      case 'all': return history
      default: return weekSessions
    }
  }

  const getModeIcon = (mode: string) => {
    const iconMap: Record<string, string> = {
      carousel: '🎨',
      tracking: '👁️',
      calm: '🧘',
      excite: '⚡'
    }
    return iconMap[mode] || '📋'
  }

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

        <h1 className="text-white/80 text-lg sm:text-xl font-semibold">训练历史</h1>

        {history.length > 0 ? (
          <button
            onClick={() => {
              if (confirm('确定要清空所有训练历史吗？此操作不可恢复。')) {
                clearHistory()
                speak('训练历史已清空')
              }
            }}
            className="flex items-center gap-2 text-red-400/80 hover:text-red-400 transition-colors px-4 py-3 rounded-2xl hover:bg-red-400/10 text-base"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">清空</span>
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-cyan/5 rounded-2xl p-4 sm:p-5 border border-neon-cyan/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-neon-cyan" />
                <div className="text-white/50 text-sm">连续训练</div>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">
                {streak}
                <span className="text-base font-normal ml-1">天</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neon-magenta/10 to-neon-magenta/5 rounded-2xl p-4 sm:p-5 border border-neon-magenta/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-neon-magenta" />
                <div className="text-white/50 text-sm">平均时长</div>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">
                {formatDuration(averageDuration)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-neon-gold/10 to-neon-gold/5 rounded-2xl p-4 sm:p-5 border border-neon-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-neon-gold" />
                <div className="text-white/50 text-sm">最长训练</div>
              </div>
              <div className="text-white text-xl sm:text-2xl font-bold">
                {longestSession ? formatDuration(longestSession.duration) : '暂无'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-calm-lavender/10 to-calm-lavender/5 rounded-2xl p-4 sm:p-5 border border-calm-lavender/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-calm-lavender" />
                <div className="text-white/50 text-sm">总训练次数</div>
              </div>
              <div className="text-white text-2xl sm:text-3xl font-bold">
                {history.length}
                <span className="text-base font-normal ml-1">次</span>
              </div>
            </div>
          </div>

          {Object.keys(modeDistribution).length > 0 && (
            <div className="bg-white/5 rounded-2xl p-5 sm:p-6 border border-white/10">
              <h2 className="text-white text-lg font-medium mb-4">训练模式分布</h2>
              <div className="space-y-4">
                {Object.entries(modeDistribution).map(([mode, data]) => (
                  <div key={mode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/80 text-base">{getModeIcon(mode)} {MODE_LABELS[mode] || mode}</span>
                      <span className="text-white/50 text-sm">{data.count}次 · {formatDuration(data.totalDuration)}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                        style={{
                          width: `${(data.count / history.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { key: 'today', label: '今天', count: todaySessions.length },
                { key: 'week', label: '本周', count: weekSessions.length },
                { key: 'month', label: '本月', count: monthSessions.length },
                { key: 'all', label: '全部', count: history.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any)
                    speak(`${tab.label}的训练`)
                  }}
                  className={`px-6 py-3 rounded-2xl text-base font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan/40'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {getDisplaySessions().map(session => (
                <div
                  key={session.id}
                  className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-white text-lg font-medium">{getModeIcon(session.mode)} {MODE_LABELS[session.mode] || session.mode}</span>
                        {session.completed ? (
                          <span className="text-sm px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full font-medium">已完成</span>
                        ) : (
                          <span className="text-sm px-3 py-1 bg-white/10 text-white/50 rounded-full">未完成</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-base flex-wrap">
                        <span className="text-white/50">{formatFullTime(session.timestamp)}</span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/70 font-medium">{formatDuration(session.duration)}</span>
                        {session.steps && session.steps.length > 0 && (
                          <>
                            <span className="text-white/30">·</span>
                            <span className="text-white/50">{session.steps.length}个步骤</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这条训练记录吗？')) {
                          deleteSession(session.id)
                          speak('记录已删除')
                        }
                      }}
                      className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {getDisplaySessions().length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <div className="text-white/50 text-xl mb-2">
                    {activeTab === 'today' && '今天还没有训练记录'}
                    {activeTab === 'week' && '本周还没有训练记录'}
                    {activeTab === 'month' && '本月还没有训练记录'}
                    {activeTab === 'all' && '还没有训练记录'}
                  </div>
                  <div className="text-white/30 text-base">
                    开始训练来积累您的康复数据吧
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
