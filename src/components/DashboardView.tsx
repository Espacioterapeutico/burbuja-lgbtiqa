import React, { useState } from 'react';
import { Compass, Users, Search, X } from 'lucide-react';
import type { UserProfile, Contact, UserStatus, Community, CommunityPost, BubbleConnectionRequest } from '../types';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { StoriesFeedBar } from './dashboard/StoriesFeedBar';
import { CommunitiesSection } from './dashboard/CommunitiesSection';
import { ContactsSection } from './dashboard/ContactsSection';

interface DashboardViewProps {
  currentUser: UserProfile;
  contacts: Contact[];
  communities: Community[];
  posts?: CommunityPost[];
  myStories: {
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenCreateStory: () => void;
  onViewMyStory: () => void;
  onSelectCommunity: (comm: Community) => void;
  onOpenCreateCommunity?: () => void;
  onOpenExplore?: () => void;
  onOpenRadar?: () => void;
  onOpenDirectChat?: (contact: Contact) => void;
  bubbleRequests?: BubbleConnectionRequest[];
  onAcceptBubbleRequest?: (req: BubbleConnectionRequest) => void;
  onRejectBubbleRequest?: (reqId: string) => void;
  onUpdateStatus: (status: UserStatus) => void;
  onUpdatePersonalMessage: (msg: string) => void;
  onToggleWhatsAppBridge: () => void;
  onOpenSharePIN: () => void;
  onOpenAddContact: () => void;
  onViewStory: (contact: Contact) => void;
  onOpenReport: (contact: Contact) => void;
  onToggleBlockContact: (contact: Contact, reason?: string) => void;
  onOpenProfile: () => void;
  onOpenSuperadmin: () => void;
  onOpenAuth: () => void;
  onTogglePinCommunity?: (commId: string) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  contacts,
  communities,
  posts = [],
  myStories,
  theme = 'dark',
  onToggleTheme,
  onOpenCreateStory,
  onViewMyStory,
  onSelectCommunity,
  onOpenCreateCommunity,
  onOpenExplore,
  onOpenRadar,
  onOpenDirectChat,
  bubbleRequests = [],
  onAcceptBubbleRequest,
  onRejectBubbleRequest,
  onTogglePinCommunity,
  onUpdateStatus,
  onUpdatePersonalMessage,
  onToggleWhatsAppBridge,
  onOpenSharePIN,
  onOpenAddContact,
  onViewStory,
  onOpenReport,
  onToggleBlockContact,
  onOpenProfile,
  onOpenSuperadmin,
  onOpenAuth,
  onLogout,
  onDeleteAccount
}) => {
  const [activeSection, setActiveSection] = useState<'comunidades' | 'contactos'>('comunidades');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar comunidades a las que el usuario sí pertenece para "Mis Comunidades"
  const myCommunities = communities.filter(c => {
    if (c.isJoined === false) return false;
    if (c.isJoined === true) return true;
    return c.members?.some(m => m.userId === currentUser.id) || c.creatorId === currentUser.id;
  });

  // Filtrado simultáneo de Comunidades y Contactos por el buscador global
  const query = searchQuery.toLowerCase().trim();

  const filteredCommunities = myCommunities.filter(c => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const filteredContacts = contacts.filter(c => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.personalMessage.toLowerCase().includes(query) ||
      (c.pin && c.pin.toLowerCase().includes(query))
    );
  });

  const contactsWithStories = filteredContacts.filter(c => c.stories && c.stories.length > 0);

  return (
    <div className="space-y-4 pb-24">
      {/* SECCIÓN 1: Perfil de Usuario, Estado, Música & Opciones */}
      <ProfileHeader
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenSharePIN={onOpenSharePIN}
        onOpenAddContact={onOpenAddContact}
        onOpenProfile={onOpenProfile}
        onOpenRadar={onOpenRadar}
        onOpenSuperadmin={onOpenSuperadmin}
        onOpenAuth={onOpenAuth}
        onUpdateStatus={onUpdateStatus}
        onUpdatePersonalMessage={onUpdatePersonalMessage}
        onToggleWhatsAppBridge={onToggleWhatsAppBridge}
        onLogout={onLogout}
        onDeleteAccount={onDeleteAccount}
      />

      {/* SECCIÓN 2: Buscador Global (Por encima de Comunidades y Contactos) */}
      <div className="relative">
        <Search className={`w-4 h-4 absolute left-3.5 top-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          placeholder="Buscar comunidades, etiquetas (#Lara, #Arte...) o contactos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-2xl py-2.5 pl-10 pr-9 text-xs transition-all focus:outline-none ${
            theme === 'light'
              ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-pink-500 shadow-sm'
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

      {/* SECCIÓN 3: Switcher Principal - MIS COMUNIDADES vs MIS CONTACTOS */}
      <div className={`flex border rounded-2xl p-1 shadow-inner ${
        theme === 'light' ? 'bg-slate-200/80 border-slate-300/80' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Mis Comunidades (Primera Píldora - Color Sólido) */}
        <button
          onClick={() => setActiveSection('comunidades')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'comunidades'
              ? 'bg-pink-600 text-white shadow-sm'
              : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Mis Comunidades ({filteredCommunities.length})</span>
        </button>

        {/* Mis Contactos (Segunda Píldora - Color Sólido) */}
        <button
          onClick={() => setActiveSection('contactos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'contactos'
              ? 'bg-pink-600 text-white shadow-sm'
              : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mis Contactos ({filteredContacts.length})</span>
        </button>
      </div>

      {/* SECCIÓN 4A: PESTAÑA MIS CONTACTOS (Historias 24h + Lista + Fichas de Bloqueo) */}
      {activeSection === 'contactos' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <StoriesFeedBar
            currentUser={currentUser}
            contactsWithStories={contactsWithStories}
            myStories={myStories}
            onViewMyStory={onViewMyStory}
            onOpenCreateStory={onOpenCreateStory}
            onViewStory={onViewStory}
          />

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
      )}

      {/* SECCIÓN 4B: PESTAÑA MIS COMUNIDADES (Filtros + Tarjetas con Previsualización) */}
      {activeSection === 'comunidades' && (
        <CommunitiesSection
          communities={filteredCommunities}
          posts={posts}
          currentUser={currentUser}
          theme={theme}
          onSelectCommunity={onSelectCommunity}
          onOpenCreateCommunity={onOpenCreateCommunity}
          onOpenExplore={onOpenExplore}
          onTogglePinCommunity={onTogglePinCommunity}
        />
      )}
    </div>
  );
};
