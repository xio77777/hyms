import { useState } from 'react'
import { Sun, Moon, Star, X, Check } from 'lucide-react'
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
        className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
        title="切换主题"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-gray-900 border border-white/10 rounded-xl p-2 shadow-xl min-w-[240px]">
            <div className="text-white/50 text-xs px-3 py-2 mb-1">
              选择主题
            </div>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs opacity-60">{t.description}</div>
                  </div>
                  {isActive && <Check className="w-4 h-4" />}
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
        className="text-amber-400/60 hover:text-amber-400 transition-colors p-1 sm:p-2 rounded-lg hover:bg-amber-400/10"
        title="切换到深色模式"
      >
        <Star className="w-4 h-4" />
      </button>
    )
  }

  if (isDark) {
    return (
      <button
        onClick={toggleTheme}
        className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
        title="切换到浅色模式"
      >
        <Sun className="w-4 h-4" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="text-gray-600 hover:text-gray-900 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-200"
      title="切换到深色模式"
    >
      <Moon className="w-4 h-4" />
    </button>
  )
}
