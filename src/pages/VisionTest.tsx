import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  Target,
  Droplets,
  Palette,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  TrendingUp,
  Calendar,
  Sparkles
} from 'lucide-react'

interface VisionTestRecord {
  id: string
  timestamp: number
  leftEye: number
  rightEye: number
  bothEyes: number
  astigmatismLeft: boolean
  astigmatismRight: boolean
  colorVision: 'normal' | 'mild' | 'moderate' | 'unknown'
  notes?: string
}

const STORAGE_KEY = 'hyms_vision_tests'

function loadTests(): VisionTestRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load vision tests:', e)
  }
  return []
}

function saveTests(tests: VisionTestRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
  } catch (e) {
    console.warn('Failed to save vision tests:', e)
  }
}

const E_CHAR_ROWS = [
  { size: 72, count: 1, vision: 0.1 },
  { size: 56, count: 2, vision: 0.15 },
  { size: 44, count: 3, vision: 0.2 },
  { size: 36, count: 4, vision: 0.3 },
  { size: 28, count: 5, vision: 0.4 },
  { size: 22, count: 6, vision: 0.5 },
  { size: 18, count: 7, vision: 0.6 },
  { size: 14, count: 8, vision: 0.8 },
  { size: 12, count: 8, vision: 1.0 },
  { size: 10, count: 9, vision: 1.2 },
  { size: 8, count: 10, vision: 1.5 },
]

type TestType = 'intro' | 'visual-acuity' | 'astigmatism' | 'color' | 'result'
type EyeSide = 'left' | 'right' | 'both'

