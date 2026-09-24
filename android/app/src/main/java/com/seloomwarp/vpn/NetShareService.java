package com.seloomwarp.vpn;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.p2p.WifiP2pManager;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ConcurrentHashMap;

public class NetShareService extends Service {
    public static final String ACTION_START = "com.seloomwarp.vpn.NETSHARE_START";
    public static final String ACTION_STOP = "com.seloomwarp.vpn.NETSHARE_STOP";
    public static final String EXTRA_IPV6 = "netshare_ipv6";
    private static final int HTTP_PORT = 8282;
    private static final int SOCKS_PORT = 8181;
    private static volatile NetShareService instance;
    private final ExecutorService workers = Executors.newCachedThreadPool();
    private volatile ServerSocket httpServer;
    private volatile ServerSocket socksServer;
    private volatile boolean running;
    private volatile boolean ipv6Enabled = true;
    private WifiP2pManager p2pManager;
    private WifiP2pManager.Channel p2pChannel;
    private static final ConcurrentHashMap<String, long[]> trafficByClient = new ConcurrentHashMap<>();
    private static final long[] totalTraffic = new long[] {0L, 0L};

    public static boolean isRunning() {
        NetShareService service = instance;
        return service != null && service.running;
    }

    public static long[] trafficFor(String address) {
        long[] value = trafficByClient.get(address);
        return value == null ? new long[] {0L, 0L} : new long[] {value[0], value[1]};
    }

    public static long[] totalTraffic() {
        synchronized (totalTraffic) { return new long[] {totalTraffic[0], totalTraffic[1]}; }
    }

