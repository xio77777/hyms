import { useState, useEffect, useCallback } from 'react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'beginner' | 'streak' | 'duration' | 'mode' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: number
  progress: number
  target: number
  reward: number
}

const STORAGE_KEY = 'hyms_achievements'
const UNLOCKED_KEY = 'hyms_unlocked_achievements'

const ACHIEVEMENTS_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  { id: 'first_training', title: '初次体验', description: '完成第一次训练', icon: '🌱', category: 'beginner', rarity: 'common', target: 1, reward: 10 },
  { id: 'train_5', title: '小有成就', description: '累计完成5次训练', icon: '⭐', category: 'beginner', rarity: 'common', target: 5, reward: 20 },
  { id: 'train_20', title: '训练达人', description: '累计完成20次训练', icon: '🏆', category: 'beginner', rarity: 'rare', target: 20, reward: 50 },
  { id: 'train_50', title: '训练大师', description: '累计完成50次训练', icon: '👑', category: 'beginner', rarity: 'epic', target: 50, reward: 100 },
  { id: 'train_100', title: '传奇训练家', description: '累计完成100次训练', icon: '💎', category: 'beginner', rarity: 'legendary', target: 100, reward: 200 },

  { id: 'streak_3', title: '三日连更', description: '连续训练3天', icon: '🔥', category: 'streak', rarity: 'common', target: 3, reward: 15 },
  { id: 'streak_7', title: '周周坚持', description: '连续训练7天', icon: '💪', category: 'streak', rarity: 'rare', target: 7, reward: 30 },
  { id: 'streak_30', title: '月度之星', description: '连续训练30天', icon: '🌟', category: 'streak', rarity: 'epic', target: 30, reward: 80 },
  { id: 'streak_100', title: '百日筑基', description: '连续训练100天', icon: '🎯', category: 'streak', rarity: 'legendary', target: 100, reward: 300 },

  { id: 'duration_30min', title: '半小时', description: '累计训练30分钟', icon: '⏱️', category: 'duration', rarity: 'common', target: 1800, reward: 15 },
  { id: 'duration_1hour', title: '一小时', description: '累计训练1小时', icon: '🕐', category: 'duration', rarity: 'common', target: 3600, reward: 25 },
  { id: 'duration_5hour', title: '五小时', description: '累计训练5小时', icon: '⏰', category: 'duration', rarity: 'rare', target: 18000, reward: 60 },
  { id: 'duration_10hour', title: '十小时', description: '累计训练10小时', icon: '⌛', category: 'duration', rarity: 'epic', target: 36000, reward: 120 },
  { id: 'duration_50hour', title: '五十小时', description: '累计训练50小时', icon: '📅', category: 'duration', rarity: 'legendary', target: 180000, reward: 500 },

  { id: 'mode_tracking', title: '追踪高手', description: '完成10次视觉追踪训练', icon: '👁️', category: 'mode', rarity: 'common', target: 10, reward: 15 },
  { id: 'mode_calm', title: '静心大师', description: '完成10次舒缓模式训练', icon: '🧘', category: 'mode', rarity: 'common', target: 10, reward: 15 },
  { id: 'mode_excite', title: '活力四射', description: '完成10次兴奋模式训练', icon: '⚡', category: 'mode', rarity: 'common', target: 10, reward: 15 },
  { id: 'mode_eye', title: '眼保健操', description: '完成10次眼球运动训练', icon: '🔵', category: 'mode', rarity: 'rare', target: 10, reward: 25 },
  { id: 'mode_focus', title: '专注如我', description: '完成10次视觉聚焦训练', icon: '🎯', category: 'mode', rarity: 'rare', target: 10, reward: 25 },
  { id: 'mode_redblue', title: '红蓝战士', description: '完成10次红蓝光刺激训练', icon: '🔴🔵', category: 'mode', rarity: 'rare', target: 10, reward: 25 },
  { id: 'mode_cognitive', title: '最强大脑', description: '完成10次认知记忆训练', icon: '🧠', category: 'mode', rarity: 'rare', target: 10, reward: 25 },
  { id: 'mode_all', title: '全能选手', description: '体验所有训练模式', icon: '🎨', category: 'mode', rarity: 'epic', target: 7, reward: 80 },

  { id: 'night_train', title: '夜猫子', description: '在22点后完成训练', icon: '🌙', category: 'special', rarity: 'rare', target: 1, reward: 20 },
  { id: 'morning_train', title: '早起的鸟儿', description: '在6-8点完成训练', icon: '🌅', category: 'special', rarity: 'rare', target: 1, reward: 20 },
  { id: 'weekend_warrior', title: '周末勇士', description: '周末完成训练', icon: '🎉', category: 'special', rarity: 'common', target: 1, reward: 10 },
  { id: 'perfect_week', title: '完美一周', description: '一周内每天都训练', icon: '📆', category: 'special', rarity: 'epic', target: 7, reward: 100 },
  { id: 'cast_first', title: '大屏体验', description: '首次使用投屏功能', icon: '📺', category: 'special', rarity: 'common', target: 1, reward: 15 },
  { id: 'share_first', title: '分享喜悦', description: '首次分享训练成果', icon: '📤', category: 'special', rarity: 'common', target: 1, reward: 10 },
]

