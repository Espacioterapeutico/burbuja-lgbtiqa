import React, { useState } from 'react';
import { Lock, Crown, ArrowRight, Pin, Clock, UserPlus, X, Info, Sparkles, Users } from 'lucide-react';
import type { Community, CommunityPost, UserProfile } from '../../types';
import { CommunityPostLivePreview } from './CommunityPostLivePreview';

interface CommunityCardProps {
  comm: Community;
  posts: CommunityPost[];
  currentUser: UserProfile;
  theme: 'dark' | 'light';
  onSelectCommunity: (comm: Community) => void;
  onTogglePinCommunity?: (commId: string) => void;
  isExploreMode?: boolean;
  onJoinCommunity?: (comm: Community) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  comm,
  posts,
  currentUser,
  theme,
  onSelectCommunity,
  onTogglePinCommunity,
  isExploreMode = false,
  onJoinCommunity
}) => {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const hasQuorum = comm.activeNow >= 3;
  const myMemberInComm = comm.members?.find(m => m.userId === currentUser.id);
  const myRoleInComm = myMemberInComm?.role || (comm.creatorId === currentUser.id ? 'admin' : null);
  const commPosts = posts.filter(p => p.communityId === comm.id);

  const formatRelativeActivity = (dateStr?: string) => {
    if (!dateStr) return null;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Actividad justo ahora';
    if (diffMins < 60) return `Activo hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Activo hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Activo hace ${diffDays} d`;
  };

  const activityText = formatRelativeActivity(comm.lastActivityAt);

  return (
    <div
      onClick={() => onSelectCommunity(comm)}
      className={`group p-3.5 sm:p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 transition-all shadow-md cursor-pointer text-left space-y-2.5 border ${
        comm.isPinned
          ? 'border-amber-500/60 ring-1 ring-amber-500/30 bg-gradient-to-b from-amber-950/15 via-slate-900/90 to-slate-900'
          : 'border-slate-800/80 hover:border-pink-500/40'
      }`}
    >
      {/* 1. Foto del grupo / Nombre + Badge de Admin en la MISMA LÍNEA + Pin a la derecha */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Foto/Icono de la comunidad: Clic abre la descripción completa para ahorrar espacio */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDescriptionModal(true);
            }}
            className="relative w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/70 flex items-center justify-center text-xl shrink-0 transition-transform hover:scale-110 active:scale-95 group/icon shadow-inner"
            title="Toca para ver la descripción e información del grupo"
          >
            <span>{comm.icon}</span>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-pink-500/60 flex items-center justify-center text-[9px] text-pink-300 shadow">
              <Info className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* Nombre de la comunidad + Admin en la misma línea */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
            <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors truncate">
              {comm.name}
            </h4>

            {/* Rol de Admin al lado del nombre en la misma línea */}
            {myRoleInComm === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/70 shadow-sm shrink-0">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Admin</span>
              </span>
            )}

            {comm.isClosed && (
              <span title="Comunidad protegida por PIN">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </span>
            )}
          </div>
        </div>

        {/* Pin Chincheta Button en la misma línea a la derecha */}
        {onTogglePinCommunity && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinCommunity(comm.id);
            }}
            className={`p-1.5 rounded-xl border transition-all shrink-0 active:scale-90 ${
              comm.isPinned
                ? 'bg-amber-950/80 border-amber-600/70 text-amber-300 shadow-sm'
                : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={comm.isPinned ? 'Desfijar' : 'Fijar de primero'}
          >
            <Pin className={`w-3.5 h-3.5 transition-transform ${comm.isPinned ? 'fill-amber-400 text-amber-300 rotate-45 scale-110' : ''}`} />
          </button>
        )}
      </div>

      {/* 2. Previsualización de Contenido (Directo después del título para ahorrar espacio) */}
      {commPosts.length > 0 && (
        <CommunityPostLivePreview
          posts={commPosts}
          theme={theme}
          onOpenConversation={() => onSelectCommunity(comm)}
        />
      )}

      {/* 3. Botón de Acción: Entrar o Unirme */}
      <div className="pt-0.5 flex justify-center">
        {isExploreMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onJoinCommunity?.(comm);
            }}
            className="w-full max-w-xs py-2 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{comm.isClosed ? 'Solicitar Acceso (PIN)' : 'Unirme a la Comunidad'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectCommunity(comm)}
            className="w-full max-w-xs py-2 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95"
          >
            <span>Entrar al Grupo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. MODAL DE DESCRIPCIÓN Y DETALLES (Al dar clic en la foto de la comunidad) */}
      {showDescriptionModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDescriptionModal(false);
          }}
          className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-default"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-left"
          >
            {/* Header con foto ampliada y nombre */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border-2 border-pink-500/60 flex items-center justify-center text-3xl shadow-lg">
                  {comm.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                    {comm.name}
                    {comm.isClosed && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  </h3>
                  <p className="text-xs text-pink-400 font-semibold">{comm.category}</p>
                  {myRoleInComm === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                      <Crown className="w-3 h-3" />
                      <span>Eres Administrador</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ESTADO DEL CHAT, MIEMBROS Y HACE CUÁNTOS MINUTOS (Dentro de la descripción) */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estado y Actividad del Grupo
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Si el chat está activo o no */}
                {hasQuorum ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Chat Activo ({comm.activeNow} personas conectadas)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Quorum: {comm.activeNow}/3 necesarios para chatear
                  </span>
                )}
              </div>

              {/* 2. Número de miembros y 3. Hace cuántos minutos */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <strong className="text-white">{comm.memberCount}</strong> miembros registrados
                </span>

                {activityText && (
                  <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-medium font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {activityText}
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIPCIÓN COMPLETA DEL ESPACIO SEGURO */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Descripción de la Comunidad</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {comm.description}
              </p>
            </div>

            {/* Temáticas / Tags */}
            {comm.tags && comm.tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block">Temáticas principales:</span>
                <div className="flex flex-wrap gap-1.5">
                  {comm.tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-pink-950/70 text-pink-300 border border-pink-800/40">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón para Entrar */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDescriptionModal(false);
                  onSelectCommunity(comm);
                }}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Entrar a la Comunidad</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
