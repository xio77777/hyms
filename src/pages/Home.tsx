import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  CircleDot,
  Waves,
  Focus,
  Brain,
  Tv,
  Trophy,
  Flame,
  Clock,
  Target,
  Zap,
  Star,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Wind
} from 'lucide-react'
import CastButton from '@/components/CastButton'
import OnboardingModal from '@/components/OnboardingModal'
import AchievementUnlockModal from '@/components/AchievementUnlockModal'
import { useTrainingStore } from '@/store/trainingStore'
import { useTrainingHistory } from '@/hooks/useTrainingHistory'
import { formatDuration } from '@/hooks/useTrainingHistory'
import { useOnboarding } from '@/components/OnboardingModal'
import { useAchievements } from '@/hooks/useAchievements'
import { useEyeHealth } from '@/hooks/useEyeHealth'

interface QuickStartCardProps {
  title: string
  subtitle: string
  duration: string
  icon: React.ReactNode
  gradient: string
  accent: string
  onClick: () => void
  hot?: boolean
  recommended?: boolean
}

/**
 * 快速开始卡片 - 大卡片、沉浸式设计
 */
function QuickStartCard({ title, subtitle, duration, icon, gradient, accent, onClick, hot, recommended }: QuickStartCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-3xl text-left
        transition-all duration-500 ease-out
        hover:scale-[1.02] active:scale-[0.98]
        ${gradient}
        border border-white/10 hover:border-white/20
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {hot && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-red-500/90 rounded-full text-white text-xs font-bold">
            <Flame className="w-3 h-3" />
            <span>热门</span>
          </div>
        </div>
      )}
      
      {recommended && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-neon-cyan/90 rounded-full text-black text-xs font-bold">
            <Sparkles className="w-3 h-3" />
            <span>推荐</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${accent}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/60 text-sm mb-4">{subtitle}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/50 text-sm">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all">
            <span className="text-sm font-medium">开始</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color: string
  trend?: string
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-0.5 text-green-400 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-white/50 text-xs">{label}</div>
    </div>
  )
}

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
}

function FeatureItem({ icon, title, desc, onClick }: FeatureItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-neon-cyan/20 group-hover:text-neon-cyan transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium mb-0.5">{title}</div>
        <div className="text-white/50 text-sm truncate">{desc}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </button>
  )
}

const QUICK_START = [
  {
    title: '多感官刺激',
    subtitle: '视觉追踪 + 情绪调节',
    duration: '5-15 分钟',
    icon: <Eye className="w-7 h-7 text-white" />,
    gradient: 'bg-gradient-to-br from-cyan-600/40 via-blue-600/30 to-purple-600/40',
    accent: 'bg-white/20',
    path: '/sensory',
    recommended: true,
  },
  {
    title: '眼球运动',
    subtitle: '眼肌力量与灵活性训练',
    duration: '3-10 分钟',
    icon: <CircleDot className="w-7 h-7 text-white" />,
    gradient: 'bg-gradient-to-br from-emerald-600/40 via-teal-600/30 to-cyan-600/40',
    accent: 'bg-white/20',
    path: '/eye-movement',
    hot: true,
  },
  {
    title: '视觉聚焦',
    subtitle: '改善视力模糊与聚焦能力',
    duration: '5-12 分钟',
    icon: <Focus className="w-7 h-7 text-white" />,
    gradient: 'bg-gradient-to-br from-amber-600/40 via-orange-600/30 to-red-600/40',
    accent: 'bg-white/20',
    path: '/focus',
  },
  {
    title: '红蓝光刺激',
    subtitle: '专业视神经激活方法',
    duration: '5-10 分钟',
    icon: <Waves className="w-7 h-7 text-white" />,
    gradient: 'bg-gradient-to-br from-red-600/40 via-rose-600/30 to-blue-600/40',
    accent: 'bg-white/20',
    path: '/red-blue',
  },
  {
    title: '呼吸训练',
    subtitle: '4-7-8呼吸法+视觉引导',
    duration: '3-15 分钟',
    icon: <Wind className="w-7 h-7 text-white" />,
    gradient: 'bg-gradient-to-br from-teal-600/40 via-cyan-600/30 to-sky-600/40',
    accent: 'bg-white/20',
    path: '/breathing',
  },
]

const FEATURES = [
  {
    icon: <Eye className="w-5 h-5" />,
    title: '视力自测',
    desc: '定期检测，追踪视力变化',
    path: '/vision-test',
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: '认知记忆训练',
    desc: '数字排序与记忆翻牌游戏',
    path: '/cognitive',
  },
  {
    icon: <Tv className="w-5 h-5" />,
    title: '画中画模式',
    desc: '投屏时手机继续控制',
    path: '/pip',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: '训练计划',
    desc: '系统化训练方案',
    path: '/plan',
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: '成就系统',
    desc: '徽章与等级激励',
    path: '/achievements',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: '训练历史',
    desc: '记录与趋势分析',
    path: '/history',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: '训练提醒',
    desc: '养成规律训练习惯',
    path: '/reminders',
  },
]

