export interface RemoteUpdateManifest {
  version: string;
  title?: string;
  message?: string;
  url?: string;
  publishedAt?: string;
  mandatory?: boolean;
}

export interface AppUpdate {
  version: string;
  title: string;
  message: string;
  url: string;
  publishedAt?: string;
  mandatory: boolean;
}

export const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/seloom1/oodiproxy/main/updates.json';
export const CURRENT_APP_VERSION = '2.0';
export const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const LAST_SEEN_UPDATE_KEY = 'oodi_last_update_version_v1';

function compareVersions(a: string, b: string): number {
  const left = a.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = b.split('.').map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] || 0) - (right[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export async function checkForAppUpdate(): Promise<AppUpdate | null> {
  if (UPDATE_MANIFEST_URL.includes('USERNAME/REPOSITORY')) return null;
  const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Update check failed: ${response.status}`);
  const remote = (await response.json()) as RemoteUpdateManifest;
  if (!remote?.version || compareVersions(remote.version, CURRENT_APP_VERSION) <= 0) return null;
  return {
    version: remote.version,
    title: remote.title || `تحديث جديد متوفر (${remote.version})`,
    message: remote.message || 'يتوفر إصدار جديد من التطبيق.',
    url: remote.url || '',
    publishedAt: remote.publishedAt,
    mandatory: Boolean(remote.mandatory),
  };
}

export function shouldShowUpdate(version: string): boolean {
  try { return localStorage.getItem(LAST_SEEN_UPDATE_KEY) !== version; } catch { return true; }
}

export function markUpdateAsSeen(version: string): void {
  try { localStorage.setItem(LAST_SEEN_UPDATE_KEY, version); } catch { /* ignore */ }
}

export function isSafeExternalUrl(url: string): boolean {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' || parsed.protocol === 'http:'; } catch { return false; }
}

export function openUpdateUrl(url: string): void {
  if (isSafeExternalUrl(url)) window.open(url, '_blank', 'noopener,noreferrer');
}

export function formatUpdateDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('ar-IQ', { dateStyle: 'medium' }).format(date);
}

export function updateConfigIsReady(): boolean {
  return !UPDATE_MANIFEST_URL.includes('USERNAME/REPOSITORY');
}

export function getLastSeenUpdateVersion(): string | null {
  try { return localStorage.getItem(LAST_SEEN_UPDATE_KEY); } catch { return null; }
}

export function getCurrentVersionLabel(): string { return `الإصدار الحالي ${CURRENT_APP_VERSION}`; }
export function getUpdateVersionLabel(update: AppUpdate): string { return `الإصدار ${update.version}`; }
export function getUpdateDateLabel(update: AppUpdate): string | null { return formatUpdateDate(update.publishedAt); }
export function canOpenUpdate(update: AppUpdate): boolean { return isSafeExternalUrl(update.url); }
export function isUpdateDismissible(update: AppUpdate): boolean { return !update.mandatory; }
export function isUpdateAvailable(update: AppUpdate | null): update is AppUpdate { return Boolean(update); }
export function getUpdateStorageKey(): string { return LAST_SEEN_UPDATE_KEY; }
export function getUpdateManifestUrl(): string { return UPDATE_MANIFEST_URL; }
export function getUpdateInterval(): number { return UPDATE_CHECK_INTERVAL_MS; }
export function getAppVersion(): string { return CURRENT_APP_VERSION; }
export function clearSeenUpdate(): void { try { localStorage.removeItem(LAST_SEEN_UPDATE_KEY); } catch { /* ignore */ } }
export function resetUpdateNotice(): void { clearSeenUpdate(); }
