export type ProtocolType = 'WireGuard' | 'VLESS' | 'VMess' | 'Trojan';

export interface WireguardServer {
  id: string;
  name: string;
  rawUri: string;
  endpoint: string;
  host: string;
  port: number;
  privateKey: string;
  publicKey: string;
  addresses: string[];
  dns: string[];
  mtu: number;
  persistentKeepalive: number;
  allowedIPs: string[];
  protocol: ProtocolType;
  serverProvider: string;
  latency?: number | null;
  isCustom?: boolean;
  createdAt: number;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

export interface AppSettings {
  dpiBypass: boolean;
  autoReconnect: boolean;
  bypassLanRoute: boolean;
  proxyTethering: boolean;
  externalIp: string;
  location: string;
  country?: string;
  countryFlag?: string;
  defaultDns: string;
  mtu: number;
  keepalive: number;
  excludedApplications: string[];
  language: 'ar' | 'en';
}

export interface NetworkTelemetry {
  durationSeconds: number;
  uploadBytes: number;
  downloadBytes: number;
  uploadSpeedKBs: number;
  downloadSpeedKBs: number;
  pingMs: number;
}

export interface ConnectionLogEntry {
  id: string;
  timestamp: number;
  durationSeconds: number;
  uploadBytes: number;
  downloadBytes: number;
}
