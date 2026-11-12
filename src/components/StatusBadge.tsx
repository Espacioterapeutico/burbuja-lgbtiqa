import React from 'react';
import type { UserStatus } from '../types';

export const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; dotColor: string; bgBadge: string; textBadge: string; icon: string }
> = {
  disponible: {
    label: 'Disponible',
    dotColor: 'bg-emerald-400 ring-emerald-500/30',
    bgBadge: 'bg-emerald-500/15 border-emerald-500/30',
    textBadge: 'text-emerald-300',
    icon: '🟢'
  },
  ocupado: {
    label: 'Ocupado',
    dotColor: 'bg-rose-500 ring-rose-500/30',
    bgBadge: 'bg-rose-500/15 border-rose-500/30',
    textBadge: 'text-rose-300',
    icon: '🔴'
  },
  en_crisis: {
    label: 'En una crisis / Necesito hablar',
    dotColor: 'bg-purple-400 ring-purple-500/40 animate-pulse',
    bgBadge: 'bg-purple-500/20 border-purple-500/40 animate-pulse',
    textBadge: 'text-purple-300 font-semibold',
    icon: '💜'
  },
  en_fiesta: {
    label: 'En fiesta',
    dotColor: 'bg-amber-400 ring-amber-500/30',
    bgBadge: 'bg-amber-500/15 border-amber-500/30',
    textBadge: 'text-amber-300',
    icon: '🪩'
  },
  ausente: {
    label: 'Ausente',
    dotColor: 'bg-orange-400 ring-orange-500/30',
    bgBadge: 'bg-orange-500/15 border-orange-500/30',
    textBadge: 'text-orange-300',
    icon: '🟠'
  },
  desconectado: {
    label: 'Desconectado (Modo Detox)',
    dotColor: 'bg-slate-500 ring-slate-500/30',
    bgBadge: 'bg-slate-500/15 border-slate-500/30',
    textBadge: 'text-slate-400',
    icon: '⚪'
  }
};

interface StatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showLabel = true }) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border backdrop-blur-sm ${config.bgBadge} ${config.textBadge} ${
        size === 'sm' ? 'text-xs' : 'text-sm font-medium'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ring-2 ${config.dotColor}`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
