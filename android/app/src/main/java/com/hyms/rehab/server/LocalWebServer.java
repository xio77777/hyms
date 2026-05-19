package com.hyms.rehab.server;

import android.content.Context;
import android.util.Log;

import fi.iki.elonen.NanoHTTPD;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * 本地HTTP服务器
 * 在手机上启动HTTP服务，提供训练页面给电视端访问
 * 电视通过DLNA获取到手机IP地址后，访问此服务器加载训练内容
 */
public class LocalWebServer extends NanoHTTPD {
    private static final String TAG = "LocalWebServer";
    private static final int PORT = 8899;

    private Context context;
    private static LocalWebServer instance;

    public static synchronized LocalWebServer getInstance(Context ctx) {
        if (instance == null) {
            instance = new LocalWebServer(ctx);
        }
        return instance;
    }

    private LocalWebServer(Context ctx) {
        super(PORT);
        this.context = ctx.getApplicationContext();
    }

    /**
     * 启动本地HTTP服务器
     */
    public boolean startServer() {
        try {
            if (isAlive()) return true;
            start(NanoHTTPD.SOCKET_READ_TIMEOUT, false);
            Log.i(TAG, "Local web server started on port " + PORT);
            return true;
        } catch (IOException e) {
            Log.e(TAG, "Failed to start local web server", e);
            return false;
        }
    }

    /**
     * 停止本地HTTP服务器
     */
    public void stopServer() {
        if (isAlive()) {
            stop();
            Log.i(TAG, "Local web server stopped");
        }
    }

    /**
     * 获取电视端访问的训练页面URL
     */
    public String getCastUrl() {
        String ip = com.hyms.rehab.dlna.SsdpDiscovery.getLocalIpAddress();
        return "http://" + ip + ":" + PORT + "/sensory";
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Log.d(TAG, "Request: " + uri);

        try {
            if (uri.equals("/sensory") || uri.equals("/sensory/") || uri.equals("/")) {
                return serveAsset("public/index.html", "text/html");
            }

            if (uri.startsWith("/assets/")) {
                String path = "public" + uri;
                String mime = getMimeType(uri);
                return serveAsset(path, mime);
            }

            if (uri.equals("/favicon.svg")) {
                return serveAsset("public/favicon.svg", "image/svg+xml");
            }

            if (uri.equals("/cordova.js") || uri.equals("/native-bridge.js")) {
                return newFixedLengthResponse(Response.Status.OK, "application/javascript", "");
            }

            return serveAsset("public/index.html", "text/html");
        } catch (Exception e) {
            Log.e(TAG, "Error serving " + uri, e);
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", "Error: " + e.getMessage());
        }
    }

    private Response serveAsset(String assetPath, String mimeType) {
        try {
            InputStream is = context.getAssets().open(assetPath);
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();

            InputStream bais = new ByteArrayInputStream(buffer);
            return newFixedLengthResponse(Response.Status.OK, mimeType, bais, size);
        } catch (IOException e) {
            Log.w(TAG, "Asset not found: " + assetPath);
            try {
                InputStream fallback = context.getAssets().open("public/index.html");
                int size = fallback.available();
                byte[] buffer = new byte[size];
                fallback.read(buffer);
                fallback.close();

                InputStream bais = new ByteArrayInputStream(buffer);
                return newFixedLengthResponse(Response.Status.OK, "text/html", bais, size);
            } catch (IOException e2) {
                return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found");
            }
        }
    }

    private String getMimeType(String uri) {
        if (uri.endsWith(".js")) return "application/javascript";
        if (uri.endsWith(".css")) return "text/css";
        if (uri.endsWith(".html")) return "text/html";
        if (uri.endsWith(".svg")) return "image/svg+xml";
        if (uri.endsWith(".png")) return "image/png";
        if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
        if (uri.endsWith(".json")) return "application/json";
        if (uri.endsWith(".woff") || uri.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }
}