export default function VisionTest() {
  const navigate = useNavigate()
  const [testType, setTestType] = useState<TestType>('intro')
  const [currentEye, setCurrentEye] = useState<EyeSide>('both')
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalThisRow, setTotalThisRow] = useState(0)
  const [eDirections, setEDirections] = useState<number[]>([])
  const [astigmatismLeft, setAstigmatismLeft] = useState(false)
  const [astigmatismRight, setAstigmatismRight] = useState(false)
  const [colorVision, setColorVision] = useState<'normal' | 'mild' | 'moderate' | 'unknown'>('unknown')
  const [leftEyeVision, setLeftEyeVision] = useState(0)
  const [rightEyeVision, setRightEyeVision] = useState(0)
  const [bothEyeVision, setBothEyeVision] = useState(0)
  const [tests, setTests] = useState<VisionTestRecord[]>(() => loadTests())
  const [colorTestIndex, setColorTestIndex] = useState(0)
  const [colorCorrect, setColorCorrect] = useState(0)

  const generateEDirections = useCallback((count: number) => {
    const dirs: number[] = []
    for (let i = 0; i < count; i++) {
      dirs.push(Math.floor(Math.random() * 4))
    }
    setEDirections(dirs)
  }, [])

  useEffect(() => {
    if (testType === 'visual-acuity' && currentRow < E_CHAR_ROWS.length) {
      generateEDirections(E_CHAR_ROWS[currentRow].count)
      setCurrentCharIndex(0)
      setCorrectCount(0)
      setTotalThisRow(0)
    }
  }, [testType, currentRow, generateEDirections])

  const startVisualAcuityTest = (side: EyeSide) => {
    setCurrentEye(side)
    setCurrentRow(0)
    setCorrectCount(0)
    setTotalThisRow(0)
    setTestType('visual-acuity')
  }

  const handleAnswer = (direction: number) => {
    const isCorrect = direction === eDirections[currentCharIndex]
    if (isCorrect) setCorrectCount(prev => prev + 1)
    setTotalThisRow(prev => prev + 1)

    const nextIndex = currentCharIndex + 1
    if (nextIndex >= E_CHAR_ROWS[currentRow].count) {
      const passRate = correctCount / (totalThisRow + 1)
      const isCorrectCurrent = isCorrect
      const newCorrect = isCorrectCurrent ? correctCount + 1 : correctCount
      const newTotal = totalThisRow + 1
      const newPassRate = newCorrect / newTotal

      if (newPassRate >= 0.6 && currentRow < E_CHAR_ROWS.length - 1) {
        setCurrentRow(prev => prev + 1)
      } else {
        const vision = E_CHAR_ROWS[Math.max(0, currentRow - (newPassRate < 0.5 ? 1 : 0))].vision
        if (currentEye === 'left') {
          setLeftEyeVision(vision)
          startVisualAcuityTest('right')
        } else if (currentEye === 'right') {
          setRightEyeVision(vision)
          startVisualAcuityTest('both')
        } else {
          setBothEyeVision(vision)
          setTestType('astigmatism')
        }
      }
    } else {
      setCurrentCharIndex(nextIndex)
    }
  }

  const handleAstigmatismAnswer = (side: 'left' | 'right', hasAstigmatism: boolean) => {
    if (side === 'left') {
      setAstigmatismLeft(hasAstigmatism)
    } else {
      setAstigmatismRight(hasAstigmatism)
      setTestType('color')
      setColorTestIndex(0)
      setColorCorrect(0)
    }
  }

  const colorTestImages = [
    { answer: 'red', colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'] },
    { answer: 'green', colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'] },
    { answer: 'blue', colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'] },
    { answer: 'yellow', colors: ['#ff6b6b', '#ffd93d', '#45b7d1', '#96ceb4'] },
  ]

  const handleColorTest = (selectedColor: string) => {
    const correctAnswer = colorTestImages[colorTestIndex].answer
    if (selectedColor === correctAnswer) {
      setColorCorrect(prev => prev + 1)
    }

    if (colorTestIndex >= colorTestImages.length - 1) {
      const passRate = (colorCorrect + (selectedColor === correctAnswer ? 1 : 0)) / colorTestImages.length
      if (passRate >= 0.8) {
        setColorVision('normal')
      } else if (passRate >= 0.5) {
        setColorVision('mild')
      } else {
        setColorVision('moderate')
      }
      finishTest()
    } else {
      setColorTestIndex(prev => prev + 1)
    }
  }

  const finishTest = () => {
    const record: VisionTestRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      leftEye: leftEyeVision,
      rightEye: rightEyeVision,
      bothEyes: bothEyeVision,
      astigmatismLeft,
      astigmatismRight,
      colorVision,
    }
    const newTests = [record, ...tests].slice(0, 50)
    setTests(newTests)
    saveTests(newTests)
    setTestType('result')
  }

  const restartTest = () => {
    setTestType('intro')
    setCurrentRow(0)
    setCurrentCharIndex(0)
    setCorrectCount(0)
    setLeftEyeVision(0)
    setRightEyeVision(0)
    setBothEyeVision(0)
    setAstigmatismLeft(false)
    setAstigmatismRight(false)
    setColorVision('unknown')
  }

  const getEDirectionChar = (direction: number) => {
    switch (direction) {
      case 0: return 'E'
      case 1: return 'Ɱ'
      case 2: return '∃'
      case 3: return 'M'
      default: return 'E'
    }
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const getVisionLabel = (vision: number) => {
    if (vision >= 1.0) return { text: '正常', color: 'text-green-400' }
    if (vision >= 0.6) return { text: '轻度', color: 'text-yellow-400' }
    if (vision >= 0.3) return { text: '中度', color: 'text-orange-400' }
    return { text: '较低', color: 'text-red-400' }
  }

  const latestTest = tests[0]

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-neon-cyan/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-neon-magenta/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </button>
            <h1 className="text-white text-xl font-bold">视力自测</h1>
            <div className="w-16" />
          </div>

          {testType === 'intro' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-neon-cyan/20 flex items-center justify-center">
                    <Eye className="w-7 h-7 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">视力自测</h2>
                    <p className="text-white/50 text-sm">定期检测，追踪视力变化</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  本测试提供视力、散光、色觉的初步筛查。测试时请保持与屏幕约30-50cm距离，
                  光线柔和。测试结果仅供参考，如有不适请及时就医。
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Target className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
                  <div className="text-white font-medium text-sm">视力检测</div>
                  <div className="text-white/40 text-xs">E字视力表</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Droplets className="w-8 h-8 text-neon-magenta mx-auto mb-2" />
                  <div className="text-white font-medium text-sm">散光检测</div>
                  <div className="text-white/40 text-xs">放射状线条</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Palette className="w-8 h-8 text-neon-gold mx-auto mb-2" />
                  <div className="text-white font-medium text-sm">色觉检测</div>
                  <div className="text-white/40 text-xs">色彩辨别</div>
                </div>
              </div>

              <button
                onClick={() => startVisualAcuityTest('left')}
                className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-2xl text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                开始测试
                <ChevronRight className="w-5 h-5" />
              </button>

              {latestTest && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-neon-cyan" />
                      最近测试
                    </h3>
                    <span className="text-white/40 text-xs">
                      {formatDate(latestTest.timestamp)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-0.5">{latestTest.leftEye}</div>
                      <div className="text-white/40 text-xs">左眼</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-0.5">{latestTest.rightEye}</div>
                      <div className="text-white/40 text-xs">右眼</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-0.5">{latestTest.bothEyes}</div>
                      <div className="text-white/40 text-xs">双眼</div>
                    </div>
                  </div>
                </div>
              )}

              {tests.length > 1 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-gold" />
                    历史记录
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tests.slice(0, 10).map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-white/60 text-sm">
                          {formatDate(test.timestamp)}
                        </span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-white/50">左 {test.leftEye}</span>
                          <span className="text-white/50">右 {test.rightEye}</span>
                          <span className="text-neon-cyan">双 {test.bothEyes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {testType === 'visual-acuity' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="text-center mb-6">
                <div className="text-white/60 text-sm mb-1">
                  {currentEye === 'left' ? '请遮住右眼，测试左眼' :
                   currentEye === 'right' ? '请遮住左眼，测试右眼' : '双眼测试'}
                </div>
                <div className="text-white/40 text-xs">
                  第 {currentRow + 1} 行 / 共 {E_CHAR_ROWS.length} 行
                </div>
              </div>

              <div className="bg-white border-4 border-white rounded-3xl p-8 mb-8 min-w-[300px] flex items-center justify-center"
                style={{ minHeight: '200px' }}>
                <div
                  className="font-bold text-black text-center tracking-widest"
                  style={{ fontSize: `${E_CHAR_ROWS[currentRow].size}px` }}
                >
                  {getEDirectionChar(eDirections[currentCharIndex] || 0)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                <div />
                <button
                  onClick={() => handleAnswer(0)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors text-lg font-medium"
                >
                  ↑
                </button>
                <div />
                <button
                  onClick={() => handleAnswer(1)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors text-lg font-medium"
                >
                  ←
                </button>
                <button
                  onClick={() => handleAnswer(3)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors text-lg font-medium"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleAnswer(2)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors text-lg font-medium"
                >
                  →
                </button>
              </div>

              <div className="mt-6 text-white/40 text-xs">
                选择 E 字开口方向
              </div>
            </div>
          )}

          {testType === 'astigmatism' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="text-center mb-6">
                <div className="text-white/80 text-lg font-medium mb-1">散光测试</div>
                <div className="text-white/50 text-sm">
                  {astigmatismLeft ? '请遮住左眼，测试右眼' : '请遮住右眼，测试左眼'}
                </div>
              </div>

              <div className="bg-white rounded-full w-64 h-64 mb-8 flex items-center justify-center relative overflow-hidden">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-black"
                    style={{
                      width: '2px',
                      height: '45%',
                      top: '5%',
                      left: '50%',
                      transformOrigin: 'bottom center',
                      transform: `translateX(-50%) rotate(${i * 15}deg)`,
                    }}
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-white border-2 border-black/20 z-10" />
              </div>

              <div className="text-white/60 text-sm mb-6 text-center max-w-xs">
                观察放射状线条，是否所有线条粗细一致、同样清晰？
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAstigmatismAnswer(astigmatismLeft ? 'right' : 'left', false)}
                  className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  均匀清晰
                </button>
                <button
                  onClick={() => handleAstigmatismAnswer(astigmatismLeft ? 'right' : 'left', true)}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  有粗细差异
                </button>
              </div>
            </div>
          )}

          {testType === 'color' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="text-center mb-6">
                <div className="text-white/80 text-lg font-medium mb-1">色觉测试</div>
                <div className="text-white/50 text-sm">
                  第 {colorTestIndex + 1} 题 / 共 {colorTestImages.length} 题
                </div>
              </div>

              <div className="text-white/60 text-sm mb-4">
                哪个颜色看起来更突出/不同？
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {colorTestImages[colorTestIndex].colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => handleColorTest(
                      i === 0 ? 'red' : i === 1 ? 'green' : i === 2 ? 'blue' : 'yellow'
                    )}
                    className="w-24 h-24 rounded-2xl hover:scale-105 transition-transform shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {testType === 'result' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-magenta/10 border border-white/10 rounded-3xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-neon-cyan" />
                </div>
                <h2 className="text-white text-xl font-bold mb-1">测试完成</h2>
                <p className="text-white/50 text-sm">以下是您的测试结果</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-white/50 text-xs mb-2">左眼</div>
                  <div className={`text-2xl font-bold mb-1 ${getVisionLabel(leftEyeVision).color}`}>
                    {leftEyeVision}
                  </div>
                  <div className={`text-xs ${getVisionLabel(leftEyeVision).color}`}>
                    {getVisionLabel(leftEyeVision).text}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-white/50 text-xs mb-2">右眼</div>
                  <div className={`text-2xl font-bold mb-1 ${getVisionLabel(rightEyeVision).color}`}>
                    {rightEyeVision}
                  </div>
                  <div className={`text-xs ${getVisionLabel(rightEyeVision).color}`}>
                    {getVisionLabel(rightEyeVision).text}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-white/50 text-xs mb-2">双眼</div>
                  <div className={`text-2xl font-bold mb-1 ${getVisionLabel(bothEyeVision).color}`}>
                    {bothEyeVision}
                  </div>
                  <div className={`text-xs ${getVisionLabel(bothEyeVision).color}`}>
                    {getVisionLabel(bothEyeVision).text}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-white/50 text-xs mb-2">散光</div>
                  <div className="text-white font-medium text-sm">
                    {astigmatismLeft || astigmatismRight ? (
                      <span className="text-orange-400">
                        可能存在散光
                      </span>
                    ) : (
                      <span className="text-green-400">未见明显异常</span>
                    )}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-white/50 text-xs mb-2">色觉</div>
                  <div className="text-white font-medium text-sm">
                    {colorVision === 'normal' ? (
                      <span className="text-green-400">正常</span>
                    ) : colorVision === 'mild' ? (
                      <span className="text-yellow-400">轻度异常</span>
                    ) : (
                      <span className="text-orange-400">建议就医检查</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-amber-400/80 text-sm leading-relaxed">
                  ⚠️ 本测试仅供参考，不能替代专业眼科检查。如有视力下降、眼痛、
                  视物变形等症状，请及时就医。
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={restartTest}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重新测试
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-xl text-white font-medium"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
