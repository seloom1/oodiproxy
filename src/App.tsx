import React, { useState, useEffect, useRef } from 'react';
import { ShieldOff } from 'lucide-react';
import { Header } from './components/Header';
import { PowerSwitch } from './components/PowerSwitch';
import { StatsCard } from './components/StatsCard';
import { DeviceInfoBar } from './components/DeviceInfoBar';
import { TelegramBanner } from './components/TelegramBanner';
import { Footer } from './components/Footer';
import { AddServerModal } from './components/AddServerModal';
import { ServerListModal } from './components/ServerListModal';
import { ConfigExportModal } from './components/ConfigExportModal';
import { SettingsModal } from './components/SettingsModal';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BalyBadge } from './components/BalyBadge';
import { ConnectionHistoryModal } from './components/ConnectionHistoryModal';
import { AppExclusionsModal } from './components/AppExclusionsModal';

import { WireguardServer, ConnectionState, AppSettings, NetworkTelemetry, ConnectionLogEntry } from './types';
import { getInitialServers, parseWireguardUri, USER_DEFAULT_URI } from './utils/wireguard';
import { measureRealPing } from './utils/realSpeed';
import { fetchRealExternalIpAndCountry } from './utils/geoIp';
import VpnBridge, { InstalledApp } from './utils/vpnBridge';
import ShizziBridge from './utils/shizziBridge';
import { CellularInfo, EMPTY_CELLULAR_INFO, readCellularInfo } from './utils/cellularInfo';

const STORAGE_SERVERS_KEY = 'seloomwarp_servers_v1';
const STORAGE_SETTINGS_KEY = 'seloomwarp_settings_v1';
const STORAGE_ACTIVE_SERVER_KEY = 'seloomwarp_active_id_v1';
const STORAGE_CONNECTION_LOG_KEY = 'seloomwarp_connection_log_v1';

function normalizeStoredServers(value: unknown): WireguardServer[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  return value.map((server) => {
    if (!server || typeof server !== 'object') return server as WireguardServer;
    const item = server as WireguardServer;
    const hasIpv6Address = Array.isArray(item.addresses)
      && item.addresses.some((address) => address.includes(':'));
    const allowed = Array.isArray(item.allowedIPs) ? item.allowedIPs : [];
    const dns = Array.isArray(item.dns) ? item.dns : [];
    const normalizedRoutes = !hasIpv6Address && allowed.includes('::/0')
      ? allowed.filter((route) => route !== '::/0')
      : allowed;
    const normalizedDns = !hasIpv6Address
      ? dns.filter((serverAddress) => !serverAddress.includes(':'))
      : dns;
    // Migrate the old implicit IPv4+IPv6 default only when the peer itself
    // has no IPv6 address. Explicit IPv6-capable configurations are preserved.
    if (normalizedRoutes !== allowed || normalizedDns !== dns) {
      return {
        ...item,
        allowedIPs: normalizedRoutes,
        dns: normalizedDns.length ? normalizedDns : ['1.1.1.1', '1.0.0.1'],
      };
    }
    return item;
  });
}

