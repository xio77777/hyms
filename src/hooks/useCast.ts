import { useState, useEffect, useCallback, useRef } from 'react'
import { registerPlugin, PluginListenerHandle } from '@capacitor/core'

interface CastDevice {
  id: string
  name: string
  description: string
  type: 'dlna' | 'miracast' | 'miracast_connected'
}

interface CastPlugin {
  startScan(): Promise<void>
  stopScan(): Promise<void>
  getDevices(): Promise<{ devices: CastDevice[] }>
  connect(options: { deviceId: string }): Promise<{ connected: boolean }>
  disconnect(): Promise<void>
  isCasting(): Promise<{ isCasting: boolean }>
  sendUpdate(options: {
    mode: string
    speed: number
    brightness: number
    isPaused: boolean
  }): Promise<void>
  openSystemCastSettings(): Promise<void>
  addListener(
    eventName: 'onDevicesChanged',
    listenerFunc: (data: { devices: CastDevice[] }) => void
  ): Promise<PluginListenerHandle>
  addListener(
    eventName: 'onCastStatusChanged',
    listenerFunc: (data: { connected: boolean; deviceName: string }) => void
  ): Promise<PluginListenerHandle>
}

let CastInstance: CastPlugin | null = null

function getCastPlugin(): CastPlugin | null {
  if (CastInstance) return CastInstance
  try {
    const isNative =
      typeof window !== 'undefined' &&
      (window as any).Capacitor?.isNativePlatform?.()
    if (!isNative) return null
    CastInstance = registerPlugin<CastPlugin>('Cast')
    return CastInstance
  } catch {
    return null
  }
}

/**
 * 投屏Hook（DLNA + Presentation 混合方案）
 * 封装Capacitor Cast插件的调用，提供设备发现、连接/断开、状态同步等功能
 * DLNA方式优先（类似爱奇艺），Miracast/Presentation作为备选
 * 在非原生环境（浏览器）下自动降级，不显示投屏按钮
 */
export function useCast() {
  const [devices, setDevices] = useState<CastDevice[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const listenersRef = useRef<PluginListenerHandle[]>([])

  useEffect(() => {
    const plugin = getCastPlugin()
    if (!plugin) return

    const setup = async () => {
      try {
        const l1 = await plugin.addListener('onDevicesChanged', (data) => {
          setDevices(data.devices)
        })
        const l2 = await plugin.addListener('onCastStatusChanged', (data) => {
          setIsConnected(data.connected)
          setDeviceName(data.deviceName)
        })
        listenersRef.current = [l1, l2]
      } catch (e) {
        console.warn('Cast listeners setup failed:', e)
      }
    }
    setup()

    return () => {
      listenersRef.current.forEach((l) => l.remove())
    }
  }, [])

  const startScan = useCallback(async () => {
    const plugin = getCastPlugin()
    if (!plugin) return
    try {
      setIsScanning(true)
      await plugin.startScan()
      const result = await plugin.getDevices()
      setDevices(result.devices)
    } catch (e) {
      console.error('Cast scan failed:', e)
    } finally {
      setIsScanning(false)
    }
  }, [])

  const stopScan = useCallback(async () => {
    const plugin = getCastPlugin()
    if (!plugin) return
    try {
      await plugin.stopScan()
    } catch (e) {
      console.error('Cast stop scan failed:', e)
    }
  }, [])

  const connect = useCallback(async (deviceId: string) => {
    const plugin = getCastPlugin()
    if (!plugin) return
    try {
      await plugin.connect({ deviceId })
      setIsConnected(true)
    } catch (e) {
      console.error('Cast connect failed:', e)
      throw e
    }
  }, [])

  const disconnect = useCallback(async () => {
    const plugin = getCastPlugin()
    if (!plugin) return
    try {
      await plugin.disconnect()
      setIsConnected(false)
      setDeviceName('')
    } catch (e) {
      console.error('Cast disconnect failed:', e)
    }
  }, [])

  const sendUpdate = useCallback(
    async (options: {
      mode: string
      speed: number
      brightness: number
      isPaused: boolean
    }) => {
      const plugin = getCastPlugin()
      if (!plugin) return
      try {
        await plugin.sendUpdate(options)
      } catch (e) {
        console.error('Cast send update failed:', e)
      }
    },
    []
  )

  const openSystemCastSettings = useCallback(async () => {
    const plugin = getCastPlugin()
    if (!plugin) return
    try {
      await plugin.openSystemCastSettings()
    } catch (e) {
      console.error('Open system cast settings failed:', e)
      throw e
    }
  }, [])

  return {
    devices,
    isConnected,
    deviceName,
    isScanning,
    isAvailable: !!getCastPlugin(),
    startScan,
    stopScan,
    connect,
    disconnect,
    sendUpdate,
    openSystemCastSettings,
  }
}
