import React, { useState } from 'react';
import { Search, X, UserPlus, Radio, Check } from 'lucide-react';
import type { Contact, UserProfile, BubbleConnectionRequest } from '../types';
import { StoriesFeedBar } from './dashboard/StoriesFeedBar';
import { ContactsSection } from './dashboard/ContactsSection';

interface ContactsTabProps {
  currentUser: UserProfile;
  contacts: Contact[];
  myStories: {
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[];
  theme: 'dark' | 'light';
  bubbleRequests: BubbleConnectionRequest[];
  onAcceptBubbleRequest: (req: BubbleConnectionRequest) => void;
  onRejectBubbleRequest: (reqId: string) => void;
  onRemoveContact?: (contact: Contact) => void;
  onOpenAddContact: () => void;
  onOpenRadar: () => void;
  onOpenDirectChat: (contact: Contact) => void;
  onViewStory: (contact: Contact) => void;
  onOpenCreateStory: () => void;
  onViewMyStory: () => void;
  onOpenReport: (contact: Contact) => void;
  onToggleBlockContact: (contact: Contact, reason?: string) => void;
  officialContact?: Contact;
  isAdmin?: boolean;
  onOpenCreateOfficialStory?: () => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  currentUser,
  contacts,
  myStories,
  theme,
  bubbleRequests,
  onAcceptBubbleRequest,
  onRejectBubbleRequest,
  onRemoveContact,
  onOpenAddContact,
  onOpenRadar,
  onOpenDirectChat,
  onViewStory,
  onOpenCreateStory,
  onViewMyStory,
  onOpenReport,
  onToggleBlockContact,
  officialContact,
  isAdmin = false,
  onOpenCreateOfficialStory
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.personalMessage.toLowerCase().includes(q) ||
      (c.pin && c.pin.toLowerCase().includes(q))
    );
  });

  const contactsWithStories = filteredContacts.filter((c) => c.stories && c.stories.length > 0);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200 text-left">
      {/* 1. Header de Contactos */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className={`text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Contactos y Chats
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tus conexiones privadas en la red de confianza
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenRadar}
              className="p-2 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 transition-all active:scale-95 shadow-sm"
              title="Abrir Radar de Cercanía"
            >
              <Radio className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Agregar persona por PIN"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        {/* BANNER DESTACADO DE SOLICITUDES ENTRANTES */}
        {bubbleRequests && bubbleRequests.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-slate-900 border-2 border-pink-500 shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-bold border border-pink-500/40 animate-bounce">
                  🫧
                </span>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>¡Tienes {bubbleRequests.length} Solicitud{bubbleRequests.length > 1 ? 'es' : ''} de Conexión!</span>
                  </h3>
                  <p className="text-[10px] text-pink-300/80">
                    Personas que quieren conectar sus burbujas contigo
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black font-mono bg-pink-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                {bubbleRequests.length} nueva{bubbleRequests.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {bubbleRequests.map(req => (
                <div key={req.id} className="p-2.5 rounded-2xl bg-slate-950/90 border border-pink-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img 
                        src={req.fromUserAvatar} 
                        alt={req.fromUserName} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-pink-500" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg'; }} 
                      />
                      <span className="absolute -bottom-1 -right-1 text-[10px]">🫧</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{req.fromUserName}</span>
                        <span className="text-[10px] text-pink-400 font-medium">({req.fromUserPronouns})</span>
                      </div>
                      {req.introMessage && (
                        <p className="text-[11px] text-slate-300 italic truncate">"{req.introMessage}"</p>
                      )}
                      <span className="font-mono text-[9px] text-slate-500">{req.fromUserPin}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAcceptBubbleRequest(req)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Aceptar y conectar"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aceptar 🫧</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRejectBubbleRequest(req.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700 transition-all active:scale-95 cursor-pointer"
                      title="Rechazar solicitud"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Barra de Historias (Estilo Estados de WhatsApp / Instagram) */}
        <StoriesFeedBar
          currentUser={currentUser}
          contactsWithStories={contactsWithStories}
          myStories={myStories}
          onViewMyStory={onViewMyStory}
          onOpenCreateStory={onOpenCreateStory}
          onViewStory={onViewStory}
          officialContact={officialContact}
          isAdmin={isAdmin}
          onOpenCreateOfficialStory={onOpenCreateOfficialStory}
        />

        {/* 3. Buscador de Contactos */}
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3.5 top-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Buscar contactos por nombre, mensaje o PIN..."
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

      {/* 4. Lista de Contactos, Peticiones y Chats */}
      <ContactsSection
        contacts={filteredContacts}
        onOpenAddContact={onOpenAddContact}
        onViewStory={onViewStory}
        onOpenReport={onOpenReport}
        onToggleBlockContact={onToggleBlockContact}
        onOpenDirectChat={onOpenDirectChat}
        onOpenRadar={onOpenRadar}
        bubbleRequests={bubbleRequests}
        onAcceptBubbleRequest={onAcceptBubbleRequest}
        onRejectBubbleRequest={onRejectBubbleRequest}
        onRemoveContact={onRemoveContact}
      />
    </div>
  );
};
