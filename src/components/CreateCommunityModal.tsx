import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Globe, 
  Plus, 
  Hash, 
  Image as ImageIcon, 
  Smile, 
  Upload, 
  ShieldAlert 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Community, UserProfile } from '../types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateCommunity: (community: Community) => void;
}

const PRESET_ICONS = ['🌈', '🌆', '🎬', '🏳️‍⚧️', '📖', '🎨', '☕', '🌿', '🪩', '💜', '📢', '🤝', '🏕️', '⚽', '💻', '✨'];

const SUGGESTED_BANNED_WORDS = ['odio', 'acoso', 'amenazas', 'insultos', 'discriminación', 'datos personales', 'número telefónico'];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateCommunity
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  // Identidad visual: Icono vs Imagen propia
  const [identityMode, setIdentityMode] = useState<'icon' | 'image'>('icon');
  const [selectedIcon, setSelectedIcon] = useState('🌈');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isClosed, setIsClosed] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['EspacioSeguro']);

  // Palabras prohibidas / vetadas
  const [bannedWords, setBannedWords] = useState<string[]>(['odio', 'acoso', 'insultos']);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [autoMuteDuration, setAutoMuteDuration] = useState('Silenciado por 24 horas');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      setSelectedIcon(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags(prev => [...prev, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleAddBannedWord = (wordToAdd?: string) => {
    const word = (wordToAdd || newBannedWord).trim().toLowerCase();
    if (word && !bannedWords.includes(word)) {
      setBannedWords(prev => [...prev, word]);
      setNewBannedWord('');
    }
  };

  const handleRemoveBannedWord = (wordToRemove: string) => {
    setBannedWords(prev => prev.filter(w => w !== wordToRemove));
  };

  const isCustomImage = selectedIcon.startsWith('data:') || selectedIcon.startsWith('http') || selectedIcon.startsWith('/');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const finalIcon = identityMode === 'image' && customImage ? customImage : selectedIcon;

    const newCommunity: Community = {
      id: `comm-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      isClosed,
      pinCode: isClosed ? (pinCode.trim().toUpperCase() || `COMM-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      icon: finalIcon,
      memberCount: 1,
      activeNow: 1, // Will require quorum (at least 3 to activate group chat)
      tags: tags.length > 0 ? tags : ['EspacioSeguro'],
      creatorId: currentUser.id,
      lastActivityAt: new Date().toISOString(),
      isPinned: false,
      isJoined: true,
      bannedWords: bannedWords,
      autoMuteDuration: autoMuteDuration,
      members: [
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          userPin: currentUser.pin,
          role: 'admin',
          joinedAt: 'Fundador'
        }
      ],
      pendingRequests: []
    };

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#a855f7', '#06b6d4', '#10b981']
    });

    onCreateCommunity(newCommunity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-pink-950/50 overflow-hidden shrink-0 border border-pink-400/30">
              {isCustomImage ? (
                <img src={selectedIcon} alt="Icono de la comunidad" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedIcon}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                Crear Nueva Comunidad
                <Sparkles className="w-4 h-4 text-pink-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Serás el 👑 <strong className="text-pink-300">Administrador</strong> del espacio seguro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
          {/* Identidad Visual: Selector entre Ícono y Foto propia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300">
                Identidad Visual de la Comunidad *
              </label>
              
              {/* Selector de modo */}
              <div className="flex rounded-xl bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setIdentityMode('icon');
                    if (isCustomImage) setSelectedIcon('🌈');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    identityMode === 'icon' 
                      ? 'bg-pink-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Ícono / Emoji</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdentityMode('image');
                    if (customImage) setSelectedIcon(customImage);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    identityMode === 'image' 
                      ? 'bg-pink-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Foto Propia</span>
                </button>
              </div>
            </div>

            {/* Panel de Emojis */}
            {identityMode === 'icon' && (
              <div className="p-2.5 bg-slate-950/60 rounded-2xl border border-slate-800 animate-in fade-in duration-150">
                <div className="flex flex-wrap gap-2">
                  {PRESET_ICONS.map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setSelectedIcon(ico)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                        selectedIcon === ico
                          ? 'bg-pink-600 scale-110 shadow-md ring-2 ring-pink-400 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel de Subir Imagen Propia */}
            {identityMode === 'image' && (
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in duration-150">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border-2 border-dashed border-pink-500/60 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {customImage ? (
                      <img src={customImage} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-pink-400/80 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{customImage ? 'Cambiar Imagen' : 'Subir Imagen desde Galería'}</span>
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Sube el logo, foto de grupo o ilustración de tu comunidad (JPG, PNG o WebP).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nombre de la Comunidad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Voluntariado & Activismo Queer Barquisimeto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Category / Enfoque Libre */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Enfoque o Categoría Libre (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Activismo, Encuentros, Cultura, Salud..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Descripción & Propósito del Espacio *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explica de qué trata la comunidad, cuáles son las normas de convivencia y respeto mutuo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Privacy Toggle: Abierta vs Cerrada */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Tipo de Espacio y Privacidad
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsClosed(false)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  !isClosed
                    ? 'bg-pink-950/40 border-pink-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abierta</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Cualquier persona referida puede unirse y ver publicaciones.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsClosed(true)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  isClosed
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cerrada (Con filtro)</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Requiere solicitud aprobada por un moderador o clave PIN.
                </p>
              </button>
            </div>

            {isClosed && (
              <div className="mt-2.5 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                <label className="block text-[11px] font-semibold text-purple-200">
                  Código PIN de Invitación Directa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: ACTIV-2026"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-purple-700/60 rounded-lg px-3 py-1.5 text-xs font-mono text-purple-300 placeholder:text-purple-600 focus:outline-none"
                />
                <p className="text-[10px] text-purple-300/80">
                  Las personas que no tengan este PIN podrán solicitar ingreso y tú o tus moderadores decidirán si aceptarlas.
                </p>
              </div>
            )}
          </div>

          {/* SECCIÓN DEDICADA: MODERACIÓN Y PALABRAS VETADAS */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-200">
                  Filtro de Palabras Vetadas & Moderación
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                {bannedWords.length} vetadas
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Las palabras que agregues aquí se reemplazarán automáticamente por <em>«bububu»</em> o <em>«burbuja»</em> en el chat de la comunidad para evitar agresiones o filtraciones de privacidad.
            </p>

            {/* Input para agregar palabra vetada */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe una palabra a vetar..."
                value={newBannedWord}
                onChange={(e) => setNewBannedWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBannedWord();
                  }
                }}
                className="flex-1 bg-slate-950 border border-cyan-900/60 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddBannedWord()}
                className="px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Sugerencias Rápidas */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                Sugerencias de protección comunitaria:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_BANNED_WORDS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleAddBannedWord(sug)}
                    disabled={bannedWords.includes(sug)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                      bannedWords.includes(sug)
                        ? 'bg-slate-900/80 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border-cyan-800/50 active:scale-95'
                    }`}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de palabras vetadas activas */}
            {bannedWords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {bannedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBannedWord(word)}
                      className="text-cyan-400 hover:text-white transition-colors ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Selector de sanción por reincidencia */}
            <div className="pt-2 border-t border-cyan-900/40">
              <label className="block text-[11px] font-semibold text-cyan-300 mb-1">
                Sanción automática por reincidencia:
              </label>
              <select
                value={autoMuteDuration}
                onChange={(e) => setAutoMuteDuration(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Silenciado por 24 horas">Silenciar por 24 horas (Recomendado)</option>
                <option value="Silenciado por 12 horas">Silenciar por 12 horas</option>
                <option value="Silenciado por 1 hora">Silenciar por 1 hora</option>
                <option value="Solo reemplazo con bububu">Solo sustituir texto con bububu/burbuja</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Etiquetas temáticas
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Escribe una etiqueta y presiona +"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-950/70 text-pink-300 border border-pink-800/50"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Quorum Notice */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">
              ⚖️ Regla del Quorum Comunitario:
            </p>
            <p>
              Tu comunidad empezará con 1 miembro (tú). El chat grupal en tiempo real se desbloqueará en cuanto se sumen 2 personas más (mínimo 3 miembros activos), asegurando dinamismo y seguridad colectiva sin conversaciones privadas de 1 a 1.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              Crear Comunidad y Abrir Espacio Seguro 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
