import { useState } from 'react'
import { ArrowLeft, Play, Clock, Plus, Trash2, Check, Zap, Brain, Eye, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'

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

const MODE_OPTIONS = [
  { key: 'carousel', label: '颜色轮播', icon: '🎨', duration: 3 },
  { key: 'tracking', label: '视觉追踪', icon: '👁️', duration: 5 },
  { key: 'calm', label: '舒缓放松', icon: '🧘', duration: 5 },
  { key: 'excite', label: '兴奋刺激', icon: '⚡', duration: 3 },
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
    color: 'from-calm-lavender/20 to-calm-sky/20',
    totalMinutes: 15,
    steps: [
      { mode: 'calm', label: '舒缓放松', duration: 8, icon: '🧘' },
      { mode: 'carousel', label: '颜色轮播', duration: 4, icon: '🎨' },
      { mode: 'calm', label: '舒缓放松', duration: 3, icon: '🧘' },
    ]
  },
]

const STORAGE_KEY = 'hyms_training_plans'

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

export default function TrainingPlan() {
  const navigate = useNavigate()
  const { setMode, setSpeed, speak } = useTrainingStore()
  const [plans, setPlans] = useState<TrainingPlan[]>(() => loadPlans())
  const [showCreator, setShowCreator] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanSteps, setNewPlanSteps] = useState<TrainingStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepTimeLeft, setStepTimeLeft] = useState(0)

  const handleStartPreset = (plan: TrainingPlan) => {
    speak(`${plan.name}训练开始`)
    setIsRunning(true)
    setCurrentStepIndex(0)
    setStepTimeLeft(plan.steps[0].duration * 60)
    setMode(plan.steps[0].mode as any)
    navigate('/sensory')
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

        <h1 className="text-white/80 text-lg font-semibold">训练计划</h1>

        <button
          onClick={handleCreateCustom}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>创建</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
              推荐计划
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gradient-to-br ${plan.color} rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group`}
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
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors group-hover:bg-neon-cyan/20 group-hover:text-neon-cyan"
                  >
                    <Play className="w-4 h-4" />
                    <span>开始训练</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {plans.length > 0 && (
            <div>
              <h2 className="text-white/50 text-sm font-medium uppercase tracking-widest mb-4">
                我的计划
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-gradient-to-br ${plan.color} rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group relative`}
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
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors group-hover:bg-neon-cyan/20 group-hover:text-neon-cyan"
                    >
                      <Play className="w-4 h-4" />
                      <span>开始训练</span>
                    </button>
                  </div>
                ))}
              </div>
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
                className="text-white/60 hover:text-white"
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 disabled:bg-white/5 disabled:text-white/30 text-neon-cyan rounded-xl transition-colors"
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
