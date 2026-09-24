import { registerPlugin } from '@capacitor/core';

export interface SharingConfig {
  ssid: string;
  password: string;
  band: 'auto' | '2ghz' | '5ghz';
  ipv6: boolean;
  proxyHost: string;
  proxyPort: number;
  shareVpn: boolean;
}

export interface SharingDevice {
  id: string;
  name: string;
  address: string;
  connectedAt: number;
  bytes: number;
  downloadBytes?: number;
  uploadBytes?: number;
}

export interface SharingStatus {
  active: boolean;
  supported: boolean;
  ssid: string;
  proxyHost: string;
  proxyPort: number;
  devices: SharingDevice[];
  downloadBytes: number;
  uploadBytes: number;
  ipv6?: boolean;
  message?: string;
}

export interface InternetSharingPlugin {
  getStatus(): Promise<SharingStatus>;
  start(config: SharingConfig): Promise<SharingStatus>;
  stop(): Promise<SharingStatus>;
}

const InternetSharing = registerPlugin<InternetSharingPlugin>('InternetSharing', {
  web: {
    getStatus: async () => ({
      active: false,
      supported: false,
      ssid: '',
      proxyHost: '192.168.49.1',
      proxyPort: 8282,
      devices: [],
      downloadBytes: 0,
      uploadBytes: 0,
      message: 'ميزة بث الإنترنت تحتاج نسخة Android الأصلية من التطبيق.',
    }),
    start: async () => ({
      active: false,
      supported: false,
      ssid: '',
      proxyHost: '192.168.49.1',
      proxyPort: 8282,
      devices: [],
      downloadBytes: 0,
      uploadBytes: 0,
      message: 'لا يمكن تشغيل بث الإنترنت من المتصفح.',
    }),
    stop: async () => ({
      active: false,
      supported: false,
      ssid: '',
      proxyHost: '192.168.49.1',
      proxyPort: 8282,
      devices: [],
      downloadBytes: 0,
      uploadBytes: 0,
    }),
  },
});

export default InternetSharing;
