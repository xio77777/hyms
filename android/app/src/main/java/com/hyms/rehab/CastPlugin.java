package com.hyms.rehab;

import android.content.Context;
import android.content.Intent;
import android.hardware.display.DisplayManager;
import android.media.MediaRouter;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.Display;
import android.webkit.WebView;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.hyms.rehab.dlna.DlnaController;
import com.hyms.rehab.dlna.DlnaDevice;
import com.hyms.rehab.dlna.SsdpDiscovery;
import com.hyms.rehab.server.LocalWebServer;
import com.hyms.rehab.server.SyncWebSocketServer;

import java.util.HashMap;
import java.util.Map;

/**
 * 投屏插件（DLNA + Miracast Presentation 混合方案）
 *
 * 投屏策略：
 * 1. DLNA方式（优先）：通过SSDP发现局域网内的DLNA设备，
 *    推送手机HTTP服务器上的页面URL到电视
 * 2. Miracast方式（备选）：打开系统输出切换面板让用户选择电视，
 *    连接后通过DisplayManager检测，启动Presentation
 *
 * 说明：Android不提供第三方App直接扫描/连接Miracast的公开API。
 * 爱奇艺等App投屏用的是DLNA协议。MediaRouter在国产手机上不可靠。
 * 我们使用系统OUTPUT_SWITCHER面板（Android 11+）让用户选择设备。
 */
@CapacitorPlugin(name = "Cast")
public class CastPlugin extends Plugin {
    private static final String TAG = "CastPlugin";

    private MediaRouter mediaRouter;
    private DisplayManager displayManager;
    private CastPresentation castPresentation;
    private Handler mainHandler;
    private DisplayManager.DisplayListener displayListener;

    private SsdpDiscovery ssdpDiscovery;
    private LocalWebServer webServer;
    private SyncWebSocketServer wsServer;

    private final Map<String, DlnaDevice> dlnaDevices = new HashMap<>();
    private boolean dlnaConnected = false;
    private String connectedDlnaDeviceName = "";

    @Override
    public void load() {
        super.load();
        mediaRouter = (MediaRouter) getContext().getSystemService(Context.MEDIA_ROUTER_SERVICE);
        displayManager = (DisplayManager) getContext().getSystemService(Context.DISPLAY_SERVICE);
        mainHandler = new Handler(Looper.getMainLooper());
        ssdpDiscovery = new SsdpDiscovery();

        displayListener = new DisplayManager.DisplayListener() {
            @Override
            public void onDisplayAdded(int displayId) {
                Log.i(TAG, "Display added: " + displayId);
                notifyDevicesChanged();
            }

            @Override
            public void onDisplayChanged(int displayId) {
            }

            @Override
            public void onDisplayRemoved(int displayId) {
                if (castPresentation != null && castPresentation.getDisplay() != null
                    && castPresentation.getDisplay().getDisplayId() == displayId) {
                    disconnectPresentation();
                    notifyCastStatus(false, "");
                }
                notifyDevicesChanged();
            }
        };
        displayManager.registerDisplayListener(displayListener, mainHandler);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        startDlnaScan();
        notifyDevicesChanged();
        call.resolve();
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        ssdpDiscovery.stopScan();
        call.resolve();
    }

    @PluginMethod
    public void getDevices(PluginCall call) {
        JSArray devices = new JSArray();

        for (DlnaDevice d : dlnaDevices.values()) {
            JSObject device = new JSObject();
            device.put("id", "dlna_" + d.getId());
            device.put("name", d.getName());
            device.put("description", "DLNA设备");
            device.put("type", "dlna");
            devices.put(device);
        }

        Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);
        for (Display display : displays) {
            if (display.getDisplayId() != Display.DEFAULT_DISPLAY) {
                JSObject device = new JSObject();
                device.put("id", "display_" + display.getDisplayId());
                device.put("name", display.getName());
                device.put("description", "已连接的显示设备");
                device.put("type", "miracast_connected");
                devices.put(device);
            }
        }

        JSObject result = new JSObject();
        result.put("devices", devices);
        call.resolve(result);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String deviceId = call.getString("deviceId");
        if (deviceId == null) {
            call.reject("Device ID is required");
            return;
        }

