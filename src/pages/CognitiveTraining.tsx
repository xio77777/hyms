import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type GameMode = 'sort' | 'memory'

interface MemoryCard {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ['🍎', '🌟', '🎵', '🌈', '🌻', '🐱', '🎈', '❤️']

/**
 * 生成随机数字序列
 */
function generateNumbers(count: number): number[] {
  const nums: number[] = []
  for (let i = 0; i < count; i++) {
    nums.push(Math.floor(Math.random() * 50) + 1)
  }
  return nums
}

/**
 * 生成记忆翻牌卡片
 */
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

/**
 * 数字排序游戏组件
 * 将乱序数字按从小到大依次点击，锻炼注意力和数字认知
 */
function SortGame() {
  const [numbers, setNumbers] = useState<number[]>(() => generateNumbers(8))
  const [nextTarget, setNextTarget] = useState(1)
  const [clicked, setClicked] = useState<Set<number>>(new Set())
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

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
        const newClicked = new Set(clicked)
        newClicked.add(num)
        setClicked(newClicked)
        if (nextTarget >= numbers.length) {
          setIsComplete(true)
        } else {
          setNextTarget(nextTarget + 1)
        }
      }
    },
    [clicked, isComplete, nextTarget, numbers.length, sortedNumbers]
  )

  const handleReset = () => {
    const newNums = generateNumbers(8)
    setNumbers(newNums)
    setNextTarget(1)
    setClicked(new Set())
    setIsComplete(false)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6 text-white/60">
        <span className="text-lg">
          请按从小到大的顺序点击数字
        </span>
        <span className="text-neon-cyan font-mono text-lg">
          {nextTarget}/{numbers.length}
        </span>
        <span className="text-white/40 font-mono">
          {elapsed}秒
        </span>
      </div>

      {isComplete && (
        <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl px-8 py-4 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-neon-gold" />
          <span className="text-neon-cyan text-xl font-bold">
            完成！用时 {elapsed} 秒
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 max-w-lg">
        {numbers.map((num, index) => {
          const isClicked = clicked.has(num)
          const isNext = !isClicked && num === sortedNumbers[nextTarget - 1]
          return (
            <button
              key={index}
              onClick={() => handleClick(num)}
              disabled={isClicked || isComplete}
              className={`
                w-24 h-24 rounded-2xl text-3xl font-bold transition-all duration-300
                flex items-center justify-center
                ${isClicked
                  ? 'bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan scale-95'
                  : isNext
                    ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:scale-105'
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
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10
          text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        <span>重新开始</span>
      </button>
    </div>
  )
}

/**
 * 记忆翻牌游戏组件
 * 翻开两张相同图案的卡片配对，锻炼记忆力和注意力
 */
function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(() => generateMemoryCards())
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

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
            }
          }, 500)
        } else {
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
    [cards, flippedIds, isChecking, isComplete, moves]
  )

  const handleReset = () => {
    setCards(generateMemoryCards())
    setFlippedIds([])
    setMoves(0)
    setIsComplete(false)
    setIsChecking(false)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6 text-white/60">
        <span className="text-lg">
          翻开两张相同图案的卡片进行配对
        </span>
        <span className="text-neon-magenta font-mono text-lg">
          {moves} 步
        </span>
      </div>

      {isComplete && (
        <div className="bg-neon-magenta/10 border border-neon-magenta/30 rounded-2xl px-8 py-4 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-neon-gold" />
          <span className="text-neon-magenta text-xl font-bold">
            全部配对成功！共 {moves} 步
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 max-w-md">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-20 h-20 rounded-xl text-3xl transition-all duration-300
              flex items-center justify-center
              ${card.isMatched
                ? 'bg-neon-magenta/15 border border-neon-magenta/30 scale-95'
                : card.isFlipped
                  ? 'bg-white/10 border border-white/20 scale-105'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 cursor-pointer'
              }
            `}
          >
            {card.isFlipped || card.isMatched ? (
              <span>{card.emoji}</span>
            ) : (
              <span className="text-white/20 text-2xl">?</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10
          text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        <span>重新开始</span>
      </button>
    </div>
  )
}

/**
 * 认知记忆训练页
 * 包含数字排序和记忆翻牌两种互动小游戏
 */
export default function CognitiveTraining() {
  const navigate = useNavigate()
  const [gameMode, setGameMode] = useState<GameMode>('sort')

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

        <h1 className="text-white/80 text-lg font-semibold">认知记忆训练</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setGameMode('sort')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${gameMode === 'sort'
                ? 'text-neon-cyan bg-white/10 border border-white/20'
                : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
          >
            数字排序
          </button>
          <button
            onClick={() => setGameMode('memory')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${gameMode === 'memory'
                ? 'text-neon-magenta bg-white/10 border border-white/20'
                : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
          >
            记忆翻牌
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {gameMode === 'sort' ? <SortGame /> : <MemoryGame />}
      </div>
    </div>
  )
}
