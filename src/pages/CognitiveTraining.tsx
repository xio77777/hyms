import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'

type GameMode = 'sort' | 'memory'

interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ['🍎', '🌟', '🎵', '🌈', '🌻', '🐱', '🎈', '❤️']

function generateNumbers(count: number): number[] {
  const nums: number[] = []
  const used = new Set<number>()
  while (nums.length < count) {
    const n = Math.floor(Math.random() * 50) + 1
    if (!used.has(n)) {
      used.add(n)
      nums.push(n)
    }
  }
  return nums
}

function generateMemoryCards(): MemoryCard[] {
  const selectedEmojis = EMOJIS.slice(0, 6)
  const pairs = [...selectedEmojis, ...selectedEmojis]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
}

function SortGame() {
  const [numbers, setNumbers] = useState<number[]>(() => generateNumbers(8))
  const [nextTarget, setNextTarget] = useState(1)
  const [clicked, setClicked] = useState<Set<number>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const { speak } = useTrainingStore()

  useEffect(() => {
    if (isComplete) return
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [isComplete, startTime])

  const sortedNumbers = [...numbers].sort((a, b) => a - b)

  const handleClick = useCallback(
    (num: number) => {
      if (clicked.has(num) || isComplete) return
      const target = sortedNumbers[nextTarget - 1]
      if (num === target) {
        speak(`${num}，正确`)
        const newClicked = new Set(clicked)
        newClicked.add(num)
        setClicked(newClicked)
        if (nextTarget >= numbers.length) {
          setIsComplete(true)
          speak(`完成！用时 ${Math.floor((Date.now() - startTime) / 1000)} 秒`)
        } else {
          setNextTarget(nextTarget + 1)
        }
      } else {
        speak('请按顺序点击')
      }
    },
    [clicked, isComplete, nextTarget, numbers.length, sortedNumbers, speak, startTime]
  )

  const handleReset = () => {
    const newNums = generateNumbers(8)
    setNumbers(newNums)
    setNextTarget(1)
    setClicked(new Set())
    setIsComplete(false)
    speak('游戏重新开始')
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
        <span className="text-xl sm:text-2xl font-medium">
          按从小到大顺序点击数字
        </span>
        <span className="text-neon-cyan font-mono text-2xl font-bold">
          {nextTarget}/{numbers.length}
        </span>
        <span className="text-white/50 font-mono text-xl">
          {elapsed}秒
        </span>
      </div>

      {isComplete && (
        <div className="bg-neon-cyan/10 border-2 border-neon-cyan/40 rounded-2xl px-8 py-5 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-neon-gold" />
          <span className="text-neon-cyan text-2xl sm:text-3xl font-bold">
            完成！用时 {elapsed} 秒
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {numbers.map((num, index) => {
          const isClicked = clicked.has(num)
          const isNext = !isClicked && num === sortedNumbers[nextTarget - 1]
          return (
            <button
              key={index}
              onClick={() => handleClick(num)}
              disabled={isClicked || isComplete}
              className={`
                w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-3xl sm:text-4xl font-bold transition-all duration-300
                flex items-center justify-center
                ${isClicked
                  ? 'bg-neon-cyan/20 border-2 border-neon-cyan/40 text-neon-cyan scale-95'
                  : isNext
                    ? 'bg-white/15 border-2 border-white/40 text-white hover:bg-white/20 hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                    : 'bg-white/5 border-2 border-white/10 text-white/60 hover:bg-white/10 hover:scale-105 hover:text-white'
                }
              `}
            >
              {num}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleReset}
        className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border-2 border-white/10
          text-white/70 hover:text-white hover:bg-white/10 transition-all text-xl font-medium"
      >
        <RotateCcw className="w-7 h-7" />
        <span>重新开始</span>
      </button>
    </div>
  )
}

function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(() => generateMemoryCards())
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const { speak } = useTrainingStore()

  const handleCardClick = useCallback(
    (id: number) => {
      if (isChecking || isComplete) return

      const card = cards.find((c) => c.id === id)
      if (!card || card.isFlipped || card.isMatched) return

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c
      )
      setCards(newCards)

      const newFlipped = [...flippedIds, id]
      setFlippedIds(newFlipped)

      if (newFlipped.length === 2) {
        setMoves(moves + 1)
        setIsChecking(true)

        const [firstId, secondId] = newFlipped
        const firstCard = newCards.find((c) => c.id === firstId)!
        const secondCard = newCards.find((c) => c.id === secondId)!

        if (firstCard.emoji === secondCard.emoji) {
          speak('配对成功')
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            )
            setFlippedIds([])
            setIsChecking(false)

            const allMatched = newCards.every((c) =>
              c.id === firstId || c.id === secondId ? true : c.isMatched
            )
            if (allMatched) {
              setIsComplete(true)
              speak(`全部配对成功！共 ${moves + 1} 步`)
            }
          }, 500)
        } else {
          speak('配对失败')
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            )
            setFlippedIds([])
            setIsChecking(false)
          }, 1000)
        }
      }
    },
    [cards, flippedIds, isChecking, isComplete, moves, speak]
  )

  const handleReset = () => {
    setCards(generateMemoryCards())
    setFlippedIds([])
    setMoves(0)
    setIsComplete(false)
    setIsChecking(false)
    speak('游戏重新开始')
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
        <span className="text-xl sm:text-2xl font-medium">
          翻开两张相同图案的卡片配对
        </span>
        <span className="text-neon-magenta font-mono text-2xl font-bold">
          {moves} 步
        </span>
      </div>

      {isComplete && (
        <div className="bg-neon-magenta/10 border-2 border-neon-magenta/40 rounded-2xl px-8 py-5 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-neon-gold" />
          <span className="text-neon-magenta text-2xl sm:text-3xl font-bold">
            全部配对成功！共 {moves} 步
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-3xl sm:text-4xl transition-all duration-300
              flex items-center justify-center
              ${card.isMatched
                ? 'bg-neon-magenta/15 border-2 border-neon-magenta/30 scale-95'
                : card.isFlipped
                  ? 'bg-white/10 border-2 border-white/30 scale-105'
                  : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:scale-105 cursor-pointer'
              }
            `}
          >
            {card.isFlipped || card.isMatched ? (
              <span>{card.emoji}</span>
            ) : (
              <span className="text-white/20 text-3xl">?</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 border-2 border-white/10
          text-white/70 hover:text-white hover:bg-white/10 transition-all text-xl font-medium"
      >
        <RotateCcw className="w-7 h-7" />
        <span>重新开始</span>
      </button>
    </div>
  )
}

function CountdownOverlay({ name, onComplete }: { name: string; onComplete: () => void }) {
  const [count, setCount] = useState(3)
  const doneRef = useRef(false)
  const speak = useTrainingStore((s) => s.speak)

  useEffect(() => {
    speak(`${name}准备，3`)
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1
        if (next > 0) speak(next.toString())
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [name, speak])

  useEffect(() => {
    if (count <= 0 && !doneRef.current) {
      doneRef.current = true
      speak('开始')
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }
  }, [count, onComplete, speak])

  if (count < 0) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="text-white/60 text-2xl mb-4">{name}</div>
      <div className="text-white text-[180px] font-black leading-none animate-pulse">
        {count > 0 ? count : '开始'}
      </div>
      <div className="text-white/40 text-lg mt-4">请做好准备</div>
    </div>
  )
}

export default function CognitiveTraining() {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState<GameMode>('sort')
  const [showCountdown, setShowCountdown] = useState(true)
  const { speak } = useTrainingStore()

  const handleBack = () => {
    speak('返回首页')
    navigate('/')
  }

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode)
    setShowCountdown(true)
    speak(mode === 'sort' ? '数字排序游戏' : '记忆翻牌游戏')
  }

  return (
    <div className="h-full w-full bg-dark flex flex-col overflow-hidden">
      {showCountdown && (
        <CountdownOverlay
          name={gameMode === 'sort' ? '数字排序' : '记忆翻牌'}
          onComplete={() => setShowCountdown(false)}
        />
      )}

      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>返回</span>
        </button>

        <h1 className="text-white/80 text-lg sm:text-xl font-semibold">认知记忆训练</h1>

        <div className="flex gap-2">
          <button
            onClick={() => gameMode !== 'sort' && handleModeChange('sort')}
            className={`px-5 py-3 rounded-2xl text-base sm:text-lg font-medium transition-all
              ${gameMode === 'sort'
                ? 'text-neon-cyan bg-neon-cyan/10 border-2 border-neon-cyan/40'
                : 'text-white/50 hover:text-white/80 border-2 border-transparent hover:bg-white/5'
              }`}
          >
            数字排序
          </button>
          <button
            onClick={() => gameMode !== 'memory' && handleModeChange('memory')}
            className={`px-5 py-3 rounded-2xl text-base sm:text-lg font-medium transition-all
              ${gameMode === 'memory'
                ? 'text-neon-magenta bg-neon-magenta/10 border-2 border-neon-magenta/40'
                : 'text-white/50 hover:text-white/80 border-2 border-transparent hover:bg-white/5'
              }`}
          >
            记忆翻牌
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {!showCountdown && (gameMode === 'sort' ? <SortGame /> : <MemoryGame />)}
      </div>
    </div>
  )
}
