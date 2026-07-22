import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Monitor, MonitorOff, Search, Wifi, Radio, Tv2, Smartphone, X } from 'lucide-react'
import { useCast } from '@/hooks/useCast'
import { useTrainingStore } from '@/store/trainingStore'

export default function CastButton() {
  const {
    devices,
    isConnected,
    deviceName,
    isScanning,
    isAvailable,
    startScan,
    stopScan,
    connect,
    disconnect,
    openSystemCastSettings,
  } = useCast()
  const { speak } = useTrainingStore()
  const [showDialog, setShowDialog] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isAvailable) return null

  const handleOpen = async () => {
    if (isConnected) {
      await disconnect()
      speak('已断开投屏')
      return
    }
    setErrorMsg('')
    setShowDialog(true)
    speak('搜索投屏设备')
    await startScan()
  }

  const handleClose = async () => {
    setShowDialog(false)
    setErrorMsg('')
    await stopScan()
  }

  const handleConnect = async (deviceId: string, name: string) => {
    setErrorMsg('')
    try {
      await connect(deviceId)
      speak(`已连接到${name}`)
      setShowDialog(false)
    } catch (e: any) {
      setErrorMsg(e?.message || '投屏失败')
    }
  }

  const handleOpenSystemCast = async () => {
    setErrorMsg('')
    try {
      await openSystemCastSettings()
    } catch (e: any) {
      setErrorMsg(e?.message || '打开失败')
    }
  }

  const dlnaDevices = devices.filter(d => d.type === 'dlna')
  const connectedDevices = devices.filter(d => d.type === 'miracast_connected')

  const dialog = showDialog ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border-2 border-white/10 rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white text-xl font-bold">投屏到电视</h3>
          <button
            onClick={handleClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-white/50 text-base mb-4">
          <Wifi className="w-5 h-5" />
          <span>手机和电视连接同一WiFi</span>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-base">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {connectedDevices.length > 0 && (
            <div>
              <div className="text-green-400/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>已连接 - 点击开始投屏</span>
              </div>
              <div className="space-y-2">
                {connectedDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device.id, device.name)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-white transition-all border-2 border-green-500/30 text-base"
                  >
                    <Monitor className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-base font-medium text-green-300">{device.name}</div>
                      <div className="text-sm text-white/50">{device.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {dlnaDevices.length > 0 && (
            <div>
              <div className="text-cyan-400/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>DLNA设备（推荐）</span>
              </div>
              <div className="space-y-2">
                {dlnaDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device.id, device.name)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-white transition-all border-2 border-cyan-500/30 text-base"
                  >
                    <Tv2 className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-base font-medium text-cyan-300">{device.name}</div>
                      <div className="text-sm text-white/50">{device.description || '点击投屏'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isScanning && devices.length === 0 && (
            <div className="flex items-center gap-3 text-white/50 py-6 justify-center">
              <Search className="w-5 h-5 animate-spin" />
              <span className="text-base">正在搜索DLNA设备...</span>
            </div>
          )}

          {!isScanning && devices.length === 0 && (
            <div className="text-white/50 text-base text-center py-6">
              未发现DLNA设备
              <br />
              <span className="text-sm mt-2 block">
                请确保手机和电视连接同一WiFi
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleOpenSystemCast}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 border-2 border-white/10 text-white transition-all mt-4 text-base"
        >
          <Smartphone className="w-6 h-6 text-white/60 flex-shrink-0" />
          <div className="text-left">
            <div className="text-base font-medium text-white/80">
              打开系统投屏面板
            </div>
            <div className="text-sm text-white/40">
              Android 11+：弹出设备选择框
            </div>
          </div>
        </button>

        <button
          onClick={() => { startScan(); speak('重新搜索设备') }}
          className="w-full mt-3 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-base transition-all"
        >
          重新搜索
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all text-base ${
          isConnected
            ? 'text-green-400 bg-green-400/10 border-2 border-green-400/30'
            : 'text-white/70 hover:text-white hover:bg-white/10 border-2 border-transparent'
        }`}
      >
        {isConnected ? (
          <MonitorOff className="w-6 h-6" />
        ) : (
          <Monitor className="w-6 h-6" />
        )}
        <span className="hidden sm:inline">
          {isConnected ? `投屏中` : '投屏'}
        </span>
      </button>

      {createPortal(dialog, document.body)}
    </>
  )
}
