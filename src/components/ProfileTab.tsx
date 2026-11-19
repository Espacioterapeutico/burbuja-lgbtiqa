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
  MessageCircle,
  Sparkles,
  Plus,
  Palette,
  X
} from 'lucide-react';
import type { UserProfile, UserStatus, StandardUserStatus, CustomStatusItem } from '../types';
import { parseMusicLink } from '../utils/musicParser';
import { SUPERADMIN_PIN } from '../services/authService';
import { ApkDownloadModal } from './ApkDownloadModal';
import { getStatusConfig } from './StatusBadge';
import confetti from 'canvas-confetti';

interface ProfileTabProps {
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenEditProfile: () => void;
  onOpenSharePIN: () => void;
  onOpenSuperadmin?: () => void;
  onUpdateStatus: (status: UserStatus, customLabel?: string, customColor?: string) => void;
  onUpdatePersonalMessage: (msg: string) => void;
  onToggleWhatsAppBridge?: () => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
}

const STANDARD_STATUSES: { key: StandardUserStatus; label: string; dotColor: string; icon: string }[] = [
  { key: 'disponible', label: 'Disponible', dotColor: 'bg-emerald-500', icon: '🟢' },
  { key: 'ausente', label: 'Ausente', dotColor: 'bg-amber-500', icon: '🟠' },
  { key: 'ocupado', label: 'Ocupadx', dotColor: 'bg-rose-500', icon: '🔴' },
  { key: 'en_fiesta', label: 'De Fiesta', dotColor: 'bg-cyan-500', icon: '🪩' },
  { key: 'en_crisis', label: 'En Crisis', dotColor: 'bg-purple-500 animate-ping', icon: '💜' },
  { key: 'desconectado', label: 'Modo Detox (Silenciar)', dotColor: 'bg-slate-400', icon: '📵' },
];

