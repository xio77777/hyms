import { useState } from 'react'
import { ArrowLeft, Trophy, Lock, Star, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAchievements, RARITY_COLORS, RARITY_LABELS, CATEGORY_LABELS, type Achievement } from '@/hooks/useAchievements'

type CategoryTab = 'all' | Achievement['category']

const TABS: { key: CategoryTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'beginner', label: '新手' },
  { key: 'streak', label: '连续' },
  { key: 'duration', label: '时长' },
  { key: 'mode', label: '模式' },
  { key: 'special', label: '特殊' },
]

export default function AchievementsPage() {
  const navigate = useNavigate()
  const { achievements, getStats, getByCategory } = useAchievements()
  const [activeTab, setActiveTab] = useState<CategoryTab>('all')

  const stats = getStats()

  const filteredAchievements = activeTab === 'all'
    ? achievements
    : getByCategory(activeTab)

  const unlockedInCategory = filteredAchievements.filter(a => a.unlocked).length

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </button>
            <h1 className="text-white text-2xl font-bold">成就墙</h1>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border border-amber-400/20 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-500/30 flex items-center justify-center border border-amber-400/30">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-white text-xl font-bold mb-1">
                  已解锁 {stats.unlockedCount} / {stats.totalCount}
                </div>
                <div className="text-white/50 text-sm">
                  完成度 {stats.percentage}%
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-lg font-bold">{stats.totalReward}</span>
                </div>
                <div className="text-white/40 text-xs">累计经验</div>
              </div>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-1000"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${activeTab === tab.key
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-transparent'
                  }
                `}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    {getByCategory(tab.key).filter(a => a.unlocked).length}/{getByCategory(tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab !== 'all' && (
            <div className="text-white/40 text-sm mb-4">
              {CATEGORY_LABELS[activeTab]} · 已解锁 {unlockedInCategory} / {filteredAchievements.length}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {filteredAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityStyle = RARITY_COLORS[achievement.rarity]
  const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100)

  const formatProgress = (value: number, id: string) => {
    if (id.startsWith('duration_')) {
      const mins = Math.floor(value / 60)
      if (mins < 60) return `${mins}分钟`
      return `${Math.floor(mins / 60)}小时${mins % 60}分`
    }
    return `${value}`
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-4 transition-all
        ${achievement.unlocked
          ? `${rarityStyle.bg} border ${rarityStyle.border} ${rarityStyle.glow}`
          : 'bg-white/5 border border-white/10'
        }
      `}
    >
      {achievement.unlocked && (
        <div className="absolute top-2 right-2">
          <Sparkles className={`w-4 h-4 ${rarityStyle.text}`} />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0
          ${achievement.unlocked
            ? `${rarityStyle.bg} border ${rarityStyle.border}`
            : 'bg-white/5 border border-white/10 grayscale opacity-50'
          }
        `}>
          {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/30" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold truncate ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
              {achievement.title}
            </h3>
          </div>
          <p className={`text-sm mb-3 line-clamp-2 ${achievement.unlocked ? 'text-white/60' : 'text-white/30'}`}>
            {achievement.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-white/30'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <span className={`text-xs whitespace-nowrap ${achievement.unlocked ? rarityStyle.text : 'text-white/40'}`}>
              {formatProgress(achievement.progress, achievement.id)}/{formatProgress(achievement.target, achievement.id)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}`}>
              {RARITY_LABELS[achievement.rarity]}
            </span>
            <span className="text-[10px] text-amber-400/70">
              +{achievement.reward} 经验
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
