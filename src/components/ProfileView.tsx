import React, { useState, useRef } from 'react';
import { 
  QrCode, 
  Music, 
  X,
  Camera,
  Check,
  ExternalLink,
  User,
  Save
} from 'lucide-react';
import type { UserProfile, UserStatus } from '../types';
import { STATUS_CONFIG } from './StatusBadge';
import { parseMusicLink, DEMO_MUSIC_PRESETS } from '../utils/musicParser';

interface ProfileViewProps {
  currentUser: UserProfile;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenSharePIN: () => void;
  onToggleWhatsAppBridge: () => void;
  onUpdateStatus: (st: UserStatus) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onClose?: () => void;
}

// Avatares predefinidos diversos
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
];

const PRONOUN_PRESETS = ['Elle / He', 'Ella', 'Él', 'Elle', 'Ella / Elle', 'Él / Elle', 'Cualquiera'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenSharePIN,
  onUpdateStatus,
  onUpdateProfile,
  onClose
}) => {
  // Estados de edición del perfil
  const [name, setName] = useState(currentUser.name);
  const [pronouns, setPronouns] = useState(currentUser.pronouns);
  const [personalMessage, setPersonalMessage] = useState(currentUser.personalMessage);
  const [currentSong, setCurrentSong] = useState(currentUser.currentSong);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Análisis inteligente de la música (YouTube vs Spotify vs texto plano)
  const parsedMusic = parseMusicLink(currentSong);

  // Manejador de subida de foto personalizada desde archivo
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setShowAvatarPicker(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Guardar todos los cambios del perfil
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (onUpdateProfile) {
      onUpdateProfile({
        name: name.trim(),
        pronouns: pronouns.trim() || 'Elle',
        personalMessage: personalMessage.trim(),
        currentSong: currentSong.trim(),
        avatar,
        status
      });
    }

    onUpdateStatus(status);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center overflow-y-auto p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md my-auto space-y-4 pb-8">
        {/* Barra Superior con título y botón de cerrar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-pink-950/60 border border-pink-700/60 text-pink-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Editar Mi Perfil
              </h3>
              <p className="text-[11px] text-slate-400">Personaliza tus datos, pronombres y música</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Formulario Principal de Edición de Perfil */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4 text-left">
            <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-red-500 via-yellow-500 via-emerald-500 via-blue-500 to-purple-500" />

            {/* 1. SELECCIÓN DE FOTO DE PERFIL / AVATAR */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative group">
                <img
                  src={avatar}
                  alt={name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-800 shadow-xl group-hover:opacity-90 transition-opacity"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white shadow-lg border-2 border-slate-900 transition-transform active:scale-95"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="mt-3 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors"
              >
                {showAvatarPicker ? 'Ocultar opciones de foto' : 'Cambiar foto de perfil'}
              </button>

              {/* Selector Desplegable de Avatares o Subida desde Galería */}
              {showAvatarPicker && (
                <div className="w-full mt-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Elige un avatar o sube el tuyo
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Subir foto</span>
                    </button>
                  </div>

                  {/* Input oculto para subir archivo */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />

                  {/* Galería de avatares predefinidos */}
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((avUrl, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setAvatar(avUrl);
                          setShowAvatarPicker(false);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 ${
                          avatar === avUrl ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-slate-800'
                        }`}
                      >
                        <img src={avUrl} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                        {avatar === avUrl && (
                          <div className="absolute inset-0 bg-pink-600/40 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. NOMBRE COMPLETO Y PRONOMBRES */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Tu Nombre o Apodo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Pronombres
                </label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="Ej. Elle / He, Ella, Él"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2 px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none mb-1.5"
                />

                {/* Chips de pronombres rápidos */}
                <div className="flex flex-wrap gap-1">
                  {PRONOUN_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPronouns(p)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                        pronouns === p
                          ? 'bg-pink-950 text-pink-300 border-pink-700 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. MENSAJE PERSONAL / "SOBRE MÍ" */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Mensaje Personal (Sobre mí)
                </label>
                <textarea
                  rows={2}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Escribe lo que sientes o tu estado de ánimo actual..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2 px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* 4. MÚSICA QUE ESTÁS ESCUCHANDO (IDENTIFICACIÓN INTELIGENTE DE YOUTUBE Y SPOTIFY) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Música (YouTube o Spotify)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Sin código HTML</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={currentSong}
                    onChange={(e) => setCurrentSong(e.target.value)}
                    placeholder="Pega enlace de Spotify o YouTube, o escribe Artista - Canción"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
                  />
                  {currentSong && (
                    <button
                      type="button"
                      onClick={() => setCurrentSong('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Previsualización e Identificación Automática */}
                {currentSong.trim() && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    {/* Tarjeta de Spotify Detectada */}
                    {parsedMusic.type === 'spotify' && parsedMusic.spotifyTrackId && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <div className="flex items-center gap-1.5">
                            {/* Logo oficial verde de Spotify */}
                            <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.306c-.215.353-.674.464-1.027.249-2.812-1.718-6.353-2.107-10.523-1.155-.404.092-.806-.162-.898-.565-.092-.403.162-.806.565-.898 4.567-1.042 8.483-.598 11.634 1.342.353.215.464.674.249 1.027zm1.465-3.26c-.27.44-.846.579-1.287.31-3.22-1.979-8.128-2.551-11.936-1.394-.498.151-1.03-.134-1.181-.632-.151-.498.134-1.03.632-1.181 4.357-1.322 9.774-.683 13.462 1.61.441.269.58.846.31 1.287zm.126-3.41c-3.86-2.292-10.228-2.504-13.914-1.385-.592.18-1.217-.154-1.397-.746-.18-.592.154-1.217.746-1.397 4.238-1.287 11.272-1.039 15.719 1.601.533.316.707 1.009.391 1.542-.316.533-1.009.707-1.542.391z"/>
                            </svg>
                            <span>🟢 Enlace de Spotify Reconocido</span>
                          </div>
                          <a
                            href={parsedMusic.rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-normal"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        {/* Reproductor embebido de Spotify sin necesidad de que el usuario meta HTML */}
                        <div className="rounded-xl overflow-hidden shadow-inner border border-emerald-900/40">
                          <iframe
                            src={parsedMusic.embedUrl}
                            width="100%"
                            height="80"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            title="Spotify Player"
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tarjeta de YouTube Detectada */}
                    {parsedMusic.type === 'youtube' && parsedMusic.youtubeId && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                          <div className="flex items-center gap-1.5">
                            {/* Logo oficial rojo de YouTube */}
                            <svg className="w-4 h-4 fill-rose-500" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            <span>🔴 Video de YouTube Reconocido</span>
                          </div>
                          <a
                            href={parsedMusic.rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 font-normal"
                          >
                            <span>Ver en YouTube</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        {/* Reproductor embebido de YouTube */}
                        <div className="rounded-xl overflow-hidden aspect-video max-h-40 border border-rose-950/60 shadow">
                          <iframe
                            src={parsedMusic.embedUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube Player"
                          />
                        </div>
                      </div>
                    )}

                    {/* Texto simple de canción */}
                    {parsedMusic.type === 'custom' && (
                      <div className="flex items-center gap-2 text-xs text-cyan-300">
                        <Music className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate">🎵 Pista: {parsedMusic.artist ? `${parsedMusic.artist} - ${parsedMusic.title}` : parsedMusic.title}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Canciones de demostración para probar con 1 clic */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 block mb-1">
                    O toca una para probar cómo se ve:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {DEMO_MUSIC_PRESETS.map((dm) => (
                      <button
                        type="button"
                        key={dm.name}
                        onClick={() => setCurrentSong(dm.url)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1"
                      >
                        <span className={dm.source === 'spotify' ? 'text-emerald-400' : 'text-rose-400'}>
                          {dm.source === 'spotify' ? '🟢 Spotify' : '🔴 YouTube'}
                        </span>
                        <span>{dm.name.split(' - ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. SELECTOR DE ESTADO */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Estado Actual de Conexión
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(STATUS_CONFIG) as UserStatus[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatus(st)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        status === st
                          ? 'bg-pink-950/50 border-pink-500/60 text-pink-200 shadow-sm font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{STATUS_CONFIG[st].icon}</span>
                      <span className="truncate">{STATUS_CONFIG[st].label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. PIN ALFANUMÉRICO (INMUTABLE DE SEGURIDAD) */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tu PIN Alfanumérico</span>
                  <div className="text-lg font-mono font-black text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text tracking-widest">
                    {currentUser.pin}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenSharePIN}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-transform active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5 text-pink-400" />
                  <span>Ver QR</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDAR CAMBIOS */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-pink-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios del Perfil</span>
          </button>
        </form>

        {/* Notificación Toast de Guardado Exitoso */}
        {isSavedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-60 px-5 py-3 rounded-2xl bg-emerald-950/95 border-2 border-emerald-500 text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">¡Tu perfil se ha actualizado con éxito! ✨</span>
          </div>
        )}
      </div>
    </div>
  );
};
