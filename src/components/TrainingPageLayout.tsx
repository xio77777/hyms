import { ArrowLeft, Pause, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/store/trainingStore'
import ControlBar from './ControlBar'

interface TrainingPageLayoutProps {
  title: string
  children: React.ReactNode
  showBackButton?: boolean
  showControlBar?: boolean
}

export default function TrainingPageLayout({
  title,
  children,
  showBackButton = true,
  showControlBar = true
}: TrainingPageLayoutProps) {
  const navigate = useNavigate()
  const { isPaused, togglePause } = useTrainingStore()

  return (
    <div className="h-full w-full bg-dark relative">
      <canvas
        className="absolute inset-0 w-full h-full"
      />

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          {showBackButton && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">返回</span>
            </button>
          )}

          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
            <span className="text-white/70 text-sm font-medium">
              {title}
            </span>
          </div>

          <button
            onClick={togglePause}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/50"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">继续</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">暂停</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1">
          {children}
        </div>

        {showControlBar && <ControlBar />}
      </div>
    </div>
  )
}
