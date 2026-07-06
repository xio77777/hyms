import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Play, Clock, Plus, Trash2, Check, Zap, Brain, Eye, Target, ChevronRight, Calendar, Star, Award, Flame, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'
import { useTrainingHistory, formatDuration } from '@/hooks/useTrainingHistory'

interface TrainingPlan {
  id: string
  name: string
  icon: string
  color: string
  steps: TrainingStep[]
  totalMinutes: number
}

interface TrainingStep {
  mode: string
  label: string
  duration: number
  icon: string
}

interface DailyTask {
  id: string
  title: string
  description: string
  icon: string
  duration: number
  mode: string
  path: string
  completed: boolean
  reward: number
}

interface PhaseProgram {
  id: string
  name: string
  description: string
  duration: string
  icon: string
  color: string
  difficulty: '入门' | '进阶' | '高级'
  sessions: number
  features: string[]
  plan: TrainingStep[]
}

const MODE_OPTIONS = [
  { key: 'carousel', label: '颜色轮播', icon: '🎨', duration: 3 },
  { key: 'tracking', label: '视觉追踪', icon: '👁️', duration: 5 },
  { key: 'calm', label: '舒缓放松', icon: '🧘', duration: 5 },
  { key: 'excite', label: '兴奋刺激', icon: '⚡', duration: 3 },
]

const PHASE_PROGRAMS: PhaseProgram[] = [
  {
    id: 'phase-1',
    name: '适应期',
    description: '循序渐进建立训练习惯，适合新手开始',
    duration: '2周',
    icon: '🌱',
    color: 'from-emerald-500/20 to-teal-500/20',
    difficulty: '入门',
    sessions: 10,
    features: ['低强度训练', '5-8分钟每次', '舒缓为主', '建立习惯'],
    plan: [
      { mode: 'calm', label: '舒缓放松', duration: 5, icon: '🧘' },
      { mode: 'carousel', label: '颜色轮播', duration: 3, icon: '🎨' },
    ],
  },
  {
    id: 'phase-2',
    name: '提升期',
    description: '增加训练强度，全面锻炼视功能',
    duration: '4周',
    icon: '💪',
    color: 'from-cyan-500/20 to-blue-500/20',
    difficulty: '进阶',
    sessions: 24,
    features: ['中等强度', '10-15分钟每次', '多模式组合', '追踪训练'],
    plan: [
      { mode: 'tracking', label: '视觉追踪', duration: 5, icon: '👁️' },
      { mode: 'carousel', label: '颜色轮播', duration: 3, icon: '🎨' },
      { mode: 'calm', label: '舒缓放松', duration: 4, icon: '🧘' },
    ],
  },
  {
    id: 'phase-3',
    name: '强化期',
    description: '高强度综合训练，最大化康复效果',
    duration: '8周',
    icon: '🔥',
    color: 'from-orange-500/20 to-red-500/20',
    difficulty: '高级',
    sessions: 56,
    features: ['高强度训练', '15-25分钟每次', '全模式覆盖', '认知训练'],
    plan: [
      { mode: 'tracking', label: '视觉追踪', duration: 6, icon: '👁️' },
      { mode: 'excite', label: '兴奋刺激', duration: 4, icon: '⚡' },
      { mode: 'carousel', label: '颜色轮播', duration: 4, icon: '🎨' },
      { mode: 'calm', label: '舒缓放松', duration: 6, icon: '🧘' },
    ],
  },
  {
    id: 'phase-4',
    name: '维持期',
    description: '保持训练效果，预防功能退化',
    duration: '长期',
    icon: '⭐',
    color: 'from-amber-500/20 to-yellow-500/20',
    difficulty: '进阶',
    sessions: 999,
    features: ['维持强度', '10分钟每次', '灵活安排', '长期坚持'],
    plan: [
      { mode: 'tracking', label: '视觉追踪', duration: 4, icon: '👁️' },
      { mode: 'calm', label: '舒缓放松', duration: 3, icon: '🧘' },
      { mode: 'carousel', label: '颜色轮播', duration: 3, icon: '🎨' },
    ],
  },
]

