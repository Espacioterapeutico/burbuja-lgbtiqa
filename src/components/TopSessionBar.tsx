import React from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';
import type { UserProfile, UserReport } from '../types';

interface TopSessionBarProps {
  currentUser: UserProfile;
  reports: UserReport[];
  onOpenSuperadmin: () => void;
  onOpenAuth: () => void;
}

export const TopSessionBar: React.FC<TopSessionBarProps> = ({
  currentUser,
  reports,
  onOpenSuperadmin,
  onOpenAuth
}) => {
  const pendingReportsCount = reports.filter(r => r.status !== 'resuelto').length;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 text-[11px] px-3 py-1.5 flex items-center justify-between text-slate-400">
      <div className="flex items-center gap-1.5 truncate">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-300">Sesión:</span>
        <span className="font-bold text-white truncate max-w-[100px] sm:max-w-none">{currentUser.name}</span>
        <span className="font-mono text-pink-300 hidden sm:inline">({currentUser.pin})</span>
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

        {/* Login / Auth Modal Trigger */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold transition-colors"
        >
          <LogIn className="w-3 h-3" />
          <span className="hidden sm:inline">Login / Gmail</span>
        </button>
      </div>
    </header>
  );
};
