package com.hyms.rehab.server;

import android.util.Log;

import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

/**
 * WebSocket同步服务器
 * 手机端启动WebSocket服务，电视端连接后接收实时状态同步
 * 支持同步：训练模式、速度、亮度、暂停状态
 */
public class SyncWebSocketServer extends NanoWSD {
    private static final String TAG = "SyncWebSocketServer";
    private static final int PORT = 8898;

    private static SyncWebSocketServer instance;
    private final Map<String, NanoWSD.WebSocket> clients = new ConcurrentHashMap<>();
    private WebSocketMessageListener messageListener;

    public interface WebSocketMessageListener {
        void onClientConnected(String id);
        void onClientDisconnected(String id);
        void onMessage(String id, String message);
    }

    public static synchronized SyncWebSocketServer getInstance() {
        if (instance == null) {
            instance = new SyncWebSocketServer();
        }
        return instance;
    }

    private SyncWebSocketServer() {
        super(PORT);
    }

    public void setMessageListener(WebSocketMessageListener listener) {
        this.messageListener = listener;
    }

    public boolean startServer() {
        try {
            if (isAlive()) return true;
            start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
            Log.i(TAG, "WebSocket server started on port " + PORT);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to start WebSocket server", e);
            return false;
        }
    }

    public void stopServer() {
        if (isAlive()) {
            for (NanoWSD.WebSocket ws : clients.values()) {
                try { ws.close(NanoWSD.WebSocketFrame.CloseCode.NormalClosure, "server shutdown", false); } catch (Exception ignored) {}
            }
            clients.clear();
            stop();
            Log.i(TAG, "WebSocket server stopped");
        }
    }

    /**
     * 向所有连接的电视端广播状态更新
     */
    public void broadcastUpdate(String mode, double speed, double brightness, boolean isPaused) {
        try {
            JSONObject json = new JSONObject();
            json.put("type", "update");
            json.put("mode", mode);
            json.put("speed", speed);
            json.put("brightness", brightness);
            json.put("isPaused", isPaused);
            String msg = json.toString();

            for (NanoWSD.WebSocket ws : clients.values()) {
                try {
                    ws.send(msg);
                } catch (Exception e) {
                    Log.w(TAG, "Failed to send to client", e);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Broadcast failed", e);
        }
    }

    /**
     * 获取电视端连接的WebSocket URL
     */
    public String getWebSocketUrl() {
        String ip = com.hyms.rehab.dlna.SsdpDiscovery.getLocalIpAddress();
        return "ws://" + ip + ":" + PORT;
    }

    public int getClientCount() {
        return clients.size();
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        return new SyncWebSocket(handshake);
    }

    private class SyncWebSocket extends NanoWSD.WebSocket {
        private final String clientId;

        public SyncWebSocket(IHTTPSession handshake) {
            super(handshake);
            this.clientId = handshake.getRemoteHostName() + "-" + System.currentTimeMillis();
        }

        @Override
        protected void onOpen() {
            clients.put(clientId, this);
            Log.i(TAG, "Client connected: " + clientId + ", total: " + clients.size());
            if (messageListener != null) messageListener.onClientConnected(clientId);
        }

        @Override
        protected void onClose(WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
            clients.remove(clientId);
            Log.i(TAG, "Client disconnected: " + clientId + ", total: " + clients.size());
            if (messageListener != null) messageListener.onClientDisconnected(clientId);
        }

        @Override
        protected void onMessage(WebSocketFrame message) {
            String text = message.getTextPayload();
            Log.d(TAG, "Message from " + clientId + ": " + text);
            if (messageListener != null) messageListener.onMessage(clientId, text);
        }

        @Override
        protected void onPong(WebSocketFrame pong) {
        }

        @Override
        protected void onException(IOException exception) {
            Log.e(TAG, "WebSocket exception for " + clientId, exception);
            clients.remove(clientId);
        }
    }
}
