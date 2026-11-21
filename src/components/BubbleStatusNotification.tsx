import React, { useState, useEffect } from 'react';
import type { UserStatus } from '../types';
import { playBubblePopSound } from '../utils/sound';

export interface StatusNotificationItem {
  id: string;
  userName: string;
  userAvatar: string;
  userPin?: string;
  status: UserStatus;
  message: string;
}

interface BubbleStatusNotificationProps {
  notifications: StatusNotificationItem[];
  onDismiss: (id: string) => void;
}

const statusColors: Record<string, { dot: string; glow: string; text: string }> = {
  disponible: {
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.8)]',
    text: 'text-emerald-300'
  },
  desconectado: {
    dot: 'bg-slate-400',
    glow: 'shadow-[0_0_8px_rgba(148,163,184,0.5)]',
    text: 'text-slate-300'
  },
  ausente: {
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_10px_rgba(251,191,36,0.8)]',
    text: 'text-amber-300'
  },
  ocupado: {
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_10px_rgba(244,63,94,0.8)]',
    text: 'text-rose-300'
  },
  en_crisis: {
    dot: 'bg-purple-500 animate-pulse',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.8)]',
    text: 'text-purple-300'
  },
  en_fiesta: {
    dot: 'bg-fuchsia-400 animate-bounce',
    glow: 'shadow-[0_0_12px_rgba(232,121,249,0.8)]',
    text: 'text-fuchsia-300'
  },
  emergencia: {
    dot: 'bg-red-500 animate-ping',
    glow: 'shadow-[0_0_14px_rgba(239,68,68,0.9)]',
    text: 'text-red-300'
  },
  personalizado: {
    dot: 'bg-cyan-400',
    glow: 'shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    text: 'text-cyan-300'
  }
};

const SingleBubbleNotification: React.FC<{
  item: StatusNotificationItem;
  onPop: (id: string) => void;
}> = ({ item, onPop }) => {
  const [phase, setPhase] = useState<'falling' | 'floating' | 'popping'>('falling');

  useEffect(() => {
    // 1. Cae suavemente desde arriba
    const floatTimer = setTimeout(() => {
      setPhase('floating');
    }, 300);

    // 2. Permanece flotando ~2.2 segundos y luego explota rápido
    const popTimer = setTimeout(() => {
      triggerPop();
    }, 2500);

    return () => {
      clearTimeout(floatTimer);
      clearTimeout(popTimer);
    };
  }, []);

  const triggerPop = () => {
    if (phase === 'popping') return;
    setPhase('popping');
    playBubblePopSound();
    setTimeout(() => {
      onPop(item.id);
    }, 280);
  };

  const currentTheme = statusColors[item.status] || statusColors.disponible;

  return (
    <div
      onClick={triggerPop}
      role="status"
      aria-live="polite"
      className="relative pointer-events-auto cursor-pointer select-none transition-all duration-300 ease-out"
      style={{
        transform:
          phase === 'falling'
            ? 'translateY(-30px) scale(0.85)'
            : phase === 'popping'
            ? 'scale(1.25)'
            : 'translateY(0) scale(1)',
        opacity: phase === 'falling' ? 0.3 : phase === 'popping' ? 0 : 1
      }}
    >
      {/* 🫧 Partículas de explosión (gotas iridiscentes de jabón que salen volando) */}
      {phase === 'popping' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span className="absolute w-2 h-2 rounded-full bg-pink-400 animate-ping -translate-x-8 -translate-y-4 opacity-75" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping translate-x-8 -translate-y-5 opacity-75" />
          <span className="absolute w-2 h-2 rounded-full bg-purple-400 animate-ping -translate-x-6 translate-y-5 opacity-75" />
          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping translate-x-7 translate-y-4 opacity-75" />
          <span className="absolute w-2.5 h-2.5 rounded-full border border-pink-300 animate-ping scale-150 opacity-60" />
        </div>
      )}

      {/* Cápsula de Burbuja de Jabón con brillo irisado */}
      <div className="relative flex items-center gap-2.5 py-2 px-3.5 sm:px-4 rounded-full bg-slate-950/85 backdrop-blur-2xl border-2 border-pink-400/60 shadow-[0_8px_30px_rgba(236,72,153,0.35)] hover:border-pink-300 transition-all">
        {/* Reflejo superior de cristal de burbuja */}
        <div className="absolute top-1 inset-x-4 h-1.5 rounded-full bg-gradient-to-r from-white/5 via-white/50 to-white/5 pointer-events-none" />

        {/* Avatar con punto de estado */}
        <div className="relative shrink-0">
          <img
            src={item.userAvatar || '/logo.svg'}
            alt={item.userName}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.svg';
            }}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${currentTheme.dot} ${currentTheme.glow}`}
          />
        </div>

        {/* Mensaje de estado */}
        <div className="flex items-center gap-1.5 text-xs text-white pr-1">
          <span className="font-extrabold tracking-tight truncate max-w-[120px] sm:max-w-[150px]">
            {item.userName}
          </span>
          <span className={`font-semibold ${currentTheme.text} whitespace-nowrap`}>
            {item.message}
          </span>
        </div>

        {/* Icono de burbuja decorativo */}
        <span className="text-sm select-none opacity-80" title="Click para reventar burbuja">
          🫧
        </span>
      </div>
    </div>
  );
};

export const BubbleStatusNotificationContainer: React.FC<BubbleStatusNotificationProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <aside
      aria-label="Notificaciones de estado"
      className="fixed top-3 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none pt-[max(env(safe-area-inset-top,0px),0.25rem)] px-4"
    >
      {notifications.map((item) => (
        <SingleBubbleNotification key={item.id} item={item} onPop={onDismiss} />
      ))}
    </aside>
  );
};