package com.seloomwarp.vpn;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.VpnService;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.wireguard.android.backend.Backend;
import com.wireguard.android.backend.GoBackend;
import com.wireguard.android.backend.Statistics;
import com.wireguard.android.backend.Tunnel;
import com.wireguard.android.backend.Tunnel.State;
import com.wireguard.config.Config;
import com.wireguard.crypto.Key;
import java.io.BufferedReader;
import java.io.StringReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class SeloomVpnService extends VpnService {
    public static final String ACTION_CONNECT = "com.seloomwarp.vpn.CONNECT";
    public static final String ACTION_DISCONNECT = "com.seloomwarp.vpn.DISCONNECT";
    public static final String EXTRA_SERVER_NAME = "server_name";
    public static final String EXTRA_ENDPOINT = "endpoint";
    public static final String EXTRA_DNS = "dns";
    public static final String EXTRA_ADDRESS = "address";
    public static final String EXTRA_PRIVATE_KEY = "private_key";
    public static final String EXTRA_PUBLIC_KEY = "public_key";
    public static final String EXTRA_MTU = "mtu";
    public static final String EXTRA_KEEPALIVE = "keepalive";
    public static final String EXTRA_ALLOWED_IPS = "allowed_ips";
    public static final String EXTRA_BYPASS_LAN = "bypass_lan_route";
    public static final String EXTRA_EXCLUDED_APPLICATIONS = "excluded_applications";

    private static final String CHANNEL_ID = "seloom_vpn_status_channel";
    private static final int NOTIFICATION_ID = 1001;
    private static volatile boolean isRunning = false;
    private static volatile SeloomVpnService activeService;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Object tunnelLock = new Object();
    private volatile boolean destroyed;
    private volatile boolean foregroundStarted;
    private Backend backend;
    private Tunnel tunnel;

    public static boolean isConnected() { return isRunning; }

    /**
     * Returns the counters maintained by the WireGuard backend for the active peer.
     * These values are actual tunnel traffic totals, not app UID totals or synthetic
     * speed-test traffic. The snapshot is safe to obtain from Capacitor's plugin thread.
     */
    public static TrafficSnapshot getTrafficSnapshot() {
        SeloomVpnService service = activeService;
        return service == null ? TrafficSnapshot.disconnected() : service.readTrafficSnapshot();
    }

    public static final class TrafficSnapshot {
        public final boolean connected;
        public final long downloadBytes;
        public final long uploadBytes;
        public final long latestHandshakeEpochMs;

        TrafficSnapshot(boolean connected, long downloadBytes, long uploadBytes, long latestHandshakeEpochMs) {
            this.connected = connected;
            this.downloadBytes = Math.max(0L, downloadBytes);
            this.uploadBytes = Math.max(0L, uploadBytes);
            this.latestHandshakeEpochMs = Math.max(0L, latestHandshakeEpochMs);
        }

        static TrafficSnapshot disconnected() {
            return new TrafficSnapshot(false, 0L, 0L, 0L);
        }
    }

    @Override public void onCreate() {
        super.onCreate();
        activeService = this;
        try { backend = new GoBackend(getApplicationContext()); }
        catch (Throwable ignored) { backend = null; }
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || destroyed) return START_NOT_STICKY;
        if (ACTION_DISCONNECT.equals(intent.getAction())) {
            submitSafely(this::stopVpn);
            return START_NOT_STICKY;
        }
        if (!ACTION_CONNECT.equals(intent.getAction())) return START_NOT_STICKY;

        try {
            createNotificationChannel();
            Notification notification = buildNotification(intent.getStringExtra(EXTRA_SERVER_NAME));
            // SPECIAL_USE was added in Android 14 (API 34). Passing that bit on
            // Android 10-13 can throw IllegalArgumentException and kill the app
            // while the VPN is being started.
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
            foregroundStarted = true;
        } catch (Throwable error) {
            isRunning = false;
            stopSelfResult(startId);
            return START_NOT_STICKY;
        }

        final Intent copy = new Intent(intent);
        submitSafely(() -> startVpn(copy));
        return START_NOT_STICKY;
    }

    private void startVpn(Intent intent) {
        synchronized (tunnelLock) {
            try {
                String privateKey = required(intent, EXTRA_PRIVATE_KEY);
                String publicKey = required(intent, EXTRA_PUBLIC_KEY);
                String endpoint = required(intent, EXTRA_ENDPOINT);
                String address = cleanAddresses(intent.getStringExtra(EXTRA_ADDRESS), "172.16.0.2/32,2606:4700:110:8d70:8df1:6e3d:693b:ea40/128");
                String dns = cleanList(intent.getStringExtra(EXTRA_DNS), "1.1.1.1");
                // Keep IPv6 opt-in; IPv4-only peers must not receive ::/0.
                String allowedIPs = cleanList(intent.getStringExtra(EXTRA_ALLOWED_IPS), "0.0.0.0/0");
                String excludedApplications = cleanPackageList(intent.getStringExtra(EXTRA_EXCLUDED_APPLICATIONS));
                boolean bypassLan = intent.getBooleanExtra(EXTRA_BYPASS_LAN, false);
                int mtu = validMtu(intent.getIntExtra(EXTRA_MTU, 1280));
                int keepalive = Math.max(0, Math.min(65535, intent.getIntExtra(EXTRA_KEEPALIVE, 25)));
                if (backend == null) throw new IllegalStateException("WireGuard backend unavailable");
                if (!hasValidCidr(address) || !hasValidCidr(allowedIPs)) throw new IllegalArgumentException("Invalid VPN route");
                if (!isEndpoint(endpoint)) throw new IllegalArgumentException("Invalid VPN endpoint");
                // Split default routes keep Android's local-network routes available when requested.
                if (bypassLan) allowedIPs = "0.0.0.0/1,128.0.0.0/1,::/1,8000::/1";

                String tunnelName = safeTunnelName(intent.getStringExtra(EXTRA_SERVER_NAME));
                String excludedLine = excludedApplications.isEmpty() ? "" : "ExcludedApplications = " + excludedApplications + "\n";
                Config config = Config.parse(new BufferedReader(new StringReader(
                    "[Interface]\n" + "PrivateKey = " + privateKey + "\n" +
                    "Address = " + address + "\n" + "DNS = " + dns + "\n" + "MTU = " + mtu + "\n\n" +
                    excludedLine +
                    "[Peer]\n" + "PublicKey = " + publicKey + "\n" +
                    "Endpoint = " + endpoint + "\n" + "AllowedIPs = " + allowedIPs + "\n" +
                    "PersistentKeepalive = " + keepalive + "\n")));

                // GoBackend rejects duplicate tunnel names and concurrent state changes.
                // Always tear down the old tunnel before creating the replacement.
                if (tunnel != null) {
                    try { backend.setState(tunnel, State.DOWN, null); } catch (Throwable ignored) {}
                    tunnel = null;
                }
                tunnel = new AppTunnel(tunnelName);
                backend.setState(tunnel, State.UP, config);
                isRunning = backend.getState(tunnel) == State.UP;
                if (!isRunning) stopVpn();
            } catch (Throwable error) {
                isRunning = false;
                try { if (backend != null && tunnel != null) backend.setState(tunnel, State.DOWN, null); } catch (Throwable ignored) {}
                tunnel = null;
                stopVpn();
            }
        }
    }

    private void stopVpn() {
        try {
            if (backend != null && tunnel != null) backend.setState(tunnel, State.DOWN, null);
        } catch (Throwable ignored) {}
        tunnel = null;
        isRunning = false;
        if (foregroundStarted) {
            try { stopForeground(true); } catch (Throwable ignored) {}
            foregroundStarted = false;
        }
        stopSelf();
    }

    private TrafficSnapshot readTrafficSnapshot() {
        synchronized (tunnelLock) {
            if (!isRunning || backend == null || tunnel == null) return TrafficSnapshot.disconnected();
            try {
                Statistics statistics = backend.getStatistics(tunnel);
                long latestHandshakeEpochMs = 0L;
                for (Key key : statistics.peers()) {
                    Statistics.PeerStats peer = statistics.peer(key);
                    if (peer != null) latestHandshakeEpochMs = Math.max(latestHandshakeEpochMs, peer.latestHandshakeEpochMillis());
                }
                // WireGuard RX means bytes delivered from the peer to this device,
                // while TX means bytes sent from this device to the peer.
                return new TrafficSnapshot(true, statistics.totalRx(), statistics.totalTx(), latestHandshakeEpochMs);
            } catch (Throwable ignored) {
                // Never let a telemetry read interrupt or tear down an active tunnel.
                return TrafficSnapshot.disconnected();
            }
        }
    }

    private static String required(Intent i, String key) {
        String value = i.getStringExtra(key);
        if (value == null || value.trim().isEmpty()) throw new IllegalArgumentException(key + " is required");
        return value.trim();
    }
    private static String cleanAddresses(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.replace(';', ',').trim();
    }
    private static String cleanList(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.replace(';', ',').trim();
    }
    private static String cleanPackageList(String value) {
        if (value == null || value.trim().isEmpty()) return "";
        StringBuilder result = new StringBuilder();
        for (String item : value.split(",")) {
            String packageName = item.trim();
            if (!packageName.matches("[A-Za-z][A-Za-z0-9_]*(?:\\.[A-Za-z0-9_]+)+")) continue;
            if (result.length() > 0) result.append(", ");
            result.append(packageName);
        }
        return result.toString();
    }
    private static boolean hasValidCidr(String values) {
        for (String value : values.split(",")) {
            String cidr = value.trim();
            if (cidr.isEmpty()) continue;
            if (!cidr.matches("(?:(?:\\d{1,3}\\.){3}\\d{1,3}/(?:3[0-2]|[12]?\\d)|[0-9a-fA-F:]+/(?:12[0-8]|1[01]?[0-9]|[1-9]?[0-9]))")) return false;
        }
        return true;
    }
    private static boolean isEndpoint(String value) {
        return value.matches("[^\\s:]+:\\d{1,5}")
            || value.matches("\\[[0-9a-fA-F:]+\\]:\\d{1,5}");
    }
    private static int validMtu(int value) { return value >= 1280 && value <= 65535 ? value : 1280; }
    private static String safeTunnelName(String name) {
        String result = name == null ? "SeloomWarp" : name.replaceAll("[^a-zA-Z0-9_=+.-]", "-");
        if (result.isEmpty()) result = "SeloomWarp";
        return result.substring(0, Math.min(15, result.length()));
    }

    @Override public void onDestroy() {
        destroyed = true;
        try { if (backend != null && tunnel != null) backend.setState(tunnel, State.DOWN, null); }
        catch (Throwable ignored) {}
        tunnel = null;
        isRunning = false;
        if (foregroundStarted) {
            try { stopForeground(true); } catch (Throwable ignored) {}
            foregroundStarted = false;
        }
        if (activeService == this) activeService = null;
        executor.shutdownNow();
        super.onDestroy();
    }

    private void submitSafely(Runnable task) {
        if (!destroyed && !executor.isShutdown()) {
            try { executor.execute(task); } catch (RuntimeException ignored) { isRunning = false; }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "حالة اتصال SeloomWarp VPN", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }
    private Notification buildNotification(String serverName) {
        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SeloomWarp VPN")
            .setContentText("جاري الاتصال عبر " + (serverName == null ? "WireGuard" : serverName))
            .setSmallIcon(android.R.drawable.ic_lock_lock).setContentIntent(pending).setOngoing(true).setPriority(NotificationCompat.PRIORITY_LOW).build();
    }
    private static final class AppTunnel implements Tunnel {
        private final String name;
        AppTunnel(String name) { this.name = name; }
        @Override public String getName() { return name; }
        @Override public void onStateChange(State state) { isRunning = state == State.UP; }
    }
}
