import { useState } from 'react'
import { Hand, X } from 'lucide-react'

interface GestureGuideProps {
  onClose?: () => void
}

export function GestureGuide({ onClose }: GestureGuideProps) {
  const [visible, setVisible] = useState(true)

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible) return null

  return (
    <div className="fixed top-20 right-4 z-50 bg-gray-900/95 border-2 border-white/10 rounded-2xl p-5 max-w-sm backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Hand className="w-6 h-6 text-neon-cyan" />
          <h4 className="text-white text-lg font-bold">手势操作</h4>
        </div>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3 text-base text-white/70">
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
          <span className="text-2xl">👆</span>
          <div>
            <div className="text-white font-medium text-lg">左右滑动</div>
            <div className="text-white/50 text-base">切换训练模式</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
          <span className="text-2xl">👆👆</span>
          <div>
            <div className="text-white font-medium text-lg">双击</div>
            <div className="text-white/50 text-base">全屏/退出全屏</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
          <span className="text-2xl">⌨️</span>
          <div>
            <div className="text-white font-medium text-lg">空格键</div>
            <div className="text-white/50 text-base">暂停/继续</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
          <span className="text-2xl">⬅️➡️</span>
          <div>
            <div className="text-white font-medium text-lg">方向键</div>
            <div className="text-white/50 text-base">切换模式</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KeyboardShortcuts() {
  return (
    <div className="fixed bottom-24 left-4 z-40 bg-gray-900/80 border-2 border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
        <div className="flex items-center gap-2">
          <kbd className="px-2.5 py-1 bg-white/10 rounded-lg text-white/80 text-base font-mono">空格</kbd>
          <span>暂停</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2.5 py-1 bg-white/10 rounded-lg text-white/80 text-base font-mono">←→</kbd>
          <span>切换</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2.5 py-1 bg-white/10 rounded-lg text-white/80 text-base font-mono">F</kbd>
          <span>全屏</span>
        </div>
      </div>
    </div>
  )
}
