import { useState } from 'react'
import { Camera, Download, Share2, X, Check } from 'lucide-react'

interface CapturedImage {
  id: string
  timestamp: number
  dataUrl: string
  mode: string
}

const STORAGE_KEY = 'hyms_captures'

function loadCaptures(): CapturedImage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load captures:', e)
  }
  return []
}

function saveCaptures(captures: CapturedImage[]) {
  try {
    const dataToSave = captures.slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (e) {
    console.warn('Failed to save captures:', e)
  }
}

export function useCapture() {
  const [captures, setCaptures] = useState<CapturedImage[]>(() => loadCaptures())
  const [showGallery, setShowGallery] = useState(false)
  const [previewImage, setPreviewImage] = useState<CapturedImage | null>(null)
  const [captureFlash, setCaptureFlash] = useState(false)

  const captureScreen = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const capture: CapturedImage = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        dataUrl,
        mode: document.title || '训练'
      }

      const newCaptures = [capture, ...captures].slice(0, 20)
      setCaptures(newCaptures)
      saveCaptures(newCaptures)

      setCaptureFlash(true)
      setTimeout(() => setCaptureFlash(false), 200)

      return capture
    } catch (e) {
      console.error('Capture failed:', e)
      return null
    }
  }

  const deleteCapture = (id: string) => {
    const newCaptures = captures.filter(c => c.id !== id)
    setCaptures(newCaptures)
    saveCaptures(newCaptures)
    if (previewImage?.id === id) {
      setPreviewImage(null)
    }
  }

  const downloadCapture = (capture: CapturedImage) => {
    const link = document.createElement('a')
    link.href = capture.dataUrl
    link.download = `hyms-${capture.mode}-${new Date(capture.timestamp).toLocaleDateString('zh-CN').replace(/\//g, '-')}.png`
    link.click()
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    captures,
    showGallery,
    setShowGallery,
    previewImage,
    setPreviewImage,
    captureFlash,
    captureScreen,
    deleteCapture,
    downloadCapture,
    formatTime
  }
}

interface CaptureButtonProps {
  onCapture: () => void
  onShowGallery: () => void
  flash: boolean
}

export function CaptureButton({ onCapture, onShowGallery, flash }: CaptureButtonProps) {
  return (
    <>
      {flash && (
        <div className="fixed inset-0 bg-white z-[9998] pointer-events-none animate-pulse" />
      )}
      
      <button
        onClick={onCapture}
        className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
        title="截图保存"
      >
        <Camera className="w-4 h-4" />
      </button>
      
      <button
        onClick={onShowGallery}
        className="text-white/60 hover:text-white transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/10"
        title="查看截图"
      >
        <Download className="w-4 h-4" />
      </button>
    </>
  )
}

interface GalleryModalProps {
  captures: CapturedImage[]
  previewImage: CapturedImage | null
  onClose: () => void
  onSelect: (capture: CapturedImage) => void
  onDelete: (id: string) => void
  onDownload: (capture: CapturedImage) => void
  formatTime: (timestamp: number) => string
}

export function GalleryModal({
  captures,
  previewImage,
  onClose,
  onSelect,
  onDelete,
  onDownload,
  formatTime
}: GalleryModalProps) {
  if (!captures.length) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-96 max-w-[90vw]">
          <div className="text-center text-white/60 mb-4">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无截图</p>
            <p className="text-xs mt-2">点击训练页面的截图按钮保存画面</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex bg-black/80">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-medium">训练截图 ({captures.length})</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="relative group bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => onSelect(capture)}
              >
                <img
                  src={capture.dataUrl}
                  alt={capture.mode}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(capture)
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(capture.id)
                    }}
                    className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-full transition-colors"
                    title="删除"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-white/80 text-xs truncate">{capture.mode}</div>
                  <div className="text-white/50 text-xs">{formatTime(capture.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="w-96 bg-gray-900 border-l border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">预览</h4>
            <button
              onClick={() => onSelect(previewImage)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={previewImage.dataUrl}
            alt={previewImage.mode}
            className="w-full rounded-lg mb-4"
          />
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">模式</span>
              <span className="text-white">{previewImage.mode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">时间</span>
              <span className="text-white">{formatTime(previewImage.timestamp)}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onDownload(previewImage)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>下载</span>
            </button>
            <button
              onClick={() => onDelete(previewImage.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
