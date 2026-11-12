import React, { useState } from 'react';
import { 
  Music, 
  Edit3, 
  QrCode, 
  MessageCircle, 
  ChevronDown, 
  Sun, 
  Moon, 
  MoreVertical, 
  User, 
  LogOut,
  UserX,
  AlertTriangle,
  Power, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import type { UserProfile, UserStatus } from '../../types';
import { STATUS_CONFIG } from '../StatusBadge';
import { Logo } from '../Logo';
import { parseMusicLink } from '../../utils/musicParser';

interface ProfileHeaderProps {
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenSharePIN: () => void;
  onOpenAddContact: () => void;
  onOpenProfile: () => void;
  onOpenRadar?: () => void;
  onOpenSuperadmin: () => void;
  onOpenAuth: () => void;
  onUpdateStatus: (status: UserStatus) => void;
  onUpdatePersonalMessage: (msg: string) => void;
  onToggleWhatsAppBridge: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onOpenSharePIN,
  onOpenProfile,
  onOpenRadar,
  onOpenSuperadmin,
  onOpenAuth,
  onUpdateStatus,
  onUpdatePersonalMessage,
  onToggleWhatsAppBridge,
  onLogout,
  onDeleteAccount
}) => {
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [messageDraft, setMessageDraft] = useState(currentUser.personalMessage);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusDisplayMode, setStatusDisplayMode] = useState<'message' | 'music'>('message');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const parsedMusic = parseMusicLink(currentUser.currentSong);

  const handleSaveMessage = () => {
    onUpdatePersonalMessage(messageDraft);
    setIsEditingMessage(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between px-1">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all active:scale-95 shadow-sm ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-slate-200/50'
                  : 'bg-slate-900/90 border-slate-700/80 hover:border-pink-500/50 text-slate-200'
              }`}
              title={theme === 'dark' ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          {/* Three Dots Menu for Profile and Options */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-full border transition-all active:scale-95 shadow-sm ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-slate-200/50'
                  : 'bg-slate-900 border-slate-700/80 hover:border-pink-500/50 text-slate-200'
              }`}
              title="Más opciones y perfil"
            >
              <MoreVertical className={`w-4 h-4 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setMenuOpen(false)}
                />
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border-2 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 shadow-slate-400/30'
                  : 'bg-slate-900/98 backdrop-blur-2xl border-slate-700 text-white'
              }`}>
                {/* Header del menú */}
                <div className={`px-3.5 py-2 border-b mb-1 ${
                  theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-slate-950/40'
                }`}>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Menú de Opciones
                  </p>
                  <p className={`text-xs font-bold truncate ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    {currentUser.name}
                  </p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); onOpenProfile(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                    theme === 'light'
                      ? 'text-slate-800 hover:bg-pink-50 hover:text-pink-700'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 text-pink-500" />
                  <span className="font-semibold">Editar Mi Perfil</span>
                </button>

                <button
                  onClick={() => { setMenuOpen(false); onOpenSharePIN(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                    theme === 'light'
                      ? 'text-slate-800 hover:bg-cyan-50 hover:text-cyan-700'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-500" />
                  <span>Mi PIN y Código QR</span>
                </button>

                {onOpenRadar && (
                  <button
                    onClick={() => { setMenuOpen(false); onOpenRadar(); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                      theme === 'light'
                        ? 'text-pink-700 hover:bg-pink-50'
                        : 'text-pink-300 hover:bg-slate-800'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-cyan-500" />
                    <span className="font-semibold">Explorar Personas Cercanas 🫧</span>
                  </button>
                )}

                {onToggleTheme && (
                  <button
                    onClick={() => { setMenuOpen(false); onToggleTheme(); }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                      theme === 'light'
                        ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    <span>{theme === 'dark' ? 'Modo Claro ☀️' : 'Modo Oscuro 🌙'}</span>
                  </button>
                )}

                <button
                  onClick={() => { setMenuOpen(false); onOpenSuperadmin(); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                    theme === 'light'
                      ? 'text-purple-700 hover:bg-purple-50'
                      : 'text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>Portal Superadmin</span>
                </button>

                <button
                  onClick={() => { setMenuOpen(false); onUpdateStatus('desconectado'); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left transition-colors font-medium ${
                    theme === 'light'
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Power className="w-4 h-4 text-slate-400" />
                  <span>Modo Detox (Desconectar)</span>
                </button>

                <div className={`my-1 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`} />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      onOpenAuth();
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left font-semibold transition-colors ${
                    theme === 'light'
                      ? 'text-amber-700 hover:bg-amber-50'
                      : 'text-amber-300 hover:bg-amber-950/30'
                  }`}
                >
                  <LogOut className="w-4 h-4 text-amber-500" />
                  <span>Salir de la cuenta</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left font-semibold transition-colors ${
                    theme === 'light'
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  <UserX className="w-4 h-4 text-rose-500" />
                  <span>Cerrar cuenta definitivamente</span>
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Retro MSN/BBM Personal Profile Card (Dynamic Light / Dark Theme) */}
      <div className={`relative rounded-3xl p-5 shadow-xl z-20 border transition-all ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 shadow-slate-200/60'
          : 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-slate-800'
      }`}>
        {/* Glow Accent */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl ${
            theme === 'light' ? 'bg-pink-400/10' : 'bg-pink-500/10'
          }`} />
        </div>

        {/* Fila Principal: Foto a la izquierda / Info estructurada a la derecha */}
        <div className="flex items-start gap-4">
          {/* Foto de perfil con indicador de estado */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 shadow-lg transition-transform hover:scale-105 ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-700'
              }`}
            />
            <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 ${
              theme === 'light' ? 'border-white' : 'border-slate-900'
            } ${STATUS_CONFIG[currentUser.status].dotColor} flex items-center justify-center text-xs shadow-md`}>
              {currentUser.status === 'en_crisis' ? '💜' : ''}
            </div>
          </div>

          {/* COLUMNA: NOMBRE (PRONOMBRES) -> MENSAJE / MÚSICA -> ESTATUS */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* 1. Nombre y apellido (pronombres) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className={`text-base font-extrabold ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {currentUser.name}
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                theme === 'light'
                  ? 'text-pink-700 bg-pink-100 border border-pink-200'
                  : 'text-pink-400 bg-pink-950/60 border border-pink-800/40'
              }`}>
                ({currentUser.pronouns})
              </span>
            </div>

            {/* 2. Mensaje personalizado O música identificada de Spotify/YouTube */}
            <div className="text-xs min-h-[22px] flex items-center">
              {statusDisplayMode === 'music' && currentUser.currentSong ? (
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <div
                    onClick={() => setStatusDisplayMode('message')}
                    className={`flex items-center gap-1.5 min-w-0 truncate font-mono text-[11px] cursor-pointer ${
                      parsedMusic.type === 'spotify' 
                        ? 'text-emerald-400 hover:text-emerald-300' 
                        : parsedMusic.type === 'youtube'
                        ? 'text-rose-400 hover:text-rose-300'
                        : theme === 'light' ? 'text-cyan-700 hover:text-cyan-600' : 'text-cyan-300 hover:text-cyan-200'
                    }`}
                    title="Clic para cambiar a tu mensaje personal"
                  >
                    {parsedMusic.type === 'spotify' ? (
                      <svg className="w-3.5 h-3.5 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.353-.674.464-1.027.249-2.812-1.718-6.353-2.107-10.523-1.155-.404.092-.806-.162-.898-.565-.092-.403.162-.806.565-.898 4.567-1.042 8.483-.598 11.634 1.342.353.215.464.674.249 1.027zm1.465-3.26c-.27.44-.846.579-1.287.31-3.22-1.979-8.128-2.551-11.936-1.394-.498.151-1.03-.134-1.181-.632-.151-.498.134-1.03.632-1.181 4.357-1.322 9.774-.683 13.462 1.61.441.269.58.846.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.592.18-1.217-.154-1.397-.746-.18-.592.154-1.217.746-1.397 4.238-1.287 11.272-1.039 15.719 1.601.533.316.707 1.009.391 1.542-.316.533-1.009.707-1.542.391z"/>
                      </svg>
                    ) : parsedMusic.type === 'youtube' ? (
                      <svg className="w-3.5 h-3.5 fill-rose-500 shrink-0" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    ) : (
                      <Music className="w-3.5 h-3.5 text-cyan-400 animate-bounce shrink-0" />
                    )}
                    <span className="truncate">
                      {parsedMusic.type === 'spotify' 
                        ? 'Spotify: Pista activa' 
                        : parsedMusic.type === 'youtube'
                        ? 'YouTube: Video activo'
                        : currentUser.currentSong}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatusDisplayMode('message')}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 text-[10px]"
                    title="Ver mensaje personal"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ) : isEditingMessage ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    className={`flex-1 border rounded-xl px-2.5 py-1 text-xs focus:outline-none ${
                      theme === 'light'
                        ? 'bg-slate-50 border-pink-400 text-slate-900'
                        : 'bg-slate-950 border-pink-500/60 text-slate-100'
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveMessage}
                    className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shrink-0"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <p
                    onClick={() => setIsEditingMessage(true)}
                    className={`italic cursor-pointer flex items-center gap-1.5 min-w-0 truncate group transition-colors ${
                      theme === 'light'
                        ? 'text-slate-600 hover:text-pink-600'
                        : 'text-slate-300 hover:text-pink-300'
                    }`}
                    title="Haz clic para editar tu mensaje de estado"
                  >
                    <span className="truncate">"{currentUser.personalMessage}"</span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-pink-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>

                  {currentUser.currentSong && (
                    <button
                      type="button"
                      onClick={() => setStatusDisplayMode('music')}
                      className="p-1 rounded-lg hover:bg-slate-800 text-cyan-400 shrink-0"
                      title="Mostrar canción que estoy escuchando"
                    >
                      <Music className="w-3.5 h-3.5 animate-pulse" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 3. Selector de Estatus */}
            <div className="pt-1 relative inline-block">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-colors shadow-sm ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ring-2 ${STATUS_CONFIG[currentUser.status].dotColor}`} />
                <span>{STATUS_CONFIG[currentUser.status].label}</span>
                <ChevronDown className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown */}
              {statusDropdownOpen && (
                <div className={`absolute left-0 mt-2 w-64 rounded-2xl border-2 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900/98 backdrop-blur-2xl border-slate-700 text-white'
                }`}>
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
                    theme === 'light' ? 'text-slate-500 border-slate-100' : 'text-slate-500 border-slate-800'
                  }`}>
                    Cambiar mi Estado
                  </div>
                  {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(st);
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors ${
                        theme === 'light'
                          ? currentUser.status === st
                            ? 'text-pink-600 font-bold bg-pink-50'
                            : 'text-slate-800 hover:bg-slate-50'
                          : currentUser.status === st
                          ? 'text-pink-300 font-bold bg-pink-950/30'
                          : 'text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="text-base">{STATUS_CONFIG[st].icon}</span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{STATUS_CONFIG[st].label}</p>
                        {st === 'en_crisis' && (
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">Acompañamiento prioritario</p>
                        )}
                        {st === 'desconectado' && (
                          <p className="text-[10px] text-slate-500 font-normal">Activa Modo Detox (Blanco y negro)</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Tira Inferior: Botón WhatsApp - Botón de QR */}
        <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 text-xs ${
          theme === 'light' ? 'border-slate-100 text-slate-700' : 'border-slate-800/80 text-slate-300'
        }`}>
          {/* Botón WhatsApp */}
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-bold text-xs">WhatsApp</span>
            <label className="relative inline-flex items-center cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={currentUser.allowWhatsAppBridge}
                onChange={onToggleWhatsAppBridge}
                className="sr-only peer"
              />
              <div className={`w-9 h-5 rounded-full peer peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${
                theme === 'light' ? 'bg-slate-200 after:border-slate-300 peer-checked:bg-emerald-500' : 'bg-slate-800 after:border-slate-300 peer-checked:bg-emerald-500'
              }`}></div>
            </label>
          </div>

          {/* Botón de QR */}
          <button
            type="button"
            onClick={onOpenSharePIN}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
              theme === 'light'
                ? 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200'
                : 'bg-slate-800 hover:bg-slate-750 text-pink-300 border-slate-700'
            }`}
            title="Abrir mi Código QR y PIN"
          >
            <QrCode className="w-4 h-4 text-pink-400" />
            <span className="font-mono">{currentUser.pin}</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación: Cerrar Cuenta Definitivamente */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-rose-900/60 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">¿Cerrar cuenta definitivamente?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Esta acción es <strong className="text-rose-400 font-bold">permanente e irreversible</strong>. Se borrarán tus datos locales, tus publicaciones, contactos y tu PIN disidente de este dispositivo.
              </p>
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/40 text-[11px] text-rose-300">
                ⚠️ No podrás recuperar el acceso con tu PIN actual.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onDeleteAccount?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all active:scale-95"
              >
                Sí, cerrar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
