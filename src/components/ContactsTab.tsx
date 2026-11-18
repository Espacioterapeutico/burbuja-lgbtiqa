import React, { useState } from 'react';
import { Search, X, UserPlus, Radio } from 'lucide-react';
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
      />
    </div>
  );
};
