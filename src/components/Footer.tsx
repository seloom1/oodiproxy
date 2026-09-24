import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full py-1.5 px-3 text-center z-10 select-none">
      {/* Corner cyber neon glow waves */}
      <div className="absolute bottom-0 left-0 w-24 h-10 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 50" fill="none" className="w-full h-full">
          <path d="M0 50 Q 25 10, 50 35 T 100 10" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M0 40 Q 30 20, 60 40 T 100 20" stroke="#a855f7" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-24 h-10 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 50" fill="none" className="w-full h-full">
          <path d="M100 50 Q 75 10, 50 35 T 0 10" stroke="#d946ef" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M100 40 Q 70 20, 40 40 T 0 20" stroke="#3b82f6" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>

      {/* Footer copyright & channel */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[10px] font-semibold text-slate-400/80 tracking-wide flex items-center justify-center gap-1.5">
          <span>© 2025</span>
          <span className="text-slate-300 font-bold tracking-wider">SELOOM WARP</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-semibold">WireGuard</span>
          <span className="text-slate-500">•</span>
          <a 
            href="https://t.me/seloom1" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:text-cyan-300 font-mono tracking-tight hover:underline transition-colors font-bold"
          >
            @seloom1
          </a>
        </p>
      </div>
    </footer>
  );
};
