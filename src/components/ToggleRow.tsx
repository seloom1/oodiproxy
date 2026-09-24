import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

interface ToggleRowProps {
  dpiBypass: boolean;
  onToggleDpiBypass: () => void;
  autoReconnect: boolean;
  onToggleAutoReconnect: () => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  dpiBypass,
  onToggleDpiBypass,
  autoReconnect,
  onToggleAutoReconnect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 w-full select-none">
      {/* DPI Bypass Box */}
      <div 
        onClick={onToggleDpiBypass}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleDpiBypass()}
        className="flex items-center justify-between p-2 rounded-xl bg-[#090d24]/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-white tracking-wide">DPI Bypass</span>
            <span className="text-[10px] text-slate-400 truncate">تجاوز فحص الشبكة</span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div 
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0 p-0.5 ${
            dpiBypass ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-700'
          }`}
        >
          <div 
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
              dpiBypass ? 'translate-x-4' : 'translate-x-0'
            }`} 
          />
        </div>
      </div>

      {/* Auto Reconnect Box */}
      <div 
        onClick={onToggleAutoReconnect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleAutoReconnect()}
        className="flex items-center justify-between p-2 rounded-xl bg-[#090d24]/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex flex-col text-right leading-tight">
            <span className="text-xs font-bold text-white tracking-wide">Auto Reconnect</span>
            <span className="text-[10px] text-slate-400 truncate">إعادة الاتصال</span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div 
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0 p-0.5 ${
            autoReconnect ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-slate-700'
          }`}
        >
          <div 
            className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-md ${
              autoReconnect ? 'translate-x-4' : 'translate-x-0'
            }`} 
          />
        </div>
      </div>
    </div>
  );
};