        if (deviceId.startsWith("dlna_")) {
            connectDlna(deviceId, call);
        } else if (deviceId.startsWith("display_")) {
            connectDisplay(deviceId, call);
        } else {
            call.reject("Unknown device type");
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        mainHandler.post(() -> {
            disconnectDlna();
            disconnectPresentation();
            call.resolve();
            notifyCastStatus(false, "");
        });
    }

    @PluginMethod
    public void isCasting(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isCasting", dlnaConnected || isPresentationActive());
        call.resolve(result);
    }

    @PluginMethod
    public void sendUpdate(PluginCall call) {
        String mode = call.getString("mode", "carousel");
        Double speed = call.getDouble("speed", 1.0);
        Double brightness = call.getDouble("brightness", 0.85);
        Boolean isPaused = call.getBoolean("isPaused", false);

        if (dlnaConnected && wsServer != null) {
            wsServer.broadcastUpdate(mode, speed, brightness, isPaused);
        }

        String js = String.format(
            "if(window.__castUpdate){window.__castUpdate('%s',%s,%s,%s,'sensory');}",
            mode, speed, brightness, isPaused
        );
        mainHandler.post(() -> {
            if (castPresentation != null) {
                WebView wv = castPresentation.getWebView();
                if (wv != null) {
                    wv.evaluateJavascript(js, null);
                }
            }
        });
        call.resolve();
    }