    @Override public void onCreate() {
        super.onCreate();
        instance = this;
        p2pManager = (WifiP2pManager) getSystemService(WIFI_P2P_SERVICE);
        if (p2pManager != null) p2pChannel = p2pManager.initialize(this, getMainLooper(), () -> { });
        createChannel();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(1801, notification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE);
        } else if (Build.VERSION.SDK_INT >= 26) {
            startForeground(1801, notification());
        }
        if (intent != null && ACTION_STOP.equals(intent.getAction())) stopProxy();
        else if (intent != null && ACTION_START.equals(intent.getAction())) { ipv6Enabled = intent.getBooleanExtra(EXTRA_IPV6, true); startProxy(); }
        return START_STICKY;
    }

    private synchronized void startProxy() {
        if (running) return;
        try {
            httpServer = new ServerSocket();
            httpServer.setReuseAddress(true);
            httpServer.bind(new InetSocketAddress("0.0.0.0", HTTP_PORT));
            socksServer = new ServerSocket();
            socksServer.setReuseAddress(true);
            socksServer.bind(new InetSocketAddress("0.0.0.0", SOCKS_PORT));
            running = true;
            workers.execute(() -> acceptHttp(httpServer));
            workers.execute(() -> acceptSocks(socksServer));
        } catch (IOException error) {
            stopProxy();
        }
    }

    private void acceptHttp(ServerSocket server) {
        while (running && server != null && !server.isClosed()) try {
            Socket client = server.accept();
            workers.execute(() -> handleHttp(client));
        } catch (IOException ignored) { break; }
    }

    private void acceptSocks(ServerSocket server) {
        while (running && server != null && !server.isClosed()) try {
            Socket client = server.accept();
            workers.execute(() -> handleSocks(client));
        } catch (IOException ignored) { break; }
    }

    private void handleHttp(Socket client) {
        try (Socket local = client) {
            local.setSoTimeout(20000);
            BufferedReader reader = new BufferedReader(new InputStreamReader(local.getInputStream(), StandardCharsets.ISO_8859_1));
            String request = reader.readLine();
            if (request == null) return;
            String[] parts = request.split(" ", 3);
            if (parts.length < 2) return;
            String method = parts[0];
            String target = parts[1];
            ArrayList<String> headers = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) headers.add(line);
            if ("CONNECT".equalsIgnoreCase(method)) {
                String[] hostPort = target.split(":", 2);
                String host = hostPort[0];
                int port = hostPort.length > 1 ? Integer.parseInt(hostPort[1]) : 443;
                try (Socket upstream = open(host, port)) {
                    write(local, "HTTP/1.1 200 Connection Established\r\n\r\n");
                    relay(local, upstream, local.getInetAddress().getHostAddress());
                }
                return;
            }
            if (!target.startsWith("http://") && !target.startsWith("https://")) {
                write(local, "HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
                return;
            }
            URI uri = new URI(target);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : ("https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80);
            if (host == null) return;
            try (Socket upstream = open(host, port)) {
                BufferedWriter out = new BufferedWriter(new OutputStreamWriter(upstream.getOutputStream(), StandardCharsets.ISO_8859_1));
                String path = uri.getRawPath() == null || uri.getRawPath().isEmpty() ? "/" : uri.getRawPath();
                if (uri.getRawQuery() != null) path += "?" + uri.getRawQuery();
                out.write(method + " " + path + " HTTP/1.1\r\n");
                boolean hasHost = false;
                for (String header : headers) {
                    if (header.regionMatches(true, 0, "Proxy-", 0, 6)) continue;
                    if (header.regionMatches(true, 0, "Host:", 0, 5)) hasHost = true;
                    out.write(header + "\r\n");
                }
                if (!hasHost) out.write("Host: " + host + "\r\n");
                out.write("Connection: close\r\n\r\n");
                out.flush();
                copy(upstream.getInputStream(), local.getOutputStream(), local.getInetAddress().getHostAddress(), true);
            }
        } catch (Throwable ignored) {}
    }

    private void handleSocks(Socket client) {
        try (Socket local = client) {
            local.setSoTimeout(20000);
            InputStream in = local.getInputStream(); OutputStream out = local.getOutputStream();
            if (in.read() != 5) return;
            int count = in.read(); if (count < 0) return;
            byte[] methods = new byte[count]; readFully(in, methods);
            out.write(new byte[] {5, 0}); out.flush();
            if (in.read() != 5 || in.read() != 1 || in.read() < 0) return;
            int type = in.read(); String host;
            if (type == 1) { byte[] a = new byte[4]; readFully(in, a); host = (a[0]&255)+"."+(a[1]&255)+"."+(a[2]&255)+"."+(a[3]&255); }
            else if (type == 3) { int n = in.read(); if (n < 0) return; byte[] d = new byte[n]; readFully(in, d); host = new String(d, StandardCharsets.UTF_8); }
            else if (type == 4) { byte[] a = new byte[16]; readFully(in, a); host = InetAddress.getByAddress(a).getHostAddress(); }
            else return;
            int port = ((in.read() & 255) << 8) | (in.read() & 255);
            try (Socket upstream = open(host, port)) {
                out.write(new byte[] {5,0,0,1,0,0,0,0,0,0}); out.flush();
                relay(local, upstream, local.getInetAddress().getHostAddress());
            }
        } catch (Throwable ignored) {}
    }

    private Socket open(String host, int port) throws IOException {
        IOException last = null;
        for (InetAddress address : InetAddress.getAllByName(host)) {
            if (!ipv6Enabled && address instanceof Inet6Address) continue;
            try { Socket socket = new Socket(); socket.connect(new InetSocketAddress(address, port), 15000); return socket; } catch (IOException error) { last = error; }
        }
        throw last == null ? new IOException("No compatible address") : last;
    }

    private void relay(Socket a, Socket b, String clientAddress) throws IOException {
        Thread one = new Thread(() -> pipe(a, b, clientAddress, false), "netshare-up");
        Thread two = new Thread(() -> pipe(b, a, clientAddress, true), "netshare-down");
        one.start(); two.start();
        try { one.join(30000); two.join(30000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
    private void pipe(Socket from, Socket to, String clientAddress, boolean download) { try { copy(from.getInputStream(), to.getOutputStream(), clientAddress, download); } catch (IOException ignored) {} }
    private static void copy(InputStream in, OutputStream out) throws IOException { copy(in, out, null, false); }
    private static void copy(InputStream in, OutputStream out, String clientAddress, boolean download) throws IOException { byte[] buffer = new byte[16384]; int n; while ((n = in.read(buffer)) != -1) { out.write(buffer,0,n); out.flush(); if (clientAddress != null) { long[] value = trafficByClient.computeIfAbsent(clientAddress, key -> new long[] {0L,0L}); synchronized (value) { value[download ? 0 : 1] += n; } synchronized (totalTraffic) { totalTraffic[download ? 0 : 1] += n; } } } }
    private static void readFully(InputStream in, byte[] data) throws IOException { int p=0,n; while(p<data.length && (n=in.read(data,p,data.length-p))!=-1)p+=n; if(p<data.length)throw new EOFException(); }
    private static void write(Socket socket, String value) throws IOException { socket.getOutputStream().write(value.getBytes(StandardCharsets.ISO_8859_1)); socket.getOutputStream().flush(); }

    private synchronized void stopProxy() {
        running = false;
        try { if (httpServer != null) httpServer.close(); } catch (IOException ignored) {}
        try { if (socksServer != null) socksServer.close(); } catch (IOException ignored) {}
        httpServer = null; socksServer = null;
        if (p2pManager != null && p2pChannel != null) {
            try { p2pManager.removeGroup(p2pChannel, new WifiP2pManager.ActionListener() { @Override public void onSuccess() {} @Override public void onFailure(int reason) {} }); } catch (RuntimeException ignored) {}
        }
        stopForeground(true); stopSelf();
    }
    @Override public void onDestroy() { stopProxy(); workers.shutdownNow(); if (instance == this) instance = null; super.onDestroy(); }
    @Override public IBinder onBind(Intent intent) { return null; }
    private void createChannel() { if (Build.VERSION.SDK_INT >= 26) { NotificationManager n = getSystemService(NotificationManager.class); if (n != null) n.createNotificationChannel(new NotificationChannel("netshare", "NetShare", NotificationManager.IMPORTANCE_LOW)); } }
    private Notification notification() { return new NotificationCompat.Builder(this, "netshare").setContentTitle("NetShare").setContentText("مشاركة الإنترنت عبر Wi‑Fi Direct وProxy").setSmallIcon(android.R.drawable.ic_dialog_info).setOngoing(true).build(); }
}
