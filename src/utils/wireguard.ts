import { WireguardServer } from '../types';

export function formatTransferRate(kilobytesPerSecond: number): string {
  if (!Number.isFinite(kilobytesPerSecond) || kilobytesPerSecond <= 0) return '--';
  if (kilobytesPerSecond >= 1000) return `${(kilobytesPerSecond / 1024).toFixed(2)} MB/s`;
  return `${Math.round(kilobytesPerSecond)} KB/s`;
}

export const USER_DEFAULT_URI = `wireguard://98qlf4cSnq2VMmonjeWZI1dS1994IzfbR%2FfRdG%2FiCoE%3D@engage.cloudflareclient.com:2408?address=172.16.0.2%2F32%2C2606%3A4700%3A110%3A8d70%3A8df1%3A6e3d%3A693b%3Aea40%2F128&publickey=bmXOC%2BF1FxEMF9dyiK2H5%2F1SUtzH0JuVo51h2wPfgyo%3D&privatekey=98qlf4cSnq2VMmonjeWZI1dS1994IzfbR%2FfRdG%2FiCoE%3D#SELOOM1-WARP%20BALLY%20`;

/**
 * Parses a wireguard:// URI string into a WireguardServer object
 */
export function parseWireguardUri(uriString: string): WireguardServer {
  const trimmed = uriString.trim();
  if (!trimmed.toLowerCase().startsWith('wireguard://')) {
    throw new Error('الرابط يجب أن يبدأ بـ wireguard:// (Must start with wireguard://)');
  }

  // Remove wireguard:// prefix
  let remaining = trimmed.substring('wireguard://'.length);

  // Extract hash/fragment for server name
  let name = 'Warp Cloudflare';
  const hashIdx = remaining.indexOf('#');
  if (hashIdx !== -1) {
    name = decodeURIComponent(remaining.substring(hashIdx + 1)).trim();
    remaining = remaining.substring(0, hashIdx);
  }

  // Extract query string
  let queryString = '';
  const queryIdx = remaining.indexOf('?');
  if (queryIdx !== -1) {
    queryString = remaining.substring(queryIdx + 1);
    remaining = remaining.substring(0, queryIdx);
  }

  // The remaining part is [userinfo@]host[:port]
  let userPrivate = '';
  let endpoint = remaining;

  const atIdx = remaining.lastIndexOf('@');
  if (atIdx !== -1) {
    userPrivate = decodeURIComponent(remaining.substring(0, atIdx));
    endpoint = remaining.substring(atIdx + 1);
  }

  // Parse endpoint into host and port
  let host = endpoint;
  let port = 2408;
  const colonIdx = endpoint.lastIndexOf(':');
  if (colonIdx !== -1) {
    host = endpoint.substring(0, colonIdx);
    const parsedPort = parseInt(endpoint.substring(colonIdx + 1), 10);
    if (!isNaN(parsedPort) && parsedPort > 0) {
      port = parsedPort;
    }
  }

  // Parse query params
  const params = new URLSearchParams(queryString);
  const privateKey = decodeURIComponent(params.get('privatekey') || params.get('private_key') || userPrivate);
  const publicKey = decodeURIComponent(params.get('publickey') || params.get('public_key') || 'bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=');

  const rawAddress = params.get('address') || '172.16.0.2/32, 2606:4700:110:8d70:8df1:6e3d:693b:ea40/128';
  const addresses = rawAddress
    .split(',')
    .map(a => decodeURIComponent(a).trim())
    .filter(Boolean);

  // Keep DNS IPv4-only by default. IPv6 DNS is opt-in for peers that
  // explicitly provide IPv6 routing and an IPv6 interface address.
  const rawDns = params.get('dns') || '1.1.1.1, 1.0.0.1';
  const dns = rawDns
    .split(',')
    .map(d => decodeURIComponent(d).trim())
    .filter(Boolean);

  const mtu = parseInt(params.get('mtu') || '1280', 10) || 1280;
  const keepalive = parseInt(params.get('keepalive') || params.get('persistentkeepalive') || '25', 10) || 25;

  // Keep IPv6 opt-in. Many mobile WireGuard peers are IPv4-only; routing
  // ::/0 to those peers can make IPv6-capable apps/sites appear offline.
  const rawAllowed = params.get('allowedips') || params.get('allowed_ips') || '0.0.0.0/0';
  const allowedIPs = rawAllowed
    .split(',')
    .map(a => decodeURIComponent(a).trim())
    .filter(Boolean);

  return {
    id: 'wg-' + Math.random().toString(36).substring(2, 9),
    name: name || 'Cloudflare WARP',
    rawUri: uriString,
    endpoint: `${host}:${port}`,
    host,
    port,
    privateKey: privateKey || '98qlf4cSnq2VMmonjeWZI1dS1994IzfbR/fRdG/iCoE=',
    publicKey,
    addresses: addresses.length ? addresses : ['172.16.0.2/32'],
    dns: dns.length ? dns : ['1.1.1.1'],
    mtu,
    persistentKeepalive: keepalive,
    allowedIPs,
    protocol: 'WireGuard',
    serverProvider: host.includes('cloudflare') ? 'Cloudflare' : 'WireGuard Node',
    latency: null,
    createdAt: Date.now()
  };
}