const PRESET_PLANS: TrainingPlan[] = [
  {
    id: 'preset-1',
    name: '快速激活',
    icon: '⚡',
    color: 'from-neon-gold/20 to-neon-cyan/20',
    totalMinutes: 10,
    steps: [
      { mode: 'carousel', label: '颜色轮播', duration: 3, icon: '🎨' },
      { mode: 'excite', label: '兴奋刺激', duration: 4, icon: '⚡' },
      { mode: 'calm', label: '舒缓放松', duration: 3, icon: '🧘' },
    ]
  },
  {
    id: 'preset-2',
    name: '深度训练',
    icon: '🧠',
    color: 'from-neon-magenta/20 to-neon-cyan/20',
    totalMinutes: 25,
    steps: [
      { mode: 'tracking', label: '视觉追踪', duration: 8, icon: '👁️' },
      { mode: 'carousel', label: '颜色轮播', duration: 5, icon: '🎨' },
      { mode: 'calm', label: '舒缓放松', duration: 6, icon: '🧘' },
      { mode: 'tracking', label: '视觉追踪', duration: 6, icon: '👁️' },
    ]
  },
  {
    id: 'preset-3',
    name: '睡前放松',
    icon: '🌙',
    color: 'from-purple-500/20 to-indigo-500/20',
    totalMinutes: 15,
    steps: [
      { mode: 'calm', label: '舒缓放松', duration: 8, icon: '🧘' },
      { mode: 'carousel', label: '颜色轮播', duration: 4, icon: '🎨' },
      { mode: 'calm', label: '舒缓放松', duration: 3, icon: '🧘' },
    ]
  },
]

const STORAGE_KEY = 'hyms_training_plans'
const DAILY_TASKS_KEY = 'hyms_daily_tasks'
const ACTIVE_PHASE_KEY = 'hyms_active_phase'

function loadPlans(): TrainingPlan[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load plans:', e)
  }
  return []
}

function savePlans(plans: TrainingPlan[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  } catch (e) {
    console.warn('Failed to save plans:', e)
  }
}

function loadDailyTasks(): DailyTask[] {
  try {
    const saved = localStorage.getItem(DAILY_TASKS_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toDateString()
      if (data.date === today) {
        return data.tasks
      }
    }
  } catch (e) {
    console.warn('Failed to load daily tasks:', e)
  }
  return generateDailyTasks()
}

function saveDailyTasks(tasks: DailyTask[]) {
  try {
    localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify({
      date: new Date().toDateString(),
      tasks,
    }))
  } catch (e) {
    console.warn('Failed to save daily tasks:', e)
  }
}

function generateDailyTasks(): DailyTask[] {
  return [
    {
      id: 'daily-1',
      title: '晨间唤醒',
      description: '5分钟眼球运动，激活视神经',
      icon: '👁️',
      duration: 300,
      mode: 'eye-movement',
      path: '/eye-movement',
      completed: false,
      reward: 10,
    },
    {
      id: 'daily-2',
      title: '核心训练',
      description: '10分钟多感官刺激训练',
      icon: '🎯',
      duration: 600,
      mode: 'sensory',
      path: '/sensory',
      completed: false,
      reward: 20,
    },
    {
      id: 'daily-3',
      title: '认知锻炼',
      description: '5分钟记忆训练，保持大脑活跃',
      icon: '🧠',
      duration: 300,
      mode: 'cognitive',
      path: '/cognitive',
      completed: false,
      reward: 15,
    },
    {
      id: 'daily-4',
      title: '晚间放松',
      description: '舒缓模式，帮助放松入眠',
      icon: '🌙',
      duration: 480,
      mode: 'sensory',
      path: '/sensory',
      completed: false,
      reward: 10,
    },
  ]
}

function loadActivePhase(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PHASE_KEY)
  } catch (e) {
    return null
  }
}

function saveActivePhase(phaseId: string | null) {
  try {
    if (phaseId) {
      localStorage.setItem(ACTIVE_PHASE_KEY, phaseId)
    } else {
      localStorage.removeItem(ACTIVE_PHASE_KEY)
    }
  } catch (e) {
    console.warn('Failed to save active phase:', e)
  }
}

