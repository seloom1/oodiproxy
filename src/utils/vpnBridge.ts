import { registerPlugin } from '@capacitor/core';

export interface InstalledApp {
  packageName: string;
  label: string;
  icon?: string;
}

export interface VpnConnectOptions {
  serverName: string;
  endpoint: string;
  dns?: string;
  address?: string;
  privateKey?: string;
  publicKey?: string;
  allowedIPs?: string;
  bypassLanRoute?: boolean;
  excludedApplications?: string[];
}

export interface VpnTrafficStats {
  connected: boolean;
  downloadBytes: number;
  uploadBytes: number;
  latestHandshakeEpochMs: number;
}

export interface VpnBridgePlugin {
  isVpnConnected(): Promise<{ connected: boolean }>;
  getTrafficStats(): Promise<VpnTrafficStats>;
  listApplications(): Promise<{ applications: InstalledApp[] }>;
  connect(options: VpnConnectOptions): Promise<{ status: string }>;
  disconnect(): Promise<{ status: string }>;
}

const VpnBridge = registerPlugin<VpnBridgePlugin>('VpnBridge', {
  web: {
    isVpnConnected: async () => ({ connected: false }),
    getTrafficStats: async () => ({ connected: false, downloadBytes: 0, uploadBytes: 0, latestHandshakeEpochMs: 0 }),
    listApplications: async () => ({ applications: [] }),
    connect: async () => ({ status: 'connected' }),
    disconnect: async () => ({ status: 'disconnected' }),
  },
});

export default VpnBridge;
