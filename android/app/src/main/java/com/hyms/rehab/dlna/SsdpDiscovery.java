package com.hyms.rehab.dlna;

import android.util.Log;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

/**
 * SSDP设备发现服务
 * 通过发送M-SEARCH广播包发现局域网内的DLNA设备
 * 解析设备描述XML获取设备名称和AVTransport服务URL
 *
 * 修复要点：
 * - 放宽SSDP过滤条件，不只搜索MediaRenderer，也搜索MediaServer和通用UPnP设备
 * - 很多智能电视以MediaServer身份暴露，但实际也支持AVTransport
 * - 增加多轮扫描，提高发现率
 */
public class SsdpDiscovery {
    private static final String TAG = "SsdpDiscovery";
    private static final String SSDP_ADDRESS = "239.255.255.250";
    private static final int SSDP_PORT = 1900;
    private static final int SEARCH_TIMEOUT_MS = 6000;

    private final ConcurrentHashMap<String, DlnaDevice> devices = new ConcurrentHashMap<>();
    private ExecutorService executor;
    private volatile boolean scanning = false;

    public interface DiscoveryListener {
        void onDeviceFound(DlnaDevice device);
        void onScanComplete();
    }

    /**
     * 开始SSDP扫描
     * 发送多种M-SEARCH广播，覆盖不同类型的UPnP设备
     */
    public void startScan(DiscoveryListener listener) {
        if (scanning) return;
        scanning = true;
        devices.clear();
        executor = Executors.newFixedThreadPool(6);

        executor.execute(() -> {
            DatagramSocket socket = null;
            try {
                socket = new DatagramSocket();
                socket.setSoTimeout(SEARCH_TIMEOUT_MS);
                socket.setReuseAddress(true);

                // 搜索目标列表 - 覆盖多种设备类型
                String[] searchTargets = {
                    "urn:schemas-upnp-org:device:MediaRenderer:1",
                    "urn:schemas-upnp-org:device:MediaServer:1",
                    "urn:schemas-upnp-org:service:AVTransport:1",
                    "urn:schemas-upnp-org:service:RenderingControl:1",
                    "urn:schemas-upnp-org:service:ConnectionManager:1",
                    "ssdp:all"
                };

                InetAddress ssdpAddr = InetAddress.getByName(SSDP_ADDRESS);

                for (String st : searchTargets) {
                    String searchMsg = "M-SEARCH * HTTP/1.1\r\n"
                        + "HOST: " + SSDP_ADDRESS + ":" + SSDP_PORT + "\r\n"
                        + "MAN: \"ssdp:discover\"\r\n"
                        + "MX: 3\r\n"
                        + "ST: " + st + "\r\n"
                        + "\r\n";

                    byte[] data = searchMsg.getBytes();
                    DatagramPacket packet = new DatagramPacket(data, data.length, ssdpAddr, SSDP_PORT);
                    socket.send(packet);

                    // 间隔发送，避免网络拥塞
                    Thread.sleep(200);
                }

                byte[] buffer = new byte[8192];
                long startTime = System.currentTimeMillis();

                while (System.currentTimeMillis() - startTime < SEARCH_TIMEOUT_MS) {
                    try {
                        DatagramPacket response = new DatagramPacket(buffer, buffer.length);
                        socket.receive(response);
                        String responseStr = new String(response.getData(), 0, response.getLength());
                        parseSsdpResponse(responseStr, listener);
                    } catch (java.net.SocketTimeoutException e) {
                        break;
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "SSDP scan error", e);
            } finally {
                if (socket != null) socket.close();
                scanning = false;
                if (listener != null) listener.onScanComplete();
            }
        });
    }

    public void stopScan() {
        scanning = false;
        if (executor != null) {
            executor.shutdownNow();
            executor = null;
        }
    }

    public Map<String, DlnaDevice> getDevices() {
        return new HashMap<>(devices);
    }

    /**
     * 解析SSDP响应
     * 放宽过滤条件：只要设备有LOCATION就尝试获取详情
     */
    private void parseSsdpResponse(String response, DiscoveryListener listener) {
        String location = extractHeader(response, "LOCATION");
        String st = extractHeader(response, "ST");
        String usn = extractHeader(response, "USN");
        String server = extractHeader(response, "SERVER");

        if (location == null || location.isEmpty()) return;

        // 去重：基于location URL
        String dedupeKey = location;
        if (devices.containsKey(dedupeKey)) return;

        // 过滤掉明显不是媒体设备的条目
        if (st != null && (st.contains("InternetGateway") || st.contains("WANIP") || st.contains("WANPPP"))) {
            return;
        }

        executor.execute(() -> {
            try {
                DlnaDevice device = fetchDeviceDetails(location);
                if (device != null && !devices.containsKey(device.getId())) {
                    devices.put(device.getId(), device);
                    if (listener != null) listener.onDeviceFound(device);
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed to fetch device details: " + location, e);
                // 即使获取详情失败，也添加一个基本设备条目
                String fallbackId = String.valueOf(location.hashCode());
                if (!devices.containsKey(fallbackId)) {
                    String name = guessDeviceName(location, server);
                    DlnaDevice fallback = new DlnaDevice(fallbackId, name, location);
                    devices.put(fallbackId, fallback);
                    if (listener != null) listener.onDeviceFound(fallback);
                }
            }
        });
    }

    /**
     * 获取设备详情
     * 解析设备描述XML，提取设备名称和AVTransport服务URL
     * 放宽条件：即使不是MediaRenderer也保留，很多电视以其他类型暴露
     */
    private DlnaDevice fetchDeviceDetails(String locationUrl) throws Exception {
        URL url = new URL(locationUrl);
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(url.openStream());

        String friendlyName = getTagValue(doc, "friendlyName");
        String manufacturer = getTagValue(doc, "manufacturer");
        String modelName = getTagValue(doc, "modelName");
        String modelDescription = getTagValue(doc, "modelDescription");
        String deviceType = getTagValue(doc, "deviceType");
        String udn = getTagValue(doc, "UDN");

        if (friendlyName == null || friendlyName.isEmpty()) {
            friendlyName = modelName != null ? modelName : "未知设备";
        }

        // 查找AVTransport服务URL
        String avTransportUrl = findServiceUrl(doc, locationUrl, "AVTransport");

        // 如果没有AVTransport，也查找RenderingControl（部分电视通过此服务暴露）
        if (avTransportUrl == null) {
            avTransportUrl = findServiceUrl(doc, locationUrl, "ConnectionManager");
        }

        String deviceId = udn != null ? udn : String.valueOf(locationUrl.hashCode());
        DlnaDevice device = new DlnaDevice(deviceId, friendlyName, locationUrl);
        device.setAvTransportUrl(avTransportUrl);

        if (manufacturer != null) {
            device.setManufacturer(manufacturer);
        }
        if (modelName != null) {
            device.setModelName(modelName);
        }

        return device;
    }

    /**
     * 从设备描述XML中查找指定服务的控制URL
     */
    private String findServiceUrl(Document doc, String baseUrl, String serviceName) {
        try {
            NodeList serviceList = doc.getElementsByTagName("service");
            for (int i = 0; i < serviceList.getLength(); i++) {
                Element service = (Element) serviceList.item(i);
                String serviceType = getTextContent(service, "serviceType");
                if (serviceType != null && serviceType.contains(serviceName)) {
                    String controlUrl = getTextContent(service, "controlURL");
                    if (controlUrl != null && !controlUrl.isEmpty()) {
                        return resolveUrl(baseUrl, controlUrl);
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to find " + serviceName + " URL", e);
        }
        return null;
    }

    /**
     * 解析相对URL为绝对URL
     */
    private String resolveUrl(String baseUrl, String relativeUrl) {
        try {
            if (relativeUrl.startsWith("http")) {
                return relativeUrl;
            }
            URL base = new URL(baseUrl);
            String path = relativeUrl.startsWith("/") ? relativeUrl : "/" + relativeUrl;
            int port = base.getPort();
            String portStr = port > 0 ? ":" + port : "";
            return base.getProtocol() + "://" + base.getHost() + portStr + path;
        } catch (Exception e) {
            return relativeUrl;
        }
    }

    /**
     * 根据URL和SERVER头猜测设备名称
     */
    private String guessDeviceName(String location, String server) {
        if (server != null) {
            String lower = server.toLowerCase();
            if (lower.contains("samsung")) return "Samsung TV";
            if (lower.contains("lg ")) return "LG TV";
            if (lower.contains("sony")) return "Sony TV";
            if (lower.contains("hisense")) return "Hisense TV";
            if (lower.contains("tcl")) return "TCL TV";
            if (lower.contains("xiaomi")) return "Xiaomi TV";
            if (lower.contains("huawei")) return "Huawei TV";
            if (lower.contains("chromecast")) return "Chromecast";
        }
        try {
            URL u = new URL(location);
            return "设备 " + u.getHost();
        } catch (Exception e) {
            return "未知设备";
        }
    }

    private String getTagValue(Document doc, String tagName) {
        NodeList nodes = doc.getElementsByTagName(tagName);
        if (nodes.getLength() > 0) {
            return nodes.item(0).getTextContent().trim();
        }
        return null;
    }

    private String getTextContent(Element parent, String tagName) {
        NodeList nodes = parent.getElementsByTagName(tagName);
        if (nodes.getLength() > 0) {
            return nodes.item(0).getTextContent().trim();
        }
        return null;
    }

    private String extractHeader(String response, String headerName) {
        String[] lines = response.split("\r\n");
        for (String line : lines) {
            int colon = line.indexOf(':');
            if (colon > 0) {
                String key = line.substring(0, colon).trim();
                String value = line.substring(colon + 1).trim();
                if (key.equalsIgnoreCase(headerName)) {
                    return value;
                }
            }
        }
        return null;
    }

    /**
     * 获取手机本地IP地址
     */
    public static String getLocalIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to get local IP", e);
        }
        return "127.0.0.1";
    }
}
