import { useNavigate } from 'react-router-dom'
import { Eye, CircleDot, Waves, Focus, Brain, Tv, BarChart3, ListChecks, History, Bell, Settings, Sun, Type, Play, Sparkles } from 'lucide-react'
import CastButton from '@/components/CastButton'
import { useTrainingStore } from '@/store/trainingStore'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useState, useEffect } from 'react'

interface TrainingCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

function TrainingCard({ title, description, icon, color, onClick }: TrainingCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-3xl
        bg-white/5 backdrop-blur-md
        border-2 ${color}
        p-8 text-left transition-all duration-300
        hover:bg-white/10 hover:scale-[1.03]
        active:scale-[0.97]
        min-h-[220px]
        flex flex-col justify-between
        w-full
        focus:outline-none focus:ring-4 focus:ring-white/30
      `}
    >
      <div className={`mb-4 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-base leading-relaxed">{description}</p>
      </div>
    </button>
  )
}

const CORE_TRAINING = [
  {
    title: '多感官刺激',
    description: '视觉追踪训练与情绪调节灯光',
    icon: <Eye className="w-14 h-14" />,
    color: 'border-neon-cyan/40 text-neon-cyan',
    path: '/sensory',
  },
  {
    title: '眼球运动',
    description: '引导光点按轨迹移动，锻炼眼肌',
    icon: <CircleDot className="w-14 h-14" />,
    color: 'border-neon-magenta/40 text-neon-magenta',
    path: '/eye-movement',
  },
  {
    title: '红蓝光刺激',
    description: '红光激活视觉通路，蓝光舒缓神经',
    icon: <Waves className="w-14 h-14" />,
    color: 'border-red-400/40 text-red-400',
    path: '/red-blue',
  },
]

const SUPPLEMENTAL_TRAINING = [
  {
    title: '视觉聚焦',
    description: '目标远近切换，改善聚焦能力',
    icon: <Focus className="w-12 h-12" />,
    color: 'border-neon-gold/40 text-neon-gold',
    path: '/focus',
  },
  {
    title: '认知记忆',
    description: '数字排序与记忆翻牌游戏',
    icon: <Brain className="w-12 h-12" />,
    color: 'border-calm-lavender/40 text-calm-lavender',
    path: '/cognitive',
  },
]

