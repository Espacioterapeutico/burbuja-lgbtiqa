import React, { useState, useRef } from 'react';
import { 
  X, 
  ArrowLeft, 
  Camera, 
  Mic, 
  Send, 
  Play, 
  Pause
} from 'lucide-react';
import type { Contact, UserProfile, ChatMessage } from '../types';
import { playVoiceNoteAudio, stopVoiceNoteAudio } from '../utils/sound';
import { authService } from '../services/authService';

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
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'BL-4410A': [
      {
        id: 'dm-val-1',
        communityId: 'direct',
        senderName: 'Val Martínez',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        senderPronouns: 'Ella',
        text: '¡Hola Alex! Qué bueno que conectemos por acá 🌈 Me encantó tu último aporte.',
        timestamp: '15:10'
      }
    ],
    'BL-8871Z': [
      {
        id: 'dm-sam-1',
        communityId: 'direct',
        senderName: 'Sam Ortiz',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        senderPronouns: 'Elle',
        text: '¡Hola! Gracias por estar presente en la comunidad 💜',
        timestamp: '14:20'
      }
    ],
    'BL-8190C': [
      {
        id: 'dm-mat-1',
        communityId: 'direct',
        senderName: 'Mateo Salazar',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        senderPronouns: 'Él',
        text: '¡Burbujas conectadas! 🫧 Qué bueno saludarte Alex, vi que estamos cerca en Barquisimeto.',
        timestamp: 'Recién conectado'
      }
    ]
  });

  const [inputMessage, setInputMessage] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const voiceTimerRef = useRef<any>(null);

  if (!isOpen || !contact) return null;

  const isAdmin = authService.isSuperadmin(currentUser);
  const isOfficialContact = contact.id === 'burbuja-oficial' || contact.pin === 'BL-94X7A' || contact.name === 'Burbuja LGBTIQ';

  const contactKey = contact.pin || contact.id;
  const currentChatHistory = messages[contactKey] || [
    {
      id: `welcome-${contact.id}`,
      communityId: 'direct',
      senderName: isOfficialContact ? 'Burbuja LGBTIQ' : contact.name,
      senderAvatar: isOfficialContact ? '/logo.svg' : contact.avatar,
      senderPronouns: isOfficialContact ? 'Oficial' : contact.pronouns,
      text: isOfficialContact 
        ? `¡Hola! Te damos la bienvenida al canal oficial de atención de Burbuja LGBTIQA+ 🫧 ¿En qué te podemos acompañar hoy?`
        : `¡Burbujas conectadas con éxito! 🫧 Conversación privada protegida punto a punto.`,
      timestamp: 'Ahora'
    }
  ];

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

    const audioMsg: ChatMessage = {
      id: `dm-voice-${Date.now()}`,
      communityId: 'direct',
      senderName: isAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isAdmin ? 'Oficial' : currentUser.pronouns,
      text: '🎙️ Nota de voz',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioUrl: 'mock-audio',
      audioDurationSeconds: dur
    };

    setMessages(prev => ({
      ...prev,
      [contactKey]: [...(prev[contactKey] || []), audioMsg]
    }));

    simulateReply();
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

  // Enviar Mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedPhoto) return;

    const newMsg: ChatMessage = {
      id: `dm-msg-${Date.now()}`,
      communityId: 'direct',
      senderName: isAdmin ? 'Burbuja LGBTIQ' : currentUser.name,
      senderAvatar: isAdmin ? '/logo.svg' : currentUser.avatar,
      senderPronouns: isAdmin ? 'Oficial' : currentUser.pronouns,
      text: inputMessage.trim() || (attachedPhoto ? '📷 Foto enviada' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedPhoto || undefined
    };

    setMessages(prev => ({
      ...prev,
      [contactKey]: [...(prev[contactKey] || []), newMsg]
    }));

    setInputMessage('');
    setAttachedPhoto(null);

    simulateReply();
  };

  // Respuesta simulada para dar vida al chat 1 a 1
  const simulateReply = () => {
    setTimeout(() => {
      const replies = [
        `¡Hola ${currentUser.name.split(' ')[0]}! Qué lindo leerte en este espacio privado 🫧 Me da mucha tranquilidad coincidir contigo.`,
        `¡Totalmente de acuerdo! Me alegra haber conectado nuestras burbujas ✨ Cuenta conmigo para lo que necesites.`,
        `¡Genial! Me encantó tu mensaje. Estamos en contacto directo por aquí 💜`
      ];

      const botMsg: ChatMessage = {
        id: `dm-bot-${Date.now()}`,
        communityId: 'direct',
        senderName: contact.name,
        senderAvatar: contact.avatar,
        senderPronouns: contact.pronouns,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => ({
        ...prev,
        [contactKey]: [...(prev[contactKey] || []), botMsg]
      }));
    }, 1200);
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
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
          </div>

          <div>
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>{isOfficialContact ? 'Burbuja LGBTIQ' : contact.name}</span>
              {isOfficialContact ? (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                  <span>Oficial</span>
                  <span>🫧</span>
                </span>
              ) : (
                <span className="text-[10px] font-normal text-pink-300">({contact.pronouns})</span>
              )}
            </h3>
            <p className="text-[10px] text-emerald-400 font-mono">
              {isOfficialContact 
                ? 'Canal Oficial y Asistencia Comunitaria' 
                : `Burbujas Conectadas • PIN: ${contact.pin}`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Historial de Mensajes 1 a 1 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        <div className="text-center py-2 space-y-1">
          <span className="text-[11px] font-semibold text-slate-300 bg-slate-900 px-3.5 py-1 rounded-full border border-slate-800 inline-block shadow-sm">
            🔒 Chat 1 a 1 protegido bajo consentimiento mutuo
          </span>
          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
            Los mensajes, fotos y audios en este canal solo son visibles entre tú y {isOfficialContact ? 'Burbuja LGBTIQ' : contact.name}.
          </p>
        </div>

        {currentChatHistory.map((msg) => {
          const isMe = msg.senderName === currentUser.name || (isAdmin && msg.senderName === 'Burbuja LGBTIQ');

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700 shadow"
              />

              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className="text-[9px] text-slate-400 mb-0.5">{msg.timestamp}</span>

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    isMe
                      ? 'bg-pink-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Foto Instantánea */}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Foto"
                      onClick={() => setZoomPhoto(msg.imageUrl || null)}
                      className="w-full h-auto max-h-48 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  )}

                  {/* Nota de Voz */}
                  {msg.audioUrl && (
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/30 border border-white/10 min-w-[190px]">
                      <button
                        type="button"
                        onClick={() => handleTogglePlayVoice(msg.id, msg.audioDurationSeconds || 6)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          playingVoiceId === msg.id ? 'bg-amber-400 text-slate-950' : 'bg-pink-500 text-white'
                        }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-3.5 h-3.5 fill-slate-950" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-1 h-4">
                        {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4].map((h, idx) => (
                          <span
                            key={idx}
                            className={`w-1 rounded-full ${playingVoiceId === msg.id ? 'bg-pink-300 animate-pulse' : 'bg-slate-400'}`}
                            style={{ height: `${h * 100}%` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono text-slate-300 shrink-0">
                        0:0{msg.audioDurationSeconds || 6}
                      </span>
                    </div>
                  )}

                  {/* Texto */}
                  {msg.text && <p>{msg.text}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Entrada del Chat 1 a 1 */}
      <div className="bg-slate-900 border-t border-slate-800">
        {/* Previsualización de Foto antes de enviar */}
        {attachedPhoto && (
          <div className="p-2.5 px-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <img src={attachedPhoto} alt="Foto" className="w-10 h-10 rounded-xl object-cover border border-pink-500" />
              <span className="text-xs text-slate-300">Foto lista para enviar</span>
            </div>
            <button onClick={() => setAttachedPhoto(null)} className="p-1 rounded-full text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grabación de Audio en Curso */}
        {isRecordingVoice ? (
          <div className="p-3 px-4 flex items-center justify-between bg-rose-950/70 border-t border-rose-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-rose-200">
                Grabando nota de voz: 00:0{voiceDuration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelVoice}
                className="p-1.5 px-3 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendVoice}
                className="p-1.5 px-3 rounded-xl bg-pink-600 text-xs font-bold text-white flex items-center gap-1 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="p-3">
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') setAttachedPhoto(reader.result);
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-pink-400 border border-slate-800 transition-colors"
                title="Tomar o adjuntar foto"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleStartVoice}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
                title="Grabar nota de voz"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`Mensaje privado para ${contact.name.split(' ')[0]}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() && !attachedPhoto}
                className="p-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lightbox de foto */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in"
        >
          <button
            onClick={() => setZoomPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={zoomPhoto} alt="Foto ampliada" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
        </div>
      )}
    </div>
  );
};
