import React from 'react';
import { X, Plus, Check, Trash2, QrCode, Download, Copy, RefreshCw, Zap, Server } from 'lucide-react';
import { WireguardServer } from '../types';

interface ServerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: WireguardServer[];
  activeServerId: string;
  onSelectServer: (server: WireguardServer) => void;
  onOpenAddServer: () => void;
  onExportConfig: (server: WireguardServer) => void;
  onDeleteServer: (id: string) => void;
  onPingAll: () => void;
  isPinging: boolean;
}

export const ServerListModal: React.FC<ServerListModalProps> = ({
  isOpen,
  onClose,
  servers,
  activeServerId,
  onSelectServer,
  onOpenAddServer,
  onExportConfig,
  onDeleteServer,
  onPingAll,
  isPinging,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUri = (server: WireguardServer, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(server.rawUri);
    setCopiedId(server.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="server-list-title"
        className="relative w-full max-w-lg bg-[#080d24] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] max-h-[90vh] flex flex-col text-right overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <h2 id="server-list-title" className="text-lg font-bold text-white tracking-wide">
              قائمة خوادم WireGuard
            </h2>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action bar: active tunnel latency check and Add new */}
        <div className="flex items-center justify-between gap-2 my-3">
          <button
            onClick={onPingAll}
            disabled={isPinging}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'جارٍ الفحص...' : 'فحص زمن النفق النشط'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAddServer();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خادم جديد</span>
          </button>
        </div>

        {/* Server cards list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 pl-0.5">
          {servers.map((server) => {
            const isActive = server.id === activeServerId;
            return (
              <div
                key={server.id}
                onClick={() => onSelectServer(server)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectServer(server)}
                className={`w-full rounded-2xl p-3.5 border transition-all cursor-pointer group text-right ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left actions: QR, Export, Copy URI, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportConfig(server);
                      }}
                      title="عرض QR Code وملف .conf"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleCopyUri(server, e)}
                      title="نسخ رابط wireguard://"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      {copiedId === server.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {servers.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteServer(server.id);
                        }}
                        title="حذف الخادم"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Right info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 justify-end">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>الخادم النشط</span>
                        </span>
                      )}
                      <span className="text-sm font-bold text-white tracking-wide truncate">
                        {server.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-mono truncate" dir="ltr">
                        {server.endpoint}
                      </span>
                      {server.latency && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          <span>{server.latency} ms</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
