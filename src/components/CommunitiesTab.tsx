import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import type { Community, CommunityPost, ChatMessage, UserProfile, Contact } from '../types';
import { CommunitiesSection } from './dashboard/CommunitiesSection';
import { CommunityView } from './CommunityView';

interface CommunitiesTabProps {
  communities: Community[];
  posts: CommunityPost[];
  chatMessages: ChatMessage[];
  selectedCommunity: Community | null;
  onSelectCommunity: (comm: Community | null) => void;
  onSendMessage: (
    text: string,
    isZump?: boolean,
    media?: { audioUrl?: string; audioDurationSeconds?: number; imageUrl?: string }
  ) => void;
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  isZumping: boolean;
  onTriggerZump: () => void;
  onOpenSharePIN: () => void;
  onOpenCreateCommunity: () => void;
  onOpenExplore: () => void;
  onTogglePinCommunity?: (commId: string) => void;
  onOpenManageCommunity?: () => void;
  onMuteMember?: (communityId: string, userId: string, muteDurationText: string | null) => void;
  onAddContact?: (contact: Contact) => void;
  onOpenReport?: (contact: Contact) => void;
}

export const CommunitiesTab: React.FC<CommunitiesTabProps> = ({
  communities,
  posts,
  chatMessages,
  selectedCommunity,
  onSelectCommunity,
  onSendMessage,
  currentUser,
  theme,
  isZumping,
  onTriggerZump,
  onOpenSharePIN,
  onOpenCreateCommunity,
  onOpenExplore,
  onTogglePinCommunity,
  onOpenManageCommunity,
  onMuteMember,
  onAddContact,
  onOpenReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Si hay una comunidad seleccionada con id válido y diferente de 'none', mostramos la vista completa del chat y muro
  if (selectedCommunity && selectedCommunity.id !== 'none') {
    return (
      <div className="animate-in fade-in duration-200 pb-20">
        <CommunityView
          communities={communities}
          selectedCommunity={selectedCommunity}
          onSelectCommunity={(c) => onSelectCommunity(c)}
          posts={posts}
          chatMessages={chatMessages}
          onSendMessage={onSendMessage}
          currentUser={currentUser}
          isZumping={isZumping}
          onTriggerZump={onTriggerZump}
          onOpenSharePIN={onOpenSharePIN}
          onBack={() => onSelectCommunity(null)}
          onOpenCreateCommunity={onOpenCreateCommunity}
          onOpenManageCommunity={onOpenManageCommunity}
          onMuteMember={onMuteMember}
          onAddContact={onAddContact}
          onOpenReport={onOpenReport}
        />
      </div>
    );
  }

  // Filtrado de comunidades por buscador
  const filteredCommunities = communities.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 text-left">
      {/* 1. Header con Buscador y botón para Crear/Explorar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className={`text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Comunidades
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenCreateCommunity}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            title="Crear nueva comunidad"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Buscar comunidades, etiquetas (#Lara, #Arte...) o temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl py-2.5 pl-10 pr-9 text-xs transition-all focus:outline-none ${
              theme === 'light'
                ? 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-pink-500 shadow-sm'
                : 'bg-slate-900/90 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-pink-500/60'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
              title="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Tarjetas y Muro de Comunidades con previsualizaciones */}
      <CommunitiesSection
        communities={filteredCommunities}
        posts={posts}
        currentUser={currentUser}
        theme={theme}
        onSelectCommunity={(c) => onSelectCommunity(c)}
        onOpenCreateCommunity={onOpenCreateCommunity}
        onOpenExplore={onOpenExplore}
        onTogglePinCommunity={onTogglePinCommunity}
      />
    </div>
  );
};
