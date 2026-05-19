import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Monitor, MonitorOff, Search, Wifi, Radio, Tv2, Smartphone } from 'lucide-react'
import { useCast } from '@/hooks/useCast'

/**
 * 投屏按钮组件（DLNA + 系统投屏面板）
 *
 * 工作方式：
 * 1. DLNA方式（优先，类似爱奇艺）：自动发现局域网内DLNA设备，推送页面URL
 * 2. 系统投屏面板（备选）：Android 11+打开系统输出切换面板（设备选择对话框），
 *    用户选择电视后系统自动建立Miracast连接，连接成功后应用检测到并启动Presentation
 *
 * 说明：Android不提供第三方App直接扫描/连接Miracast的公开API，
 * OUTPUT_SWITCHER是系统级面板，和从Quick Settings点投屏弹出的面板是同一个。
 * 仅在原生Android环境下显示
 */
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
  const [showDialog, setShowDialog] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isAvailable) return null

  const handleOpen = async () => {
    if (isConnected) {
      await disconnect()
      return
    }
    setErrorMsg('')
    setShowDialog(true)
    await startScan()
  }

  const handleClose = async () => {
    setShowDialog(false)
    setErrorMsg('')
    await stopScan()
  }

  const handleConnect = async (deviceId: string) => {
    setErrorMsg('')
    try {
      await connect(deviceId)
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
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-80 max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">投屏到电视</h3>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <Wifi className="w-3 h-3" />
          <span>手机和电视连接同一WiFi</span>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {/* 已连接的Miracast设备 */}
          {connectedDevices.length > 0 && (
            <div>
              <div className="text-green-400/70 text-xs font-medium mb-2 flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                <span>已连接 - 点击开始投屏</span>
              </div>
              <div className="space-y-2">
                {connectedDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-white transition-all border border-green-500/30"
                  >
                    <Monitor className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-green-300">{device.name}</div>
                      <div className="text-xs text-white/50">{device.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DLNA设备 */}
          {dlnaDevices.length > 0 && (
            <div>
              <div className="text-cyan-400/70 text-xs font-medium mb-2 flex items-center gap-1">
                <Radio className="w-3 h-3" />
                <span>DLNA设备（推荐）</span>
              </div>
              <div className="space-y-2">
                {dlnaDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleConnect(device.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-white transition-all border border-cyan-500/30"
                  >
                    <Tv2 className="w-5 h-5 text-cyan-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-cyan-300">{device.name}</div>
                      <div className="text-xs text-white/50">{device.description || '点击投屏'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 搜索中 */}
          {isScanning && devices.length === 0 && (
            <div className="flex items-center gap-2 text-white/40 py-4 justify-center">
              <Search className="w-4 h-4 animate-spin" />
              <span className="text-sm">正在搜索DLNA设备...</span>
            </div>
          )}

          {/* 无设备 */}
          {!isScanning && devices.length === 0 && (
            <div className="text-white/40 text-sm text-center py-4">
              未发现DLNA设备
              <br />
              <span className="text-xs">
                请确保手机和电视连接同一WiFi
              </span>
            </div>
          )}
        </div>

        {/* 系统投屏面板按钮 */}
        <button
          onClick={handleOpenSystemCast}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all mt-3"
        >
          <Smartphone className="w-5 h-5 text-white/60" />
          <div className="text-left">
            <div className="text-sm font-medium text-white/80">
              打开系统投屏面板
            </div>
            <div className="text-xs text-white/40">
              Android 11+：弹出设备选择框；旧版本：打开设置
            </div>
          </div>
        </button>

        <button
          onClick={startScan}
          className="w-full mt-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"
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
        className={`flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg transition-all ${
          isConnected
            ? 'text-green-400 bg-green-400/10 border border-green-400/30'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        {isConnected ? (
          <MonitorOff className="w-4 h-4" />
        ) : (
          <Monitor className="w-4 h-4" />
        )}
        <span className="text-[10px] sm:text-sm hidden sm:inline">
          {isConnected ? `投屏中: ${deviceName}` : '投屏'}
        </span>
      </button>

      {createPortal(dialog, document.body)}
    </>
  )
}