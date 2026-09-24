import React, { ReactNode } from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface BalyBadgeProps {
  isBalyActive?: boolean;
  children?: ReactNode;
}

export const BalyBadge: React.FC<BalyBadgeProps> = ({ isBalyActive, children }) => {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#031138]/95 via-[#05184d]/95 to-[#040f2e]/95 border border-blue-600/40 p-2 shadow-[0_4px_20px_rgba(3,17,56,0.7)] select-none backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div
          aria-label="حالة الخادم"
          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 pointer-events-none ${
            isBalyActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
              : 'bg-[#0038b8]/70 text-white border border-blue-400/30'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isBalyActive ? 'text-emerald-400 fill-emerald-400' : 'text-amber-300 fill-amber-300'}`} />
          <span>{isBalyActive ? 'الخادم نشط' : 'بلي'}</span>
        </div>

        <div className="flex-1 flex flex-col text-right min-w-0 pr-1">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[12px] font-bold text-white tracking-tight flex items-center gap-1">
              <span>تطبيق بلي (Baly)</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[9px] font-semibold border border-blue-400/30">Oodi 4G</span>
          </div>
          <p className="text-[10px] text-blue-200/90 font-medium leading-tight mt-0.5 truncate">يعمل على خطوط أودي بعد اختيار تطبيق بلي</p>
        </div>

        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(2,20,64,0.8)] border border-blue-500/60 bg-[#020b24] p-0.5 flex items-center justify-center shrink-0">
          <img src="/assets/bally.jpg" alt="شعار تطبيق بلي Baly" className="w-full h-full object-cover rounded-[10px] contrast-105 brightness-95" onError={(e) => { e.currentTarget.style.display = 'none'; const parent = e.currentTarget.parentElement; if (parent) parent.innerHTML = '<span class="text-white font-extrabold text-sm tracking-tighter">بلي</span>'; }} />
        </div>
      </div>
      {children && <div className="mt-1.5">{children}</div>}
    </div>
  );
};
