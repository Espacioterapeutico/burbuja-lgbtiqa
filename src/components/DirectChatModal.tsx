import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Camera, 
  Mic, 
  Send, 
  Play, 
  Pause,
  Lock,
  Zap,
  MoreVertical,
  Trash2,
  ShieldAlert,
  Flag,
  UserMinus,
  Eye,
  Bell,
  BellOff
} from 'lucide-react';
import type { Contact, UserProfile, ChatMessage } from '../types';
import { playVoiceNoteAudio, stopVoiceNoteAudio, playZumpSound } from '../utils/sound';
import { authService, SUPERADMIN_PIN } from '../services/authService';
import { supabase } from '../lib/supabase';
import { useBackHandler } from '../utils/navigationManager';

interface DirectChatModalProps {
  contact: Contact | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onDeleteContact?: (contact: Contact) => void;
  onBlockContact?: (contact: Contact, reason?: string) => void;
  onReportContact?: (contact: Contact) => void;
  onToggleMuteContact?: (contact: Contact) => void;
}

/**
 * Burbujita minimalista con líneas que representa el estado del mensaje:
 * - Reloj adentro: No enviado / enviando
 * - Check adentro: Enviado
 * - Sobrecito abierto adentro: Recibido / entregado
 */
const MessageStatusBubble: React.FC<{ status?: 'sending' | 'sent' | 'delivered' }> = ({ status = 'delivered' }) => {
  const label =
    status === 'sending'
      ? 'Burbuja: No enviado aún (Reloj)'
      : status === 'sent'
      ? 'Burbuja: Mensaje enviado (Check)'
      : 'Burbuja: Mensaje recibido (Sobrecito abierto)';

  return (
    <span title={label} className="inline-flex items-center">
      <svg
        viewBox="0 0 20 20"
        className="w-3.5 h-3.5 inline-block shrink-0 ml-1 text-pink-200/90"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 🫧 Contorno circular de la burbuja minimalista (sin relleno) */}
        <circle cx="10" cy="10" r="8" strokeWidth="1.2" opacity="0.9" />
        <path d="M14 6a6 6 0 0 0-2.5-1.5" strokeWidth="1" opacity="0.9" />

        {status === 'sending' && (
          /* ⏱️ Reloj minimalista de líneas (no enviado / pendiente) */
          <>
            <circle cx="10" cy="10" r="4.2" strokeWidth="1" strokeDasharray="1.5 1" opacity="0.9" />
            <path d="M10 7.8v2.4l1.6 1" strokeWidth="1.1" />
          </>
        )}

        {status === 'sent' && (
          /* ✓ Check o flechita minimalista adentro (enviado) */
          <path d="M6.5 10.5l2.2 2.2 4.5-4.8" strokeWidth="1.3" />
        )}

        {status === 'delivered' && (
          /* ✉️ Sobrecito abierto adentro (recibido / entregado) */
          <>
            <path d="M6 10v4.2h8v-4.2" strokeWidth="1.1" />
            <path d="M6 10l4 2.8 4-2.8" strokeWidth="1" />
            <path d="M6 10l4-2.6 4 2.6" strokeWidth="1.1" />
          </>
        )}
      </svg>
    </span>
  );
};

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  contact,
  currentUser,
  isOpen,
  onClose,
  onDeleteContact,
  onBlockContact,
  onReportContact,
  onToggleMuteContact
}) => {
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isViewOnceSelected, setIsViewOnceSelected] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [viewOncePhoto, setViewOncePhoto] = useState<{ id: string; url: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isZumping, setIsZumping] = useState(false);

  // Manejo de gestos hacia atrás / Back button nativo
  useBackHandler('direct-chat-zoom', !!zoomPhoto, () => setZoomPhoto(null), 40);
  useBackHandler('direct-chat-view-once', !!viewOncePhoto, () => setViewOncePhoto(null), 40);
  useBackHandler('direct-chat-menu', isMenuOpen, () => setIsMenuOpen(false), 30);
  useBackHandler('direct-chat-modal', isOpen, onClose, 20);

  // Historial de IDs de fotos vistas una vez
  const [viewedOnceIds, setViewedOnceIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('burbuja_viewed_once_ids') || '[]');
    } catch {
      return [];
    }
  });

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const voiceTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !contact) return null;

  const isAdmin = authService.isSuperadmin(currentUser);
  const isOfficialRecipient = 
    contact.id === 'superadmin-root' || 
    contact.id === 'burbuja-oficial' || 
    contact.pin === SUPERADMIN_PIN || 
    contact.name === 'Burbuja LGBTIQ';

  // Identificador único y determinista para la conversación directa
  const myPin = (isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.id === 'superadmin-root')
    ? SUPERADMIN_PIN
    : (currentUser.pin || currentUser.id || '')
  ).toUpperCase().trim();

  const theirPin = (isOfficialRecipient
    ? SUPERADMIN_PIN
    : (contact.pin || contact.id || '')
  ).toUpperCase().trim();

  const directChatId = `dm_${[myPin, theirPin].sort().join('_')}`;

  // Cargar mensajes existentes y suscripción en tiempo real
  useEffect(() => {
    if (!directChatId) return;

    // 1. Cargar desde LocalStorage para respuesta instantánea
    try {
      const saved = localStorage.getItem(`burbuja_dm_${directChatId}`);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setChatList(parsed);
        }
      }
    } catch {}

    // 2. Cargar historial real desde Supabase
    supabase
      .from('chat_messages')
      .select('*')
      .eq('community_id', directChatId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped: ChatMessage[] = data.map((m: any) => ({
            id: m.id,
            communityId: directChatId,
            senderName: m.sender_name,
            senderAvatar: m.sender_avatar || '/logo.svg',
            senderPronouns: m.sender_pronouns || '',
            text: m.text,
            isZump: !!m.is_zump || m.text === '⚡ ¡ZUMBIDO!',
            isViewOnce: !!m.is_view_once,
            isViewed: !!m.is_viewed,
            deliveryStatus: 'delivered',
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
            audioUrl: m.audio_url,
            audioDurationSeconds: m.audio_duration_seconds,
            imageUrl: m.image_url
          }));
          setChatList(mapped);
          try {
            localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(mapped));
            const cleanMyPin = currentUser.pin.toUpperCase().trim();
            const stored = localStorage.getItem(`burbuja_dm_last_read_${cleanMyPin}`);
            const lastReadMap = stored ? JSON.parse(stored) : {};
            lastReadMap[theirPin] = new Date().toISOString();
            localStorage.setItem(`burbuja_dm_last_read_${cleanMyPin}`, JSON.stringify(lastReadMap));
          } catch {}
        }
      });

    // 3. Suscripción Realtime a nuevos mensajes
    const channel = supabase
      .channel(`room_${directChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `community_id=eq.${directChatId}`
        },
        (payload: any) => {
          const m = payload.new;
          if (m) {
            const isIncomingZump = !!m.is_zump || m.text === '⚡ ¡ZUMBIDO!';
            if (isIncomingZump) {
              playZumpSound();
              setIsZumping(true);
              setTimeout(() => setIsZumping(false), 700);
            }

            const incoming: ChatMessage = {
              id: m.id,
              communityId: directChatId,
              senderName: m.sender_name,
              senderAvatar: m.sender_avatar || '/logo.svg',
              senderPronouns: m.sender_pronouns || '',
              text: m.text,
              isZump: isIncomingZump,
              isViewOnce: !!m.is_view_once,
              isViewed: !!m.is_viewed,
              deliveryStatus: 'delivered',
              timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
              audioUrl: m.audio_url,
              audioDurationSeconds: m.audio_duration_seconds,
              imageUrl: m.image_url
            };

            setChatList(prev => {
              if (prev.some(x => x.id === incoming.id)) return prev;
              const updated = [...prev, incoming];
              try {
                localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
                const cleanMyPin = currentUser.pin.toUpperCase().trim();
                const stored = localStorage.getItem(`burbuja_dm_last_read_${cleanMyPin}`);
                const lastReadMap = stored ? JSON.parse(stored) : {};
                lastReadMap[theirPin] = new Date().toISOString();
                localStorage.setItem(`burbuja_dm_last_read_${cleanMyPin}`, JSON.stringify(lastReadMap));
              } catch {}
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [directChatId]);

  // Scroll automático hacia el último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList]);

  // Toggle reproducción de nota de voz
  const handleTogglePlayVoice = (id: string, durationSeconds: number) => {
    if (playingVoiceId === id) {
      stopVoiceNoteAudio();
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      playVoiceNoteAudio(durationSeconds, () => {
        setPlayingVoiceId(null);
      });
    }
  };

  // Iniciar grabación de nota de voz simulada
  const handleStartVoice = () => {
    setIsRecordingVoice(true);
    setVoiceDuration(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceDuration(prev => prev + 1);
    }, 1000);
  };

  // Cancelar grabación
  const handleCancelVoice = () => {
    clearInterval(voiceTimerRef.current);
    setIsRecordingVoice(false);
    setVoiceDuration(0);
  };

  // Enviar nota de voz
  const handleSendVoice = () => {
    clearInterval(voiceTimerRef.current);
    setIsRecordingVoice(false);
    const dur = Math.max(1, voiceDuration);
    setVoiceDuration(0);

    const isSendingAsAdmin = isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.name.includes('Fundador'));

    const audioMsg: ChatMessage = {
      id: `dm-voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      communityId: directChatId,
      senderName: isSendingAsAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isSendingAsAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isSendingAsAdmin ? 'Oficial' : currentUser.pronouns,
      text: '🎙️ Nota de voz',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioUrl: 'mock-audio',
      audioDurationSeconds: dur,
      deliveryStatus: 'sent'
    };

    setChatList(prev => {
      const updated = [...prev, audioMsg];
      try {
        localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    supabase.from('chat_messages').insert([{
      id: audioMsg.id,
      community_id: directChatId,
      sender_name: audioMsg.senderName,
      sender_avatar: audioMsg.senderAvatar,
      sender_pronouns: audioMsg.senderPronouns,
      text: audioMsg.text,
      audio_url: audioMsg.audioUrl,
      audio_duration_seconds: audioMsg.audioDurationSeconds
    }]).then(() => {});
  };

  // Enviar un Zumbido (WLM Retro Nudge)
  const handleSendZump = () => {
    playZumpSound();
    setIsZumping(true);
    setTimeout(() => setIsZumping(false), 700);

    const isSendingAsAdmin = isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.name.includes('Fundador'));

    const zumpMsg: ChatMessage = {
      id: `dm-zump-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      communityId: directChatId,
      senderName: isSendingAsAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isSendingAsAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isSendingAsAdmin ? 'Oficial' : currentUser.pronouns,
      text: '⚡ ¡ZUMBIDO!',
      isZump: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'sent'
    };

    setChatList(prev => {
      const updated = [...prev, zumpMsg];
      try {
        localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    supabase.from('chat_messages').insert([{
      id: zumpMsg.id,
      community_id: directChatId,
      sender_name: zumpMsg.senderName,
      sender_avatar: zumpMsg.senderAvatar,
      sender_pronouns: zumpMsg.senderPronouns,
      text: zumpMsg.text,
      is_zump: true
    }]).then(() => {});
  };

  // Enviar mensaje de texto o foto
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedPhoto) return;

    const isSendingAsAdmin = isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.name.includes('Fundador'));
    const isEphemeral = isViewOnceSelected && !!attachedPhoto;

    const newMsg: ChatMessage = {
      id: `dm-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      communityId: directChatId,
      senderName: isSendingAsAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isSendingAsAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isSendingAsAdmin ? 'Oficial' : currentUser.pronouns,
      text: inputMessage.trim() || (isEphemeral ? '① Foto para ver una sola vez' : attachedPhoto ? '📷 Foto enviada' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedPhoto || undefined,
      isViewOnce: isEphemeral,
      deliveryStatus: 'sending'
    };

    // Agregar con estado 'sending' (reloj)
    setChatList(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setInputMessage('');
    setAttachedPhoto(null);
    setIsViewOnceSelected(false);

    // Guardar en Supabase y actualizar a estado 'sent' (check)
    supabase.from('chat_messages').insert([{
      id: newMsg.id,
      community_id: directChatId,
      sender_name: newMsg.senderName,
      sender_avatar: newMsg.senderAvatar,
      sender_pronouns: newMsg.senderPronouns,
      text: newMsg.text,
      image_url: newMsg.imageUrl,
      is_view_once: newMsg.isViewOnce
    }]).then(() => {
      setChatList(prev =>
        prev.map(m => (m.id === newMsg.id ? { ...m, deliveryStatus: 'sent' } : m))
      );
    });
  };

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Abrir foto de 1 sola vez
  const handleOpenViewOnce = (msg: ChatMessage) => {
    if (!msg.imageUrl) return;
    setViewOncePhoto({ id: msg.id, url: msg.imageUrl });
  };

  // Cerrar y destruir foto de 1 sola vez
  const handleCloseViewOnce = () => {
    if (viewOncePhoto) {
      const updated = [...viewedOnceIds, viewOncePhoto.id];
      setViewedOnceIds(updated);
      try {
        localStorage.setItem('burbuja_viewed_once_ids', JSON.stringify(updated));
      } catch {}

      // Actualizar en la lista local para que aparezca como "Foto abierta"
      setChatList(prev =>
        prev.map(m => (m.id === viewOncePhoto.id ? { ...m, isViewed: true } : m))
      );
    }
    setViewOncePhoto(null);
  };

  // Acciones del Menú Superior de 3 punticos
  const handleClearChat = async () => {
    setIsMenuOpen(false);
    if (!window.confirm(`¿Estás seguro de que deseas vaciar todos los mensajes de este chat con ${contact.name}?`)) {
      return;
    }
    setChatList([]);
    try {
      localStorage.removeItem(`burbuja_dm_${directChatId}`);
    } catch {}

    try {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('community_id', directChatId);
    } catch (e) {
      console.warn('Error al vaciar chat en Supabase:', e);
    }
  };

  const handleDeleteContactAction = () => {
    setIsMenuOpen(false);
    if (window.confirm(`¿Deseas eliminar a ${contact.name} de tus contactos?`)) {
      onDeleteContact?.(contact);
      onClose();
    }
  };

  const handleBlockContactAction = () => {
    setIsMenuOpen(false);
    if (window.confirm(`¿Deseas bloquear a ${contact.name}? Ya no podrá enviarte mensajes.`)) {
      onBlockContact?.(contact);
      onClose();
    }
  };

  const handleReportContactAction = () => {
    setIsMenuOpen(false);
    onReportContact?.(contact);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ${
        isZumping ? 'zump-active' : ''
      }`}
    >
      {/* Estilos CSS para el temblor de zumbido */}
      <style>{`
        .zump-active {
          animation: zumpShake 0.12s ease-in-out infinite alternate !important;
        }
        @keyframes zumpShake {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-6px, 3px) rotate(-1deg); }
          50% { transform: translate(6px, -3px) rotate(1deg); }
          75% { transform: translate(-4px, -4px) rotate(-0.5deg); }
          100% { transform: translate(5px, 2px) rotate(1deg); }
        }
      `}</style>

      {/* Header del Chat 1 a 1 */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 relative z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-pink-500 shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.svg';
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">{contact.name}</h3>
              {isOfficialRecipient && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500 text-white font-black uppercase tracking-wider">
                  OFICIAL 🫧
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-400 font-mono">
              {isOfficialRecipient ? 'Canal Oficial y Asistencia Comunitaria' : `Burbuja Conectada • ${contact.pin || 'En línea'}`}
            </p>
          </div>
        </div>

        {/* Botones de Cabecera: 3 Punticos + Cerrar */}
        <div className="flex items-center gap-1.5">
          {/* Menú de 3 Punticos */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              title="Más opciones de contacto y chat"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-48 py-1.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 text-left divide-y divide-slate-800">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Vaciar chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onToggleMuteContact?.(contact);
                      }}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      {contact.isMuted ? (
                        <>
                          <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Reactivar avisos</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Silenciar avisos</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDeleteContactAction}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <UserMinus className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Eliminar contacto</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBlockContactAction}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Bloquear contacto</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReportContactAction}
                      className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Denunciar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cuerpo de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Banner de Cifrado y Consentimiento */}
        <div className="text-center py-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Chat 1 a 1 protegido bajo consentimiento mutuo</span>
          </span>
          <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
            Los mensajes, fotos y audios en este canal solo son visibles entre tú y {contact.name}.
          </p>
        </div>

        {chatList.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs space-y-1">
            <p>¡Inicia la conversación con {contact.name}!</p>
            <p className="text-[10px] text-slate-600">Escribe un saludo, envía una foto o manda un zumbido ⚡</p>
          </div>
        )}

        {chatList.map((msg) => {
          const isMe = msg.senderName === currentUser.name || (isAdmin && msg.senderName === 'Burbuja LGBTIQ');

          // Banner especial de Zumbido
          if (msg.isZump || msg.text === '⚡ ¡ZUMBIDO!') {
            return (
              <div key={msg.id} className="flex justify-center my-2 animate-in zoom-in-95 duration-200">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg animate-pulse">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                  <span>
                    {isMe ? '¡Has enviado un zumbido! ⚡' : `¡${msg.senderName} te ha enviado un zumbido! ⚡`}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono ml-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          }

          const isViewOnceMsg = !!msg.isViewOnce;
          const isAlreadyViewed = !!msg.isViewed || viewedOnceIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar || contact.avatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 mb-1 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.svg';
                  }}
                />
              )}

              <div
                className={`max-w-[78%] rounded-2xl p-3 shadow-md ${
                  isMe
                    ? 'bg-pink-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* 1. Archivo Multimedia "Ver una sola vez" */}
                {isViewOnceMsg ? (
                  isMe ? (
                    /* Vista para el remitente */
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-pink-700/60 border border-pink-400/40 text-white mb-1">
                      <div className="w-7 h-7 rounded-full border-2 border-dashed border-white flex items-center justify-center font-black text-xs shrink-0">
                        1
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold">Foto para ver una vez</p>
                        <p className="text-[10px] text-pink-200">El contacto solo podrá abrirla una vez</p>
                      </div>
                    </div>
                  ) : isAlreadyViewed ? (
                    /* Vista para el receptor cuando YA fue abierta */
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 mb-1 opacity-75">
                      <div className="w-7 h-7 rounded-full border border-slate-600 flex items-center justify-center font-bold text-xs shrink-0 opacity-60">
                        1
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-semibold">Foto abierta</p>
                        <p className="text-[10px] text-slate-500">Este archivo ya fue visualizado</p>
                      </div>
                    </div>
                  ) : (
                    /* Vista para el receptor cuando AÚN NO ha sido abierta */
                    <button
                      type="button"
                      onClick={() => handleOpenViewOnce(msg)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/50 text-white mb-1 transition-all active:scale-98 group cursor-pointer text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-pink-600/30 border-2 border-pink-400 flex items-center justify-center font-black text-xs text-pink-300 group-hover:scale-105 transition-transform shrink-0">
                        1
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-pink-200 flex items-center gap-1.5">
                          <span>Foto para ver 1 vez</span>
                          <Eye className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                        </p>
                        <p className="text-[10px] text-slate-300">Toca para abrir y visualizar</p>
                      </div>
                    </button>
                  )
                ) : (
                  /* Foto normal permanente */
                  msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden cursor-pointer" onClick={() => setZoomPhoto(msg.imageUrl || null)}>
                      <img
                        src={msg.imageUrl}
                        alt="Foto compartida"
                        className="w-full max-h-48 object-cover rounded-xl hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )
                )}

                {/* 2. Nota de Voz */}
                {msg.audioUrl ? (
                  <div className="flex items-center gap-3 py-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlayVoice(msg.id, msg.audioDurationSeconds || 6)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        isMe ? 'bg-white text-pink-600' : 'bg-pink-600 text-white'
                      }`}
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-1 h-4">
                        {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 60].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              playingVoiceId === msg.id
                                ? isMe ? 'bg-white animate-pulse' : 'bg-pink-400 animate-pulse'
                                : isMe ? 'bg-pink-300/70' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono opacity-80 block mt-1">
                        00:{String(msg.audioDurationSeconds || 6).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                ) : (
                  !isViewOnceMsg && <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Pie de mensaje: Hora + Burbujita con líneas minimalistas (Reloj / Check / Sobrecito) */}
                <div
                  className={`text-[9px] flex items-center justify-end gap-1 mt-1 font-mono ${
                    isMe ? 'text-pink-200' : 'text-slate-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <MessageStatusBubble status={msg.deliveryStatus || 'delivered'} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Preview de foto adjunta antes de enviar con opción "Ver una sola vez" */}
      {attachedPhoto && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <img src={attachedPhoto} alt="Adjunto" className="w-10 h-10 object-cover rounded-lg border border-pink-500 shadow" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">Foto adjunta</span>
              <button
                type="button"
                onClick={() => setIsViewOnceSelected(prev => !prev)}
                className={`inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                  isViewOnceSelected
                    ? 'bg-pink-600 text-white border-pink-400 shadow-md ring-1 ring-pink-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Toca para alternar ver una sola vez"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black">
                  1
                </span>
                <span>{isViewOnceSelected ? '① Ver 1 sola vez ACTIVO' : 'Activar ver 1 sola vez'}</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAttachedPhoto(null);
              setIsViewOnceSelected(false);
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            title="Quitar foto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input / Barra de Envío */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCapturePhoto}
        />

        {isRecordingVoice ? (
          <div className="flex items-center justify-between bg-slate-950 border border-pink-500/60 rounded-2xl px-4 py-2.5 animate-pulse">
            <div className="flex items-center gap-2 text-pink-400">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
              <span className="text-xs font-mono font-bold">
                Grabando... 00:{String(voiceDuration).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelVoice}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendVoice}
                className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Enviar Nota
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
            {/* Botón Zumbido (Nudge Retro) */}
            <button
              type="button"
              onClick={handleSendZump}
              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 transition-all active:scale-90 shrink-0"
              title="¡Enviar Zumbido! ⚡"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>

            {/* Botón Foto */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Tomar o adjuntar foto"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Botón Nota de Voz */}
            <button
              type="button"
              onClick={handleStartVoice}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Grabar nota de voz"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input Texto */}
            <input
              type="text"
              placeholder={`Mensaje privado para ${contact.name.split(' ')[0]}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />

            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={!inputMessage.trim() && !attachedPhoto}
              className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-transform active:scale-95 shadow shrink-0"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Modal Zoom Foto Normal */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-lg w-full">
            <button
              type="button"
              onClick={() => setZoomPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white bg-slate-800/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomPhoto} alt="Zoom" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Modal de Foto de 1 Sola Vez (Efímera - Se autodestruye al salir) */}
      {viewOncePhoto && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in select-none">
          <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full border-2 border-pink-400 bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-black">
                1
              </span>
              <div>
                <p className="text-xs font-bold text-pink-200">Foto para ver una sola vez</p>
                <p className="text-[10px] text-slate-400">Esta foto se destruirá automáticamente al cerrar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseViewOnce}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-auto flex items-center justify-center max-h-[75vh]">
            <img
              src={viewOncePhoto.url}
              alt="Foto efímera"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
            />
          </div>

          <div className="text-center pb-2">
            <button
              type="button"
              onClick={handleCloseViewOnce}
              className="py-2.5 px-6 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg transition-transform active:scale-95"
            >
              Cerrar y eliminar foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};