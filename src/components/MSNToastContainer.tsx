import React from 'react';
import { X, Sparkles } from 'lucide-react';
import type { MSNToast } from '../types';

interface MSNToastContainerProps {
  toasts: MSNToast[];
  onDismiss: (id: string) => void;
}

export const MSNToastContainer: React.FC<MSNToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 inset-x-3 sm:left-auto sm:right-4 sm:w-80 z-50 flex flex-col gap-2 pointer-events-none pt-[max(env(safe-area-inset-top,0px),0.25rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto relative flex items-center gap-3 p-3 rounded-2xl bg-slate-900/95 border-2 border-pink-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-6 duration-300"
        >
          {/* Nostalgic Glow bar */}
          <div className="absolute left-0 inset-y-0 w-1.5 bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-400 rounded-l-2xl" />

          {/* Contact Avatar */}
          <div className="relative shrink-0 pl-1">
            <img
              src={toast.avatar}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>{toast.title}</span>
            </div>
            <p className="text-xs font-semibold text-white truncate mt-0.5">
              {toast.message}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
