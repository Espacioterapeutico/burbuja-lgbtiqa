import React, { useState } from 'react';
import { X, Megaphone, Send, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GlobalBroadcast } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (broadcast: GlobalBroadcast) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendBroadcast
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'informativo' | 'alerta_seguridad'>('informativo');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);

    const newBroadcast: GlobalBroadcast = {
      id: `bc-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      urgency,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authorName: 'Burbuja LGBTIQ (Oficial)'
    };

    setTimeout(() => {
      onSendBroadcast(newBroadcast);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
      setIsSending(false);
      setTitle('');
      setMessage('');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl text-left overflow-hidden space-y-4">
        {/* Glow de fondo */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Encabezado */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-white">
                  Mensaje de Difusión
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transmite a toda la comunidad de Barquisimeto & Lara
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {/* Tipo de Urgencia */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Tipo de Difusión
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('informativo')}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  urgency === 'informativo'
                    ? 'border-pink-500 bg-pink-500/20 text-pink-200 ring-2 ring-pink-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                <div className="text-left">
                  <span className="block leading-none">Comunicado</span>
                  <span className="text-[10px] font-normal text-slate-400">Noticias y eventos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('alerta_seguridad')}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  urgency === 'alerta_seguridad'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-left">
                  <span className="block leading-none">Alerta Segura</span>
                  <span className="text-[10px] font-normal text-slate-400">Prioridad alta</span>
                </div>
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Título del Anuncio
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 🌈 Encuentro Comunitario Seguro / Actualización"
              maxLength={70}
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Mensaje Completo
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el mensaje que recibirán todos los participantes de la Burbuja..."
              rows={3}
              maxLength={400}
              required
              className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-0.5">
              <span>Firmado como: <strong>Burbuja LGBTIQ (Oficial)</strong></span>
              <span>{message.length}/400</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitiendo...' : 'Transmitir Difusión'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
