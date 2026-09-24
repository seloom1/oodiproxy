import React from 'react';
import { X, Server, Plus, QrCode, Settings, Settings2, Activity, ExternalLink, Cloud, ShieldOff } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenServers: () => void;
  onOpenAddServer: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenHotspotSettings: () => void;
  onOpenAppExclusions: () => void;
  excludedAppsCount: number;
  isConnected: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenServers,
  onOpenAddServer,
  onOpenExport,
  onOpenSettings,
  onOpenHotspotSettings,
  onOpenAppExclusions,
  excludedAppsCount,
  isConnected,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xs bg-[#070b1e] border-l border-slate-800 h-full p-5 flex flex-col text-right shadow-2xl relative animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <span className="text-base font-black text-white">OODI PROXY SELOOM1</span>
              <span className="text-[10px] text-cyan-400 font-mono">WireGuard & WARP</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Connection status banner */}
        <div className="my-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
          <span className={`text-xs font-bold ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isConnected ? 'متصل بنفق مشفر' : 'غير متصل'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300">حالة النفق:</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => {
              onClose();
              onOpenServers();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-slate-500 text-[10px]">إدارة</span>
            <div className="flex items-center gap-2.5">
              <span>قائمة السيرفرات</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAddServer();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-cyan-400 text-[10px] bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">جديد</span>
            <div className="flex items-center gap-2.5">
              <span>إضافة خادم WireGuard</span>
              <Plus className="w-4 h-4 text-cyan-400" />
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenExport();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-slate-500 text-[10px]">.conf / QR</span>
            <div className="flex items-center gap-2.5">
              <span>تصدير الإعدادات الرسمية</span>
              <QrCode className="w-4 h-4 text-blue-400" />
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-slate-500 text-[10px]">DNS / MTU</span>
            <div className="flex items-center gap-2.5">
              <span>الإعدادات والشبكة</span>
              <Settings className="w-4 h-4 text-fuchsia-400" />
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenHotspotSettings();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-slate-500 text-[10px]">VPN / Proxy</span>
            <div className="flex items-center gap-2.5">
              <span>إعدادات بث الإنترنت Hotspot</span>
              <Settings2 className="w-4 h-4 text-cyan-400" />
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAppExclusions();
            }}
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-fuchsia-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="rounded-full bg-fuchsia-400 px-2 py-0.5 text-[10px] font-black text-slate-950">{excludedAppsCount}</span>
            <div className="flex items-center gap-2.5">
              <span>استثناء التطبيقات من VPN</span>
              <ShieldOff className="w-4 h-4 text-fuchsia-400" />
            </div>
          </button>

          <a
            href="https://t.me/freevpsiraq"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-2.5">
              <span>قناة التليجرام: freevpsiraq</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </a>

          <a
            href="https://t.me/seloom1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3 rounded-xl hover:bg-slate-800/70 text-slate-200 hover:text-cyan-300 flex items-center justify-between text-xs font-bold transition-colors"
          >
            <span className="text-cyan-400 font-mono text-[11px]">@seloom1</span>
            <div className="flex items-center gap-2.5">
              <span>المطور (Developer)</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
          </a>
        </nav>

        {/* Drawer footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-bold">OODI PROXY SELOOM1</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">WireGuard Exclusive Client</div>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
