import React from 'react';

interface CosmicGlobeBackgroundProps {
  isConnected: boolean;
}

export const CosmicGlobeBackground: React.FC<CosmicGlobeBackgroundProps> = ({ isConnected }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Deep cosmic background radial lighting */}
      <div 
        className={`absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[110px] transition-all duration-1000 ${
          isConnected 
            ? 'bg-gradient-to-b from-cyan-600/30 via-blue-600/20 to-fuchsia-600/25 opacity-100' 
            : 'bg-gradient-to-b from-blue-900/20 via-slate-800/10 to-transparent opacity-60'
        }`} 
      />

      {/* Wireframe Digital Earth Globe Graphic */}
      <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px]">
        <svg 
          viewBox="0 0 400 400" 
          className={`w-full h-full transition-all duration-1000 ${
            isConnected ? 'opacity-90 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 'opacity-40'
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="globeAtmosphere" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.0" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
            </radialGradient>
            
            <linearGradient id="networkLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="orbitRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Globe Atmosphere Fill */}
          <circle cx="200" cy="200" r="180" fill="url(#globeAtmosphere)" />

          {/* Outer Ring */}
          <circle cx="200" cy="200" r="180" stroke="url(#networkLineGrad)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="200" cy="200" r="175" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />

          {/* Latitude Lines */}
          <ellipse cx="200" cy="200" rx="180" ry="140" stroke="#0ea5e9" strokeWidth="0.6" opacity="0.35" />
          <ellipse cx="200" cy="200" rx="180" ry="90" stroke="#38bdf8" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="180" ry="40" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="#22d3ee" strokeWidth="0.8" opacity="0.45" />

          {/* Longitude Lines */}
          <ellipse cx="200" cy="200" rx="140" ry="180" stroke="#3b82f6" strokeWidth="0.6" opacity="0.35" />
          <ellipse cx="200" cy="200" rx="90" ry="180" stroke="#60a5fa" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="40" ry="180" stroke="#818cf8" strokeWidth="0.7" opacity="0.35" />
          <line x1="200" y1="20" x2="200" y2="380" stroke="#a855f7" strokeWidth="0.8" opacity="0.4" />

          {/* Digital Network Mesh Nodes (Connected dots) */}
          <g className={isConnected ? "animate-pulse" : ""}>
            <circle cx="130" cy="110" r="3" fill="#22d3ee" />
            <circle cx="270" cy="110" r="2.5" fill="#a855f7" />
            <circle cx="160" cy="250" r="3.5" fill="#38bdf8" />
            <circle cx="240" cy="270" r="3" fill="#ec4899" />
            <circle cx="90" cy="190" r="2.5" fill="#00f5ff" />
            <circle cx="310" cy="190" r="3" fill="#818cf8" />
            <circle cx="200" cy="60" r="2.5" fill="#22d3ee" />
            <circle cx="200" cy="340" r="2.5" fill="#d946ef" />

            {/* Connecting Mesh Lines */}
            <path d="M130 110 L200 60 L270 110 L310 190 L240 270 L200 340 L160 250 L90 190 Z" 
              stroke="url(#networkLineGrad)" 
              strokeWidth="0.7" 
              strokeDasharray="2 4"
              opacity="0.45" 
            />
            <path d="M130 110 L160 250 M270 110 L240 270 M90 190 L310 190" 
              stroke="#06b6d4" 
              strokeWidth="0.5" 
              opacity="0.3" 
            />
          </g>

          {/* Upper Outer Orbit Ring */}
          <ellipse 
            cx="200" 
            cy="120" 
            rx="195" 
            ry="45" 
            stroke="url(#orbitRingGrad)" 
            strokeWidth="1.2" 
            opacity="0.6"
            strokeDasharray="4 6"
          />
        </svg>
      </div>

      {/* Bottom glowing cyber waves */}
      <div className="absolute bottom-0 left-0 w-64 h-48 bg-cyan-600/10 rounded-full blur-[90px]" />
      <div className="absolute bottom-0 right-0 w-64 h-48 bg-fuchsia-600/10 rounded-full blur-[90px]" />

      {/* Cyber grid lines along bottom */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-[linear-gradient(to_top,#050814,transparent)]" />
    </div>
  );
};
