import React from 'react';
import { Shield, Send, CheckCircle2, Award } from 'lucide-react';
import { ProtocolType } from '../types';

interface ProtocolSelectorProps {
  selectedProtocol: ProtocolType;
  onSelectProtocol: (protocol: ProtocolType) => void;
}

export const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({
  selectedProtocol,
  onSelectProtocol,
}) => {
  const protocols: { id: ProtocolType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'WireGuard',
      label: 'WireGuard',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'VLESS',
      label: 'VLESS',
      icon: <Send className="w-3.5 h-3.5" />,
    },
    {
      id: 'VMess',
      label: 'VMess',
      icon: <span className="font-bold text-xs">V</span>,
    },
    {
      id: 'Trojan',
      label: 'Trojan',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full rounded-2xl p-3 bg-[#090d24]/80 backdrop-blur-md border border-slate-800/80 select-none">
      {/* Label */}
      <div className="text-right text-xs font-bold text-slate-300 mb-2.5 px-1">
        اختر البروتوكول
      </div>

      {/* Protocol pills row */}
      <div className="grid grid-cols-4 gap-2">
        {protocols.map((proto) => {
          const isSelected = selectedProtocol === proto.id;
          return (
            <button
              key={proto.id}
              onClick={() => onSelectProtocol(proto.id)}
              id={`btn-proto-${proto.id.toLowerCase()}`}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/40'
                  : 'bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {proto.icon}
              <span className="truncate">{proto.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
