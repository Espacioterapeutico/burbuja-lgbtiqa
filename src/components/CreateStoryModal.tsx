import React, { useState } from 'react';
import { X, Sparkles, Send, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishStory: (mediaUrl: string, caption: string) => void;
}

const SAMPLE_STORY_PRESETS = [
  {
    name: 'Atardecer',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Fiesta / Ballroom',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Café & Libros',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Orgullo 🏳️‍🌈',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80'
  }
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onPublishStory
}) => {
  const [selectedMedia, setSelectedMedia] = useState(SAMPLE_STORY_PRESETS[0].url);
  const [caption, setCaption] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = customUrl.trim() || selectedMedia;
    const finalCaption = caption.trim() || 'Compartiendo un momento en la Burbuja ✨';

    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#ec4899', '#a855f7', '#06b6d4', '#eab308']
    });

    onPublishStory(finalUrl, finalCaption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-left overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tu Historia de 24 Horas</span>
        </div>
        <h3 className="text-base font-bold text-white mb-4">
          Subir Historia a la Burbuja
        </h3>

        <form onSubmit={handlePublish} className="space-y-4">
          {/* Story Image Preview */}
          <div className="relative aspect-[9/10] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
            <img
              src={customUrl.trim() || selectedMedia}
              alt="Vista previa de tu historia"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            <div className="absolute bottom-3 inset-x-3">
              <p className="text-xs text-white bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10 truncate font-medium">
                {caption.trim() || 'Tu pie de foto aparecerá aquí...'}
              </p>
            </div>
          </div>

          {/* Quick preset selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Elige una imagen o momento:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_STORY_PRESETS.map((p) => {
                const isSelected = selectedMedia === p.url && !customUrl.trim();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => { setSelectedMedia(p.url); setCustomUrl(''); }}
                    className={`relative rounded-xl overflow-hidden border aspect-square transition-all ${
                      isSelected ? 'border-pink-500 ring-2 ring-pink-500/50 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute inset-0 bg-pink-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Mensaje o reflexión (opcional):
            </label>
            <input
              type="text"
              placeholder="¿Qué quieres compartir hoy con tu red?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          <p className="text-[10px] text-slate-500 leading-tight">
            🔒 Recuerda: Tus contactos solo podrán enviarte reacciones con emojis (sin chats privados directos).
          </p>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Publicar en mi Historia (24h)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
