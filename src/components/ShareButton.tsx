import { useState } from 'react'
import { Share2, Image, FileText, Copy, Check, X, Download } from 'lucide-react'
import { useShare } from '@/hooks/useShare'
import { useTrainingStore } from '@/store/trainingStore'

export function ShareButton() {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const { shareText, shareImage, copyToClipboard } = useShare()
  const { speak } = useTrainingStore()

  const handleShareText = async () => {
    speak('分享文本报告')
    const success = await shareText()
    if (success) {
      setShowMenu(false)
    }
  }

  const handleShareImage = async () => {
    speak('分享图片报告')
    const success = await shareImage()
    if (success) {
      setShowMenu(false)
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      speak('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
      setShowMenu(false)
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setShowMenu(!showMenu)
          speak('分享')
        }}
        className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="分享训练报告"
      >
        <Share2 className="w-6 h-6" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-gray-900 border-2 border-white/10 rounded-2xl p-3 shadow-xl min-w-[240px]">
            <button
              onClick={handleShareText}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/10 text-white transition-colors text-base"
            >
              <FileText className="w-6 h-6 text-neon-cyan flex-shrink-0" />
              <span>分享文本报告</span>
            </button>
            <button
              onClick={handleShareImage}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/10 text-white transition-colors text-base"
            >
              <Image className="w-6 h-6 text-neon-magenta flex-shrink-0" />
              <span>分享图片报告</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6 text-neon-gold flex-shrink-0" />
                  <span className="text-white">复制文本</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </>
  )
}

interface ShareModalProps {
  onClose: () => void
}

export function ShareModal({ onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { generateTextReport, generateImageReport, shareText, shareImage, copyToClipboard } = useShare()
  const { speak } = useTrainingStore()

  const textReport = generateTextReport()

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      speak('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadImage = async () => {
    setDownloading(true)
    speak('正在生成图片')
    const dataUrl = await generateImageReport()
    if (dataUrl) {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `hyms-training-report-${Date.now()}.png`
      link.click()
    }
    setDownloading(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border-2 border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">分享训练报告</h2>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white/70 text-base font-medium mb-3">文本报告预览</h3>
            <div className="bg-black/40 rounded-2xl p-5 border-2 border-white/10">
              <pre className="text-white/70 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {textReport}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={shareText}
              className="flex items-center justify-center gap-3 py-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-2xl transition-colors font-medium text-lg"
            >
              <Share2 className="w-6 h-6" />
              <span>分享文本</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors font-medium text-lg"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 text-green-400" />
                  <span className="text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6" />
                  <span>复制文本</span>
                </>
              )}
            </button>
            <button
              onClick={shareImage}
              className="flex items-center justify-center gap-3 py-4 bg-neon-magenta/20 hover:bg-neon-magenta/30 text-neon-magenta rounded-2xl transition-colors font-medium text-lg"
            >
              <Image className="w-6 h-6" />
              <span>分享图片</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-3 py-4 bg-neon-gold/20 hover:bg-neon-gold/30 text-neon-gold rounded-2xl transition-colors font-medium text-lg disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-6 h-6 border-2 border-neon-gold/30 border-t-neon-gold rounded-full animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>下载图片</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
