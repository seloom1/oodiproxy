import React from 'react';
import { Power, Loader2 } from 'lucide-react';
import { ConnectionState } from '../types';

interface PowerSwitchProps {
  connectionState: ConnectionState;
  onToggle: () => void;
  serverName: string;
}

export const PowerSwitch: React.FC<PowerSwitchProps> = ({
  connectionState,
  onToggle,
}) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting' || connectionState === 'disconnecting';

  return (
    <div className="relative flex flex-col items-center justify-center my-0 z-20 select-none">
      {/* Outer Glow Halo */}
      <div 
        className={`absolute w-40 h-40 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          isConnected
            ? 'bg-gradient-to-tr from-cyan-500/35 via-blue-500/25 to-fuchsia-500/35 scale-105'
            : isConnecting
            ? 'bg-cyan-500/20 animate-pulse'
            : 'bg-slate-700/10 scale-90'
        }`}
      />

      {/* Center Power Button Outer Ring */}
      <button
        onClick={onToggle}
        disabled={isConnecting}
        id="btn-vpn-power-toggle"
        aria-label={isConnected ? "قطع الاتصال" : "الاتصال بالخادم"}
        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-transform active:scale-95 group focus:outline-none ${
          isConnecting ? 'cursor-wait' : 'cursor-pointer'
        }`}
      >
        {/* Animated Gradient Border Ring */}
        <div 
          className={`absolute inset-0 rounded-full p-[3px] transition-all duration-700 ${
            isConnected
              ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 shadow-[0_0_25px_rgba(6,182,212,0.5)]'
              : isConnecting
              ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 animate-spin'
              : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_0_12px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Inner dark circle button surface */}
          <div className="w-full h-full rounded-full bg-[#070b1e] flex items-center justify-center shadow-inner relative overflow-hidden">
            {/* Subtle gloss highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />

            {/* Pulsing ring inside button when connected */}
            {isConnected && (
              <div className="absolute inset-1.5 rounded-full border border-cyan-400/30 animate-ping opacity-20" />
            )}

            {/* Power Icon */}
            {isConnecting ? (
              <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
            ) : (
              <Power 
                className={`w-9 h-9 sm:w-10 sm:h-10 transition-all duration-500 ${
                  isConnected
                    ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`} 
                strokeWidth={2.5}
              />
            )}
          </div>
        </div>
      </button>

      {/* Status Pill Badge ("متصل" / "غير متصل") */}
      <div className="mt-1.5 flex flex-col items-center gap-0.5">
        <div 
          className={`px-6 py-1 rounded-full flex items-center gap-2 transition-all duration-500 shadow-md border ${
            isConnected
              ? 'bg-gradient-to-r from-cyan-950/80 via-blue-950/90 to-fuchsia-950/80 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : isConnecting
              ? 'bg-slate-900/80 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <span 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                : isConnecting
                ? 'bg-cyan-400 animate-ping'
                : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            }`} 
          />
          <span className="text-sm font-bold tracking-wide text-white">
            {isConnected ? 'متصل' : isConnecting ? 'جارٍ الاتصال...' : 'غير متصل'}
          </span>
        </div>

        {/* Subtitle status note */}
        <p className="text-[11px] text-slate-300 font-medium tracking-tight text-center">
          {isConnected 
            ? 'الإنترنت يعمل بشكل طبيعي' 
            : isConnecting 
            ? 'جاري إعداد نفق WireGuard المشفر...' 
            : 'اضغط على الزر لتشغيل خادم WireGuard'}
        </p>
      </div>
    </div>
  );
};
