package com.seloomwarp.vpn;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pDevice;
import android.net.wifi.p2p.WifiP2pGroup;
import android.net.wifi.p2p.WifiP2pManager;
import android.os.Build;
import android.os.Looper;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "InternetSharing", permissions = {
        @Permission(alias = "nearby", strings = { Manifest.permission.NEARBY_WIFI_DEVICES, Manifest.permission.ACCESS_FINE_LOCATION })
})
public class InternetSharingPlugin extends Plugin {
    private WifiP2pManager wifiP2pManager;
    private WifiP2pManager.Channel channel;
    private String ssid = "DIRECT-NS-OODI";
    private String password = "oodi12345";
    private String proxyHost = "192.168.49.1";
    private int proxyPort = 8282;
    private int operatingBand = WifiP2pConfig.GROUP_OWNER_BAND_AUTO;
    private boolean ipv6 = true;
    private boolean active = false;

    @Override
    public void load() {
        super.load();
        wifiP2pManager = (WifiP2pManager) getContext().getSystemService(Context.WIFI_P2P_SERVICE);
        if (wifiP2pManager != null) {
            channel = wifiP2pManager.initialize(getContext(), Looper.getMainLooper(), () -> {
                active = false;
            });
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        requestStatus(call, "");
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (!hasWifiPermissions()) {
            requestPermissionForAlias("nearby", call, "permissionResult");
            return;
        }
        startInternal(call);
    }

    @PermissionCallback
    private void permissionResult(PluginCall call) {
        if (!hasWifiPermissions()) {
            call.reject("يجب السماح بصلاحية Nearby devices/الموقع لتشغيل شبكة NetShare");
            return;
        }
        startInternal(call);
    }

    private boolean hasWifiPermissions() {
        if (Build.VERSION.SDK_INT >= 33) {
            return getContext().checkSelfPermission(Manifest.permission.NEARBY_WIFI_DEVICES) == PackageManager.PERMISSION_GRANTED;
        }
        return getContext().checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private void startInternal(PluginCall call) {
        if (wifiP2pManager == null || channel == null) {
            call.reject("Wi‑Fi Direct غير متاح على هذا الجهاز");
            return;
        }
        ssid = normalizeSsid(call.getString("ssid", "OODI"));
        password = normalizePassword(call.getString("password", "oodi12345"));
        proxyHost = call.getString("proxyHost", "192.168.49.1");
        proxyPort = call.getInt("proxyPort", 8282);
        String band = call.getString("band", "auto");
        operatingBand = "2ghz".equalsIgnoreCase(band) ? WifiP2pConfig.GROUP_OWNER_BAND_2GHZ
                : ("5ghz".equalsIgnoreCase(band) ? WifiP2pConfig.GROUP_OWNER_BAND_5GHZ : WifiP2pConfig.GROUP_OWNER_BAND_AUTO);
        ipv6 = call.getBoolean("ipv6", true);

        try {
            wifiP2pManager.removeGroup(channel, new WifiP2pManager.ActionListener() {
                @Override public void onSuccess() { createVirtualGroup(call); }
                @Override public void onFailure(int reason) { createVirtualGroup(call); }
            });
        } catch (SecurityException error) {
            call.reject("اسمح بصلاحية Nearby devices/الموقع لتشغيل Wi‑Fi Direct", error);
        }
    }

    private void createVirtualGroup(PluginCall call) {
        final String networkName = ssid.startsWith("DIRECT-") ? ssid : "DIRECT-NS-" + ssid;
        try {
            WifiP2pConfig config = new WifiP2pConfig.Builder()
                    .setNetworkName(networkName)
                    .setPassphrase(password)
                    .setGroupOperatingBand(operatingBand)
                    .build();
            wifiP2pManager.createGroup(channel, config, new WifiP2pManager.ActionListener() {
                @Override public void onSuccess() {
                    startProxy();
                    active = true;
                    requestStatus(call, "تم إنشاء شبكة NetShare الافتراضية " + networkName);
                }
                @Override public void onFailure(int reason) {
                    // Some vendor Android builds do not allow custom P2P credentials.
                    // Retry with a system-generated DIRECT group instead of phone hotspot.
                    try {
                        wifiP2pManager.createGroup(channel, new WifiP2pManager.ActionListener() {
                            @Override public void onSuccess() {
                                startProxy();
                                active = true;
                                requestStatus(call, "تم إنشاء شبكة Wi‑Fi Direct؛ قد يستخدم النظام اسمًا وكلمة مرور تلقائيين");
                            }
                            @Override public void onFailure(int fallbackReason) {
                                active = false;
                                call.reject("تعذر إنشاء شبكة Wi‑Fi Direct (رمز " + fallbackReason + ")");
                            }
                        });
                    } catch (RuntimeException error) {
                        call.reject("تعذر إنشاء شبكة NetShare الافتراضية (رمز " + reason + ")", error);
                    }
                }
            });
        } catch (SecurityException error) {
            call.reject("اسمح بصلاحية Nearby devices/الموقع لتشغيل Wi‑Fi Direct", error);
        }
    }

    private void startProxy() {
        android.content.Intent intent = new android.content.Intent(getContext(), NetShareService.class).setAction(NetShareService.ACTION_START).putExtra(NetShareService.EXTRA_IPV6, ipv6);
        if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(intent); else getContext().startService(intent);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (wifiP2pManager != null && channel != null) {
            try {
                wifiP2pManager.removeGroup(channel, new WifiP2pManager.ActionListener() {
                    @Override public void onSuccess() { finishStop(call); }
                    @Override public void onFailure(int reason) { finishStop(call); }
                });
                return;
            } catch (RuntimeException ignored) {}
        }
        finishStop(call);
    }

    private void finishStop(PluginCall call) {
        getContext().startService(new android.content.Intent(getContext(), NetShareService.class).setAction(NetShareService.ACTION_STOP));
        active = false;
        call.resolve(status("تم إيقاف شبكة NetShare الافتراضية"));
    }

    private void requestStatus(PluginCall call, String message) {
        if (wifiP2pManager == null || channel == null) { call.resolve(status(message)); return; }
        try {
            wifiP2pManager.requestGroupInfo(channel, group -> call.resolve(status(message, group)));
        } catch (RuntimeException error) { call.resolve(status(message)); }
    }

    private JSObject status(String message) {
        return status(message, null);
    }

    private JSObject status(String message, WifiP2pGroup group) {
        JSObject result = new JSObject();
        result.put("active", active || NetShareService.isRunning());
        result.put("supported", wifiP2pManager != null && channel != null);
        result.put("ssid", ssid);
        result.put("proxyHost", proxyHost);
        result.put("proxyPort", proxyPort);
        JSArray devices = new JSArray();
        long download = 0L, upload = 0L;
        if (group != null) for (WifiP2pDevice device : group.getClientList()) {
            String ip = findIpForMac(device.deviceAddress);
            long[] traffic = NetShareService.trafficFor(ip == null ? device.deviceAddress : ip);
            download += traffic[0]; upload += traffic[1];
            JSObject item = new JSObject();
            item.put("id", device.deviceAddress);
            item.put("name", device.deviceName == null || device.deviceName.isEmpty() ? "جهاز متصل" : device.deviceName);
            item.put("address", ip == null ? device.deviceAddress : ip);
            item.put("connectedAt", System.currentTimeMillis());
            item.put("bytes", traffic[0] + traffic[1]);
            item.put("downloadBytes", traffic[0]);
            item.put("uploadBytes", traffic[1]);
            devices.put(item);
        }
        long[] total = NetShareService.totalTraffic();
        result.put("devices", devices);
        result.put("downloadBytes", total[0]);
        result.put("uploadBytes", total[1]);
        result.put("ipv6", ipv6);
        if (message != null && !message.isEmpty()) result.put("message", message);
        return result;
    }

    private static String findIpForMac(String mac) {
        if (mac == null) return null;
        String wanted = mac.replace('-', ':').toLowerCase();
        try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader("/proc/net/arp"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.trim().split("\\s+");
                if (parts.length >= 4 && parts[3].toLowerCase().equals(wanted)) return parts[0];
            }
        } catch (java.io.IOException ignored) {}
        return null;
    }

    private static String normalizeSsid(String value) {
        String clean = value == null ? "OODI" : value.trim().replaceAll("[^a-zA-Z0-9_-]", "-");
        if (clean.isEmpty()) clean = "OODI";
        return clean.substring(0, Math.min(20, clean.length()));
    }

    private static String normalizePassword(String value) {
        String clean = value == null ? "oodi12345" : value.trim();
        return clean.length() >= 8 ? clean.substring(0, Math.min(63, clean.length())) : "oodi12345";
    }
}
