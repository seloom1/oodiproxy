import React from 'react';
import { Database, Globe, MapPin, RefreshCw, Settings2, Wifi, Hexagon, Network } from 'lucide-react';
import { formatBytes } from '../utils/wireguard';

interface DeviceInfoBarProps {
  externalIp: string;
  country?: string;
  countryFlag?: string;
  isConnected: boolean;
  totalBytes: number;
  onRefreshIp?: () => void;
  onOpenHistory?: () => void;
  onOpenInternetSharing?: () => void;
  isLoadingIp?: boolean;
  sharingActive?: boolean;
  sharingDeviceCount?: number;
  sharingBytes?: number;
  sharingDownloadBytes?: number;
  sharingUploadBytes?: number;
  sharingTheme?: 'cyan' | 'violet' | 'green';
  onSharingThemeChange?: (theme: 'cyan' | 'violet' | 'green') => void;
}

export const DeviceInfoBar: React.FC<DeviceInfoBarProps> = ({
  externalIp,
  country = 'غير محددة',
  countryFlag = '🌐',
  isConnected,
  totalBytes,
  onRefreshIp,
  onOpenHistory,
  onOpenInternetSharing,
  isLoadingIp = false,
  sharingActive = false,
  sharingDeviceCount = 0,
  sharingBytes = 0,
  sharingDownloadBytes = 0,
  sharingUploadBytes = 0,
  sharingTheme = 'cyan',
  onSharingThemeChange,
}) => {
  const theme = sharingTheme === 'violet' ? { border: 'border-violet-400/40', bg: 'bg-violet-500/10', accent: 'text-violet-200', dot: 'bg-violet-400' } : sharingTheme === 'green' ? { border: 'border-emerald-400/40', bg: 'bg-emerald-500/10', accent: 'text-emerald-200', dot: 'bg-emerald-400' } : { border: 'border-cyan-400/40', bg: 'bg-cyan-500/10', accent: 'text-cyan-200', dot: 'bg-cyan-400' };
  return (
    <div className="w-full rounded-xl py-1.5 px-2 bg-[#090d24]/90 backdrop-blur-md border border-slate-800/80 text-right select-none">
      <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-800/80">
        <button type="button" onClick={onRefreshIp} title="تحديث عنوان IP الفعلي" className="flex items-center justify-center gap-1.5 min-w-0 px-1 hover:bg-slate-800/30 rounded-lg transition-colors">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="flex flex-col min-w-0 leading-tight">
            <span className="text-[8px] text-slate-500">IP الخارجي {isLoadingIp && <RefreshCw className="inline w-2.5 h-2.5 animate-spin" />}</span>
            <span className="text-[10px] text-slate-200 font-mono truncate">{isConnected ? externalIp : 'غير متصل'}</span>
          </span>
        </button>

        <div className="flex items-center justify-center gap-1.5 min-w-0 px-1" dir="rtl">
          <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
          <span className="text-[8px] text-slate-500">الدولة</span>
          <span className="text-[10px] font-bold text-slate-200 truncate">{isConnected ? country : 'غير محددة'}</span>
          <span className="text-base leading-none shrink-0" role="img" aria-label="علم الدولة">{isConnected ? countryFlag : '🌐'}</span>
        </div>
      </div>

      <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-center gap-2" dir="rtl">
        <Database className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
        <span className="text-[8px] text-slate-500">إجمالي البيانات</span>
        <span className="text-[11px] font-bold text-fuchsia-300 font-mono">{isConnected ? formatBytes(totalBytes) : '0 B'}</span>
        <button type="button" onClick={onOpenHistory} title="عرض السجلات السابقة" aria-label="عرض السجلات السابقة" className="mr-1 p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors">
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <button type="button" onClick={onOpenInternetSharing} className={`mt-1.5 w-full rounded-xl border ${theme.border} ${theme.bg} px-3 py-2 flex items-center justify-between text-[10px] font-bold ${theme.accent} hover:brightness-125 transition-colors`} dir="rtl">
        <span className="flex items-center gap-2"><Wifi className="w-4 h-4" /><span>مشاركة الإنترنت NetShare</span></span><span className={`h-2.5 w-2.5 rounded-full ${sharingActive ? theme.dot : 'bg-slate-600'}`} />
      </button>
      <div className={`mt-1.5 rounded-xl border ${theme.border} ${theme.bg} p-3`} dir="rtl">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="relative flex h-12 w-12 items-center justify-center"><Hexagon className={`absolute h-12 w-12 ${theme.accent} opacity-40`} strokeWidth={1.2} /><Network className={`relative h-6 w-6 ${theme.accent}`} /><span className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full ${theme.dot} px-1 text-[9px] font-black text-slate-950`}>{sharingDeviceCount}</span></div><div><span className="text-[10px] text-slate-400">عملاء الأجهزة المتصلة</span><div className={`text-2xl font-black leading-none ${theme.accent}`}>{sharingDeviceCount}</div></div></div><div className="text-left"><div className="text-[9px] text-slate-400">الاستخدام الكلي</div><div className="text-sm font-black text-fuchsia-200 font-mono">{formatBytes(sharingBytes)}</div></div></div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[9px]"><div className="rounded-lg bg-slate-950/40 p-1.5 text-center text-emerald-300">↓ تنزيل {formatBytes(sharingDownloadBytes)}</div><div className="rounded-lg bg-slate-950/40 p-1.5 text-center text-fuchsia-300">↑ رفع {formatBytes(sharingUploadBytes)}</div></div>
        <div className="mt-2 flex items-center justify-between"><span className="text-[8px] text-slate-500">ثيم البطاقة</span><div className="flex gap-1.5">{([['cyan', 'bg-cyan-400'], ['violet', 'bg-violet-400'], ['green', 'bg-emerald-400']] as const).map(([value, color]) => <button key={value} type="button" aria-label={`ثيم ${value}`} onClick={() => onSharingThemeChange?.(value)} className={`h-3.5 w-3.5 rounded-full ${color} ${sharingTheme === value ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-60'}`} />)}</div></div>
      </div>
    </div>
  );
};
