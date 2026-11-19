import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Camera, 
  Mic, 
  Send, 
  Play, 
  Pause,
  Lock
} from 'lucide-react';
import type { Contact, UserProfile, ChatMessage } from '../types';
import { playVoiceNoteAudio, stopVoiceNoteAudio } from '../utils/sound';
import { authService, SUPERADMIN_PIN } from '../services/authService';
import { supabase } from '../lib/supabase';

interface DirectChatModalProps {
  contact: Contact | null;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  contact,
  currentUser,
  isOpen,
  onClose
}) => {
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const voiceTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !contact) return null;

  const isAdmin = authService.isSuperadmin(currentUser);
  const isOfficialRecipient = contact.id === 'superadmin-root' || contact.id === 'burbuja-oficial' || contact.pin === SUPERADMIN_PIN || contact.name === 'Burbuja LGBTIQ';

  // Identificador único y determinista para la conversación directa entre dos usuarios
  const myPin = (isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.id === 'superadmin-root')
    ? SUPERADMIN_PIN
    : (currentUser.pin || currentUser.id || '')
  ).toUpperCase().trim();

  const theirPin = (isOfficialRecipient
    ? SUPERADMIN_PIN
    : (contact.pin || contact.id || '')
  ).toUpperCase().trim();

  const directChatId = `dm_${[myPin, theirPin].sort().join('_')}`;

  // Cargar mensajes existentes y suscribirse a cambios en tiempo real
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

    // 2. Cargar historial real desde Supabase (tabla chat_messages con community_id = directChatId)
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
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
            audioUrl: m.audio_url,
            audioDurationSeconds: m.audio_duration_seconds,
            imageUrl: m.image_url
          }));
          setChatList(mapped);
          try {
            localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(mapped));
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
            const incoming: ChatMessage = {
              id: m.id,
              communityId: directChatId,
              senderName: m.sender_name,
              senderAvatar: m.sender_avatar || '/logo.svg',
              senderPronouns: m.sender_pronouns || '',
              text: m.text,
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

  // Auto-scroll al final al recibir o enviar mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList]);

  // Grabación de Audio
  const handleStartVoice = () => {
    setIsRecordingVoice(true);
    setVoiceDuration(0);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    voiceTimerRef.current = setInterval(() => {
      setVoiceDuration(prev => prev + 1);
    }, 1000);
  };

  const handleCancelVoice = () => {
    setIsRecordingVoice(false);
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setVoiceDuration(0);
  };

  const handleSendVoice = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    const dur = Math.max(1, voiceDuration);
    setIsRecordingVoice(false);
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
      audioDurationSeconds: dur
    };

    setChatList(prev => {
      const updated = [...prev, audioMsg];
      try {
        localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Guardar en Supabase
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

  // Reproducción de Audio
  const handleTogglePlayVoice = (msgId: string, durationSec: number = 6) => {
    if (playingVoiceId === msgId) {
      stopVoiceNoteAudio();
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(msgId);
      playVoiceNoteAudio(durationSec, () => {
        setPlayingVoiceId(null);
      });
    }
  };

  // Enviar Mensaje de Texto o Foto
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedPhoto) return;

    const isSendingAsAdmin = isAdmin && (currentUser.pin === SUPERADMIN_PIN || currentUser.name.includes('Fundador'));

    const newMsg: ChatMessage = {
      id: `dm-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      communityId: directChatId,
      senderName: isSendingAsAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isSendingAsAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isSendingAsAdmin ? 'Oficial' : currentUser.pronouns,
      text: inputMessage.trim() || (attachedPhoto ? '📷 Foto enviada' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedPhoto || undefined
    };

    setChatList(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`burbuja_dm_${directChatId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setInputMessage('');
    setAttachedPhoto(null);

    // Guardar en Supabase
    supabase.from('chat_messages').insert([{
      id: newMsg.id,
      community_id: directChatId,
      sender_name: newMsg.senderName,
      sender_avatar: newMsg.senderAvatar,
      sender_pronouns: newMsg.senderPronouns,
      text: newMsg.text,
      image_url: newMsg.imageUrl
    }]).then(() => {});
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Header del Chat 1 a 1 */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
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

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
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
            <p className="text-[10px] text-slate-600">Escribe un saludo o envía una nota de voz.</p>
          </div>
        )}

        {chatList.map((msg) => {
          const isMe = msg.senderName === currentUser.name || (isAdmin && msg.senderName === 'Burbuja LGBTIQ');

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar || contact.avatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 mb-1"
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
                {/* Si es una foto */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden cursor-pointer" onClick={() => setZoomPhoto(msg.imageUrl || null)}>
                    <img
                      src={msg.imageUrl}
                      alt="Foto compartida"
                      className="w-full max-h-48 object-cover rounded-xl hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}

                {/* Si es una Nota de Voz */}
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
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}

                <span
                  className={`text-[9px] block text-right mt-1 ${
                    isMe ? 'text-pink-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isMe && (
                <img
                  src={isAdmin ? '/logo.svg' : currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-pink-400 mb-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.svg';
                  }}
                />
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Preview de foto adjunta antes de enviar */}
      {attachedPhoto && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={attachedPhoto} alt="Adjunto" className="w-10 h-10 object-cover rounded-lg border border-pink-500" />
            <span className="text-xs text-slate-300">Foto lista para enviar</span>
          </div>
          <button
            onClick={() => setAttachedPhoto(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
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
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Botón Foto */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Tomar o adjuntar foto"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Botón Nota de Voz */}
            <button
              type="button"
              onClick={handleStartVoice}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
              className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-transform active:scale-95 shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Modal Zoom Foto */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setZoomPhoto(null)}
              className="absolute -top-10 right-0 p-2 text-white bg-slate-800/80 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomPhoto} alt="Zoom" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
