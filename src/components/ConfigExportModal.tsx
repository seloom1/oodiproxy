import React, { useState } from 'react';
import { X, Download, Copy, Check, QrCode, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { WireguardServer } from '../types';
import { generateWireguardConfig, downloadConfFile } from '../utils/wireguard';

interface ConfigExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: WireguardServer | null;
}

export const ConfigExportModal: React.FC<ConfigExportModalProps> = ({
  isOpen,
  onClose,
  server,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'conf'>('qr');
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  if (!isOpen || !server) return null;

  const confString = generateWireguardConfig(server);

  const handleCopyConf = () => {
    navigator.clipboard.writeText(confString);
    setCopiedConf(true);
    setTimeout(() => setCopiedConf(false), 2000);
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(server.rawUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-config-title"
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
            <h2 id="export-config-title" className="text-lg font-bold text-white tracking-wide">
              تصدير إعدادات WireGuard
            </h2>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Server name chip */}
        <div className="my-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-cyan-400" dir="ltr">{server.endpoint}</span>
          <span className="font-bold text-white truncate max-w-[200px]">{server.name}</span>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 mb-3 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>رمز الاستجابة السريعة (QR Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('conf')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'conf'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ملف الإعدادات (.conf)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 pl-0.5">
          {activeTab === 'qr' ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              {/* QR Container with white background for perfect scanning */}
              <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <QRCodeSVG
                  value={confString}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <p className="text-xs text-slate-300 text-center max-w-sm">
                امسح الرمز بواسطة تطبيق <strong className="text-cyan-300">WireGuard</strong> الرسمي على هاتفك (Android / iOS) لإضافة الخادم والاتصال فورًا.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>تنسيق WireGuard الرسمي</span>
                <span className="font-mono text-cyan-400">wireguard.conf</span>
              </div>
              <pre
                dir="ltr"
                className="w-full bg-[#050816] border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 overflow-x-auto max-h-56 select-all"
              >
                {confString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUri}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUri ? 'تم النسخ' : 'نسخ رابط wireguard://'}</span>
            </button>

            <button
              onClick={handleCopyConf}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedConf ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copiedConf ? 'تم النسخ' : 'نسخ كود .conf'}</span>
            </button>
          </div>

          <button
            onClick={() => downloadConfFile(server)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف .conf</span>
          </button>
        </div>
      </div>
    </div>
  );
};