/**
 * Converts a WireguardServer into standard WireGuard .conf format
 */
export function generateWireguardConfig(server: WireguardServer): string {
  return `[Interface]
PrivateKey = ${server.privateKey}
Address = ${server.addresses.join(', ')}
DNS = ${server.dns.join(', ')}
MTU = ${server.mtu}

[Peer]
PublicKey = ${server.publicKey}
Endpoint = ${server.endpoint}
AllowedIPs = ${server.allowedIPs.join(', ')}
PersistentKeepalive = ${server.persistentKeepalive}
`;
}

/**
 * Builds a wireguard:// URI from a server object
 */
export function buildWireguardUri(server: WireguardServer): string {
  const encPriv = encodeURIComponent(server.privateKey);
  const encPub = encodeURIComponent(server.publicKey);
  const encAddr = encodeURIComponent(server.addresses.join(','));
  const encDns = encodeURIComponent(server.dns.join(','));
  const encName = encodeURIComponent(server.name);
  const encAllowed = encodeURIComponent(server.allowedIPs.join(','));

  return `wireguard://${encPriv}@${server.endpoint}?address=${encAddr}&publickey=${encPub}&privatekey=${encPriv}&dns=${encDns}&mtu=${server.mtu}&keepalive=${server.persistentKeepalive}&allowedips=${encAllowed}#${encName}`;
}

/**
 * Parses a standard WireGuard .conf INI string
 */
export function parseWireguardConf(confText: string, serverName = 'Imported WireGuard'): WireguardServer {
  const lines = confText.split('\n');
  let privateKey = '';
  let addresses: string[] = ['172.16.0.2/32'];
  let dns: string[] = ['1.1.1.1'];
  let mtu = 1280;
  let publicKey = '';
  let endpoint = 'engage.cloudflareclient.com:2408';
  let allowedIPs = ['0.0.0.0/0'];
  let persistentKeepalive = 25;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key = line.substring(0, eqIdx).trim().toLowerCase();
    const val = line.substring(eqIdx + 1).trim();

    switch (key) {
      case 'privatekey':
        privateKey = val;
        break;
      case 'address':
        addresses = val.split(',').map(s => s.trim()).filter(Boolean);
        break;
      case 'dns':
        dns = val.split(',').map(s => s.trim()).filter(Boolean);
        break;
      case 'mtu':
        mtu = parseInt(val, 10) || 1280;
        break;
      case 'publickey':
        publicKey = val;
        break;
      case 'endpoint':
        endpoint = val;
        break;
      case 'allowedips':
        allowedIPs = val.split(',').map(s => s.trim()).filter(Boolean);
        break;
      case 'persistentkeepalive':
        persistentKeepalive = parseInt(val, 10) || 25;
        break;
    }
  }

  let host = endpoint;
  let port = 2408;
  const colonIdx = endpoint.lastIndexOf(':');
  if (colonIdx !== -1) {
    host = endpoint.substring(0, colonIdx);
    port = parseInt(endpoint.substring(colonIdx + 1), 10) || 2408;
  }

  const server: WireguardServer = {
    id: 'wg-' + Math.random().toString(36).substring(2, 9),
    name: serverName,
    rawUri: '',
    endpoint,
    host,
    port,
    privateKey,
    publicKey,
    addresses,
    dns,
    mtu,
    persistentKeepalive,
    allowedIPs,
    protocol: 'WireGuard',
    serverProvider: host.includes('cloudflare') ? 'Cloudflare' : 'Custom Server',
    latency: null,
    createdAt: Date.now()
  };

  server.rawUri = buildWireguardUri(server);
  return server;
}

/**
 * Downloads a wireguard .conf file directly in browser
 */
export function downloadConfFile(server: WireguardServer) {
  const content = generateWireguardConfig(server);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = server.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'wireguard';
  a.download = `${safeName}.conf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Initial predefined servers list
 */
export function getInitialServers(): WireguardServer[] {
  // First item is the exact user provided link parsed!
  const userServer = parseWireguardUri(USER_DEFAULT_URI);
  userServer.id = 'wg-baly-oodi-primary';
  userServer.name = 'SELOOM1-WARP BALLY (خطوط أودي)';
  userServer.serverProvider = 'Baly Oodi Fast Tunnel';
  userServer.latency = null;

  const warpIp1: WireguardServer = {
    ...parseWireguardUri(USER_DEFAULT_URI),
    id: 'wg-cf-anycast-1',
    name: 'Warp Fast Anycast (162.159.192.1)',
    endpoint: '162.159.192.1:2408',
    host: '162.159.192.1',
    port: 2408,
    latency: null,
    serverProvider: 'Cloudflare Edge',
    createdAt: Date.now() - 100000
  };

  const warpIp2: WireguardServer = {
    ...parseWireguardUri(USER_DEFAULT_URI),
    id: 'wg-cf-anycast-2',
    name: 'Warp Direct IP (162.159.193.1)',
    endpoint: '162.159.193.1:2408',
    host: '162.159.193.1',
    port: 2408,
    latency: null,
    serverProvider: 'Cloudflare Edge',
    createdAt: Date.now() - 200000
  };

  return [userServer, warpIp1, warpIp2];
}

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format seconds into HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
