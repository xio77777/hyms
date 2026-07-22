import { useState } from 'react'
import { Sun, Moon, Star, Check } from 'lucide-react'
import { useTheme, Theme } from '@/hooks/useTheme'

export function ThemeSwitcher() {
  const [showMenu, setShowMenu] = useState(false)
  const { theme, setTheme } = useTheme()

  const themes: { key: Theme; label: string; icon: any; description: string }[] = [
    {
      key: 'dark',
      label: '深色模式',
      icon: Moon,
      description: '保护眼睛，适合暗环境'
    },
    {
      key: 'light',
      label: '浅色模式',
      icon: Sun,
      description: '清晰明亮，适合白天'
    },
    {
      key: 'night',
      label: '夜间模式',
      icon: Star,
      description: '超低亮度，睡前使用'
    }
  ]

  const currentTheme = themes.find(t => t.key === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white/70 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10"
        title="切换主题"
      >
        <CurrentIcon className="w-6 h-6" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-gray-900 border-2 border-white/10 rounded-2xl p-3 shadow-xl min-w-[280px]">
            {themes.map(t => {
              const Icon = t.icon
              const isActive = t.key === theme
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTheme(t.key)
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-base font-medium">{t.label}</div>
                    <div className="text-sm opacity-60">{t.description}</div>
                  </div>
                  {isActive && <Check className="w-5 h-5 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

export function QuickThemeToggle() {
  const { toggleTheme, isDark, isNight } = useTheme()

  if (isNight) {
    return (
      <button
        onClick={toggleTheme}
        className="text-amber-400/70 hover:text-amber-400 transition-colors w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-amber-400/10"
        title="切换到深色模式"
      >
        <Star className="w-6 h-6" />
      </button>
    )
  }

  if (isDark) {
    return (
      <button
        onClick={toggleTheme}
        className="text-white/70 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10"
        title="切换到浅色模式"
      >
        <Sun className="w-6 h-6" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="text-gray-600 hover:text-gray-900 transition-colors w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-gray-200"
      title="切换到深色模式"
    >
      <Moon className="w-6 h-6" />
    </button>
  )
}
