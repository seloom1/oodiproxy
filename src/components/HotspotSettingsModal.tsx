import React from 'react';
import { Check, Info, Router, Settings2, Wifi, X } from 'lucide-react';
import { AppSettings } from '../types';

interface HotspotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`relative w-10 h-5 rounded-full p-0.5 transition-colors ${checked ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,.45)]' : 'bg-slate-700'}`}>
    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export const HotspotSettingsModal: React.FC<HotspotSettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [form, setForm] = React.useState<AppSettings>(settings);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => setForm(settings), [settings, isOpen]);
  if (!isOpen) return null;

  const save = () => {
    onSaveSettings(form);
    setSaved(true);
    window.setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#080d24] border border-cyan-500/30 p-5 shadow-2xl text-right">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white" aria-label="إغلاق"><X className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><h2 className="text-base font-bold text-white">إعدادات بث الإنترنت Hotspot</h2><Settings2 className="w-5 h-5 text-cyan-400" /></div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <Toggle checked={form.bypassLanRoute} onChange={() => setForm({ ...form, bypassLanRoute: !form.bypassLanRoute })} label="Bypass LAN route VPN" />
              <div className="flex items-start gap-2 text-right"><div><h3 className="text-sm font-bold text-white">Bypass LAN route (VPN)</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-400">السماح بالوصول إلى أجهزة الشبكة المحلية مثل الراوتر والكاميرا عبر جدول التوجيه بدل تمريرها إلى المسار العام.</p></div><Router className="w-5 h-5 shrink-0 text-cyan-400" /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-500/25 bg-slate-900/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <Toggle checked={form.proxyTethering} onChange={() => setForm({ ...form, proxyTethering: !form.proxyTethering })} label="Proxy tethering" />
              <div className="flex items-start gap-2 text-right"><div><h3 className="text-sm font-bold text-white">Proxy tethering</h3><p className="mt-1 text-[11px] leading-relaxed text-slate-400">مشاركة اتصال VPN مع نقطة Wi‑Fi أو الشبكات المشتركة عبر Proxy. يمكن تفعيل الخيار قبل تشغيل نقطة الاتصال؛ لا يتطلب تشغيلها الآن.</p></div><Wifi className="w-5 h-5 shrink-0 text-fuchsia-400" /></div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-[10px] leading-relaxed text-blue-200"><Info className="w-4 h-4 shrink-0 text-blue-300" /><span>سيبقى Proxy tethering قابلًا للتفعيل بشكل طبيعي حتى إذا كانت نقطة الاتصال غير مفعلة.</span></div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">
          <span className="text-xs font-bold text-emerald-400">{saved && <span className="flex items-center gap-1"><Check className="w-4 h-4" />تم الحفظ</span>}</span>
          <div className="flex gap-2"><button onClick={onClose} className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-300">إلغاء</button><button onClick={save} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white">حفظ</button></div>
        </div>
      </div>
    </div>
  );
};