const COLOR_PRESETS = [
  { name: 'Púrpura Queer', hex: '#a855f7' },
  { name: 'Rosa Neón', hex: '#ec4899' },
  { name: 'Cian Caribe', hex: '#06b6d4' },
  { name: 'Azul Eléctrico', hex: '#3b82f6' },
  { name: 'Verde Menta', hex: '#10b981' },
  { name: 'Lima Fresca', hex: '#84cc16' },
  { name: 'Amarillo Neón', hex: '#eab308' },
  { name: 'Naranja Fuego', hex: '#f97316' },
  { name: 'Rojo Pasión', hex: '#ef4444' },
  { name: 'Lavanda Suave', hex: '#8b5cf6' }
];

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
  const [copiedId, setCopiedId] = useState(false);
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [draftMsg, setDraftMsg] = useState(currentUser.personalMessage);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Estados personalizados
  const [customStatuses, setCustomStatuses] = useState<CustomStatusItem[]>(() => {
    try {
      const saved = localStorage.getItem('burbuja_custom_statuses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return currentUser.customStatuses || [
      { id: 'cs-estudiando', label: 'Estudiando 📚', color: '#3b82f6' },
      { id: 'cs-gym', label: 'En el gym 💪', color: '#10b981' },
      { id: 'cs-relax', label: 'Descansando ☕', color: '#ec4899' }
    ];
  });

  const [isCreatingCustomStatus, setIsCreatingCustomStatus] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#ec4899');

  const isSuperadmin = currentUser.id === 'superadmin-root' || currentUser.pin === SUPERADMIN_PIN;
  const parsedMusic = parseMusicLink(currentUser.currentSong);

  const curStatusConfig = getStatusConfig(
    currentUser.status, 
    currentUser.customStatusLabel, 
    currentUser.customStatusColor
  );

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

  const handleSaveAndApplyCustomStatus = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const label = newStatusText.trim();
    if (!label) return;

    const newItem: CustomStatusItem = {
      id: `cs-${Date.now()}`,
      label,
      color: newStatusColor,
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...customStatuses.filter(cs => cs.label.toLowerCase() !== label.toLowerCase())].slice(0, 8);
    setCustomStatuses(updated);
    try {
      localStorage.setItem('burbuja_custom_statuses', JSON.stringify(updated));
    } catch {}

    onUpdateStatus('personalizado', label, newStatusColor);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    setIsCreatingCustomStatus(false);
    setNewStatusText('');
  };

  const handleDeleteCustomStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customStatuses.filter(cs => cs.id !== id);
    setCustomStatuses(updated);
    try {
      localStorage.setItem('burbuja_custom_statuses', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectCustomStatus = (cs: CustomStatusItem) => {
    onUpdateStatus('personalizado', cs.label, cs.color);
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
            <div 
              className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 ${
                curStatusConfig.dotColor || ''
              } flex items-center justify-center text-xs shadow-md`}
              style={curStatusConfig.customColor ? { backgroundColor: curStatusConfig.customColor, boxShadow: `0 0 8px ${curStatusConfig.customColor}` } : undefined}
            >
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

            {/* Caja de PIN Personal (Siempre de Alto Contraste y 100% legible) */}
            <div 
              className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl border-2 transition-all shadow-md ${
                theme === 'light'
                  ? 'border-slate-800'
                  : 'border-pink-500/40'
              }`}
              style={{
                backgroundColor: '#090d16',
                borderColor: theme === 'light' ? '#1e293b' : '#ec489955'
              }}
            >
              <div className="text-left px-0.5">
                <span 
                  className="text-[9px] font-black uppercase tracking-wider block"
                  style={{ color: '#f472b6' }}
                >
                  Tu PIN Personal
                </span>
                <span 
                  className="font-mono text-base font-black tracking-widest block select-all"
                  style={{ color: '#ffffff', textShadow: '0 0 10px rgba(236,72,153,0.3)' }}
                >
                  {currentUser.pin}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPin}
                className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer ml-1"
                title="Copiar mi PIN"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* ID Único de Usuario (Enrutamiento Seguro en Base de Datos) */}
            <div 
              className="flex items-center justify-between px-3.5 py-2 rounded-2xl border shadow-inner mt-2"
              style={{
                backgroundColor: '#090d16',
                borderColor: theme === 'light' ? '#1e293b' : '#38bdf833'
              }}
            >
              <div className="text-left px-0.5 truncate mr-2">
                <span 
                  className="text-[9px] font-black uppercase tracking-wider block"
                  style={{ color: '#38bdf8' }}
                >
                  ID de Cuenta (Ruteo Seguro)
                </span>
                <span 
                  className="font-mono text-[11px] font-semibold tracking-wider block text-slate-300 truncate select-all"
                >
                  {currentUser.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(currentUser.id);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="p-1.5 rounded-xl bg-sky-600/80 hover:bg-sky-500 text-white transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer shrink-0"
                title="Copiar mi ID único"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
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

      {/* 3. Selector Rápido de Estado Emocional & Personalizado */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Tu Estado Actual
          </span>
          {curStatusConfig.customColor ? (
            <span
              style={{
                backgroundColor: `${curStatusConfig.customColor}20`,
                borderColor: `${curStatusConfig.customColor}40`,
                color: curStatusConfig.customColor
              }}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-sm"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: curStatusConfig.customColor, boxShadow: `0 0 6px ${curStatusConfig.customColor}` }}
              />
              <span className="truncate max-w-[130px]">{curStatusConfig.label}</span>
            </span>
          ) : (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${curStatusConfig.bgBadge} ${curStatusConfig.textBadge}`}>
              {curStatusConfig.label}
            </span>
          )}
        </div>

        {/* Estados Estándar (incluyendo Desconectarme) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STANDARD_STATUSES.map((st) => {
            const isSelected = currentUser.status === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => onUpdateStatus(st.key)}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500/15 text-pink-600 dark:text-pink-300 ring-2 ring-pink-500/30'
                    : theme === 'light'
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${st.dotColor}`} />
                  <span className="truncate">{st.label}</span>
                </div>
                <span className="text-xs">{st.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Sección de Estados Personalizados */}
        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span>Estados Personalizados</span>
            </span>
            {!isCreatingCustomStatus && (
              <button
                type="button"
                onClick={() => setIsCreatingCustomStatus(true)}
                className="text-[11px] font-extrabold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar estado</span>
              </button>
            )}
          </div>

          {/* Formulario Creador de Estado Personalizado */}
          {isCreatingCustomStatus ? (
            <div className={`p-3.5 rounded-2xl border space-y-3 animate-in fade-in zoom-in-95 ${
              theme === 'light' ? 'bg-slate-50 border-pink-300/80' : 'bg-slate-950/80 border-pink-500/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>Crear y Personalizar Estado</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomStatus(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Input de texto del estado */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Texto del estado (ej: Estudiando 📚, En el gym 💪, En pausa ☕)
                </label>
                <input
                  type="text"
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="Escribe tu estado..."
                  maxLength={35}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                    theme === 'light'
                      ? 'bg-white border-slate-300 focus:border-pink-500 text-slate-900'
                      : 'bg-slate-900 border-slate-700 focus:border-pink-500 text-slate-100'
                  }`}
                  autoFocus
                />
              </div>

              {/* Paleta de colores */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Personalizar Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewStatusColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center ${
                        newStatusColor === c.hex ? 'ring-2 ring-offset-2 ring-pink-500 scale-110 shadow-md' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {newStatusColor === c.hex && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                  
                  {/* Selector HEX libre */}
                  <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-300 dark:border-slate-700">
                    <label 
                      className="w-6 h-6 rounded-full cursor-pointer border border-white/40 flex items-center justify-center relative overflow-hidden shadow-sm"
                      style={{ backgroundColor: newStatusColor }}
                      title="Elegir cualquier color libre"
                    >
                      <input
                        type="color"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <Palette className="w-3 h-3 text-white mix-blend-difference" />
                    </label>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                      {newStatusColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Previsualización en vivo */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Vista previa en vivo:
                </span>
                <div
                  style={{
                    backgroundColor: `${newStatusColor}20`,
                    borderColor: `${newStatusColor}50`,
                    color: newStatusColor
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl border font-bold text-xs shadow-sm"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: newStatusColor, boxShadow: `0 0 8px ${newStatusColor}` }}
                  />
                  <span>{newStatusText.trim() || 'Tu estado personalizado'}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomStatus(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!newStatusText.trim()}
                  onClick={() => handleSaveAndApplyCustomStatus()}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-pink-600 hover:bg-pink-500 text-white disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar y Activar</span>
                </button>
              </div>
            </div>
          ) : (
            /* Lista de estados personalizados guardados */
            <div className="flex flex-wrap gap-2">
              {customStatuses.map((cs) => {
                const isActive = currentUser.status === 'personalizado' && currentUser.customStatusLabel === cs.label;
                return (
                  <div
                    key={cs.id}
                    className={`group relative inline-flex items-center rounded-2xl border transition-all active:scale-95 shadow-sm ${
                      isActive
                        ? 'ring-2 ring-offset-1'
                        : theme === 'light'
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200'
                    }`}
                    style={
                      isActive
                        ? { 
                            backgroundColor: `${cs.color}18`, 
                            borderColor: cs.color, 
                            color: cs.color,
                            boxShadow: `0 0 10px ${cs.color}30`
                          }
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectCustomStatus(cs)}
                      className="px-2.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cs.color, boxShadow: `0 0 5px ${cs.color}` }}
                      />
                      <span className="truncate max-w-[130px]">{cs.label}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomStatus(cs.id, e)}
                      className="pr-2 pl-0.5 text-slate-400 hover:text-rose-500 transition-colors opacity-60 group-hover:opacity-100"
                      title="Eliminar este estado"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCreatingCustomStatus(true)}
                className={`px-3 py-1.5 rounded-2xl border border-dashed text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  theme === 'light'
                    ? 'border-pink-300 text-pink-600 hover:bg-pink-50'
                    : 'border-pink-500/40 text-pink-400 hover:bg-pink-950/30'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Nuevo estado</span>
              </button>
            </div>
          )}
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

        {/* Compartir Pase de Invitación (PIN) */}
        <button
          type="button"
          onClick={onOpenSharePIN}
          className="w-full py-3 px-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/15 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/40 text-pink-700 dark:text-pink-300 text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-500">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-pink-700 dark:text-pink-200 block text-xs">
                Compartir Pase de Invitación
              </span>
              <span className="text-[10px] text-pink-600/80 dark:text-pink-400/80 block">
                Invita a personas de confianza con tu PIN
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-pink-500 text-white font-black uppercase tracking-wider shadow-sm">
            {currentUser.invitationsRemaining} pases
          </span>
        </button>

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

        {/* Descargar APK Android (Siempre visible para actualizar o instalar) */}
        <button
          type="button"
          onClick={() => setIsApkModalOpen(true)}
          className="w-full py-3 px-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-emerald-200 block text-xs">
                Descargar Burbuja LGBTIQ+ v1.0.0
              </span>
              <span className="text-[10px] text-emerald-400/80 block">
                Instalador oficial para Android (.APK)
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Nueva actualización</span>
          </span>
        </button>

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
      />
    </div>
  );
};
