import React from 'react';
import { Cloud, Shield, Globe, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import { WireguardServer } from '../types';

interface ServerCardProps {
  server: WireguardServer;
  onOpenServerList: () => void;
  isRtl?: boolean;
}

export const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onOpenServerList,
  isRtl = true,
}) => {
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;
  const primaryDns = server.dns && server.dns.length > 0 ? server.dns[0] : '1.1.1.1';

  return (
    <div 
      onClick={onOpenServerList}
      id="card-active-server"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenServerList()}
      className="relative w-full rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/50 via-blue-500/40 to-fuchsia-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer group active:scale-[0.99] select-none"
    >
      {/* Card Inner Background */}
      <div className="w-full bg-[#090d24]/90 backdrop-blur-md rounded-[15px] p-2.5 sm:p-3 flex flex-col gap-2">
        {/* Top row: Cloud icon, Server Name, Endpoint, and Chevron arrow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Cloudflare/Cloud Icon Squircle */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-fuchsia-600/30 border border-cyan-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
            </div>

            {/* Server details */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide truncate max-w-[180px] sm:max-w-[240px]">
                  {server.name || 'Warp'}
                </span>
                {server.latency && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    {server.latency} ms
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-300/80 font-mono tracking-tight truncate max-w-[200px] sm:max-w-[260px]">
                {server.endpoint}
              </span>
            </div>
          </div>

          {/* Chevron Navigation Indicator */}
          <div className="p-0.5 rounded-lg text-slate-400 group-hover:text-cyan-400 transition-colors">
            <ChevronIcon className="w-5 h-5" />
          </div>
        </div>

        {/* 3 info chips: Protocol, DNS, Server */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {/* Protocol */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-md bg-slate-900/40 border border-slate-800/60">
            <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="text-right sm:text-center">
              <div className="text-[9px] text-slate-400 leading-tight">Protocol</div>
              <div className="text-[11px] font-bold text-slate-200 leading-tight">{server.protocol}</div>
            </div>
          </div>

          {/* DNS */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-md bg-slate-900/40 border border-slate-800/60">
            <Globe className="w-3 h-3 text-blue-400 shrink-0" />
            <div className="text-right sm:text-center">
              <div className="text-[9px] text-slate-400 leading-tight">DNS</div>
              <div className="text-[11px] font-bold text-slate-200 font-mono leading-tight">{primaryDns}</div>
            </div>
          </div>

          {/* Server Provider */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-md bg-slate-900/40 border border-slate-800/60">
            <Server className="w-3 h-3 text-fuchsia-400 shrink-0" />
            <div className="text-right sm:text-center">
              <div className="text-[9px] text-slate-400 leading-tight">Server</div>
              <div className="text-[11px] font-bold text-slate-200 truncate leading-tight">{server.serverProvider || 'Cloudflare'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
