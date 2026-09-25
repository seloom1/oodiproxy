import { registerPlugin } from '@capacitor/core';

export interface ShizziStatus {
  installed: boolean;
  running: boolean;
  permissionGranted: boolean;
  uid: number;
}

interface ShizziBridgePlugin {
  status(): Promise<ShizziStatus>;
  batteryStatus(): Promise<{ exempt: boolean }>;
  requestBatteryExemption(): Promise<void>;
  open(): Promise<void>;
  openShizuku(): Promise<void>;
}

const ShizziBridge = registerPlugin<ShizziBridgePlugin>('ShizziBridge');

export default ShizziBridge;
