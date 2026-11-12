import React from 'react';
import { ShieldCheck, LogOut, LogIn } from 'lucide-react';
import type { UserProfile, UserReport } from '../types';

interface TopSessionBarProps {
  currentUser: UserProfile | null;
  reports: UserReport[];
  onOpenSuperadmin: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
}

export const TopSessionBar: React.FC<TopSessionBarProps> = ({
  currentUser,
  reports,
  onOpenSuperadmin,
  onOpenAuth,
  onLogout
}) => {
  const pendingReportsCount = reports.filter(r => r.status !== 'resuelto').length;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 text-[11px] px-3 py-1.5 flex items-center justify-between text-slate-400">
      <div className="flex items-center gap-1.5 truncate">
        {currentUser ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Sesión:</span>
            <span className="font-bold text-white truncate max-w-[100px] sm:max-w-none">{currentUser.name}</span>
            <span className="font-mono text-pink-300 hidden sm:inline">({currentUser.pin})</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-semibold text-slate-400">Sin sesión activa</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Superadmin button */}
        <button
          onClick={onOpenSuperadmin}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[10px] font-bold transition-colors"
        >
          <ShieldCheck className="w-3 h-3 text-purple-400" />
          <span>Superadmin ({pendingReportsCount})</span>
        </button>

        {currentUser ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-[10px] font-bold transition-colors"
            title="Cerrar sesión en este dispositivo"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 text-[10px] font-bold transition-colors"
          >
            <LogIn className="w-3 h-3" />
            <span>Entrar / Registro</span>
          </button>
        )}
      </div>
    </header>
  );
};