    /**
     * 打开系统投屏面板
     *
     * Android 11+ (API 30+): 打开系统输出切换面板（设备选择对话框），
     * 这个和从Quick Settings点击投屏按钮弹出的面板是同一个。
     * 用户在这里选择电视，系统自动建立Miracast连接。
     *
     * Android 10及以下: 打开无线显示设置页。
     */
    @PluginMethod
    public void openSystemCastSettings(PluginCall call) {
        mainHandler.post(() -> {
            try {
                boolean opened = false;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    try {
                        Intent panel = new Intent("android.settings.panel.action.OUTPUT_SWITCHER");
                        panel.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(panel);
                        opened = true;
                        Log.i(TAG, "Opened OUTPUT_SWITCHER panel");
                    } catch (Exception e) {
                        Log.w(TAG, "OUTPUT_SWITCHER failed, trying CAST_SETTINGS", e);
                    }
                }

                if (!opened) {
                    try {
                        Intent intent = new Intent("android.settings.CAST_SETTINGS");
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(intent);
                        opened = true;
                    } catch (Exception e1) {
                        try {
                            Intent intent = new Intent("android.settings.WIFI_DISPLAY_SETTINGS");
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            getContext().startActivity(intent);
                            opened = true;
                        } catch (Exception e2) {
                            call.reject("无法打开投屏面板");
                            return;
                        }
                    }
                }

                call.resolve();
            } catch (Exception e) {
                Log.e(TAG, "openSystemCastSettings failed", e);
                call.reject("打开投屏面板失败: " + e.getMessage());
            }
        });
    }

    // ==================== DLNA ====================

    private void startDlnaScan() {
        ssdpDiscovery.stopScan();
        ssdpDiscovery.startScan(new SsdpDiscovery.DiscoveryListener() {
            @Override
            public void onDeviceFound(DlnaDevice device) {
                dlnaDevices.put(device.getId(), device);
                notifyDevicesChanged();
            }

            @Override
            public void onScanComplete() {
                notifyDevicesChanged();
            }
        });
    }

    private void connectDlna(String compositeId, PluginCall call) {
        String rawId = compositeId.replace("dlna_", "");
        DlnaDevice device = dlnaDevices.get(rawId);
        if (device == null) {
            call.reject("DLNA device not found");
            return;
        }

        String avTransportUrl = device.getAvTransportUrl();
        if (avTransportUrl == null || avTransportUrl.isEmpty()) {
            call.reject("该设备不支持投屏，请尝试无线显示方式");
            return;
        }

        new Thread(() -> {
            try {
                webServer = LocalWebServer.getInstance(getContext());
                if (!webServer.isAlive()) {
                    webServer.startServer();
                }

                wsServer = SyncWebSocketServer.getInstance();
                if (!wsServer.isAlive()) {
                    wsServer.startServer();
                }

                String castUrl = webServer.getCastUrl();
                Log.i(TAG, "DLNA push URL: " + castUrl + " to " + avTransportUrl);

                boolean success = DlnaController.pushUrl(avTransportUrl, castUrl);

                if (success) {
                    dlnaConnected = true;
                    connectedDlnaDeviceName = device.getName();
                    mainHandler.post(() -> {
                        JSObject result = new JSObject();
                        result.put("connected", true);
                        call.resolve(result);
                        notifyCastStatus(true, device.getName());
                    });
                } else {
                    stopServers();
                    mainHandler.post(() -> {
                        call.reject("投屏失败，该电视可能不支持网页投屏，请尝试无线显示方式");
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "DLNA connect failed", e);
                stopServers();
                mainHandler.post(() -> {
                    call.reject("DLNA投屏失败: " + e.getMessage());
                });
            }
        }).start();
    }

    private void disconnectDlna() {
        if (dlnaConnected) {
            for (DlnaDevice device : dlnaDevices.values()) {
                if (device.getAvTransportUrl() != null) {
                    DlnaController.stop(device.getAvTransportUrl());
                    break;
                }
            }
            dlnaConnected = false;
            connectedDlnaDeviceName = "";
        }
        stopServers();
    }

    private void stopServers() {
        if (wsServer != null) {
            wsServer.stopServer();
        }
        if (webServer != null) {
            webServer.stopServer();
        }
    }

    // ==================== Presentation ====================

    private void connectDisplay(String deviceId, PluginCall call) {
        String rawId = deviceId.replace("display_", "");
        mainHandler.post(() -> {
            try {
                int id = Integer.parseInt(rawId);
                Display targetDisplay = null;

                Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);
                for (Display display : displays) {
                    if (display.getDisplayId() == id) {
                        targetDisplay = display;
                        break;
                    }
                }

                if (targetDisplay == null) {
                    call.reject("显示设备未找到");
                    return;
                }

                disconnectPresentation();
                castPresentation = new CastPresentation(getContext(), targetDisplay);
                castPresentation.show();

                String deviceName = targetDisplay.getName();
                JSObject result = new JSObject();
                result.put("connected", true);
                call.resolve(result);
                notifyCastStatus(true, deviceName);
            } catch (NumberFormatException e) {
                call.reject("Invalid display ID");
            } catch (Exception e) {
                call.reject("连接失败: " + e.getMessage());
            }
        });
    }

    private boolean isPresentationActive() {
        return castPresentation != null && castPresentation.isShowing();
    }

    private void disconnectPresentation() {
        if (castPresentation != null) {
            try {
                castPresentation.dismiss();
            } catch (Exception ignored) {
            }
            castPresentation = null;
        }
    }

    // ==================== 通知 ====================

    private void notifyDevicesChanged() {
        try {
            JSArray devices = new JSArray();

            for (DlnaDevice d : dlnaDevices.values()) {
                JSObject device = new JSObject();
                device.put("id", "dlna_" + d.getId());
                device.put("name", d.getName());
                device.put("description", "DLNA设备");
                device.put("type", "dlna");
                devices.put(device);
            }

            Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);
            for (Display display : displays) {
                if (display.getDisplayId() != Display.DEFAULT_DISPLAY) {
                    JSObject device = new JSObject();
                    device.put("id", "display_" + display.getDisplayId());
                    device.put("name", display.getName());
                    device.put("description", "已连接的显示设备 - 点击投屏");
                    device.put("type", "miracast_connected");
                    devices.put(device);
                }
            }

            JSObject data = new JSObject();
            data.put("devices", devices);
            notifyListeners("onDevicesChanged", data);
        } catch (Exception ignored) {
        }
    }

    private void notifyCastStatus(boolean connected, String deviceName) {
        try {
            JSObject data = new JSObject();
            data.put("connected", connected);
            data.put("deviceName", deviceName);
            notifyListeners("onCastStatusChanged", data);
        } catch (Exception ignored) {
        }
    }
}