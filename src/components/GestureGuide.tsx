import { useState } from 'react'
import { Hand, X } from 'lucide-react'

interface GestureGuideProps {
  onClose?: () => void
}

export function GestureGuide({ onClose }: GestureGuideProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed top-20 right-4 z-50 bg-gray-900/95 border border-white/10 rounded-2xl p-4 max-w-xs backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hand className="w-4 h-4 text-neon-cyan" />
          <h4 className="text-white text-sm font-medium">手势操作</h4>
        </div>
        <button
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 text-xs text-white/70">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <span className="text-lg">👆</span>
          <div>
            <div className="text-white font-medium">左右滑动</div>
            <div className="text-white/50">切换训练模式</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <span className="text-lg">👆👆</span>
          <div>
            <div className="text-white font-medium">双击</div>
            <div className="text-white/50">全屏/退出全屏</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <span className="text-lg">⌨️</span>
          <div>
            <div className="text-white font-medium">空格键</div>
            <div className="text-white/50">暂停/继续</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <span className="text-lg">⬅️➡️</span>
          <div>
            <div className="text-white font-medium">方向键</div>
            <div className="text-white/50">切换模式</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KeyboardShortcuts() {
  return (
    <div className="fixed bottom-20 left-4 z-40 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-xs text-white/50">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">Space</kbd>
          <span>暂停</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">←→</kbd>
          <span>切换</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70">F</kbd>
          <span>全屏</span>
        </div>
      </div>
    </div>
  )
}
