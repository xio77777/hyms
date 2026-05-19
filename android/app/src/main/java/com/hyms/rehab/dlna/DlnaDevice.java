package com.hyms.rehab.dlna;

/**
 * DLNA设备数据类
 * 表示通过SSDP发现的一个UPnP/DLNA设备（如智能电视、机顶盒）
 */
public class DlnaDevice {
    private String id;
    private String name;
    private String location;
    private String avTransportUrl;
    private String manufacturer;
    private String modelName;

    public DlnaDevice(String id, String name, String location) {
        this.id = id;
        this.name = name;
        this.location = location;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getAvTransportUrl() { return avTransportUrl; }
    public String getManufacturer() { return manufacturer; }
    public String getModelName() { return modelName; }

    public void setAvTransportUrl(String url) { this.avTransportUrl = url; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        DlnaDevice that = (DlnaDevice) obj;
        return id != null ? id.equals(that.id) : that.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
