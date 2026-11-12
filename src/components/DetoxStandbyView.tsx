import React from 'react';
import { Moon, Power, HeartHandshake, BatteryCharging } from 'lucide-react';
import { Logo } from './Logo';

interface DetoxStandbyViewProps {
  onReconnect: () => void;
}

export const DetoxStandbyView: React.FC<DetoxStandbyViewProps> = ({ onReconnect }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-between p-6 text-center select-none">
      {/* Retro Standby Ambient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-neutral-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">Modo Detox / Descanso</span>
        </div>
        <div className="font-mono text-xs text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
          {currentTime}
        </div>
      </div>

      {/* Centerpiece Screensaver */}
      <div className="relative z-10 my-auto flex flex-col items-center max-w-sm">
        {/* Animated Breathing Circle */}
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-neutral-700 animate-ping opacity-25" />
          <div className="absolute inset-2 rounded-full border border-neutral-600 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-2xl">
            <Logo size="md" showText={false} className="filter grayscale opacity-60" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
          <BatteryCharging className="w-3.5 h-3.5 text-neutral-400" />
          <span>Fuera de la Burbuja</span>
        </div>

        <h2 className="text-2xl font-bold text-neutral-100 tracking-tight mb-2">
          Tu bienestar también importa
        </h2>

        <p className="text-xs text-neutral-400 leading-relaxed max-w-[280px] mb-6">
          Has silenciado los feeds de video y chats grupales para darte un espacio de desconexión y calma.
        </p>

        {/* Nostalgic status box */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 text-left space-y-2 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-neutral-500" />
            <span>Tus contactos te ven como:</span>
          </div>
          <p className="text-xs font-mono text-neutral-400 italic pl-4 border-l border-neutral-800">
            "Desconectadx • Tomando un respiro fuera de la pantalla 🍃"
          </p>
        </div>

        {/* Reconnect Action Button */}
        <button
          onClick={onReconnect}
          className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm shadow-xl transition-all active:scale-95 cursor-pointer"
        >
          <Power className="w-4 h-4 text-neutral-950 transition-transform group-hover:rotate-45" />
          <span>Reconectar a la Burbuja</span>
        </button>
      </div>

      {/* Footer Support Notice */}
      <div className="relative z-10 w-full pt-4 border-t border-neutral-900 text-[10px] text-neutral-500 flex items-center justify-center gap-2">
        <HeartHandshake className="w-3.5 h-3.5" />
        <span>Si necesitas acompañamiento en una crisis, cambia a tu estado de emergencia al reconectar.</span>
      </div>
    </div>
  );
};
