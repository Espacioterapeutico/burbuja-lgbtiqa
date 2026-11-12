import React from 'react';
import { Plus, Globe } from 'lucide-react';
import type { Community, CommunityPost, UserProfile } from '../../types';
import { CommunityCard } from './CommunityCard';
import { SoapBubble } from '../SoapBubble';

interface CommunitiesSectionProps {
  communities: Community[];
  posts: CommunityPost[];
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onSelectCommunity: (comm: Community) => void;
  onOpenCreateCommunity?: () => void;
  onOpenExplore?: () => void;
  onTogglePinCommunity?: (commId: string) => void;
}

export const CommunitiesSection: React.FC<CommunitiesSectionProps> = ({
  communities,
  posts,
  currentUser,
  theme,
  onSelectCommunity,
  onOpenCreateCommunity,
  onOpenExplore,
  onTogglePinCommunity
}) => {
  // Filtrar solo las comunidades a las que el usuario sí está agregado / unido
  const joinedCommunities = communities.filter(c => {
    if (c.isJoined === false) return false;
    if (c.isJoined === true) return true;
    return c.members?.some(m => m.userId === currentUser.id) || c.creatorId === currentUser.id;
  });

  // Ordenar: Grupo fijado (solo 1 permitido) de primero, luego por última actividad
  const sortedCommunities = [...joinedCommunities].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const timeA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
    const timeB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header con Conteo y Botones Burbuja idénticos a la del chat: + (Crear) y 🌐 (Explorar) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Comunidades ({sortedCommunities.length})
        </span>

        {/* Burbujas de Jabón Auténticas (como la burbuja del chat): Crear Comunidad (+) y Explorar (🌐) */}
        <div className="flex items-center gap-2.5">
          {/* Burbuja de Jabón con el + adentro */}
          {onOpenCreateCommunity && (
            <SoapBubble
              idPrefix="bubble-create"
              sizeClass="w-9 h-9"
              glow="pink"
              onClick={onOpenCreateCommunity}
              title="Crear Comunidad (+)"
            >
              <Plus 
                className="w-4.5 h-4.5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" 
                strokeWidth={2.8} 
              />
            </SoapBubble>
          )}

          {/* Mundito en Burbuja de Jabón */}
          {onOpenExplore && (
            <SoapBubble
              idPrefix="bubble-explore"
              sizeClass="w-9 h-9"
              glow="cyan"
              onClick={onOpenExplore}
              title="Explorar nuevas comunidades (🌐)"
            >
              <Globe 
                className="w-4.5 h-4.5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" 
                strokeWidth={2.4} 
              />
            </SoapBubble>
          )}
        </div>
      </div>

      {/* Communities Cards Grid */}
      <div className="space-y-3">
        {sortedCommunities.map((comm) => (
          <CommunityCard
            key={comm.id}
            comm={comm}
            posts={posts}
            currentUser={currentUser}
            theme={theme}
            onSelectCommunity={onSelectCommunity}
            onTogglePinCommunity={onTogglePinCommunity}
          />
        ))}

        {sortedCommunities.length === 0 && (
          <div className="py-8 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2">
            <p className="text-xs">No encontramos comunidades en tu lista.</p>
            {onOpenExplore && (
              <button
                type="button"
                onClick={onOpenExplore}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Explorar comunidades disponibles</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
