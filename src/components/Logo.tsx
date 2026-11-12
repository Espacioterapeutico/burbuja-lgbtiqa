import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Interlinked Translucent Iridescent Soap Bubbles */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform hover:scale-105`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          <defs>
            {/* Iridescent Rainbow Sheen Gradient for Soap Bubble 1 */}
            <linearGradient id="soapRainbow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.85" />
            </linearGradient>

            {/* Iridescent Rainbow Sheen Gradient for Soap Bubble 2 */}
            <linearGradient id="soapRainbow2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
            </linearGradient>

            {/* Soap Bubble Glass Fill (Transparent iridescent tint) */}
            <radialGradient id="bubbleGlass" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="85%" stopColor="#e879f9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
            </radialGradient>
          </defs>

          {/* Left Soap Bubble Sphere */}
          <circle
            cx="38"
            cy="48"
            r="28"
            fill="url(#bubbleGlass)"
            stroke="url(#soapRainbow1)"
            strokeWidth="3.5"
            className="backdrop-blur-[1px]"
          />
          {/* Left Soap Bubble Specular Light Reflection (Shine) */}
          <path
            d="M22 36 A 20 20 0 0 1 38 24"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
          <circle cx="25" cy="42" r="1.5" fill="#ffffff" fillOpacity="0.7" />

          {/* Right Interlinking Soap Bubble Sphere (Meeting & merging membrane) */}
          <circle
            cx="62"
            cy="52"
            r="28"
            fill="url(#bubbleGlass)"
            stroke="url(#soapRainbow2)"
            strokeWidth="3.5"
            style={{ mixBlendMode: 'screen' }}
          />
          {/* Right Soap Bubble Specular Light Reflection (Shine) */}
          <path
            d="M48 40 A 20 20 0 0 1 64 28"
            stroke="#ffffff"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
          <circle cx="75" cy="65" r="1.5" fill="#ffffff" fillOpacity="0.6" />

          {/* Intersection Shared Chain Link / Soap Film Boundary */}
          <ellipse
            cx="50"
            cy="50"
            rx="8"
            ry="22"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeOpacity="0.5"
            strokeDasharray="2 3"
          />

          {/* Tiny Floating Micro Soap Bubbles */}
          <circle cx="76" cy="22" r="4" fill="url(#bubbleGlass)" stroke="url(#soapRainbow1)" strokeWidth="1" />
          <circle cx="75" cy="21" r="1" fill="#fff" />

          <circle cx="20" cy="74" r="3" fill="url(#bubbleGlass)" stroke="url(#soapRainbow2)" strokeWidth="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-white text-lg bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Burbuja
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-sm">
              LGBTIQ+
            </span>
          </div>
          <span className="text-[9px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
            Creando Espacios Seguros
          </span>
        </div>
      )}
    </div>
  );
};