export default function TrainingPlan() {
  const navigate = useNavigate()
  const { setMode, setSpeed, speak } = useTrainingStore()
  const { history, getTodaySessions } = useTrainingHistory()
  const [plans, setPlans] = useState<TrainingPlan[]>(() => loadPlans())
  const [showCreator, setShowCreator] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanSteps, setNewPlanSteps] = useState<TrainingStep[]>([])
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => loadDailyTasks())
  const [activePhase, setActivePhaseState] = useState<string | null>(() => loadActivePhase())
  const [activeTab, setActiveTab] = useState<'daily' | 'phase' | 'preset' | 'custom'>('daily')

  useEffect(() => {
    saveDailyTasks(dailyTasks)
  }, [dailyTasks])

  const todaySessions = getTodaySessions()
  const completedTasks = dailyTasks.filter(t => t.completed).length
  const totalReward = dailyTasks.filter(t => t.completed).reduce((sum, t) => sum + t.reward, 0)

  const markTaskCompleted = (taskId: string) => {
    setDailyTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ))
  }

  const handleStartPreset = (plan: TrainingPlan) => {
    speak(`${plan.name}训练开始`)
    setMode(plan.steps[0].mode as any)
    navigate('/sensory')
  }

  const handleStartPhase = (phase: PhaseProgram) => {
    setActivePhaseState(phase.id)
    saveActivePhase(phase.id)
    speak(`${phase.name}计划开始`)
    setMode(phase.plan[0].mode as any)
    navigate('/sensory')
  }

  const handleStartTask = (task: DailyTask) => {
    markTaskCompleted(task.id)
    navigate(task.path)
  }

  const handleAddStep = (mode: typeof MODE_OPTIONS[0]) => {
    setNewPlanSteps([
      ...newPlanSteps,
      {
        mode: mode.key,
        label: mode.label,
        duration: mode.duration,
        icon: mode.icon
      }
    ])
  }

  const handleRemoveStep = (index: number) => {
    setNewPlanSteps(newPlanSteps.filter((_, i) => i !== index))
  }

  const handleSavePlan = () => {
    if (!newPlanName.trim() || newPlanSteps.length === 0) return

    const plan: TrainingPlan = {
      id: `custom-${Date.now()}`,
      name: newPlanName,
      icon: newPlanSteps[0].icon,
      color: 'from-neon-cyan/20 to-neon-magenta/20',
      totalMinutes: newPlanSteps.reduce((sum, step) => sum + step.duration, 0),
      steps: newPlanSteps
    }

    const newPlans = [...plans, plan]
    setPlans(newPlans)
    savePlans(newPlans)
    setShowCreator(false)
    setNewPlanName('')
    setNewPlanSteps([])
    speak('训练计划已保存')
  }

  const handleDeletePlan = (id: string) => {
    const newPlans = plans.filter(p => p.id !== id)
    setPlans(newPlans)
    savePlans(newPlans)
    speak('训练计划已删除')
  }

  const handleCreateCustom = () => {
    setShowCreator(true)
    setNewPlanName('')
    setNewPlanSteps([])
  }

  const currentPhase = PHASE_PROGRAMS.find(p => p.id === activePhase)

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-neon-magenta/5 rounded-full blur-[80px]" />
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
            <h1 className="text-white text-xl font-bold">训练计划</h1>
            <button
              onClick={handleCreateCustom}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>创建</span>
            </button>
          </div>

          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {[
              { key: 'daily', label: '每日任务', icon: <Calendar className="w-4 h-4" /> },
              { key: 'phase', label: '阶段方案', icon: <Award className="w-4 h-4" /> },
              { key: 'preset', label: '精选计划', icon: <Star className="w-4 h-4" /> },
              { key: 'custom', label: '我的计划', icon: <Target className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/70'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-amber-400/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">今日任务</div>
                      <div className="text-white/50 text-sm">
                        完成 {completedTasks}/{dailyTasks.length} 项任务
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold text-xl">+{totalReward}</div>
                    <div className="text-white/40 text-xs">经验奖励</div>
                  </div>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 transition-all duration-1000"
                    style={{ width: `${(completedTasks / dailyTasks.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {dailyTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`
                      bg-white/5 backdrop-blur-sm border rounded-2xl p-4 transition-all
                      ${task.completed
                        ? 'border-emerald-400/20 opacity-60'
                        : 'border-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                        ${task.completed ? 'bg-emerald-500/20' : 'bg-white/10'}
                      `}>
                        {task.completed ? <Check className="w-6 h-6 text-emerald-400" /> : task.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-medium ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                            {task.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                            +{task.reward}
                          </span>
                        </div>
                        <div className="text-white/50 text-sm">{task.description}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white/70 text-sm font-medium">
                            {formatDuration(task.duration)}
                          </div>
                          <div className="text-white/30 text-xs">
                            第{index + 1}项
                          </div>
                        </div>
                        {!task.completed ? (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                          >
                            <Play className="w-4 h-4" />
                            开始
                          </button>
                        ) : (
                          <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                            已完成
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-gold/10 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium mb-1">训练小贴士</div>
                    <div className="text-white/60 text-sm leading-relaxed">
                      每天坚持完成任务，循序渐进效果更好。建议固定训练时间，形成生物钟，
                      让康复训练成为生活的一部分。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phase' && (
            <div className="space-y-6">
              {currentPhase && (
                <div className="bg-gradient-to-r from-neon-cyan/15 to-neon-magenta/15 border border-neon-cyan/30 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan text-xs font-bold rounded-full">
                      当前进行中
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{currentPhase.icon}</div>
                    <div>
                      <div className="text-white text-xl font-bold">{currentPhase.name}</div>
                      <div className="text-white/60 text-sm">{currentPhase.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartPhase(currentPhase)}
                    className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    继续训练
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PHASE_PROGRAMS.map((phase) => (
                  <div
                    key={phase.id}
                    className={`
                      bg-gradient-to-br ${phase.color} rounded-2xl p-5 border transition-all
                      ${activePhase === phase.id ? 'border-neon-cyan/40' : 'border-white/10 hover:border-white/20'}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{phase.icon}</div>
                      <span className={`
                        text-[10px] px-2 py-0.5 rounded-full font-medium
                        ${phase.difficulty === '入门' ? 'bg-emerald-500/20 text-emerald-300' :
                          phase.difficulty === '进阶' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-orange-500/20 text-orange-300'}
                      `}>
                        {phase.difficulty}
                      </span>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-1">{phase.name}</h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{phase.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-xs">
                      <div className="flex items-center gap-1 text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>{phase.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/40">
                        <Calendar className="w-3 h-3" />
                        <span>{phase.sessions}次</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {phase.features.map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleStartPhase(phase)}
                      className={`
                        w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${activePhase === phase.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                        }
                      `}
                    >
                      <Play className="w-4 h-4" />
                      {activePhase === phase.id ? '继续此方案' : '选择此方案'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preset' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gradient-to-br ${plan.color} rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{plan.icon}</div>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{plan.totalMinutes}分钟</span>
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="space-y-1 mb-4">
                    {plan.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/60 text-xs">
                        <span>{step.icon}</span>
                        <span>{step.label}</span>
                        <span className="ml-auto">{step.duration}分钟</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleStartPreset(plan)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
                  >
                    <Play className="w-4 h-4" />
                    开始训练
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              {plans.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 mb-2">还没有自定义计划</div>
                  <div className="text-white/30 text-sm mb-4">创建属于您的专属训练计划</div>
                  <button
                    onClick={handleCreateCustom}
                    className="px-6 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    创建计划
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-gradient-to-br ${plan.color} rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group relative`}
                    >
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="absolute top-3 right-3 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="删除计划"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{plan.icon}</div>
                        <div className="flex items-center gap-1 text-white/50 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{plan.totalMinutes}分钟</span>
                        </div>
                      </div>
                      <h3 className="text-white text-lg font-bold mb-2">{plan.name}</h3>
                      <div className="space-y-1 mb-4">
                        {plan.steps.slice(0, 3).map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/60 text-xs">
                            <span>{step.icon}</span>
                            <span>{step.label}</span>
                            <span className="ml-auto">{step.duration}分钟</span>
                          </div>
                        ))}
                        {plan.steps.length > 3 && (
                          <div className="text-white/30 text-xs">+{plan.steps.length - 3} 更多...</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleStartPreset(plan)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
                      >
                        <Play className="w-4 h-4" />
                        开始训练
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">创建训练计划</h2>
              <button
                onClick={() => setShowCreator(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">计划名称</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="例如：我的晨间训练"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">训练步骤</label>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[200px]">
                  {newPlanSteps.length === 0 ? (
                    <div className="text-center text-white/30 py-8">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p>点击下方添加训练步骤</p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {newPlanSteps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{step.icon}</span>
                            <div>
                              <div className="text-white text-sm font-medium">{step.label}</div>
                              <div className="text-white/50 text-xs">{step.duration}分钟</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStep(index)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map((mode) => (
                      <button
                        key={mode.key}
                        onClick={() => handleAddStep(mode)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white transition-colors"
                      >
                        <span>{mode.icon}</span>
                        <span className="text-xs">{mode.label}</span>
                        <span className="text-white/50 text-xs ml-auto">{mode.duration}分钟</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {newPlanSteps.length > 0 && (
                <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-white/60 text-sm">总时长</span>
                  <span className="text-white font-medium">
                    {newPlanSteps.reduce((sum, step) => sum + step.duration, 0)} 分钟
                  </span>
                </div>
              )}

              <button
                onClick={handleSavePlan}
                disabled={!newPlanName.trim() || newPlanSteps.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 disabled:bg-white/5 disabled:text-white/30 text-neon-cyan rounded-xl transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                <span>保存计划</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
