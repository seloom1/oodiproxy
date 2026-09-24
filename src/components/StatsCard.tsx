import React from 'react';
import { Activity, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { formatDuration, formatTransferRate } from '../utils/wireguard';
import { NetworkTelemetry } from '../types';

interface StatsCardProps {
  telemetry: NetworkTelemetry;
  isConnected: boolean;
  onRefreshPing?: () => void;
  isPinging?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  telemetry,
  isConnected,
  onRefreshPing,
  isPinging = false,
}) => {
  return (
    <div className="w-full rounded-xl p-px bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-fuchsia-600/30 select-none">
      <div className="w-full bg-[#090d24]/90 backdrop-blur-md rounded-[11px] py-1.5 px-1 text-center">
        <div className="grid grid-cols-4 divide-x divide-x-reverse divide-slate-800/80">
          <div className="flex flex-col items-center justify-center px-0.5">
            <Clock className="w-3 h-3 text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 leading-tight">المدة</span>
            <span className="text-[11px] font-bold text-slate-100 font-mono leading-tight">
              {isConnected ? formatDuration(telemetry.durationSeconds) : '00:00:00'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-0.5">
            <ArrowUp className="w-3 h-3 text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 leading-tight">الرفع الفعلي</span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold leading-tight">
              {isConnected ? formatTransferRate(telemetry.uploadSpeedKBs) : '--'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-0.5">
            <ArrowDown className="w-3 h-3 text-cyan-400 mb-0.5" />
            <span className="text-[9px] text-slate-400 leading-tight">التحميل الفعلي</span>
            <span className="text-[11px] text-cyan-300 font-mono font-semibold leading-tight">
              {isConnected ? formatTransferRate(telemetry.downloadSpeedKBs) : '--'}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshPing}
            title="فحص زمن المرور عبر النفق"
            className="flex flex-col items-center justify-center px-0.5 cursor-pointer hover:bg-slate-800/40 rounded-lg transition-colors group"
          >
            <Activity className={`w-3 h-3 mb-0.5 ${isPinging ? 'text-yellow-400 animate-spin' : isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[9px] text-slate-400 leading-tight group-hover:text-slate-200">زمن النفق</span>
            <span className={`text-[11px] font-bold font-mono leading-tight ${!isConnected ? 'text-slate-500' : telemetry.pingMs < 60 && telemetry.pingMs > 0 ? 'text-emerald-400' : telemetry.pingMs < 120 && telemetry.pingMs > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
              {isConnected && telemetry.pingMs > 0 ? `${telemetry.pingMs} ms` : '--'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
