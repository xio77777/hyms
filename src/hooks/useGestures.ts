import { useEffect, useRef, useCallback } from 'react'
import { useTrainingStore } from '@/store/trainingStore'
import { AudioContext } from './useAudio'

interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  enabled?: boolean
}

export function useGestures(options: GestureOptions = {}) {
  const { onSwipeLeft, onSwipeRight, onDoubleTap, onLongPress, enabled = true } = options
  
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const lastTapTime = useRef(0)
  const touchCount = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
        touchStartTime.current = Date.now()
        touchCount.current = 1
      } else {
        touchCount.current = e.touches.length
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const endTime = Date.now()
        
        const deltaX = endX - touchStartX.current
        const deltaY = endY - touchStartY.current
        const deltaTime = endTime - touchStartTime.current
        
        const minSwipeDistance = 50
        const maxVerticalMovement = 100
        
        if (
          Math.abs(deltaX) > minSwipeDistance &&
          Math.abs(deltaY) < maxVerticalMovement &&
          deltaTime < 300
        ) {
          if (deltaX > 0 && onSwipeRight) {
            AudioContext.playClick()
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            AudioContext.playClick()
            onSwipeLeft()
          }
        }
        
        const tapThreshold = 200
        const doubleTapThreshold = 300
        if (
          Math.abs(deltaX) < 10 &&
          Math.abs(deltaY) < 10 &&
          deltaTime < tapThreshold
        ) {
          if (endTime - lastTapTime.current < doubleTapThreshold && onDoubleTap) {
            AudioContext.playClick()
            onDoubleTap()
          }
          lastTapTime.current = endTime
        }
        
        if (deltaTime > 500 && deltaTime < 1000 && onLongPress) {
          const moved = Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10
          if (!moved) {
            onLongPress()
          }
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, onSwipeLeft, onSwipeRight, onDoubleTap, onLongPress])
}

export function useKeyboardShortcuts(options: {
  onSpace?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onKeyF?: () => void
  onEscape?: () => void
  onKeyM?: () => void
  onKeyV?: () => void
  onDigit?: (digit: number) => void
  enabled?: boolean
} = {}) {
  const { onSpace, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onKeyF, onEscape, onKeyM, onKeyV, onDigit, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (onSpace) {
            AudioContext.playClick()
            onSpace()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (onArrowLeft) {
            AudioContext.playClick()
            onArrowLeft()
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (onArrowRight) {
            AudioContext.playClick()
            onArrowRight()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (onArrowUp) {
            AudioContext.playClick()
            onArrowUp()
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (onArrowDown) {
            AudioContext.playClick()
            onArrowDown()
          }
          break
        case 'KeyF':
          e.preventDefault()
          if (onKeyF) {
            AudioContext.playClick()
            onKeyF()
          }
          break
        case 'KeyM':
          e.preventDefault()
          if (onKeyM) {
            AudioContext.playClick()
            onKeyM()
          }
          break
        case 'KeyV':
          e.preventDefault()
          if (onKeyV) {
            AudioContext.playClick()
            onKeyV()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (onEscape) {
            onEscape()
          }
          break
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
        case 'Digit0':
          e.preventDefault()
          if (onDigit) {
            const digit = parseInt(e.code.replace('Digit', ''))
            AudioContext.playClick()
            onDigit(digit)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, onSpace, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onKeyF, onEscape, onKeyM, onKeyV, onDigit])
}

export function useSwipeToChangeMode() {
  const { mode, setMode } = useTrainingStore()
  const modes = ['carousel', 'tracking', 'calm', 'excite'] as const
  const currentIndex = modes.indexOf(mode)

  const goToNextMode = useCallback(() => {
    const nextIndex = (currentIndex + 1) % modes.length
    setMode(modes[nextIndex])
  }, [currentIndex, setMode])

  const goToPrevMode = useCallback(() => {
    const prevIndex = (currentIndex - 1 + modes.length) % modes.length
    setMode(modes[prevIndex])
  }, [currentIndex, setMode])

  const goToMode = useCallback((targetMode: typeof mode) => {
    setMode(targetMode)
  }, [setMode])

  return {
    currentMode: mode,
    modes,
    currentIndex,
    goToNextMode,
    goToPrevMode,
    goToMode
  }
}
