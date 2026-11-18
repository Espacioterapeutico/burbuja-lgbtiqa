import React from 'react';
import { 
  X, 
  Compass, 
  Megaphone, 
  Radio, 
  MessageCircle, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { Logo } from './Logo';

interface AdminBottomMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateCommunity: () => void;
  onOpenBroadcast: () => void;
  onOpenCreateOfficialStory: () => void;
  onOpenContactsAsAdmin: () => void;
  onOpenSuperadmin: () => void;
  theme?: 'light' | 'dark';
}

export const AdminBottomMenu: React.FC<AdminBottomMenuProps> = ({
  isOpen,
  onClose,
  onOpenCreateCommunity,
  onOpenBroadcast,
  onOpenCreateOfficialStory,
  onOpenContactsAsAdmin,
  onOpenSuperadmin,
  theme = 'light'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Menu */}
      <div 
        className={`relative z-10 w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-5 sm:p-6 border-t sm:border shadow-2xl transition-all animate-in slide-in-from-bottom duration-250 select-none ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
            : 'bg-slate-950 border-slate-800 text-white shadow-black/80'
        }`}
      >
        {/* Barra superior / Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />

        {/* Encabezado del Menú Admin */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-md">
              <div className="p-1 rounded-xl bg-slate-950">
                <Logo size="sm" showText={false} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm tracking-tight">
                  Menú de Control Admin
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                  <span>Oficial</span>
                  <span>🫧</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Acciones maestras de la plataforma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opciones del Menú en Cuadrícula / Tarjetas */}
        <div className="py-2.5 space-y-2">
          {/* 1. CREAR COMUNIDAD */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateCommunity();
            }}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] group shadow-sm ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-pink-50/60 border-slate-200 hover:border-pink-300'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-pink-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
                  Crear Comunidad
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Abre un nuevo foro o espacio seguro temático
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* 2. MANDAR MENSAJE DE DIFUSIÓN */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBroadcast();
            }}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] group shadow-sm ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-300'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  Mandar Mensaje de Difusión
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Transmite un comunicado o alerta global a toda la red
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* 3. SUBIR ESTADO OFICIAL (VISIBLE PARA TODOS) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateOfficialStory();
            }}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] group shadow-sm ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-cyan-50/60 border-slate-200 hover:border-cyan-300'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    Subir Estado Oficial (24h)
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold uppercase">
                    Público
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Todos lo ven en sus historias, así no te tengan agregado
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* 4. ESCRIBIR A CONTACTOS (COMO BURBUJA LGBTIQ) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenContactsAsAdmin();
            }}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] group shadow-sm ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-emerald-50/60 border-slate-200 hover:border-emerald-300'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Escribir a Contactos
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Tus chats privados siempre dicen: <strong>Burbuja LGBTIQ</strong>
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* 5. PORTAL DE SUPERADMIN Y AUDITORÍA */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSuperadmin();
            }}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] group shadow-sm ${
              theme === 'light'
                ? 'bg-purple-50/50 hover:bg-purple-50 border-purple-200 hover:border-purple-300'
                : 'bg-purple-950/20 hover:bg-purple-950/40 border-purple-900/50 hover:border-purple-600/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xs text-purple-950 dark:text-purple-200 block group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  Portal de Auditoría y Gobernanza
                </span>
                <span className="text-[10px] text-purple-800/80 dark:text-purple-400/80 block">
                  Revisión de reportes, códigos de invitación y seguridad
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
