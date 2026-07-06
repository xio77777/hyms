import { Eye, X, Check } from 'lucide-react'

interface EyeBreakReminderProps {
  countdown: number
  onDismiss: () => void
}

export default function EyeBreakReminder({ countdown, onDismiss }: EyeBreakReminderProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Eye className="w-12 h-12 text-neon-cyan" />
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">
          护眼休息时间
        </h2>
        
        <p className="text-white/60 text-base mb-6 leading-relaxed">
          您已连续训练一段时间了<br />
          请看向 <span className="text-neon-cyan font-medium">6米外</span> 的远处物体<br />
          让眼睛休息一下
        </p>

        <div className="text-6xl font-bold text-neon-cyan mb-2 font-mono">
          {countdown}
        </div>
        <div className="text-white/40 text-sm mb-8">秒后自动继续</div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onDismiss}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 font-medium transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            跳过休息
          </button>
          <button
            onClick={onDismiss}
            className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-xl text-white font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            我已休息好
          </button>
        </div>

        <div className="mt-8 text-white/30 text-xs">
          💡 遵循 20-20-20 护眼法则：每20分钟，看20英尺（约6米）外，持续20秒
        </div>
      </div>
    </div>
  )
}
