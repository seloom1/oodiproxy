import React from 'react';
import { Send, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface TelegramBannerProps {
  isRtl?: boolean;
}

export const TelegramBanner: React.FC<TelegramBannerProps> = ({ isRtl = true }) => {
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {/* Telegram Channel Button */}
      <a
        href="https://t.me/freevpsiraq"
        target="_blank"
        rel="noopener noreferrer"
        id="btn-telegram-channel"
        className="w-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600/50 via-cyan-500/60 to-blue-600/50 block group transition-all active:scale-[0.99] shadow-sm"
      >
        <div className="w-full bg-[#081335]/90 hover:bg-[#0c1c4d]/90 backdrop-blur-md rounded-xl py-2 px-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform shrink-0">
              <Send className="w-4 h-4 text-white -translate-x-0.5 translate-y-0.5" />
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[11px] font-bold text-slate-100 group-hover:text-cyan-300">قناة التليكرام الرسمية</span>
              <span className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-200">t.me/freevpsiraq</span>
            </div>
          </div>

          <ChevronIcon className="w-4 h-4 text-cyan-400/80 group-hover:text-cyan-300 transition-transform" />
        </div>
      </a>

      {/* Developer Telegram Credit Badge */}
      <a
        href="https://t.me/seloom1"
        target="_blank"
        rel="noopener noreferrer"
        id="btn-telegram-developer"
        className="w-full rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 py-1.5 px-3 flex items-center justify-between text-xs transition-all group"
      >
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px] group-hover:text-cyan-300">
          <span>@seloom1</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 text-[11px]">
          <span className="font-semibold">المطور (Developer)</span>
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </a>
    </div>
  );
};

