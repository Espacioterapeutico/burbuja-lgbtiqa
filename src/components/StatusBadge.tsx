import React from 'react';
import type { StandardUserStatus, UserStatus } from '../types';

export const STATUS_CONFIG: Record<
  StandardUserStatus,
  { label: string; dotColor: string; bgBadge: string; textBadge: string; icon: string }
> = {
  disponible: {
    label: 'Disponible',
    dotColor: 'bg-emerald-400 ring-emerald-500/30',
    bgBadge: 'bg-emerald-500/15 border-emerald-500/30',
    textBadge: 'text-emerald-500 dark:text-emerald-300',
    icon: '🟢'
  },
  ocupado: {
    label: 'Ocupadx',
    dotColor: 'bg-rose-500 ring-rose-500/30',
    bgBadge: 'bg-rose-500/15 border-rose-500/30',
    textBadge: 'text-rose-500 dark:text-rose-300',
    icon: '🔴'
  },
  en_crisis: {
    label: '💜 En Crisis (Auxilio)',
    dotColor: 'bg-purple-400 ring-purple-500/40 animate-pulse',
    bgBadge: 'bg-purple-500/20 border-purple-500/40 animate-pulse',
    textBadge: 'text-purple-600 dark:text-purple-300 font-semibold',
    icon: '💜'
  },
  en_fiesta: {
    label: 'De Fiesta 🪩',
    dotColor: 'bg-cyan-400 ring-cyan-500/30',
    bgBadge: 'bg-cyan-500/15 border-cyan-500/30',
    textBadge: 'text-cyan-500 dark:text-cyan-300',
    icon: '🪩'
  },
  ausente: {
    label: 'Ausente',
    dotColor: 'bg-amber-400 ring-amber-500/30',
    bgBadge: 'bg-amber-500/15 border-amber-500/30',
    textBadge: 'text-amber-500 dark:text-amber-300',
    icon: '🟠'
  },
  desconectado: {
    label: 'Desconectadx (Modo Detox)',
    dotColor: 'bg-slate-400 ring-slate-400/30',
    bgBadge: 'bg-slate-500/15 border-slate-500/30',
    textBadge: 'text-slate-500 dark:text-slate-400',
    icon: '⚪'
  }
};

export interface ResolvedStatusConfig {
  label: string;
  dotColor: string;
  bgBadge: string;
  textBadge: string;
  icon: string;
  customColor?: string;
}

export function getStatusConfig(
  status: UserStatus | string | undefined,
  customLabel?: string,
  customColor?: string
): ResolvedStatusConfig {
  if (status && status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as StandardUserStatus];
  }

  // Si es un estado personalizado
  const color = customColor || '#a855f7';
  const label = customLabel || (status && status !== 'personalizado' ? status : 'Personalizado');

  return {
    label,
    dotColor: '',
    bgBadge: '',
    textBadge: '',
    icon: '✨',
    customColor: color
  };
}

interface StatusBadgeProps {
  status: UserStatus | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  customLabel?: string;
  customColor?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'sm', 
  showLabel = true,
  customLabel,
  customColor
}) => {
  const config = getStatusConfig(status, customLabel, customColor);

  if (config.customColor) {
    return (
      <span
        style={{
          backgroundColor: `${config.customColor}22`,
          borderColor: `${config.customColor}44`,
          color: config.customColor
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border backdrop-blur-sm font-semibold ${
          size === 'sm' ? 'text-xs' : 'text-sm font-medium'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full ring-2"
          style={{ 
            backgroundColor: config.customColor, 
            boxShadow: `0 0 6px ${config.customColor}` 
          }}
        />
        {showLabel && <span className="truncate max-w-[120px]">{config.label}</span>}
      </span>
    );
  }

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
