import React from 'react';
import { X, Settings, RotateCcw, Check, Globe, Shield, Wifi } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetServers: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetServers,
}) => {
  const [form, setForm] = React.useState<AppSettings>(settings);
  const [savedNotice, setSavedNotice] = React.useState(false);

  React.useEffect(() => {
    setForm(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(form);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const dnsOptions = [
    { label: 'Cloudflare (1.1.1.1)', value: '1.1.1.1' },
    { label: 'Google DNS (8.8.8.8)', value: '8.8.8.8' },
    { label: 'Quad9 DNS (9.9.9.9)', value: '9.9.9.9' },
    { label: 'AdGuard Ad-block (94.140.14.14)', value: '94.140.14.14' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
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
            <h2 id="settings-title" className="text-lg font-bold text-white tracking-wide">
              إعدادات التطبيق والشبكة
            </h2>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-0.5 pl-0.5">
          {/* DNS selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1.5">
              <span>خادم DNS الافتراضي</span>
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            </label>
            <select
              value={form.defaultDns}
              onChange={(e) => setForm({ ...form, defaultDns: e.target.value })}
              className="w-full bg-[#050816] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            >
              {dnsOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-right" dir="rtl">
            <div className="flex items-center justify-end gap-2 text-xs font-black text-cyan-200"><Wifi className="h-4 w-4" /> طريقة تشغيل NetShare</div>
            <p className="mt-2 text-[11px] leading-6 text-slate-300">هذه شبكة Wi‑Fi Direct افتراضية من نوع NetShare وليست Hotspot الهاتف. بعد بث الشبكة والاتصال بالهاتف المستلم للإنترنت، اذهب إلى إعدادات شبكة Wi‑Fi، واجعل الخادم الوكيل <b className="text-cyan-200">يدويًا</b>، ثم أضف الخادم الوكيل <b className="font-mono text-cyan-200">192.168.49.1</b> والبورت <b className="font-mono text-cyan-200">8282</b>. للتطبيقات التي تدعم SOCKS5 استخدم المنفذ <b className="font-mono text-cyan-200">8181</b>. إعدادات Hotspot الموجودة في القائمة لا تتأثر.</p>
          </div>

          {/* MTU & Keepalive */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
                <span>WireGuard MTU</span>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              </label>
              <input
                type="number"
                value={form.mtu}
                onChange={(e) => setForm({ ...form, mtu: parseInt(e.target.value, 10) || 1280 })}
                className="w-full bg-[#050816] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block text-left">افتراضي Cloudflare: 1280</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
                <span>Keepalive (ثانية)</span>
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
              </label>
              <input
                type="number"
                value={form.keepalive}
                onChange={(e) => setForm({ ...form, keepalive: parseInt(e.target.value, 10) || 25 })}
                className="w-full bg-[#050816] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block text-left">الموصى به: 25 ثانية</span>
            </div>
          </div>

          {/* Reset servers button */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                if (window.confirm('هل تريد استعادة قائمة الخوادم الافتراضية؟')) {
                  onResetServers();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الخوادم إلى الوضع الافتراضي</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            {savedNotice && (
              <>
                <Check className="w-4 h-4" />
                <span>تم حفظ الإعدادات</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-md transition-all active:scale-95"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
