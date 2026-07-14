import { useEffect, useCallback } from 'react'

/**
 * 全局键盘/遥控器导航 hook
 * 支持方向键在可聚焦元素间导航，回车激活
 * 适配大屏电视遥控器操作场景
 *
 * 方向键：在当前页面的可聚焦按钮间导航
 * 回车/空格：激活当前聚焦元素
 * Escape：返回上一页或关闭弹出菜单
 */
export function useKeyboardNav(onEscape?: () => void) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const focusableSelector = 'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => {
      const rect = el.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })

    if (focusableElements.length === 0) return

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        {
          const nextIndex = currentIndex === -1
            ? 0
            : (currentIndex + 1) % focusableElements.length
          focusableElements[nextIndex]?.focus()
        }
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        {
          const prevIndex = currentIndex === -1
            ? 0
            : (currentIndex - 1 + focusableElements.length) % focusableElements.length
          focusableElements[prevIndex]?.focus()
        }
        break
      case 'Escape':
        if (onEscape) {
          e.preventDefault()
          onEscape()
        }
        break
    }
  }, [onEscape])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
