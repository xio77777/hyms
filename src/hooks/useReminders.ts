import { useState, useEffect, useCallback } from 'react'

export interface Reminder {
  id: string
  time: string
  label: string
  enabled: boolean
  days: number[]
}

const STORAGE_KEY = 'hyms_reminders'

function loadReminders(): Reminder[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load reminders:', e)
  }
  return []
}

function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  } catch (e) {
    console.warn('Failed to save reminders:', e)
  }
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders())
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    saveReminders(reminders)
  }, [reminders])

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission === 'granted'
    }
    return false
  }

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString()
    }
    setReminders(prev => [...prev, newReminder])
    return newReminder
  }

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    )
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    )
  }

  const showNotification = useCallback((title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hyms-reminder'
      })
    }
  }, [notificationPermission])

  return {
    reminders,
    notificationPermission,
    requestPermission,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    showNotification
  }
}

export const PRESET_REMINDERS = [
  { time: '08:00', label: '晨间训练', days: [1, 2, 3, 4, 5] },
  { time: '14:00', label: '午后练习', days: [1, 2, 3, 4, 5] },
  { time: '20:00', label: '晚间训练', days: [0, 1, 2, 3, 4, 5, 6] }
]

export const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? '下午' : '上午'
  const hour12 = hour % 12 || 12
  return `${ampm} ${hour12}:${minutes}`
}
