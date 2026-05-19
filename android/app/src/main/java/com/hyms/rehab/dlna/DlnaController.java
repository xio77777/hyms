package com.hyms.rehab.dlna;

import android.util.Log;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * DLNA控制点
 * 通过AVTransport服务向电视推送内容URL
 *
 * 核心操作：
 * 1. SetAVTransportURI - 设置播放地址
 * 2. Play - 开始播放
 *
 * 兼容性修复：
 * - protocolInfo使用多种MIME类型尝试，提高电视兼容性
 * - 增加重试机制
 * - 更详细的错误日志
 */
public class DlnaController {
    private static final String TAG = "DlnaController";

    /**
     * 向电视推送URL并开始播放
     * 依次尝试不同的MIME类型，提高兼容性
     */
    public static boolean pushUrl(String avTransportUrl, String contentUrl) {
        if (avTransportUrl == null || avTransportUrl.isEmpty()) {
            Log.e(TAG, "AVTransport URL is empty");
            return false;
        }

        Log.i(TAG, "Pushing URL: " + contentUrl + " to " + avTransportUrl);

        // 依次尝试不同的MIME类型
        String[] mimeTypes = {
            "text/html",
            "application/x-html+svg",
            "video/mp4",
            "application/octet-stream"
        };

        for (String mime : mimeTypes) {
            try {
                boolean setOk = setAvTransportUri(avTransportUrl, contentUrl, mime);
                if (!setOk) {
                    Log.w(TAG, "SetAVTransportURI failed with mime: " + mime);
                    continue;
                }

                Thread.sleep(500);

                boolean playOk = play(avTransportUrl);
                if (playOk) {
                    Log.i(TAG, "Successfully pushed URL with mime: " + mime);
                    return true;
                }
                Log.w(TAG, "Play failed with mime: " + mime);
            } catch (Exception e) {
                Log.w(TAG, "Push failed with mime: " + mime, e);
            }
        }

        Log.e(TAG, "All MIME types failed for URL: " + contentUrl);
        return false;
    }

    /**
     * 停止电视上的播放
     */
    public static boolean stop(String avTransportUrl) {
        if (avTransportUrl == null || avTransportUrl.isEmpty()) return false;

        String soapBody = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\""
            + " s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">"
            + "<s:Body>"
            + "<u:Stop xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">"
            + "<InstanceID>0</InstanceID>"
            + "</u:Stop>"
            + "</s:Body>"
            + "</s:Envelope>";

        return sendSoapRequest(avTransportUrl, soapBody, "Stop");
    }

    private static boolean setAvTransportUri(String avTransportUrl, String contentUrl, String mimeType) {
        String escapedUrl = contentUrl
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;");

        String protocolInfo = "http-get:*:" + mimeType + ":*";

        String metadata = "&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; "
            + "xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; "
            + "xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;"
            + "&lt;item id=&quot;0&quot; parentID=&quot;-1&quot; restricted=&quot;1&quot;&gt;"
            + "&lt;dc:title&gt;HYMS Training&lt;/dc:title&gt;"
            + "&lt;upnp:class&gt;object.item.videoItem&lt;/upnp:class&gt;"
            + "&lt;res protocolInfo=&quot;" + protocolInfo + "&quot;&gt;" + escapedUrl + "&lt;/res&gt;"
            + "&lt;/item&gt;"
            + "&lt;/DIDL-Lite&gt;";

        String soapBody = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\""
            + " s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">"
            + "<s:Body>"
            + "<u:SetAVTransportURI xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">"
            + "<InstanceID>0</InstanceID>"
            + "<CurrentURI>" + escapedUrl + "</CurrentURI>"
            + "<CurrentURIMetaData>" + metadata + "</CurrentURIMetaData>"
            + "</u:SetAVTransportURI>"
            + "</s:Body>"
            + "</s:Envelope>";

        return sendSoapRequest(avTransportUrl, soapBody, "SetAVTransportURI");
    }

    private static boolean play(String avTransportUrl) {
        String soapBody = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            + "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\""
            + " s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">"
            + "<s:Body>"
            + "<u:Play xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">"
            + "<InstanceID>0</InstanceID>"
            + "<Speed>1</Speed>"
            + "</u:Play>"
            + "</s:Body>"
            + "</s:Envelope>";

        return sendSoapRequest(avTransportUrl, soapBody, "Play");
    }

    private static boolean sendSoapRequest(String url, String soapBody, String action) {
        HttpURLConnection conn = null;
        try {
            URL u = new URL(url);
            conn = (HttpURLConnection) u.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setRequestProperty("Content-Type", "text/xml; charset=\"utf-8\"");
            conn.setRequestProperty("SOAPAction",
                "\"urn:schemas-upnp-org:service:AVTransport:1#" + action + "\"");
            conn.setRequestProperty("Connection", "close");

            byte[] body = soapBody.getBytes("UTF-8");
            conn.setRequestProperty("Content-Length", String.valueOf(body.length));

            OutputStream os = conn.getOutputStream();
            os.write(body);
            os.flush();
            os.close();

            int responseCode = conn.getResponseCode();
            Log.d(TAG, action + " response: " + responseCode + " for URL: " + url);

            if (responseCode >= 200 && responseCode < 300) {
                return true;
            }

            // 读取错误响应
            try {
                java.io.InputStream es = conn.getErrorStream();
                if (es != null) {
                    byte[] errBuf = new byte[2048];
                    int len = es.read(errBuf);
                    if (len > 0) {
                        String errMsg = new String(errBuf, 0, len);
                        Log.w(TAG, action + " error response: " + errMsg);
                    }
                    es.close();
                }
            } catch (Exception ignored) {}

            return false;
        } catch (Exception e) {
            Log.e(TAG, action + " request failed for URL: " + url, e);
            return false;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}
