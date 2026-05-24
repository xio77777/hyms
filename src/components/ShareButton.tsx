import { useState } from 'react'
import { Share2, Image, FileText, Copy, Check, X, Download } from 'lucide-react'
import { useShare } from '@/hooks/useShare'

export function ShareButton() {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const { shareText, shareImage, copyToClipboard } = useShare()

  const handleShareText = async () => {
    const success = await shareText()
    if (success) {
      setShowMenu(false)
    }
  }

  const handleShareImage = async () => {
    const success = await shareImage()
    if (success) {
      setShowMenu(false)
    }
  }

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowMenu(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
        title="分享训练报告"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-gray-900 border border-white/10 rounded-xl p-2 shadow-xl min-w-[200px]">
            <button
              onClick={handleShareText}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm">分享文本报告</span>
            </button>
            <button
              onClick={handleShareImage}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <Image className="w-4 h-4 text-neon-magenta" />
              <span className="text-sm">分享图片报告</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">已复制到剪贴板</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neon-gold" />
                  <span className="text-sm">复制文本</span>
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

  const textReport = generateTextReport()

  const handleCopy = async () => {
    const success = await copyToClipboard()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadImage = async () => {
    setDownloading(true)
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
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">分享训练报告</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white/70 text-sm font-medium mb-3">文本报告预览</h3>
            <div className="bg-black/40 rounded-xl p-4 border border-white/10">
              <pre className="text-white/60 text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {textReport}
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={shareText}
              className="flex items-center justify-center gap-2 py-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-xl transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>分享文本</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制文本</span>
                </>
              )}
            </button>
            <button
              onClick={shareImage}
              className="flex items-center justify-center gap-2 py-3 bg-neon-magenta/20 hover:bg-neon-magenta/30 text-neon-magenta rounded-xl transition-colors font-medium"
            >
              <Image className="w-4 h-4" />
              <span>分享图片</span>
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 bg-neon-gold/20 hover:bg-neon-gold/30 text-neon-gold rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neon-gold/30 border-t-neon-gold rounded-full animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
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
