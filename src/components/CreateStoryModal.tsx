import React, { useState, useRef } from 'react';
import { X, Sparkles, Send, Check, Camera, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../services/storageService';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishStory: (mediaUrl: string, caption: string, isOfficial?: boolean) => void;
  isAdmin?: boolean;
  defaultIsOfficial?: boolean;
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
  onPublishStory,
  isAdmin = false,
  defaultIsOfficial = false
}) => {
  const [selectedMedia, setSelectedMedia] = useState(SAMPLE_STORY_PRESETS[0].url);
  const [caption, setCaption] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [compressionBadge, setCompressionBadge] = useState<string | null>(null);
  const [isOfficialStory, setIsOfficialStory] = useState(defaultIsOfficial);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setCompressionBadge(null);
    try {
      const result = await storageService.uploadMedia(file, 'stories');
      setSelectedMedia(result.url);
      setCustomUrl(result.url);
      if (result.savedPercent > 0) {
        setCompressionBadge(
          `Comprimida: ${result.originalSizeKB} KB → ${result.compressedSizeKB} KB (-${result.savedPercent}%)`
        );
      }
    } catch (err: any) {
      alert(err?.message || 'Error al subir archivo.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

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

    onPublishStory(finalUrl, finalCaption, isOfficialStory);
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

            {compressionBadge && (
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                ⚡ {compressionBadge}
              </div>
            )}

            <div className="absolute bottom-3 inset-x-3">
              <p className="text-xs text-white bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10 truncate font-medium">
                {caption.trim() || 'Tu pie de foto aparecerá aquí...'}
              </p>
            </div>
          </div>

          {/* Botón para subir foto propia comprimida o elegir preset */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Sube tu foto o elige fondo:
              </label>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 disabled:opacity-50 text-pink-300 border border-pink-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Comprimiendo...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3 h-3" />
                    <span>Subir de mi Galería</span>
                  </>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_STORY_PRESETS.map((p) => {
                const isSelected = selectedMedia === p.url && !customUrl.trim();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => { setSelectedMedia(p.url); setCustomUrl(''); setCompressionBadge(null); }}
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

          {/* Toggle de Estado Oficial para ADMIN */}
          {isAdmin && (
            <div 
              onClick={() => setIsOfficialStory(!isOfficialStory)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isOfficialStory
                  ? 'bg-cyan-950/40 border-cyan-500/60 ring-2 ring-cyan-500/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📢</span>
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    Publicar como Estado Oficial
                  </span>
                  <span className="text-[10px] text-cyan-300 block">
                    Todos los usuarios lo verán, así no te tengan agregado
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                isOfficialStory ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-900'
              }`}>
                {isOfficialStory && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-500 leading-tight">
            🔒 Las fotos se comprimen automáticamente en WebP ultraligero antes de subirse.
          </p>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {isOfficialStory 
                ? 'Publicar Estado Oficial (Para Todos)' 
                : 'Publicar en mi Historia (24h)'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