/**
 * 首页 - 沉浸式设计 + 游戏化激励
 * 参考Keep、Nike Training Club等健康类App的设计理念
 */
export default function Home() {
  const navigate = useNavigate()
  const { stats } = useTrainingStore()
  const { getStreak, getWeekSessions, getTotalDuration, history } = useTrainingHistory()
  const { showGuide, completeOnboarding } = useOnboarding()
  const { newlyUnlocked, clearNewlyUnlocked } = useAchievements()
  const { todayTotalMinutes } = useEyeHealth()
  
  const [greeting, setGreeting] = useState('')
  const [level, setLevel] = useState(1)
  const [exp, setExp] = useState(0)
  const [nextLevelExp, setNextLevelExp] = useState(100)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 6) setGreeting('凌晨好')
    else if (hour < 12) setGreeting('早上好')
    else if (hour < 14) setGreeting('中午好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }, [])

  useEffect(() => {
    const totalMinutes = Math.floor(getTotalDuration() / 60)
    const calculatedLevel = Math.floor(totalMinutes / 50) + 1
    const currentLevelExp = (calculatedLevel - 1) * 50
    const progress = totalMinutes - currentLevelExp
    setLevel(Math.min(calculatedLevel, 20))
    setExp(Math.min(progress, 50))
    setNextLevelExp(50)
  }, [getTotalDuration, history.length])

  const streak = getStreak()
  const weekSessions = getWeekSessions()
  const totalDuration = getTotalDuration()

  const weeklyGoal = 5
  const weeklyProgress = Math.min(weekSessions.length, weeklyGoal)

  const getRecommendation = () => {
    if (history.length === 0) {
      return {
        title: '新手入门',
        subtitle: '从舒缓模式开始，适应训练节奏',
        duration: '5 分钟',
        icon: <Eye className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-cyan-600/40 via-blue-600/30 to-purple-600/40',
        accent: 'bg-white/20',
        path: '/sensory',
        reason: '为新用户推荐的入门训练',
        recommended: true,
      }
    }

    const hour = new Date().getHours()
    const modeDistribution: Record<string, number> = {}
    history.forEach(s => {
      modeDistribution[s.mode] = (modeDistribution[s.mode] || 0) + 1
    })

    let leastMode = 'sensory'
    let leastCount = Infinity
    const allModes = ['sensory', 'eye-movement', 'focus', 'red-blue', 'cognitive']
    allModes.forEach(mode => {
      const count = modeDistribution[mode] || 0
      if (count < leastCount) {
        leastCount = count
        leastMode = mode
      }
    })

    let timeBasedMode = leastMode
    let reason = '平衡训练，全面提升'
    
    if (hour >= 21 || hour < 6) {
      timeBasedMode = 'sensory'
      reason = '夜间舒缓，助您放松入眠'
    } else if (hour >= 6 && hour < 10) {
      timeBasedMode = 'eye-movement'
      reason = '晨间唤醒，激活视神经'
    } else if (hour >= 14 && hour < 17) {
      timeBasedMode = 'focus'
      reason = '下午提神，提升专注力'
    }

    const recommendations: Record<string, any> = {
      'sensory': {
        title: '多感官刺激',
        subtitle: '视觉追踪 + 情绪调节',
        duration: '5-15 分钟',
        icon: <Eye className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-cyan-600/40 via-blue-600/30 to-purple-600/40',
        accent: 'bg-white/20',
        path: '/sensory',
      },
      'eye-movement': {
        title: '眼球运动',
        subtitle: '眼肌力量与灵活性训练',
        duration: '3-10 分钟',
        icon: <CircleDot className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-emerald-600/40 via-teal-600/30 to-cyan-600/40',
        accent: 'bg-white/20',
        path: '/eye-movement',
      },
      'focus': {
        title: '视觉聚焦',
        subtitle: '改善视力模糊与聚焦能力',
        duration: '5-12 分钟',
        icon: <Focus className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-amber-600/40 via-orange-600/30 to-red-600/40',
        accent: 'bg-white/20',
        path: '/focus',
      },
      'red-blue': {
        title: '红蓝光刺激',
        subtitle: '专业视神经激活方法',
        duration: '5-10 分钟',
        icon: <Waves className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-red-600/40 via-rose-600/30 to-blue-600/40',
        accent: 'bg-white/20',
        path: '/red-blue',
      },
      'cognitive': {
        title: '认知记忆训练',
        subtitle: '数字排序与记忆翻牌游戏',
        duration: '10-15 分钟',
        icon: <Brain className="w-7 h-7 text-white" />,
        gradient: 'bg-gradient-to-br from-purple-600/40 via-violet-600/30 to-indigo-600/40',
        accent: 'bg-white/20',
        path: '/cognitive',
      },
    }

    return {
      ...recommendations[timeBasedMode] || recommendations['sensory'],
      reason,
      recommended: true,
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-neon-cyan/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-neon-magenta/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-neon-gold/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-5 py-6">
          {/* 顶部栏 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-white/50 text-sm mb-0.5">{greeting}，欢迎回来</div>
              <div className="flex items-center gap-2">
                <h1 className="text-white text-2xl font-bold">康复训练</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-full">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-xs font-bold">Lv.{level}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CastButton />
            </div>
          </div>

          {/* 等级进度条 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-white/70 text-sm">
                  经验值 {exp} / {nextLevelExp}
                </span>
              </div>
              <span className="text-white/40 text-xs">
                再训练 {nextLevelExp - exp} 分钟升级
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-1000"
                style={{ width: `${(exp / nextLevelExp) * 100}%` }}
              />
            </div>
          </div>

          {/* 数据概览 */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard
              label="连续打卡"
              value={`${streak}天`}
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              color="bg-orange-500/20"
              trend={streak > 0 ? '继续' : undefined}
            />
            <StatCard
              label="本周训练"
              value={`${weeklyProgress}/${weeklyGoal}`}
              icon={<Target className="w-5 h-5 text-neon-cyan" />}
              color="bg-cyan-500/20"
            />
            <StatCard
              label="累计时长"
              value={formatDuration(totalDuration)}
              icon={<Zap className="w-5 h-5 text-neon-magenta" />}
              color="bg-fuchsia-500/20"
            />
          </div>

          {/* 今日推荐 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                今日推荐
              </h2>
              <span className="text-white/40 text-xs">{recommendation.reason}</span>
            </div>
            <QuickStartCard
              title={recommendation.title}
              subtitle={recommendation.subtitle}
              duration={recommendation.duration}
              icon={recommendation.icon}
              gradient={recommendation.gradient}
              accent={recommendation.accent}
              recommended={true}
              onClick={() => navigate(recommendation.path)}
            />
          </div>

          {/* 快速开始 - 大卡片 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">快速开始</h2>
              <button
                onClick={() => navigate('/plan')}
                className="text-neon-cyan text-sm flex items-center gap-1 hover:underline"
              >
                全部计划
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_START.map((item) => (
                <QuickStartCard
                  key={item.path}
                  title={item.title}
                  subtitle={item.subtitle}
                  duration={item.duration}
                  icon={item.icon}
                  gradient={item.gradient}
                  accent={item.accent}
                  hot={item.hot}
                  recommended={item.recommended}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          </div>

          {/* 更多功能 */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-bold mb-4">更多功能</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((item) => (
                <FeatureItem
                  key={item.path}
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          </div>

          {/* 今日用眼健康 */}
          <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-sky-500/10 border border-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium mb-1">今日用眼</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  已训练 <span className="text-teal-400 font-medium">{todayTotalMinutes} 分钟</span>
                  {todayTotalMinutes < 30 && '，建议每天训练 30 分钟效果更佳'}
                  {todayTotalMinutes >= 30 && todayTotalMinutes < 60 && '，继续保持！'}
                  {todayTotalMinutes >= 60 && '，请注意适当休息，避免过度用眼'}
                </div>
              </div>
            </div>
          </div>

          {/* 每日小贴士 */}
          <div className="bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-gold/10 border border-white/10 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-white font-medium mb-1">今日小贴士</div>
                <div className="text-white/60 text-sm leading-relaxed">
                  遵循 20-20-20 护眼法则：每用眼 20 分钟，看向 20 英尺（约 6 米）外的物体 20 秒。
                  训练时注意坐姿端正，眼睛与屏幕保持 30-50cm 距离。
                </div>
              </div>
            </div>
          </div>

          {/* 底部声明 */}
          <div className="text-center text-white/20 text-xs pb-6">
            HYMS · 康复视神经训练系统 · 仅供康复辅助使用
          </div>
        </div>
      </div>

      {showGuide && (
        <OnboardingModal
          onClose={completeOnboarding}
          onComplete={completeOnboarding}
        />
      )}

      {newlyUnlocked.length > 0 && (
        <AchievementUnlockModal
          achievements={newlyUnlocked}
          onClose={clearNewlyUnlocked}
        />
      )}
    </div>
  )
}
