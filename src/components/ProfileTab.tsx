import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  Camera, 
  ShieldCheck, 
  Music, 
  Moon, 
  Sun, 
  LogOut, 
  Smartphone, 
  Edit3, 
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import type { UserProfile, UserStatus } from '../types';
import { parseMusicLink } from '../utils/musicParser';
import { SUPERADMIN_PIN } from '../services/authService';
import { isApkAlreadyDownloadedOrInstalled, ApkDownloadModal } from './ApkDownloadModal';
import confetti from 'canvas-confetti';

interface ProfileTabProps {
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenEditProfile: () => void;
  onOpenSharePIN: () => void;
  onOpenSuperadmin?: () => void;
  onUpdateStatus: (status: UserStatus) => void;
  onUpdatePersonalMessage: (msg: string) => void;
  onToggleWhatsAppBridge?: () => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; dotColor: string; bgBadge: string; textBadge: string }> = {
  disponible: { 
    label: 'Disponible', 
    dotColor: 'bg-emerald-500', 
    bgBadge: 'bg-emerald-500/15 border-emerald-500/30', 
    textBadge: 'text-emerald-500 dark:text-emerald-400' 
  },
  ausente: { 
    label: 'Ausente', 
    dotColor: 'bg-amber-500', 
    bgBadge: 'bg-amber-500/15 border-amber-500/30', 
    textBadge: 'text-amber-500 dark:text-amber-400' 
  },
  ocupado: { 
    label: 'Ocupadx', 
    dotColor: 'bg-rose-500', 
    bgBadge: 'bg-rose-500/15 border-rose-500/30', 
    textBadge: 'text-rose-500 dark:text-rose-400' 
  },
  en_crisis: { 
    label: '💜 En Crisis (Auxilio)', 
    dotColor: 'bg-purple-500 animate-ping', 
    bgBadge: 'bg-purple-500/20 border-purple-500/50', 
    textBadge: 'text-purple-600 dark:text-purple-300 font-bold' 
  },
  en_fiesta: { 
    label: 'De Fiesta 🪩', 
    dotColor: 'bg-cyan-500', 
    bgBadge: 'bg-cyan-500/15 border-cyan-500/30', 
    textBadge: 'text-cyan-500 dark:text-cyan-400' 
  },
  desconectado: { 
    label: 'Desconectadx', 
    dotColor: 'bg-slate-400', 
    bgBadge: 'bg-slate-500/15 border-slate-500/30', 
    textBadge: 'text-slate-500 dark:text-slate-400' 
  }
};

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onOpenEditProfile,
  onOpenSharePIN,
  onOpenSuperadmin,
  onUpdateStatus,
  onUpdatePersonalMessage,
  onToggleWhatsAppBridge,
  onLogout,
  onDeleteAccount
}) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [draftMsg, setDraftMsg] = useState(currentUser.personalMessage);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [apkDownloaded, setApkDownloaded] = useState(() => isApkAlreadyDownloadedOrInstalled());

  const isSuperadmin = currentUser.id === 'superadmin-root' || currentUser.pin === SUPERADMIN_PIN;
  const parsedMusic = parseMusicLink(currentUser.currentSong);

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(currentUser.pin);
    setCopiedPin(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleSaveMsg = () => {
    onUpdatePersonalMessage(draftMsg.trim());
    setIsEditingMsg(false);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 text-left">
      {/* 1. Header Superior del Perfil */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h1 className={`text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Mi Perfil
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tu identidad y configuración en la Burbuja
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Tema */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2.5 rounded-2xl border transition-all active:scale-95 shadow-sm ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 hover:border-pink-500/50 text-slate-200'
            }`}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Botón Editar Todo */}
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjeta Principal de Identidad */}
      <div className={`relative rounded-3xl p-6 border shadow-xl transition-all overflow-hidden ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 shadow-slate-200/60'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800/90'
      }`}>
        {/* Glow de fondo decorativo */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Foto de Perfil / Silueta interactiva */}
          <button
            type="button"
            onClick={onOpenEditProfile}
            title="Toca para cambiar tu foto"
            className="relative shrink-0 group focus:outline-none"
          >
            <img
              src={currentUser.avatar || '/default-avatar.svg'}
              alt={currentUser.name}
              className={`w-24 h-24 rounded-3xl object-cover border-4 shadow-xl transition-all group-hover:scale-105 group-hover:ring-4 group-hover:ring-pink-500/40 ${
                theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-slate-950'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
            {/* Botón flotante de cámara */}
            <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-90">
              <Camera className="w-4 h-4" />
            </div>
            {/* Punto de estado en vivo */}
            <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 ${
              STATUS_CONFIG[currentUser.status].dotColor
            } flex items-center justify-center text-xs shadow-md`}>
              {currentUser.status === 'en_crisis' ? '💜' : ''}
            </div>
          </button>

          {/* Datos Personales */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className={`text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {currentUser.name}
                </h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  theme === 'light'
                    ? 'text-pink-700 bg-pink-100 border border-pink-200'
                    : 'text-pink-400 bg-pink-950/60 border border-pink-800/40'
                }`}>
                  {currentUser.pronouns}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser.city || 'Barquisimeto, Lara'}
              </p>
            </div>

            {/* Caja de PIN Personal */}
            <div className={`inline-flex items-center gap-2 p-2 rounded-2xl border ${
              theme === 'light'
                ? 'bg-slate-100/80 border-slate-200'
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="text-left px-1">
                <span className="text-[9px] font-black uppercase text-pink-500 dark:text-pink-400 tracking-wider block">
                  Tu PIN Personal
                </span>
                <span className="font-mono text-base font-black text-slate-900 dark:text-white tracking-widest">
                  {currentUser.pin}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPin}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-all active:scale-95 shadow-sm"
                title="Copiar mi PIN"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Reputación y Pases de Invitación */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className={`p-3 rounded-2xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Cadena de Confianza
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {currentUser.reputationScore}%
              </span>
              <span className="text-[10px] text-slate-500">Reputación</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Pases Disponibles
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-pink-500 dark:text-pink-400">
                {currentUser.invitationsRemaining} pases
              </span>
              <button
                type="button"
                onClick={onOpenSharePIN}
                className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Invitar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selector Rápido de Estado Emocional */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-2.5 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Tu Estado Actual
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            STATUS_CONFIG[currentUser.status].bgBadge
          } ${STATUS_CONFIG[currentUser.status].textBadge}`}>
            {STATUS_CONFIG[currentUser.status].label}
          </span>
        </div>

        {/* Botones de estado con un toque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['disponible', 'ausente', 'ocupado', 'en_crisis'] as UserStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onUpdateStatus(st)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                currentUser.status === st
                  ? 'border-pink-500 bg-pink-500/15 text-pink-600 dark:text-pink-300 ring-2 ring-pink-500/30'
                  : theme === 'light'
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[st].dotColor}`} />
              <span className="truncate">{STATUS_CONFIG[st].label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Mensaje Personal & Música Favorita */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Mensaje Personal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
              <span>Frase / Mensaje Personal</span>
            </span>
            {!isEditingMsg && (
              <button
                type="button"
                onClick={() => setIsEditingMsg(true)}
                className="text-[11px] font-bold text-pink-500 hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingMsg ? (
            <div className="space-y-2">
              <input
                type="text"
                value={draftMsg}
                onChange={(e) => setDraftMsg(e.target.value)}
                maxLength={90}
                placeholder="¿Qué estás pensando?"
                className={`w-full rounded-2xl p-2.5 text-xs focus:outline-none border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-pink-500'
                    : 'bg-slate-950 border-slate-700 text-white focus:border-pink-500'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMsg(false)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMsg}
                  className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              "{currentUser.personalMessage || 'Sin mensaje de estado...'}"
            </p>
          )}
        </div>

        {/* Reproductor de Música */}
        {currentUser.currentSong && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-500" />
              <span>Canción que te representa</span>
            </span>

            {parsedMusic.type === 'spotify' && parsedMusic.embedUrl ? (
              <iframe
                src={parsedMusic.embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                className="rounded-2xl shadow-sm"
              />
            ) : parsedMusic.type === 'youtube' && parsedMusic.embedUrl ? (
              <iframe
                src={parsedMusic.embedUrl}
                width="100%"
                height="120"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-2xl shadow-sm"
              />
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-600 dark:text-pink-300">
                <Music className="w-4 h-4 shrink-0" />
                <span className="truncate">{parsedMusic.title || currentUser.currentSong}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Accesos y Configuración */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-2.5 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
          Opciones y Seguridad
        </span>

        {/* Acceso a Superadmin (Solo si es Fundador/Superadmin) */}
        {isSuperadmin && onOpenSuperadmin && (
          <button
            type="button"
            onClick={onOpenSuperadmin}
            className="w-full py-2.5 px-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Portal de Superadmin y Auditoría</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 border border-purple-700/60 font-mono">
              Fundador
            </span>
          </button>
        )}

        {/* Descargar APK Android (Si no la tiene descargada o no está dentro de la APK) */}
        {!apkDownloaded && (
          <button
            type="button"
            onClick={() => setIsApkModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Descargar App Oficial para Android (.APK)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold">
              v1.0.2
            </span>
          </button>
        )}

        {/* Puente Seguro de WhatsApp */}
        {onToggleWhatsAppBridge && (
          <button
            type="button"
            onClick={onToggleWhatsAppBridge}
            className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm ${
              currentUser.allowWhatsAppBridge
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Puente de Notificaciones WhatsApp</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              currentUser.allowWhatsAppBridge ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/40 text-slate-400'
            }`}>
              {currentUser.allowWhatsAppBridge ? 'Activo' : 'Inactivo'}
            </span>
          </button>
        )}

        {/* Cerrar Sesión */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión de mi cuenta</span>
        </button>

        {/* Eliminar Cuenta Definitivamente */}
        {onDeleteAccount && (
          <button
            type="button"
            onClick={onDeleteAccount}
            className="w-full py-1.5 text-[11px] text-slate-400 hover:text-rose-500 transition-colors text-center"
          >
            Eliminar mi cuenta definitivamente
          </button>
        )}
      </div>

      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onDownloaded={() => setApkDownloaded(true)}
      />
    </div>
  );
};