interface UnlockedAchievement {
  id: string
  unlockedAt: number
}

interface ProgressData {
  totalSessions: number
  totalDuration: number
  currentStreak: number
  modeCounts: Record<string, number>
  nightTraining: number
  morningTraining: number
  weekendTraining: number
  perfectWeekDays: number
  usedCast: number
  sharedCount: number
  triedModes: string[]
}

function loadProgress(): ProgressData {
  try {
    const saved = localStorage.getItem('hyms_achievement_progress')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load achievement progress:', e)
  }
  return {
    totalSessions: 0,
    totalDuration: 0,
    currentStreak: 0,
    modeCounts: {},
    nightTraining: 0,
    morningTraining: 0,
    weekendTraining: 0,
    perfectWeekDays: 0,
    usedCast: 0,
    sharedCount: 0,
    triedModes: [],
  }
}

function saveProgress(progress: ProgressData) {
  try {
    localStorage.setItem('hyms_achievement_progress', JSON.stringify(progress))
  } catch (e) {
    console.warn('Failed to save achievement progress:', e)
  }
}

function loadUnlocked(): UnlockedAchievement[] {
  try {
    const saved = localStorage.getItem(UNLOCKED_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Failed to load unlocked achievements:', e)
  }
  return []
}

function saveUnlocked(unlocked: UnlockedAchievement[]) {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked))
  } catch (e) {
    console.warn('Failed to save unlocked achievements:', e)
  }
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])

  const initializeAchievements = useCallback(() => {
    const progress = loadProgress()
    const unlocked = loadUnlocked()
    const unlockedSet = new Set(unlocked.map(u => u.id))

    const computed: Achievement[] = ACHIEVEMENTS_DEFS.map(def => {
      const isUnlocked = unlockedSet.has(def.id)
      const unlockRecord = unlocked.find(u => u.id === def.id)
      
      let currentProgress = 0
      switch (def.id) {
        case 'first_training':
        case 'train_5':
        case 'train_20':
        case 'train_50':
        case 'train_100':
          currentProgress = progress.totalSessions
          break
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
        case 'streak_100':
          currentProgress = progress.currentStreak
          break
        case 'duration_30min':
        case 'duration_1hour':
        case 'duration_5hour':
        case 'duration_10hour':
        case 'duration_50hour':
          currentProgress = progress.totalDuration
          break
        case 'mode_tracking':
          currentProgress = progress.modeCounts['tracking'] || progress.modeCounts['sensory'] || 0
          break
        case 'mode_calm':
          currentProgress = progress.modeCounts['calm'] || 0
          break
        case 'mode_excite':
          currentProgress = progress.modeCounts['excite'] || 0
          break
        case 'mode_eye':
          currentProgress = progress.modeCounts['eye-movement'] || 0
          break
        case 'mode_focus':
          currentProgress = progress.modeCounts['focus'] || 0
          break
        case 'mode_redblue':
          currentProgress = progress.modeCounts['red-blue'] || 0
          break
        case 'mode_cognitive':
          currentProgress = progress.modeCounts['cognitive'] || 0
          break
        case 'mode_all':
          currentProgress = progress.triedModes.length
          break
        case 'night_train':
          currentProgress = progress.nightTraining
          break
        case 'morning_train':
          currentProgress = progress.morningTraining
          break
        case 'weekend_warrior':
          currentProgress = progress.weekendTraining
          break
        case 'perfect_week':
          currentProgress = progress.perfectWeekDays
          break
        case 'cast_first':
          currentProgress = progress.usedCast
          break
        case 'share_first':
          currentProgress = progress.sharedCount
          break
      }

      return {
        ...def,
        unlocked: isUnlocked,
        unlockedAt: unlockRecord?.unlockedAt,
        progress: Math.min(currentProgress, def.target),
      }
    })

    setAchievements(computed)
    setUnlockedIds(unlockedSet)
  }, [])

  useEffect(() => {
    initializeAchievements()
  }, [initializeAchievements])

  const checkAndUnlock = useCallback((progress: ProgressData) => {
    const unlocked = loadUnlocked()
    const unlockedSet = new Set(unlocked.map(u => u.id))
    const newUnlocks: Achievement[] = []

    ACHIEVEMENTS_DEFS.forEach(def => {
      if (unlockedSet.has(def.id)) return

      let currentProgress = 0
      switch (def.id) {
        case 'first_training':
        case 'train_5':
        case 'train_20':
        case 'train_50':
        case 'train_100':
          currentProgress = progress.totalSessions
          break
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
        case 'streak_100':
          currentProgress = progress.currentStreak
          break
        case 'duration_30min':
        case 'duration_1hour':
        case 'duration_5hour':
        case 'duration_10hour':
        case 'duration_50hour':
          currentProgress = progress.totalDuration
          break
        case 'mode_tracking':
          currentProgress = progress.modeCounts['tracking'] || progress.modeCounts['sensory'] || 0
          break
        case 'mode_calm':
          currentProgress = progress.modeCounts['calm'] || 0
          break
        case 'mode_excite':
          currentProgress = progress.modeCounts['excite'] || 0
          break
        case 'mode_eye':
          currentProgress = progress.modeCounts['eye-movement'] || 0
          break
        case 'mode_focus':
          currentProgress = progress.modeCounts['focus'] || 0
          break
        case 'mode_redblue':
          currentProgress = progress.modeCounts['red-blue'] || 0
          break
        case 'mode_cognitive':
          currentProgress = progress.modeCounts['cognitive'] || 0
          break
        case 'mode_all':
          currentProgress = progress.triedModes.length
          break
        case 'night_train':
          currentProgress = progress.nightTraining
          break
        case 'morning_train':
          currentProgress = progress.morningTraining
          break
        case 'weekend_warrior':
          currentProgress = progress.weekendTraining
          break
        case 'perfect_week':
          currentProgress = progress.perfectWeekDays
          break
        case 'cast_first':
          currentProgress = progress.usedCast
          break
        case 'share_first':
          currentProgress = progress.sharedCount
          break
      }

      if (currentProgress >= def.target) {
        const now = Date.now()
        unlocked.push({ id: def.id, unlockedAt: now })
        unlockedSet.add(def.id)
        newUnlocks.push({
          ...def,
          unlocked: true,
          unlockedAt: now,
          progress: def.target,
        })
      }
    })

    if (newUnlocks.length > 0) {
      saveUnlocked(unlocked)
      setNewlyUnlocked(newUnlocks)
      initializeAchievements()
    }

    return newUnlocks
  }, [initializeAchievements])

  const recordTraining = useCallback((mode: string, duration: number, streak: number) => {
    const progress = loadProgress()
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()

    progress.totalSessions += 1
    progress.totalDuration += duration
    progress.currentStreak = streak

    if (!progress.modeCounts[mode]) {
      progress.modeCounts[mode] = 0
    }
    progress.modeCounts[mode] += 1

    if (!progress.triedModes.includes(mode)) {
      progress.triedModes.push(mode)
    }

    if (hour >= 22 || hour < 5) {
      progress.nightTraining += 1
    }

    if (hour >= 6 && hour < 8) {
      progress.morningTraining += 1
    }

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      progress.weekendTraining += 1
    }

    saveProgress(progress)
    return checkAndUnlock(progress)
  }, [checkAndUnlock])

  const recordCastUse = useCallback(() => {
    const progress = loadProgress()
    progress.usedCast += 1
    saveProgress(progress)
    return checkAndUnlock(progress)
  }, [checkAndUnlock])

  const recordShare = useCallback(() => {
    const progress = loadProgress()
    progress.sharedCount += 1
    saveProgress(progress)
    return checkAndUnlock(progress)
  }, [checkAndUnlock])

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([])
  }, [])

  const getStats = useCallback(() => {
    const unlockedCount = achievements.filter(a => a.unlocked).length
    const totalCount = achievements.length
    const totalReward = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0)
    
    return {
      unlockedCount,
      totalCount,
      totalReward,
      percentage: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
    }
  }, [achievements])

  const getByCategory = useCallback((category: Achievement['category']) => {
    return achievements.filter(a => a.category === category)
  }, [achievements])

  return {
    achievements,
    newlyUnlocked,
    recordTraining,
    recordCastUse,
    recordShare,
    clearNewlyUnlocked,
    getStats,
    getByCategory,
  }
}

export const RARITY_COLORS = {
  common: { bg: 'bg-gray-500/20', border: 'border-gray-400/30', text: 'text-gray-300', glow: '' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-400/30', text: 'text-amber-300', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]' },
}

export const RARITY_LABELS = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

export const CATEGORY_LABELS = {
  beginner: '新手成长',
  streak: '连续打卡',
  duration: '时长累计',
  mode: '模式探索',
  special: '特殊成就',
}