const TOOLS = [
  {
    title: '训练计划',
    description: '预设训练组合',
    icon: <ListChecks className="w-10 h-10" />,
    color: 'border-white/20 text-white/60',
    path: '/plan',
  },
  {
    title: '训练统计',
    description: '查看康复进展',
    icon: <BarChart3 className="w-10 h-10" />,
    color: 'border-white/20 text-white/60',
    path: '/stats',
  },
  {
    title: '训练历史',
    description: '查看记录',
    icon: <History className="w-10 h-10" />,
    color: 'border-white/20 text-white/60',
    path: '/history',
  },
  {
    title: '训练提醒',
    description: '定时提醒',
    icon: <Bell className="w-10 h-10" />,
    color: 'border-white/20 text-white/60',
    path: '/reminders',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { settings, updateSettings, speak } = useTrainingStore()
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false)
  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState(false)

  useKeyboardNav(() => {
    if (showAccessibilityMenu) {
      setShowAccessibilityMenu(false)
    }
    if (showFirstTimeGuide) {
      setShowFirstTimeGuide(false)
    }
  })

  useEffect(() => {
    const hasUsed = localStorage.getItem('hyms_has_used')
    if (!hasUsed) {
      setShowFirstTimeGuide(true)
      localStorage.setItem('hyms_has_used', 'true')
    }
  }, [])

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast })
    speak(settings.highContrast ? '高对比度模式已关闭' : '高对比度模式已开启')
  }

  const toggleLargeFont = () => {
    updateSettings({ largeFont: !settings.largeFont })
    speak(settings.largeFont ? '大字体模式已关闭' : '大字体模式已开启')
  }

  const enableRecommended = () => {
    updateSettings({ highContrast: true, largeFont: true, voiceEnabled: true })
    speak('已开启推荐的护眼模式')
    setShowFirstTimeGuide(false)
  }

  const startQuickTraining = () => {
    speak('开始今日训练，多感官刺激')
    navigate('/sensory')
  }

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      {showFirstTimeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border-2 border-neon-cyan/40 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-neon-cyan" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">欢迎使用康复训练</h2>
            <p className="text-white/70 text-lg mb-6 leading-relaxed">
              为保护您的视力，建议开启大字体和高对比度模式。语音播报将帮助您了解操作。
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={enableRecommended}
                className="w-full py-5 bg-neon-cyan/20 hover:bg-neon-cyan/30 border-2 border-neon-cyan/40 rounded-2xl text-neon-cyan text-xl font-bold transition-colors"
              >
                开启推荐模式
              </button>
              <button
                onClick={() => setShowFirstTimeGuide(false)}
                className="w-full py-4 text-white/60 hover:text-white text-lg transition-colors"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.highContrast ? 'bg-white text-black' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                康复训练
              </h1>
              <p className="text-white/40 text-sm">HYMS 系统</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
                className={`
                  p-3 rounded-xl transition-all
                  ${settings.highContrast ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}
                `}
                aria-label="无障碍设置"
              >
                <Settings className="w-6 h-6" />
              </button>

              {showAccessibilityMenu && (
                <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-[240px] shadow-2xl z-50">
                  <h3 className="text-white font-medium mb-4">无障碍设置</h3>
                  <div className="space-y-3">
                    <button
                      onClick={toggleHighContrast}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                        settings.highContrast
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span>{settings.highContrast ? '关闭' : '开启'}高对比度</span>
                    </button>
                    <button
                      onClick={toggleLargeFont}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                        settings.largeFont
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Type className="w-5 h-5" />
                      <span>{settings.largeFont ? '关闭' : '开启'}大字体</span>
                    </button>
                    <button
                      onClick={() => {
                        updateSettings({ voiceEnabled: !settings.voiceEnabled })
                        speak(settings.voiceEnabled ? '语音播报已关闭' : '语音播报已开启')
                      }}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                        settings.voiceEnabled
                          ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Tv className="w-5 h-5" />
                      <span>{settings.voiceEnabled ? '关闭' : '开启'}语音播报</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <CastButton />
          </div>
        </div>

        <button
          onClick={startQuickTraining}
          className="w-full mb-8 py-6 sm:py-8 rounded-3xl bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 border-2 border-neon-cyan/40 hover:from-neon-cyan/30 hover:to-neon-magenta/30 transition-all duration-300 flex items-center justify-center gap-4 group hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-neon-cyan/30"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neon-cyan/30 flex items-center justify-center group-hover:bg-neon-cyan/40 transition-colors">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-neon-cyan ml-1" />
          </div>
          <div className="text-left">
            <div className="text-2xl sm:text-3xl font-black text-white">开始今日训练</div>
            <div className="text-white/60 text-base sm:text-lg">多感官刺激 · 推荐每日训练</div>
          </div>
        </button>

        <section className="mb-8">
          <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
            核心训练
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {CORE_TRAINING.map((mod) => (
              <TrainingCard
                key={mod.path}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                color={mod.color}
                onClick={() => {
                  speak(`${mod.title}训练开始`)
                  navigate(mod.path)
                }}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
            辅助训练
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SUPPLEMENTAL_TRAINING.map((mod) => (
              <TrainingCard
                key={mod.path}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                color={mod.color}
                onClick={() => {
                  speak(`${mod.title}训练开始`)
                  navigate(mod.path)
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
            工具
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOOLS.map((mod) => (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className={`
                  rounded-2xl bg-white/5 backdrop-blur-md
                  border border-white/10
                  p-4 flex flex-col items-center gap-2
                  transition-all duration-300
                  hover:bg-white/10 hover:scale-[1.03]
                  active:scale-[0.97]
                  min-h-[120px]
                  justify-center
                `}
              >
                <span className={mod.color}>{mod.icon}</span>
                <span className="text-white/80 text-sm font-medium">{mod.title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-10 text-center py-6 text-white/20 text-xs">
        HYMS · 康复视神经训练系统
      </footer>
    </div>
  )
}
