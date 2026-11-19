import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Globe, 
  Music, 
  EyeOff, 
  Check, 
  Compass,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, Contact } from '../types';
import { supabase } from '../lib/supabase';
import { getStatusConfig } from './StatusBadge';
import { SingleBubbleIcon } from './CommunityView';

interface RadarBurbujasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onToggleRadarVisible: (active: boolean) => void;
  onSendConnectionRequest: (target: Contact, introMessage: string) => void;
  sentRequestsPins: string[];
}

export const RadarBurbujasModal: React.FC<RadarBurbujasModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  theme,
  onToggleRadarVisible,
  onSendConnectionRequest,
  sentRequestsPins
}) => {
  const [selectedBubbleUser, setSelectedBubbleUser] = useState<(Contact & { distanceKm: number; city: string }) | null>(null);
  const [introMessage, setIntroMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<(Contact & { distanceKm: number; city: string })[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNearby = async () => {
    if (!currentUser.radarVisible) return;
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('radar_visible', true);

      if (!error && data) {
        const filtered = data.filter((p: any) => p.id !== currentUser.id && p.pin?.toUpperCase() !== currentUser.pin?.toUpperCase());
        setNearbyUsers(
          filtered.map((p: any) => {
            const charSum = (p.id || p.pin || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
            const distance = Number(((charSum % 25 + 3) / 10).toFixed(1));
            return {
              id: p.id,
              name: p.name,
              pronouns: p.pronouns || 'Comunidad',
              avatar: p.avatar || '/logo.svg',
              pin: p.pin,
              status: (p.status || 'disponible') as any,
              personalMessage: p.personal_message || 'Burbuja activa en el radar 🫧',
              currentSong: p.current_song || '',
              allowWhatsAppBridge: !!p.allow_whatsapp_bridge,
              stories: [],
              distanceKm: distance,
              city: p.city || 'Barquisimeto'
            };
          })
        );
      }
    } catch (err) {
      console.warn('Error al buscar perfiles en radar:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !currentUser.radarVisible) return;

    fetchNearby();

    // Suscripción Realtime a cambios en la tabla profiles para ver burbujas conectarse en vivo
    const channel = supabase
      .channel('radar_presence_feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchNearby();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUser.radarVisible, currentUser.id, currentUser.pin]);

  if (!isOpen) return null;

  const isRadarActive = !!currentUser.radarVisible;

  // Ordenar personas por distancia más cercana primero
  const sortedNearbyUsers = [...nearbyUsers].sort((a, b) => a.distanceKm - b.distanceKm);

  const handleOpenConnectModal = (user: Contact & { distanceKm: number; city: string }) => {
    setSelectedBubbleUser(user);
    setIntroMessage(`¡Hola ${user.name.split(' ')[0]}! Vi tu burbuja cerca y me gustaría conectar 🫧✨`);
    setIsSendingRequest(false);
  };

  const handleConfirmSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBubbleUser) return;

    onSendConnectionRequest(selectedBubbleUser, introMessage.trim());

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#06b6d4', '#a855f7']
    });

    setSuccessToast(`¡Solicitud para Conectar Burbujas enviada a ${selectedBubbleUser.name}! 🫧`);
    setSelectedBubbleUser(null);
    setIsSendingRequest(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-slate-300/60'
          : 'bg-slate-950 border-slate-800 text-slate-100 shadow-purple-950/40'
      }`}>
        {/* Header del Radar */}
        <div className={`p-4 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <SingleBubbleIcon className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <span>Explorar Personas Cercanas</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  Cercanía
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-pink-400" />
                <span>Barquisimeto & Alrededores (Ordenado por proximidad)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isRadarActive && (
              <button
                type="button"
                onClick={fetchNearby}
                disabled={isRefreshing}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors disabled:opacity-50"
                title="Actualizar radar en vivo"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO: REGLA DE RECIPROCIDAD (PUERTA DE ACTIVACIÓN) VS BURBUJAS ACTIVAS */}
        {!isRadarActive ? (
          /* 1. Puerta: Primero debes activar tu burbuja para ver a los demás */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              {/* Burbuja grande representativa del usuario */}
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-2xl animate-pulse">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 border-2 border-pink-500 text-pink-400 shadow">
                <EyeOff className="w-4 h-4" />
              </span>
            </div>

            <div className="max-w-xs space-y-2">
              <h4 className="text-base font-extrabold text-white">
                Activa tu Burbuja para Explorar
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                En <strong>Burbuja</strong> cuidamos la reciprocidad: para ver a otras personas de la comunidad a tu alrededor, primero debes hacer visible tu propia burbuja.
              </p>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
                <p>🔒 <strong>Privacidad protegida:</strong> Nunca compartimos tu ubicación exacta ni dirección; solo tu distancia aproximada o ciudad.</p>
                <p>✨ Puedes apagar tu visibilidad en cualquier momento.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleRadarVisible(true)}
              className="w-full max-w-xs py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-xl shadow-pink-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>Activar mi Burbuja y Explorar</span>
            </button>
          </div>
        ) : (
          /* 2. Constelación de Burbujas Flotantes por Proximidad */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Barra de Estado de tu Burbuja */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">Tu burbuja está activa y visible</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleRadarVisible(false)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-1"
              >
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>Ocultarme</span>
              </button>
            </div>

            {/* Aviso de Proximidad */}
            <div className="text-center py-1">
              <span className="text-[11px] text-slate-400 font-medium bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800/80 inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Toca una burbuja para ver su perfil y <strong>Conectar Burbujas 🫧</strong></span>
              </span>
            </div>

            {/* Cuadrícula / Constelación de Burbujas Flotantes */}
            {sortedNearbyUsers.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4">
                No hay otras burbujas activas cerca en este momento.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {sortedNearbyUsers.map((user) => {
                const isSent = sentRequestsPins.includes(user.pin);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleOpenConnectModal(user)}
                    className="group relative p-3.5 rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-pink-500/50 transition-all shadow-lg cursor-pointer flex flex-col items-center text-center space-y-2 hover:-translate-y-1 duration-200"
                  >
                    {/* Burbuja Flotante Esférica con Avatar */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-pink-500/40 group-hover:border-pink-400 animate-pulse pointer-events-none" />
                      
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-800 group-hover:scale-105 transition-transform"
                      />

                      {/* Icono de jabón irisado de fondo */}
                      <SingleBubbleIcon className="absolute inset-0 w-20 h-20 opacity-80 pointer-events-none" />

                      {/* Distancia exacta aproximada */}
                      <span className="absolute -bottom-1.5 inset-x-0 mx-auto w-fit px-2 py-0.5 rounded-full bg-slate-950/90 text-cyan-300 border border-cyan-800/60 text-[9px] font-mono font-bold shadow-md">
                        {user.distanceKm} km
                      </span>
                    </div>

                    <div className="w-full">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-pink-300 transition-colors">
                        {user.name}
                      </h4>
                      <p className="text-[10px] text-pink-400 font-semibold">{user.pronouns}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.city}</p>
                    </div>

                    {/* Botón de Conectar Burbuja en la tarjeta */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConnectModal(user);
                      }}
                      className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                        isSent
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                          : 'bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/40'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Solicitud enviada</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-pink-400" />
                          <span>Conectar Burbujas</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MODAL DE SOLICITUD DE "CONECTAR BURBUJAS 🫧" AL TOCAR UNA PERSONA */}
        {selectedBubbleUser && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-left">
              {/* Header del perfil seleccionado */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedBubbleUser.avatar}
                      alt={selectedBubbleUser.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500 shadow-lg"
                    />
                    {(() => {
                      const stConf = getStatusConfig(selectedBubbleUser.status, selectedBubbleUser.customStatusLabel, selectedBubbleUser.customStatusColor);
                      return (
                        <span 
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                            stConf.dotColor || ''
                          }`}
                          style={stConf.customColor ? { backgroundColor: stConf.customColor } : undefined}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                      {selectedBubbleUser.name}
                    </h3>
                    <p className="text-xs text-pink-400 font-medium">({selectedBubbleUser.pronouns})</p>
                    <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-pink-400" />
                      <span>{selectedBubbleUser.city} • a {selectedBubbleUser.distanceKm} km</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBubbleUser(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mensaje Personal / "Sobre mí" */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Sobre mí:</span>
                "{selectedBubbleUser.personalMessage}"
              </div>

              {/* Canción favorita */}
              {selectedBubbleUser.currentSong && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
                  <Music className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedBubbleUser.currentSong}</span>
                </div>
              )}

              {/* Formulario de Saludo para "Conectar Burbujas" */}
              <form onSubmit={handleConfirmSendRequest} className="space-y-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Mensaje para Conectar Burbujas 🫧
                  </label>
                  <textarea
                    rows={2}
                    value={introMessage}
                    onChange={(e) => setIntroMessage(e.target.value)}
                    placeholder="Escribe un mensaje de saludo cordial..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 leading-snug">
                  🛡️ <strong>Consentimiento seguro:</strong> {selectedBubbleUser.name.split(' ')[0]} recibirá tu solicitud y decidirá si conectar burbujas contigo antes de habilitar el chat.
                </div>

                <button
                  type="submit"
                  disabled={isSendingRequest}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SingleBubbleIcon className="w-4 h-4" />
                  <span>Conectar Burbujas con {selectedBubbleUser.name.split(' ')[0]}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notificación */}
        {successToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-60 px-5 py-3 rounded-2xl bg-slate-900/95 border-2 border-cyan-400 text-white shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-sm">
            <span className="text-lg">🫧</span>
            <span className="text-xs font-bold text-slate-100">{successToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
