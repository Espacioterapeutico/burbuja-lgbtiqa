import React from 'react';
import { Compass, MessageCircle } from 'lucide-react';
import type { UserProfile } from '../types';

export type MainTab = 'comunidades' | 'contactos' | 'perfil';

interface BottomNavBarProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  currentUser: UserProfile;
  pendingRequestsCount?: number;
  theme?: 'light' | 'dark';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  currentUser,
  pendingRequestsCount = 0,
  theme = 'light'
}) => {
  return (
    <nav
      aria-label="Navegación principal"
      className={`fixed bottom-0 inset-x-0 z-40 transition-colors backdrop-blur-xl border-t ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
          : 'bg-slate-950/95 border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'
      } pb-[max(env(safe-area-inset-bottom,0px),0.6rem)] pt-1.5 px-3 sm:px-6`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {/* 1. COMUNIDADES (Pestaña principal por defecto) */}
        <button
          type="button"
          onClick={() => onChangeTab('comunidades')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 group relative ${
            activeTab === 'comunidades'
              ? 'text-pink-600 dark:text-pink-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          {activeTab === 'comunidades' && (
            <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-in fade-in" />
          )}
          <div className={`p-1 rounded-xl transition-all ${
            activeTab === 'comunidades' 
              ? 'bg-pink-500/15 dark:bg-pink-500/20 scale-110' 
              : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
          }`}>
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">
            Comunidades
          </span>
        </button>

        {/* 2. CONTACTOS / CHATS */}
        <button
          type="button"
          onClick={() => onChangeTab('contactos')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 group relative ${
            activeTab === 'contactos'
              ? 'text-pink-600 dark:text-pink-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          {activeTab === 'contactos' && (
            <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-in fade-in" />
          )}
          <div className="relative">
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'contactos' 
                ? 'bg-pink-500/15 dark:bg-pink-500/20 scale-110' 
                : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
            }`}>
              <MessageCircle className="w-5 h-5" />
            </div>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-md">
                {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">
            Contactos
          </span>
        </button>

        {/* 3. PERFIL */}
        <button
          type="button"
          onClick={() => onChangeTab('perfil')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 group relative ${
            activeTab === 'perfil'
              ? 'text-pink-600 dark:text-pink-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          {activeTab === 'perfil' && (
            <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-in fade-in" />
          )}
          <div className={`relative p-0.5 rounded-full transition-all ${
            activeTab === 'perfil'
              ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 scale-110'
              : 'group-hover:opacity-90'
          }`}>
            <img
              src={currentUser.avatar || '/default-avatar.svg'}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">
            Mi Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
