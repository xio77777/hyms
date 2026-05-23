import { useNavigate } from 'react-router-dom'
import { Eye, CircleDot, Waves, Focus, Brain, Tv, BarChart3, ListChecks } from 'lucide-react'
import CastButton from '@/components/CastButton'
import { useTrainingStore } from '@/store/trainingStore'

interface TrainingCardProps {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  onClick: () => void
  disabled?: boolean
}

/**
 * 训练入口卡片组件
 * 玻璃拟态风格，hover 发光效果
 */
function TrainingCard({ title, description, icon, gradient, onClick, disabled }: TrainingCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-md
        border border-white/10
        p-6 text-left transition-all duration-500
        hover:bg-white/10 hover:border-white/20
        hover:shadow-[0_0_40px_rgba(0,229,255,0.15)]
        hover:scale-[1.02]
        active:scale-[0.98]
        min-h-[180px]
        flex flex-col justify-between
        ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:bg-white/5 hover:border-white/10 hover:shadow-none' : ''}
      `}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${gradient}`}
      />
      <div className="relative z-10">
        <div className="mb-3 text-white/80 group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
      {!disabled && (
        <div className="relative z-10 mt-3 flex items-center text-white/40 group-hover:text-neon-cyan transition-colors text-xs">
          <span>开始训练</span>
          <svg className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </button>
  )
}

const TRAINING_MODULES = [
  {
    title: '多感官刺激',
    description: '视觉追踪训练与情绪调节灯光，锻炼视神经灵活性与专注力',
    icon: <Eye className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-magenta/10',
    path: '/sensory',
  },
  {
    title: '眼球运动引导',
    description: '引导光点按轨迹移动，锻炼眼肌力量和灵活性',
    icon: <CircleDot className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-cyan/10 via-transparent to-calm-sky/10',
    path: '/eye-movement',
  },
  {
    title: '红蓝光交替刺激',
    description: '红光激活视觉通路，蓝光舒缓神经，专业推荐的视神经激活方法',
    icon: <Waves className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10',
    path: '/red-blue',
  },
  {
    title: '视觉聚焦训练',
    description: '目标远近切换，引导视线聚焦，改善视力模糊和聚焦能力',
    icon: <Focus className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-gold/10 via-transparent to-neon-cyan/10',
    path: '/focus',
  },
  {
    title: '认知记忆训练',
    description: '数字排序与记忆翻牌游戏，锻炼注意力、记忆力和执行功能',
    icon: <Brain className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-magenta/10 via-transparent to-calm-lavender/10',
    path: '/cognitive',
  },
  {
    title: '画中画模式',
    description: '投屏到电视后，手机端继续显示控制界面，训练更便捷',
    icon: <Tv className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-gold/10 via-transparent to-neon-cyan/10',
    path: '/pip',
  },
  {
    title: '训练统计',
    description: '查看训练时长、次数和历史记录，了解康复进展',
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-magenta/10 via-transparent to-neon-gold/10',
    path: '/stats',
  },
  {
    title: '训练计划',
    description: '预设训练组合，一键开始系统化训练，支持自定义创建',
    icon: <ListChecks className="w-8 h-8" />,
    gradient: 'bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-gold/10',
    path: '/plan',
  },
]

/**
 * 首页
 * 展示所有训练模式入口卡片列表
 */
export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-magenta/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-neon-gold/3 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="absolute top-4 right-4 z-20">
          <CastButton />
        </div>

        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-3 tracking-wide">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-gold bg-clip-text text-transparent">
              康复视神经训练
            </span>
          </h1>
          <p className="text-white/40 text-lg">
            HYMS · 多感官刺激康复系统
          </p>
        </header>

        <div className="w-full max-w-4xl">
          <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-6 pl-2">
            训练模式
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRAINING_MODULES.map((mod) => (
              <TrainingCard
                key={mod.path}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                gradient={mod.gradient}
                onClick={() => navigate(mod.path)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center py-6 text-white/20 text-xs">
        HYMS · 康复视神经训练系统 · 仅供康复辅助使用
      </footer>
    </div>
  )
}
