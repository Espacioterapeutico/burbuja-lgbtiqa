import React from 'react';

interface SoapBubbleProps {
  sizeClass?: string;
  idPrefix?: string;
  glow?: 'pink' | 'cyan' | 'violet' | 'none';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  type?: 'button' | 'div';
}

export const SoapBubble: React.FC<SoapBubbleProps> = ({
  sizeClass = 'w-10 h-10',
  idPrefix = 'sb',
  glow = 'pink',
  children,
  className = '',
  onClick,
  title,
  type = 'button'
}) => {
  const rainbowId = `${idPrefix}-rainbow`;
  const glassId = `${idPrefix}-glass`;

  const glowShadow = glow === 'pink'
    ? 'drop-shadow-[0_4px_14px_rgba(236,72,153,0.45)] hover:drop-shadow-[0_6px_20px_rgba(236,72,153,0.7)]'
    : glow === 'cyan'
    ? 'drop-shadow-[0_4px_14px_rgba(6,182,212,0.45)] hover:drop-shadow-[0_6px_20px_rgba(6,182,212,0.7)]'
    : glow === 'violet'
    ? 'drop-shadow-[0_4px_14px_rgba(139,92,246,0.45)] hover:drop-shadow-[0_6px_20px_rgba(139,92,246,0.7)]'
    : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]';

  const Content = (
    <div className={`relative ${sizeClass} flex items-center justify-center select-none ${glowShadow} ${className}`}>
      {/* Gráfico de UNA SOLA BURBUJA de jabón con arcoíris iridiscente y reflejo de luz */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full absolute inset-0 pointer-events-none"
      >
        <defs>
          {/* Arcoíris iridiscente en el contorno de la burbuja */}
          <linearGradient id={rainbowId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.95" />
          </linearGradient>

          {/* Relleno vítreo esférico traslúcido */}
          <radialGradient id={glassId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="82%" stopColor="#f472b6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        {/* Esfera Principal */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill={`url(#${glassId})`}
          stroke={`url(#${rainbowId})`}
          strokeWidth="4.5"
        />

        {/* Reflejo Curvo de Luz Especular (Brillo de jabón característico) */}
        <path
          d="M26 38 A 30 30 0 0 1 54 20"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        {/* Brillos especulares secundarios */}
        <circle cx="28" cy="46" r="2.5" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="70" cy="74" r="2" fill="#ffffff" fillOpacity="0.55" />
      </svg>

      {/* Icono / Elemento interior flotando dentro de la burbuja */}
      {children && (
        <div className="relative z-10 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );

  if (type === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className="transition-transform duration-150 hover:scale-115 active:scale-95 focus:outline-none group rounded-full"
      >
        {Content}
      </button>
    );
  }

  return Content;
};