export default function App() {
  // 1. Servers state
  const [servers, setServers] = useState<WireguardServer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SERVERS_KEY);
      if (saved) {
        const parsed = normalizeStoredServers(JSON.parse(saved));
        if (parsed) return parsed;
      }
    } catch {
      // fallback
    }
    return getInitialServers();
  });

  // Active server ID
  const [activeServerId, setActiveServerId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SERVER_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return servers[0]?.id || '';
  });

  // 2. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults: AppSettings = {
      dpiBypass: true,
      autoReconnect: true,
      bypassLanRoute: false,
      externalIp: '104.28.212.89',
      location: 'العراق (Baghdad)',
      country: 'العراق',
      countryFlag: '🇮🇶',
      defaultDns: '1.1.1.1',
      mtu: 1280,
      keepalive: 25,
      excludedApplications: [],
      language: 'ar',
    };
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return defaults;
  });

  // 3. Connection State (Dedicated strictly to WireGuard)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // 4. Telemetry State
  const [telemetry, setTelemetry] = useState<NetworkTelemetry>({
    durationSeconds: 0,
    uploadBytes: 0,
    downloadBytes: 0,
    uploadSpeedKBs: 0,
    downloadSpeedKBs: 0,
    pingMs: 0,
  });
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONNECTION_LOG_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 50) : [];
    } catch {
      return [];
    }
  });

  // 5. Modal and Drawer states
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [isServerListOpen, setIsServerListOpen] = useState(false);
  const [isConfigExportOpen, setIsConfigExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [serverForExport, setServerForExport] = useState<WireguardServer | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isLoadingIp, setIsLoadingIp] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAppExclusionsOpen, setIsAppExclusionsOpen] = useState(false);
  const [installedApplications, setInstalledApplications] = useState<InstalledApp[]>([]);
  const [cellularInfo, setCellularInfo] = useState<CellularInfo>(EMPTY_CELLULAR_INFO);
  const [isLoadingCellular, setIsLoadingCellular] = useState(false);

  // Active server object
  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];

  // Probe native VPN state after the first paint so the interface opens immediately.
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void VpnBridge.isVpnConnected().then(({ connected }) => {
        if (!cancelled) setConnectionState(connected ? 'connected' : 'disconnected');
      }).catch(() => undefined);
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void VpnBridge.listApplications().then(({ applications }) => {
        if (!cancelled) setInstalledApplications(applications);
      }).catch(() => undefined);
    }, 750);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshCellular = async () => {
      setIsLoadingCellular(true);
      const info = await readCellularInfo();
      if (!cancelled) {
        setCellularInfo(info);
        setIsLoadingCellular(false);
      }
    };
    const initialTimer = window.setTimeout(() => { void refreshCellular(); }, 1000);
    const timer = window.setInterval(() => { void refreshCellular(); }, 10000);
    return () => { cancelled = true; window.clearTimeout(initialTimer); window.clearInterval(timer); };
  }, []);

  // Save servers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(servers));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [servers]);

  // Save active server ID
  useEffect(() => {
    if (activeServerId) {
      try {
        localStorage.setItem(STORAGE_ACTIVE_SERVER_KEY, activeServerId);
      } catch (e) {
        console.warn('Storage save failed:', e);
      }
    }
  }, [activeServerId]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_CONNECTION_LOG_KEY, JSON.stringify(connectionLogs)); } catch { /* keep live app usable */ }
  }, [connectionLogs]);

  const saveConnectionLog = (snapshot: NetworkTelemetry) => {
    const entry: ConnectionLogEntry = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      durationSeconds: snapshot.durationSeconds,
      uploadBytes: snapshot.uploadBytes,
      downloadBytes: snapshot.downloadBytes,
    };
    setConnectionLogs((previous) => [entry, ...previous].slice(0, 50));
  };

  const clearConnectionLogs = () => setConnectionLogs([]);

  // Live traffic, duration & latency when connected. Transfer counters come
  // directly from the native WireGuard backend; they are never extrapolated.
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const telemetryPollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const geoPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const telemetryRef = useRef<NetworkTelemetry>(telemetry);
  const previousTrafficSampleRef = useRef<{ downloadBytes: number; uploadBytes: number; capturedAt: number } | null>(null);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  // Measure real ping helper
  const refreshRealPing = async () => {
    setIsPinging(true);
    try {
      const realPing = await measureRealPing();
      if (realPing <= 0) return;
      setTelemetry((prev) => ({
        ...prev,
        pingMs: realPing,
      }));
      setServers((prev) =>
        prev.map((s) => (s.id === activeServerId ? { ...s, latency: realPing } : s))
      );
    } catch {
      // fallback
    } finally {
      setIsPinging(false);
    }
  };

  // Fetch real external IP, Country and Flag helper
  const refreshRealIp = async () => {
    setIsLoadingIp(true);
    try {
      const geo = await fetchRealExternalIpAndCountry();
      setSettings((prev) => ({
        ...prev,
        externalIp: geo.ip,
        country: geo.country,
        countryFlag: geo.flag,
        location: `${geo.country} (${geo.city})`,
      }));
    } catch {
      // ignore
    } finally {
      setIsLoadingIp(false);
    }
  };

  useEffect(() => {
    let disposed = false;
    if (connectionState === 'connected') {
      let trafficRequestInFlight = false;
      let pingRequestInFlight = false;
      previousTrafficSampleRef.current = null;

      // The native tunnel-counter read and RTT probe intentionally remain
      // independent. A slow network RTT request must never delay the three
      // second traffic refresh shown in the UI.
      const pollLiveTelemetry = async () => {
        if (trafficRequestInFlight || disposed) return;
        trafficRequestInFlight = true;
        try {
          const traffic = await VpnBridge.getTrafficStats();
          const capturedAt = performance.now();
          if (disposed || !traffic.connected) return;
          const previous = previousTrafficSampleRef.current;
          const elapsedSeconds = previous ? (capturedAt - previous.capturedAt) / 1000 : 0;
          const downloadDelta = previous ? traffic.downloadBytes - previous.downloadBytes : 0;
          const uploadDelta = previous ? traffic.uploadBytes - previous.uploadBytes : 0;
          const validDelta = elapsedSeconds > 0 && downloadDelta >= 0 && uploadDelta >= 0;

          previousTrafficSampleRef.current = {
            downloadBytes: traffic.downloadBytes,
            uploadBytes: traffic.uploadBytes,
            capturedAt,
          };

          setTelemetry((prev) => ({
            ...prev,
            // Backend totals are assigned as-is rather than incremented with
            // generated bytes, so the UI precisely mirrors tunnel traffic.
            downloadBytes: traffic.downloadBytes,
            uploadBytes: traffic.uploadBytes,
            downloadSpeedKBs: validDelta ? Math.round((downloadDelta / elapsedSeconds) / 1024) : 0,
            uploadSpeedKBs: validDelta ? Math.round((uploadDelta / elapsedSeconds) / 1024) : 0,
          }));
        } catch {
          // Keep the last valid native values if the service is restarting.
        } finally {
          trafficRequestInFlight = false;
        }
      };

      const pollPing = async () => {
        if (pingRequestInFlight || disposed) return;
        pingRequestInFlight = true;
        try {
          const pingMs = await measureRealPing();
          if (!disposed && pingMs > 0) {
            setTelemetry((prev) => ({ ...prev, pingMs }));
            setServers((prev) => prev.map((server) => (
              server.id === activeServerId ? { ...server, latency: pingMs } : server
            )));
          }
        } catch {
          // Preserve the most recent successful RTT.
        } finally {
          pingRequestInFlight = false;
        }
      };

      const pollMeasurements = () => {
        void pollLiveTelemetry();
        void pollPing();
      };

      // Read actual counters immediately, then refresh all live measurements
      // every three seconds as requested. The in-flight guard prevents overlap
      // on a slow network and avoids a growing queue of callbacks.
      void refreshRealIp();
      if (geoPollTimerRef.current) clearInterval(geoPollTimerRef.current);
      geoPollTimerRef.current = setInterval(() => { void refreshRealIp(); }, 30000);
      pollMeasurements();
      telemetryPollTimerRef.current = setInterval(pollMeasurements, 3000);

      // Duration is the only visual counter that is updated locally; transfer
      // bytes and throughput stay entirely native-measurement based.
      timerRef.current = setInterval(() => {
        setTelemetry((prev) => ({ ...prev, durationSeconds: prev.durationSeconds + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryPollTimerRef.current) clearInterval(telemetryPollTimerRef.current);
      if (geoPollTimerRef.current) clearInterval(geoPollTimerRef.current);
      previousTrafficSampleRef.current = null;
    }

    return () => {
      disposed = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (telemetryPollTimerRef.current) clearInterval(telemetryPollTimerRef.current);
      if (geoPollTimerRef.current) clearInterval(geoPollTimerRef.current);
    };
  }, [connectionState, activeServerId]);

  // Handle Power button toggle with Real Android VPN Service
  const handleToggleConnection = async () => {
    if (connectionState === 'connected') {
      setConnectionState('disconnecting');
      try {
        await VpnBridge.disconnect();
      } catch (err) {
        console.warn('VPN disconnect error:', err);
      }
      saveConnectionLog(telemetryRef.current);
      setTimeout(() => {
        setConnectionState('disconnected');
      }, 500);
    } else if (connectionState === 'disconnected') {
      previousTrafficSampleRef.current = null;
      setConnectionState('connecting');
      setTelemetry({
        durationSeconds: 0,
        uploadBytes: 0,
        downloadBytes: 0,
        uploadSpeedKBs: 0,
        downloadSpeedKBs: 0,
        pingMs: 0,
      });
      try {
        await VpnBridge.connect({
          serverName: activeServer.name || 'OODI PROXY SELOOM1',
          endpoint: activeServer.endpoint,
          dns: Array.isArray(activeServer.dns) ? activeServer.dns.join(',') : activeServer.dns,
          address: Array.isArray(activeServer.addresses) ? activeServer.addresses.join(',') : (activeServer.addresses || '172.16.0.2/32'),
          privateKey: activeServer.privateKey,
          publicKey: activeServer.publicKey,
          allowedIPs: Array.isArray(activeServer.allowedIPs) ? activeServer.allowedIPs.join(',') : '0.0.0.0/0',
          bypassLanRoute: settings.bypassLanRoute,
          excludedApplications: settings.excludedApplications,
        });
        // The native service starts asynchronously. Do not mark the UI as connected
        // until the WireGuard backend reports that the tunnel is actually UP.
        let connected = false;
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          const state = await VpnBridge.isVpnConnected();
          if (state.connected) {
            connected = true;
            break;
          }
        }
        setConnectionState(connected ? 'connected' : 'disconnected');
      } catch (err) {
        console.error('VPN permission or connection error:', err);
        setConnectionState('disconnected');
      }
    }
  };

  // Add Server handler
  const handleAddServer = (newServer: WireguardServer, activateImmediately: boolean) => {
    setServers((prev) => [newServer, ...prev]);
    if (activateImmediately) {
      setActiveServerId(newServer.id);
      // Selecting a server must not claim a native VPN connection. The tunnel
      // is started only by the power button after the user grants permission.
      setConnectionState('disconnected');
    }
  };

  // Select server handler
  const handleSelectServer = (server: WireguardServer) => {
    setActiveServerId(server.id);
    setIsServerListOpen(false);
    if (connectionState === 'connected') {
      // Do not swap credentials underneath a live WireGuard tunnel.
      void VpnBridge.disconnect().catch(() => undefined);
      setConnectionState('disconnected');
    }
  };

  // Delete server handler
  const handleDeleteServer = (id: string) => {
    setServers((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeServerId === id && filtered.length > 0) {
        setActiveServerId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Ping all servers with real measurement
  const handlePingAll = async () => {
    setIsPinging(true);
    try {
      const realLatency = await measureRealPing();
      if (realLatency <= 0) return;
      setServers((prev) =>
        prev.map((s) => (s.id === activeServerId ? { ...s, latency: realLatency } : s))
      );
      setTelemetry((prev) => ({
        ...prev,
        pingMs: realLatency,
      }));
    } catch {
      // fallback
    } finally {
      setIsPinging(false);
    }
  };

  // Reset to default servers
  const handleResetServers = () => {
    const defaults = getInitialServers();
    setServers(defaults);
    setActiveServerId(defaults[0].id);
  };

  // Open config export for a specific server
  const handleOpenExport = (server?: WireguardServer) => {
    setServerForExport(server || activeServer);
    setIsConfigExportOpen(true);
  };

  // Quick activate Baly server handler
  const handleQuickActivateBaly = () => {
    // Check if baly server exists in servers list
    let balyServer = servers.find((s) => s.name.toLowerCase().includes('bally') || s.name.toLowerCase().includes('بلي') || s.rawUri?.includes('BALLY'));
    if (!balyServer) {
      balyServer = parseWireguardUri(USER_DEFAULT_URI);
      balyServer.name = 'SELOOM1-WARP BALLY (خطوط أودي)';
      setServers((prev) => [balyServer!, ...prev]);
    }
    setActiveServerId(balyServer.id);
    if (connectionState === 'connected') {
      void VpnBridge.disconnect().catch(() => undefined);
      setConnectionState('disconnected');
    }
  };

  const isBalyActive = activeServer.name.toLowerCase().includes('bally') || activeServer.name.toLowerCase().includes('بلي') || activeServer.rawUri?.includes('BALLY');

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#060814] text-slate-100 flex flex-col items-center justify-between overflow-hidden selection:bg-cyan-500 selection:text-black">
      <div className="fixed inset-0 bg-[url('/assets/oodi-user-background.jpg')] bg-cover bg-center bg-no-repeat" aria-hidden="true" />
      <div className="fixed inset-0 bg-[#030014]/35" aria-hidden="true" />

      {/* Main Single-Screen Full-View Frame - No Scrolling Needed */}
      <main className="relative w-full max-w-md mx-auto h-full flex flex-col justify-between px-3.5 py-1 z-10">
        {/* Top Header & Mobile Status Bar */}
        <Header
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          serverCount={servers.length}
        />

        {/* Central Power Switch button and status pill */}
        <PowerSwitch
          connectionState={connectionState}
          onToggle={handleToggleConnection}
          serverName={activeServer.name}
        />

        {/* Baly App Oodi Integration Card */}
        <BalyBadge
          isBalyActive={isBalyActive}
        >
          <StatsCard
            telemetry={telemetry}
            isConnected={connectionState === 'connected'}
            onRefreshPing={refreshRealPing}
            isPinging={isPinging}
          />
          <DeviceInfoBar
            externalIp={settings.externalIp}
            country={settings.country || 'العراق'}
            countryFlag={settings.countryFlag || '🇮🇶'}
            isConnected={connectionState === 'connected'}
            totalBytes={telemetry.uploadBytes + telemetry.downloadBytes}
            cellularInfo={cellularInfo}
            onRefreshCellular={() => { void readCellularInfo().then(setCellularInfo); }}
            onRefreshIp={refreshRealIp}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenShizzi={() => {
              void ShizziBridge.open().catch(() => {
                void ShizziBridge.openShizuku().catch(() => undefined);
              });
            }}
            isLoadingIp={isLoadingIp}
            isLoadingCellular={isLoadingCellular}
          />
        </BalyBadge>

        {/* Server & Network Controls Group */}
        <div className="flex flex-col gap-1.5 w-full my-auto">
          <button type="button" onClick={() => setIsAppExclusionsOpen(true)} className="-translate-y-1 mb-0.5 flex w-full items-center justify-between rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/70 px-3 py-2 text-[10px] font-bold text-fuchsia-300 shadow-lg shadow-fuchsia-950/20 hover:bg-fuchsia-900/70 transition-colors" dir="rtl">
            <span className="flex items-center gap-2"><ShieldOff className="h-4 w-4 text-fuchsia-400" /><span>استثناء التطبيقات من VPN</span></span>
            <span className="rounded-full bg-fuchsia-400/80 px-2 py-0.5 text-[9px] font-black text-slate-950">{settings.excludedApplications.length}</span>
          </button>
          {/* Telegram Channel & Developer Bar */}
          <TelegramBanner />
        </div>

        {/* Bottom Compact Footer with Waves & Developer Tag */}
        <Footer />
      </main>

      {/* Modals & Slide-out Drawers */}
      <AddServerModal
        isOpen={isAddServerOpen}
        onClose={() => setIsAddServerOpen(false)}
        onAddServer={handleAddServer}
      />

      <ServerListModal
        isOpen={isServerListOpen}
        onClose={() => setIsServerListOpen(false)}
        servers={servers}
        activeServerId={activeServer.id}
        onSelectServer={handleSelectServer}
        onOpenAddServer={() => setIsAddServerOpen(true)}
        onExportConfig={(srv) => handleOpenExport(srv)}
        onDeleteServer={handleDeleteServer}
        onPingAll={handlePingAll}
        isPinging={isPinging}
      />

      <ConfigExportModal
        isOpen={isConfigExportOpen}
        onClose={() => setIsConfigExportOpen(false)}
        server={serverForExport}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onResetServers={handleResetServers}
      />

      <ConnectionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        entries={connectionLogs}
        onClear={clearConnectionLogs}
      />

      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenServers={() => setIsServerListOpen(true)}
        onOpenAddServer={() => setIsAddServerOpen(true)}
        onOpenExport={() => handleOpenExport(activeServer)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAppExclusions={() => setIsAppExclusionsOpen(true)}
        onOpenShizzi={() => {
          void ShizziBridge.open().catch(() => {
            void ShizziBridge.openShizuku().catch(() => undefined);
          });
        }}
        onOpenShizziPermissions={() => {
          void ShizziBridge.requestBatteryExemption().catch(() => {
            void ShizziBridge.open();
          });
        }}
        excludedAppsCount={settings.excludedApplications.length}
        isConnected={connectionState === 'connected'}
      />

      <AppExclusionsModal
        isOpen={isAppExclusionsOpen}
        onClose={() => setIsAppExclusionsOpen(false)}
        applications={installedApplications}
        selectedPackages={settings.excludedApplications}
        onSave={(packages) => setSettings((current) => ({ ...current, excludedApplications: packages }))}
      />

    </div>
  );
}
