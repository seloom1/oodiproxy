import React, { useMemo, useState } from 'react';
import { Check, Search, ShieldOff, X } from 'lucide-react';
import { InstalledApp } from '../utils/vpnBridge';

interface AppExclusionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: InstalledApp[];
  selectedPackages: string[];
  onSave: (packages: string[]) => void;
}

export const AppExclusionsModal: React.FC<AppExclusionsModalProps> = ({ isOpen, onClose, applications, selectedPackages, onSave }) => {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<string[]>(selectedPackages);
  const selected = new Set(draft);

  React.useEffect(() => { if (isOpen) { setDraft(selectedPackages); setQuery(''); } }, [isOpen, selectedPackages]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return [...applications]
      .filter((app) => !normalized || app.label.toLocaleLowerCase().includes(normalized) || app.packageName.toLocaleLowerCase().includes(normalized))
      .sort((a, b) => Number(selected.has(b.packageName)) - Number(selected.has(a.packageName)) || a.label.localeCompare(b.label, 'ar'));
  }, [applications, query, draft]);

  if (!isOpen) return null;
  const toggle = (packageName: string) => setDraft((current) => current.includes(packageName) ? current.filter((item) => item !== packageName) : [...current, packageName]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm" dir="rtl">
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-cyan-400/30 bg-[#070d20] shadow-2xl shadow-cyan-950/50">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          <div className="flex items-center gap-2"><div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-300"><ShieldOff className="h-5 w-5" /></div><div><h2 className="font-black text-white">استثناء التطبيقات من VPN</h2><p className="text-[10px] text-slate-400">{draft.length} تطبيق مستثنى</p></div></div>
        </div>
        <div className="border-b border-slate-800 p-3"><div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2"><Search className="h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن تطبيق..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></div></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">لا توجد تطبيقات مطابقة</p> : filtered.map((app) => {
            const isSelected = selected.has(app.packageName);
            return <button key={app.packageName} onClick={() => toggle(app.packageName)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-2 text-right transition-colors ${isSelected ? 'border border-cyan-400/35 bg-cyan-400/10' : 'border border-transparent hover:bg-slate-800/70'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${isSelected ? 'border-cyan-300 bg-cyan-400 text-slate-950' : 'border-slate-700 text-transparent'}`}><Check className="h-4 w-4" /></span>
              {app.icon ? <img src={app.icon} alt="" className="h-10 w-10 rounded-xl bg-slate-800 object-cover" /> : <div className="h-10 w-10 rounded-xl bg-slate-800" />}
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-100">{app.label}</span><span className="block truncate text-[10px] text-slate-500" dir="ltr">{app.packageName}</span></span>
            </button>;
          })}
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-3"><button onClick={onClose} className="flex-1 rounded-2xl bg-slate-800 px-4 py-3 text-xs font-bold text-slate-300">إلغاء</button><button onClick={() => { onSave(draft); onClose(); }} className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-xs font-black text-white">حفظ الاستثناءات</button></div>
      </div>
    </div>
  );
};
