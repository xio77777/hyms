import { useState, useEffect } from 'react'
import { X, ChevronRight, Sparkles, Eye, Brain, Target, Tv, CheckCircle } from 'lucide-react'

interface GuideStep {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  highlight?: string
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    icon: <Sparkles className="w-12 h-12 text-neon-cyan" />,
    title: '欢迎使用 HYMS',
    description: '康复视神经训练系统，帮助您通过科学的视觉训练，改善视神经功能，提升生活质量。',
  },
  {
    id: 'sensory',
    icon: <Eye className="w-12 h-12 text-neon-magenta" />,
    title: '多感官刺激训练',
    description: '通过视觉追踪、舒缓/兴奋模式等多种训练方式，锻炼视神经灵活性，提升专注力。',
  },
  {
    id: 'modes',
    icon: <Brain className="w-12 h-12 text-neon-gold" />,
    title: '丰富的训练模式',
    description: '包含眼球运动、视觉聚焦、红蓝光刺激、认知记忆等多种训练，全面康复视功能。',
  },
  {
    id: 'tracking',
    icon: <Target className="w-12 h-12 text-emerald-400" />,
    title: '数据追踪',
    description: '自动记录训练数据，生成趋势图表，让您直观看到康复进度和效果。',
  },
  {
    id: 'cast',
    icon: <Tv className="w-12 h-12 text-purple-400" />,
    title: '大屏投屏',
    description: '支持DLNA投屏到电视，大屏训练效果更佳，手机可作为遥控器使用。',
  },
]

const STORAGE_KEY = 'hyms_onboarding_completed'

export function useOnboarding() {
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      const timer = setTimeout(() => setShowGuide(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShowGuide(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY)
    setShowGuide(true)
  }

  return {
    showGuide,
    setShowGuide,
    completeOnboarding,
    resetOnboarding,
  }
}

interface OnboardingModalProps {
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingModal({ onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const step = GUIDE_STEPS[currentStep]
  const isLastStep = currentStep === GUIDE_STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        setIsAnimating(false)
      }, 200)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors flex items-center gap-1 text-sm"
      >
        跳过
        <X className="w-5 h-5" />
      </button>

      <div className="w-[340px] sm:w-[400px]">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-neon-cyan/10 to-transparent rounded-full blur-3xl" />

          <div
            className={`
              relative z-10 transition-all duration-300
              ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
            `}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                {step.icon}
              </div>
            </div>

            <h2 className="text-white text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-6">
            {GUIDE_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${idx === currentStep
                    ? 'w-8 bg-gradient-to-r from-neon-cyan to-neon-magenta'
                    : idx < currentStep
                    ? 'w-1.5 bg-neon-cyan/50'
                    : 'w-1.5 bg-white/20'
                  }
                `}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle className="w-5 h-5" />
                开始使用
              </>
            ) : (
              <>
                下一步
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="mt-3 text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              跳过引导
            </button>
          )}
        </div>

        <div className="text-center mt-4 text-white/30 text-xs">
          {currentStep + 1} / {GUIDE_STEPS.length}
        </div>
      </div>
    </div>
  )
}
