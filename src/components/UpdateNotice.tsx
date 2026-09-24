import React from 'react';
import { Bell, Download, X } from 'lucide-react';
import { AppUpdate, canOpenUpdate, formatUpdateDate, openUpdateUrl } from '../utils/updateService';

interface UpdateNoticeProps {
  update: AppUpdate | null;
  onDismiss: () => void;
}

export const UpdateNotice: React.FC<UpdateNoticeProps> = ({ update, onDismiss }) => {
  if (!update) return null;
  const canOpen = canOpenUpdate(update);
  const dateLabel = formatUpdateDate(update.publishedAt);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-sm rounded-3xl border border-cyan-400/30 bg-[#081124]/95 p-5 text-right shadow-2xl shadow-cyan-950/50">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300"><Bell className="h-6 w-6" /></div>
            <div>
              <p className="text-[11px] font-bold text-cyan-300">إشعار من التطبيق</p>
              <h2 className="text-lg font-black text-white">{update.title}</h2>
            </div>
          </div>
          {update.mandatory ? null : <button onClick={onDismiss} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="إغلاق"><X className="h-5 w-5" /></button>}
        </div>
        <p className="mb-3 text-sm leading-7 text-slate-200">{update.message}</p>
        <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
          <span>الإصدار {update.version}</span>
          {dateLabel && <span>{dateLabel}</span>}
        </div>
        <div className="flex gap-2">
          {canOpen && <button onClick={() => openUpdateUrl(update.url)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white active:scale-95"><Download className="h-4 w-4" /> فتح رابط التحديث</button>}
          {!update.mandatory && <button onClick={onDismiss} className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700">لاحقاً</button>}
        </div>
      </div>
    </div>
  );
};
