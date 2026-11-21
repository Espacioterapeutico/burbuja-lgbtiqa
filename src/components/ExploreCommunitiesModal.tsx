import React, { useState } from 'react';
import { X, Search, Globe, KeyRound } from 'lucide-react';
import type { Community, CommunityPost, UserProfile } from '../types';
import { CommunityCard } from './dashboard/CommunityCard';
import { SoapBubble } from './SoapBubble';
import { authService } from '../services/authService';

interface ExploreCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: Community[];
  posts: CommunityPost[];
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onJoinCommunity: (comm: Community) => void;
  onSelectCommunity: (comm: Community) => void;
}

export const ExploreCommunitiesModal: React.FC<ExploreCommunitiesModalProps> = ({
  isOpen,
  onClose,
  communities,
  posts,
  currentUser,
  theme,
  onJoinCommunity,
  onSelectCommunity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // State for closed community PIN modal
  const [pinTargetComm, setPinTargetComm] = useState<Community | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuperadmin = authService.isSuperadmin(currentUser);

  // Filtrar comunidades que NO tengan al usuario agregado/unido
  // (Para el Superadmin, se muestran todas las comunidades para supervisión completa del sistema)
  const unjoinedCommunities = communities.filter(c => {
    if (isSuperadmin) return true;
    if (c.isJoined === true) return false;
    if (c.creatorId === currentUser.id) return false;
    if (c.members?.some(m => m.userId === currentUser.id)) return false;
    return true;
  });

  // Filtrado por buscador y etiquetas
  const query = searchQuery.toLowerCase().trim();
  const filteredCommunities = unjoinedCommunities.filter(c => {
    const matchesQuery = !query || (
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.tags.some(t => t.toLowerCase().includes(query))
    );

    const matchesTag = !selectedTag || c.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

    return matchesQuery && matchesTag;
  });

  // Obtener tags únicos para chips
  const allTags = Array.from(new Set(unjoinedCommunities.flatMap(c => c.tags))).slice(0, 8);

  const handleJoinClick = (comm: Community) => {
    if (comm.isClosed) {
      setPinTargetComm(comm);
      setEnteredPin('');
      setPinError(null);
    } else {
      onJoinCommunity(comm);
    }
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTargetComm) return;

    if (pinTargetComm.pinCode && enteredPin.trim().toUpperCase() !== pinTargetComm.pinCode.toUpperCase()) {
      setPinError(`El código PIN introducido no coincide. (Pista: ${pinTargetComm.pinCode})`);
      return;
    }

    onJoinCommunity(pinTargetComm);
    setPinTargetComm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'light'
          ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-950 border-slate-800 text-slate-100 shadow-purple-950/40'
      }`}>
        {/* Header con Mundito en Burbuja */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-3">
            {/* Burbuja de Jabón del mundito */}
            <SoapBubble idPrefix="modal-globe" sizeClass="w-10 h-10" glow="cyan" type="div">
              <Globe className="w-5 h-5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" strokeWidth={2.4} />
            </SoapBubble>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white">Explorar Comunidades</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {unjoinedCommunities.length} nuevas
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Espacios seguros a los que aún no te has unido
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buscador propio de Explorar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/60 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar en explorar por nombre, etiquetas (#Gaming, #Arte) o temática..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-2xl py-2.5 pl-10 pr-9 text-xs transition-all focus:outline-none ${
                theme === 'light'
                  ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-200"
                title="Limpiar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tags Chips */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                  selectedTag === null
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                Todas
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                    selectedTag === tag
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Comunidades Disponibles con Previsualización */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          {filteredCommunities.map(comm => (
            <CommunityCard
              key={comm.id}
              comm={comm}
              posts={posts}
              currentUser={currentUser}
              theme={theme}
              onSelectCommunity={onSelectCommunity}
              isExploreMode={true}
              onJoinCommunity={handleJoinClick}
            />
          ))}

          {filteredCommunities.length === 0 && (
            <div className="py-12 px-4 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                {unjoinedCommunities.length === 0 
                  ? '¡Ya estás unid@ a todas las comunidades disponibles!'
                  : 'No se encontraron comunidades con ese criterio.'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {unjoinedCommunities.length === 0 
                  ? 'Prueba a crear un nuevo espacio seguro con el botón de burbuja (+)'
                  : 'Prueba buscando con otra palabra clave o etiqueta (#Cultura, #Música, #Salud)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submodal para PIN en comunidades cerradas */}
      {pinTargetComm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border-2 border-cyan-800/80 p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Comunidad Privada</h4>
                <p className="text-[11px] text-slate-400">{pinTargetComm.name}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmPin} className="space-y-3">
              <p className="text-xs text-slate-300">
                Introduce el código PIN de invitación para unirte a este espacio protegido:
              </p>

              <input
                type="text"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Ej. SALUD-24"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white uppercase tracking-wider font-mono focus:outline-none"
                autoFocus
              />

              {pinError && (
                <p className="text-[11px] text-rose-400">{pinError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPinTargetComm(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Confirmar PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
