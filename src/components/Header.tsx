import React from 'react';
import { Menu, Settings, Cloud } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenMenu: () => void;
  serverCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenMenu,
}) => {
  return (
    <header className="relative w-full z-20 pt-2 pb-1.5 px-3 select-none">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between relative">
        {/* Left side: Hamburger menu button */}
        <button
          onClick={onOpenMenu}
          id="btn-menu-drawer"
          aria-label="Open navigation menu"
          className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: OODI PROXY SELOOM1 brand title */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              <Cloud className="w-6 h-6 text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full -z-10" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400">OODI PROXY SELOOM1</span>
            </h1>
          </div>
          <div className="text-[11px] font-bold text-cyan-300 tracking-wider">
            1.1.1.1 <span className="text-slate-300 font-medium">VPN PROXY</span>
          </div>
        </div>

        {/* Right side: settings only; server management is in the hamburger menu. */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            id="btn-settings"
            aria-label="Open settings"
            className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-200 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
