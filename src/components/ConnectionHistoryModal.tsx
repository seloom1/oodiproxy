import React from 'react';
import { X, Clock3, ArrowUp, ArrowDown, Trash2, WifiOff } from 'lucide-react';
import { ConnectionLogEntry } from '../types';
import { formatBytes, formatDuration } from '../utils/wireguard';

interface ConnectionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ConnectionLogEntry[];
  onClear: () => void;
}

const formatDateTime = (timestamp: number) => new Intl.DateTimeFormat('ar-IQ', {
  dateStyle: 'short',
  timeStyle: 'medium',
}).format(new Date(timestamp));

export const ConnectionHistoryModal: React.FC<ConnectionHistoryModalProps> = ({
  isOpen, onClose, entries, onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[82vh] overflow-hidden rounded-3xl bg-[#080d24] border border-cyan-500/30 shadow-2xl text-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-white">سجل بيانات الاتصال</h2>
              <p className="text-[10px] text-slate-400">المدة والرفع والتحميل لكل جلسة</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onClear} disabled={entries.length === 0} className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1" aria-label="حذف سجل البيانات" title="حذف السجل">
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف السجلات</span>
              </button>
              <Clock3 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-2">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">لا توجد جلسات مسجلة بعد</div>
          ) : entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-rose-300">انتهت جلسة الاتصال</span>
                <WifiOff className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 text-[10px] text-slate-400 font-mono" dir="ltr">{formatDateTime(entry.timestamp)}</div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="rounded-lg bg-slate-950/70 p-1.5"><div className="text-slate-500">المدة</div><div className="text-slate-200 font-mono">{formatDuration(entry.durationSeconds)}</div></div>
                <div className="rounded-lg bg-slate-950/70 p-1.5"><div className="text-slate-500 flex items-center justify-center gap-1"><ArrowUp className="w-3 h-3" />الرفع</div><div className="text-emerald-300 font-mono">{formatBytes(entry.uploadBytes)}</div></div>
                <div className="rounded-lg bg-slate-950/70 p-1.5"><div className="text-slate-500 flex items-center justify-center gap-1"><ArrowDown className="w-3 h-3" />التحميل</div><div className="text-cyan-300 font-mono">{formatBytes(entry.downloadBytes)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
