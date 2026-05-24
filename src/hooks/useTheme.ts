import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'night'

const STORAGE_KEY = 'hyms_theme'

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'night') {
      return saved
    }
  } catch (e) {
    console.warn('Failed to load theme:', e)
  }
  return 'dark'
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (e) {
    console.warn('Failed to save theme:', e)
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme())

  useEffect(() => {
    saveTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'light'
      if (prev === 'light') return 'dark'
      return 'dark'
    })
  }

  const setNightMode = () => {
    setTheme('night')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    setNightMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isNight: theme === 'night'
  }
}

export const themeStyles = {
  dark: {
    bg: 'bg-dark',
    text: 'text-white',
    border: 'border-white/10',
    accent: 'text-neon-cyan',
    gradient: 'from-neon-cyan/10 to-neon-magenta/10'
  },
  light: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    border: 'border-gray-200',
    accent: 'text-blue-600',
    gradient: 'from-blue-500/10 to-purple-500/10'
  },
  night: {
    bg: 'bg-gray-950',
    text: 'text-gray-100',
    border: 'border-gray-800',
    accent: 'text-amber-400',
    gradient: 'from-amber-500/10 to-red-500/10'
  }
}
