import { useState, useEffect } from 'react';
import type { 
  UserProfile, 
  Contact, 
  Community, 
  CommunityPost, 
  ChatMessage, 
  UserStatus, 
  UserReport, 
  MSNToast, 
  CommunityRole, 
  CommunityMember,
  BubbleConnectionRequest,
  ManagedUser,
  GlobalBroadcast
} from './types';
import { DetoxStandbyView } from './components/DetoxStandbyView';
import { MSNToastContainer } from './components/MSNToastContainer';
import { GlobalModals } from './components/GlobalModals';
import { ExploreCommunitiesModal } from './components/ExploreCommunitiesModal';
import { BottomNavBar, type MainTab } from './components/BottomNavBar';
import { CommunitiesTab } from './components/CommunitiesTab';
import { ContactsTab } from './components/ContactsTab';
import { ProfileTab } from './components/ProfileTab';
import { playMsnOnlineChime } from './utils/sound';
import { authService, SUPERADMIN_PIN } from './services/authService';
import { supabase } from './lib/supabase';
import { Logo } from './components/Logo';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { AdminBottomMenu } from './components/AdminBottomMenu';
import { BroadcastModal } from './components/BroadcastModal';
import { BubbleStatusNotificationContainer, type StatusNotificationItem } from './components/BubbleStatusNotification';
import { Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  contactsMock, 
  communitiesMock, 
  mockReports, 
  bubbleRequestsMock, 
  managedUsersMock, 
  globalBroadcastsMock 
} from './mockData';

const isLocalServer = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const guestUser: UserProfile = {
  id: 'guest',
  name: 'Invitadx',
  pronouns: 'Elle / He',
  avatar: '/default-avatar.svg',
  pin: 'BL-INVITADO',
  referredByPin: '',
  referredByName: '',
  status: 'disponible',
  personalMessage: 'Burbuja LGBTIQA+ Lara ✨',
  currentSong: '',
  allowWhatsAppBridge: false,
  whatsAppNumber: '',
  invitationsRemaining: 0,
  reputationScore: 100
};

const emptyCommunityFallback: Community = {
  id: 'none',
  name: 'Sin comunidad seleccionada',
  description: '',
  category: 'General',
  icon: '🫧',
  isPinned: false,
  isJoined: false,
  isClosed: false,
  memberCount: 0,
  activeNow: 0,
  tags: [],
  members: []
};

export function App() {
  const savedUser = authService.getSavedUser();
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => savedUser || guestUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!savedUser);

  // Modo de datos: En servidor local (localhost) arranca con la base de datos ficticia de pruebas.
  // En producción (Vercel) arranca 100% limpia sin usuarios falsos, cargando solo Supabase.
  const [useMockData, setUseMockData] = useState<boolean>(() => {
    try {
      const explicit = localStorage.getItem('burbuja_use_mock_data');
      if (explicit !== null) return explicit === 'true';
      return isLocalServer;
    } catch {
      return isLocalServer;
    }
  });

  const handleToggleMockData = () => {
    const next = !useMockData;
    try {
      localStorage.setItem('burbuja_use_mock_data', String(next));
    } catch {}
    setUseMockData(next);
    window.location.reload();
  };

  const [contacts, setContacts] = useState<Contact[]>(() => useMockData ? contactsMock : []);
  const [activeTab, setActiveTab] = useState<MainTab>('comunidades');
  
  // Theme state: defaults to 'light', persists to localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('burbuja_theme');
      return (saved === 'dark' || saved === 'light') ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('burbuja_theme', theme);
    } catch {}

    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
      document.body.classList.remove('dark');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
      document.body.classList.add('dark');
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Communities dynamic state (inicia con datos ficticios en local dev o vacío en producción)
  const [communities, setCommunities] = useState<Community[]>(() => useMockData ? communitiesMock : []);
  const [selectedCommunity, setSelectedCommunity] = useState<Community>(emptyCommunityFallback);
  const [posts] = useState<CommunityPost[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Modals state
  const [isSharePINOpen, setIsSharePINOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStoryContact, setSelectedStoryContact] = useState<Contact | null>(null);
  const [reportTargetContact, setReportTargetContact] = useState<Contact | null>(null);
  const [isSuperadminOpen, setIsSuperadminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => !authService.getSavedUser());
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isCommunityRolesOpen, setIsCommunityRolesOpen] = useState(false);
  const [managingCommunity, setManagingCommunity] = useState<Community | null>(null);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [activeDirectChatContact, setActiveDirectChatContact] = useState<Contact | null>(null);
  const [bubbleRequests, setBubbleRequests] = useState<BubbleConnectionRequest[]>(() => useMockData ? bubbleRequestsMock : []);
  const [sentRadarPins, setSentRadarPins] = useState<string[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => useMockData ? managedUsersMock : []);
  const [globalBroadcasts, setGlobalBroadcasts] = useState<GlobalBroadcast[]>(() => useMockData ? globalBroadcastsMock : []);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isOfficialStoryCreation, setIsOfficialStoryCreation] = useState(false);

  // Historias oficiales de Burbuja LGBTIQ (Visibles para toda la comunidad sin necesidad de agregarlo)
  const [officialStories, setOfficialStories] = useState<{
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[]>(() => {
    try {
      const saved = localStorage.getItem('burbuja_official_stories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'official-welcome-1',
        mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        caption: '🫧 ¡Bienvenidos a Burbuja LGBTIQA+! Espacio seguro y libre de discriminación para toda nuestra comunidad en Barquisimeto & Lara. 🌈💜',
        timestamp: 'Oficial',
        reactions: [
          { emoji: '🫧', count: 32 },
          { emoji: '💜', count: 48 },
          { emoji: '🌈', count: 65 }
        ]
      }
    ];
  });

  const [officialUnreadCount, setOfficialUnreadCount] = useState(0);
  const [officialLastMessage, setOfficialLastMessage] = useState('');

  const officialBurbujaContact: Contact = {
    id: 'superadmin-root',
    name: 'Burbuja LGBTIQ',
    pronouns: 'Oficial',
    avatar: '/logo.svg',
    pin: SUPERADMIN_PIN,
    status: 'disponible',
    personalMessage: officialLastMessage ? `💬 ${officialLastMessage}` : 'Canal oficial de atención, soporte y bienvenida comunitaria 🫧🌈',
    currentSong: '',
    allowWhatsAppBridge: true,
    city: 'Barquisimeto & Lara',
    unreadCount: officialUnreadCount,
    lastMessage: officialLastMessage,
    stories: officialStories
  };

  // My stories state
  const [myStories, setMyStories] = useState<{
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[]>([]);

  // Reports state (inicia con datos simulados en local dev o vacío en producción)
  const [reports, setReports] = useState<UserReport[]>(() => useMockData ? mockReports : []);

  // Notificaciones especiales tipo Burbuja Flotante de Estados (pop rápido)
  const [bubbleStatusNotifications, setBubbleStatusNotifications] = useState<StatusNotificationItem[]>([]);

  const triggerBubbleStatusNotification = (item: StatusNotificationItem) => {
    setBubbleStatusNotifications(prev => [item, ...prev.slice(0, 2)]);
  };

  const getStatusLabelText = (status: UserStatus): string => {
    switch (status) {
      case 'disponible':
        return 'está Disponible 🟢';
      case 'desconectado':
        return 'se ha desconectado 🍃';
      case 'ausente':
        return 'está Ausente 🟡';
      case 'ocupado':
        return 'está Ocupado 🔴';
      case 'en_crisis':
        return 'necesita apoyo (En Crisis) 💜';
      case 'en_fiesta':
        return 'está De Fiesta 🎉';
      case 'emergencia':
        return 'ha activado Emergencia 🚨';
      default:
        return 'ha actualizado su estado 🫧';
    }
  };

  // Cargar usuarios, comunidades y denuncias reales desde Supabase (solo si no estamos usando la base ficticia local)
  useEffect(() => {
    if (useMockData) return;

    const isSuperadminUser = authService.isSuperadmin(currentUser);

    const loadCommunities = async () => {
      let savedJoinedIds: string[] = [];
      try {
        savedJoinedIds = JSON.parse(localStorage.getItem(`burbuja_joined_communities_${currentUser.id}`) || '[]');
      } catch {}

      const { data } = await supabase.from('communities').select('*');
      if (data && data.length > 0) {
        const mapped: Community[] = data.map((c: any) => {
          const isCreator = c.creator_id === currentUser.id;
          const hasJoinedLocally = savedJoinedIds.includes(c.id);
          // Si es Superadmin / Fundador: acceso total como supervisor a todas las comunidades del sistema
          // Si es usuario regular: sólo las que creó, a las que se unió, o la comunitaria principal
          const isJoined = isSuperadminUser || isCreator || hasJoinedLocally || c.id === 'comm-bqto';

          return {
            id: c.id,
            name: c.name,
            description: c.description || '',
            category: c.category || 'General',
            icon: c.icon || '🫧',
            isPinned: false,
            isJoined: isJoined,
            isClosed: !!c.is_closed,
            isFrozen: !!c.is_frozen,
            creatorId: c.creator_id,
            bannedWords: c.banned_words || [],
            autoMuteDuration: c.auto_mute_duration || 'Silenciado por 24 horas',
            memberCount: 1,
            activeNow: 1,
            tags: [c.category || 'General'],
            members: isSuperadminUser
              ? [
                  {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userAvatar: currentUser.avatar,
                    userPin: currentUser.pin,
                    role: 'admin',
                    joinedAt: 'Supervisor Global'
                  }
                ]
              : []
          };
        });

        setCommunities(mapped);
        setSelectedCommunity(prev => {
          if (prev && prev.id !== 'none') {
            const found = mapped.find(m => m.id === prev.id);
            if (found) return found;
          }
          return emptyCommunityFallback;
        });
      }
    };

    loadCommunities();

    // Suscripción Realtime a nuevas comunidades en Supabase
    const commChannel = supabase
      .channel('communities_realtime_stream')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities'
        },
        () => {
          loadCommunities();
        }
      )
      .subscribe();

    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) {
        setManagedUsers(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            pronouns: p.pronouns || 'Elle',
            avatar: p.avatar || '',
            pin: p.pin,
            cedulaHash: (p.cedula_hash || '').split('::')[0],
            referredByPin: p.referred_by_pin || 'RAIZ',
            referredByName: p.referred_by_name || 'Fundador',
            invitationsRemaining: p.invitations_remaining ?? 3,
            joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Reciente',
            isEnabled: p.is_enabled !== false,
            city: p.city || 'Barquisimeto',
            status: (p.status || 'disponible') as any,
            reputationScore: p.reputation_score ?? 100,
            personalMessage: p.personal_message || '',
            reportsReceivedCount: 0,
            communitiesCreated: []
          }))
        );
      }
    });

    supabase.from('reports').select('*').then(({ data }) => {
      if (data) {
        setReports(
          data.map((r: any) => ({
            id: r.id,
            reportedUserId: r.reported_user_id,
            reportedUserName: r.reported_user_name,
            reportedUserAvatar: r.reported_user_avatar || '',
            reportedUserPin: r.reported_user_pin,
            inviterPin: r.inviter_pin || '',
            inviterName: r.inviter_name || '',
            reason: r.reason,
            detail: r.detail,
            timestamp: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Reciente',
            status: r.status || 'pendiente',
            inviterAlerted: !!r.inviter_alerted
          }))
        );
      }
    });

    return () => {
      supabase.removeChannel(commChannel);
    };
  }, [isLoggedIn, isSuperadminOpen, currentUser.id]);

  // Sincronizar solicitudes de conexión y contactos para el usuario activo
  useEffect(() => {
    if (!currentUser?.pin) return;

    // 1. Cargar contactos guardados localmente para este usuario
    try {
      const savedContacts = localStorage.getItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`);
      if (savedContacts) {
        const parsed: Contact[] = JSON.parse(savedContacts);
        if (parsed.length > 0) {
          setContacts(parsed);
        }
      }
    } catch {}

    // 2. Cargar solicitudes pendientes de conectar burbujas dirigidas a este usuario
    const loadRequests = async () => {
      const cleanPin = currentUser.pin.toUpperCase().trim();
      const unhyphenated = cleanPin.replace(/[^A-Z0-9]/g, '');
      const localKey = `burbuja_requests_${cleanPin}`;
      const altLocalKey = `burbuja_requests_${unhyphenated}`;
      let localReqs: BubbleConnectionRequest[] = [];
      try {
        const k1 = JSON.parse(localStorage.getItem(localKey) || '[]');
        const k2 = JSON.parse(localStorage.getItem(altLocalKey) || '[]');
        localReqs = [...k1];
        k2.forEach((r: any) => {
          if (!localReqs.some(x => x.id === r.id || x.fromUserPin === r.fromUserPin)) {
            localReqs.push(r);
          }
        });
      } catch {}

      try {
        const { data, error } = await supabase
          .from('connection_requests')
          .select('*')
          .or(`to_user_pin.ilike.${cleanPin},to_user_pin.ilike.${unhyphenated}`)
          .eq('status', 'pendiente')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const remoteReqs: BubbleConnectionRequest[] = data.map((d: any) => ({
            id: d.id,
            fromUserId: d.from_user_id,
            fromUserName: d.from_user_name,
            fromUserAvatar: d.from_user_avatar || '/logo.svg',
            fromUserPronouns: d.from_user_pronouns || 'Comunidad',
            fromUserPin: d.from_user_pin,
            introMessage: d.intro_message || '¡Hola! Me gustaría conectar nuestras burbujas 🫧',
            timestamp: d.created_at ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
            distanceKm: d.distance_km,
            city: d.city,
            song: d.song
          }));

          const merged = [...remoteReqs];
          localReqs.forEach(lr => {
            if (!merged.some(m => m.id === lr.id || m.fromUserPin === lr.fromUserPin)) {
              merged.push(lr);
            }
          });
          setBubbleRequests(merged);
          return;
        }
      } catch (err) {
        console.warn('Error al cargar solicitudes de Supabase:', err);
      }

      setBubbleRequests(localReqs);
    };

    loadRequests();

    // 3. Descubrir conversaciones directas activas (mensajes recibidos o enviados) y calcular no leídos (n)
    const loadActiveDMs = async () => {
      const cleanMyPin = currentUser.pin.toUpperCase().trim();
      const unhyphenMyPin = cleanMyPin.replace(/[^A-Z0-9]/g, '');

      try {
        const { data: dmMessages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .like('community_id', 'dm_%')
          .order('created_at', { ascending: false })
          .limit(250);

        if (!error && dmMessages && dmMessages.length > 0) {
          const relevant = dmMessages.filter(m => {
            const cid = (m.community_id || '').toUpperCase();
            return cid.includes(cleanMyPin) || cid.includes(unhyphenMyPin) || (currentUser.id && cid.includes(currentUser.id.toUpperCase()));
          });

          // Leer mapa de última lectura guardado en LocalStorage
          let lastReadMap: Record<string, string> = {};
          try {
            const stored = localStorage.getItem(`burbuja_dm_last_read_${cleanMyPin}`);
            if (stored) lastReadMap = JSON.parse(stored);
          } catch {}

          const statsByPin: Record<string, { unreadCount: number; lastMessage: string; lastMessageTime: string }> = {};
          const otherPins = new Set<string>();

          relevant.forEach(m => {
            const parts = (m.community_id || '').replace(/^dm_/, '').split('_');
            let otherKey = '';
            for (const p of parts) {
              const cleanP = p.toUpperCase().trim();
              if (cleanP !== cleanMyPin && cleanP !== unhyphenMyPin && cleanP !== currentUser.id?.toUpperCase()) {
                otherKey = cleanP;
                break;
              }
            }
            if (!otherKey) return;
            otherPins.add(otherKey);

            if (!statsByPin[otherKey]) {
              statsByPin[otherKey] = {
                unreadCount: 0,
                lastMessage: m.text || (m.image_url ? '📷 Foto' : m.audio_url ? '🎤 Nota de voz' : ''),
                lastMessageTime: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              };
            }

            const isSentByMe = m.sender_name === currentUser.name || (authService.isSuperadmin(currentUser) && m.sender_name === 'Burbuja LGBTIQ');
            if (!isSentByMe) {
              const lastReadAt = lastReadMap[otherKey] || lastReadMap[otherKey.replace(/[^A-Z0-9]/g, '')] || '1970-01-01T00:00:00.000Z';
              const msgTime = m.created_at || new Date().toISOString();
              if (new Date(msgTime) > new Date(lastReadAt)) {
                statsByPin[otherKey].unreadCount += 1;
              }
            }
          });

          // Actualizar contador y último mensaje del canal oficial
          const officialStats = statsByPin[SUPERADMIN_PIN] || statsByPin[SUPERADMIN_PIN.replace(/[^A-Z0-9]/g, '')] || statsByPin['SUPERADMIN-ROOT'];
          if (officialStats) {
            setOfficialUnreadCount(officialStats.unreadCount);
            setOfficialLastMessage(officialStats.lastMessage);
          } else {
            setOfficialUnreadCount(0);
          }

          if (otherPins.size > 0) {
            const pinsArray = Array.from(otherPins);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .in('pin', pinsArray);

            setContacts(prev => {
              let updated = [...prev];

              if (profiles && profiles.length > 0) {
                profiles.forEach((p: any) => {
                  if (!updated.some(c => c.pin.toUpperCase() === p.pin.toUpperCase() || c.id === p.id)) {
                    updated.push({
                      id: p.id,
                      name: p.name,
                      pronouns: p.pronouns || 'Comunidad',
                      avatar: p.avatar || '/logo.svg',
                      pin: p.pin,
                      status: (p.status as any) || 'disponible',
                      personalMessage: p.personal_message || 'Conversación activa 🫧',
                      currentSong: p.current_song || '',
                      city: p.city || 'Barquisimeto & Lara',
                      allowWhatsAppBridge: !!p.allow_whatsapp_bridge,
                      stories: []
                    });
                  }
                });
              }

              // Calcular unreadCount y lastMessage para cada contacto
              updated = updated.map(c => {
                const cleanPin = (c.pin || '').toUpperCase().trim();
                const unhyphenPin = cleanPin.replace(/[^A-Z0-9]/g, '');
                const cleanId = (c.id || '').toUpperCase().trim();
                const stats = statsByPin[cleanPin] || statsByPin[unhyphenPin] || statsByPin[cleanId];
                if (stats) {
                  return {
                    ...c,
                    unreadCount: stats.unreadCount,
                    lastMessage: stats.lastMessage,
                    lastMessageTime: stats.lastMessageTime
                  };
                }
                return {
                  ...c,
                  unreadCount: 0
                };
              });

              if (currentUser?.pin) {
                try {
                  localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(updated));
                } catch {}
              }
              return updated;
            });
          }
        }
      } catch (e) {
        console.warn('Error al descubrir conversaciones directas:', e);
      }
    };

    loadActiveDMs();

    // 4. Suscripción en tiempo real a solicitudes entrantes y mensajes directos
    const channel = supabase
      .channel(`realtime_user_${currentUser.pin.toUpperCase()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_requests'
        },
        (payload: any) => {
          const d = payload.new;
          const cleanMyPin = currentUser.pin.toUpperCase().trim();
          const unhyphenMyPin = cleanMyPin.replace(/[^A-Z0-9]/g, '');
          const destPin = (d?.to_user_pin || '').toUpperCase().trim();
          const destUnhyphen = destPin.replace(/[^A-Z0-9]/g, '');

          if (d && d.status === 'pendiente' && (destPin === cleanMyPin || destUnhyphen === unhyphenMyPin)) {
            const incoming: BubbleConnectionRequest = {
              id: d.id,
              fromUserId: d.from_user_id,
              fromUserName: d.from_user_name,
              fromUserAvatar: d.from_user_avatar || '/logo.svg',
              fromUserPronouns: d.from_user_pronouns || 'Comunidad',
              fromUserPin: d.from_user_pin,
              introMessage: d.intro_message || '¡Hola! Me gustaría conectar nuestras burbujas 🫧',
              timestamp: 'Ahora',
              distanceKm: d.distance_km,
              city: d.city,
              song: d.song
            };
            setBubbleRequests(prev => {
              if (prev.some(r => r.id === incoming.id || r.fromUserPin === incoming.fromUserPin)) return prev;
              return [incoming, ...prev];
            });
            triggerMsnToast({
              id: `toast-incoming-req-${Date.now()}`,
              title: '¡Nueva Solicitud para Conectar! 🫧',
              message: `${incoming.fromUserName} (${incoming.fromUserPin}) quiere conectar contigo.`,
              avatar: incoming.fromUserAvatar
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload: any) => {
          const m = payload.new;
          const cleanMyPin = currentUser.pin.toUpperCase().trim();
          const unhyphenMyPin = cleanMyPin.replace(/[^A-Z0-9]/g, '');

          if (m && m.community_id && m.community_id.startsWith('dm_')) {
            const cid = m.community_id.toUpperCase();
            if (cid.includes(cleanMyPin) || cid.includes(unhyphenMyPin)) {
              const isSentByMe = m.sender_name === currentUser.name || (authService.isSuperadmin(currentUser) && m.sender_name === 'Burbuja LGBTIQ');
              if (!isSentByMe) {
                // Notificación sonora y visual
                triggerMsnToast({
                  id: `toast-dm-${Date.now()}`,
                  title: `Mensaje de ${m.sender_name} 💬`,
                  message: m.text || 'Te ha enviado una foto o nota de voz.',
                  avatar: m.sender_avatar || '/logo.svg'
                });
                loadActiveDMs();
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          const updated = payload.new;
          if (!updated || !updated.status) return;
          const cleanMyPin = currentUser.pin.toUpperCase().trim();
          const updatedPin = (updated.pin || '').toUpperCase().trim();
          if (updatedPin === cleanMyPin || updated.id === currentUser.id) return;

          const newStatus = updated.status as UserStatus;

          setContacts(prev => {
            const match = prev.find(
              c => (c.id && c.id === updated.id) || (updatedPin && c.pin?.toUpperCase().trim() === updatedPin)
            );
            if (!match) return prev;
            if (match.status === newStatus) return prev;

            triggerBubbleStatusNotification({
              id: `bubble-${Date.now()}-${Math.random()}`,
              userName: updated.name || match.name,
              userAvatar: updated.avatar || match.avatar || '/logo.svg',
              userPin: updated.pin,
              status: newStatus,
              message: getStatusLabelText(newStatus)
            });

            const nextContacts = prev.map(c => (c.id === match.id ? { ...c, status: newStatus } : c));
            if (currentUser?.pin) {
              try {
                localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(nextContacts));
              } catch {}
            }
            return nextContacts;
          });
        }
      )
      .subscribe();

    // 5. Suscripción Realtime a difusión instantánea de estados (Broadcast p2p)
    const statusBroadcastChannel = supabase
      .channel('burbuja_status_broadcast')
      .on('broadcast', { event: 'user_status_changed' }, ({ payload }) => {
        if (!payload || !payload.newStatus) return;
        const cleanMyPin = currentUser.pin.toUpperCase().trim();
        const incomingPin = (payload.userPin || '').toUpperCase().trim();
        if (incomingPin === cleanMyPin || payload.userId === currentUser.id) return;

        setContacts(prev => {
          const match = prev.find(
            c => (c.id && c.id === payload.userId) || (incomingPin && c.pin?.toUpperCase().trim() === incomingPin)
          );
          if (!match) return prev;
          if (match.status === payload.newStatus) return prev;

          triggerBubbleStatusNotification({
            id: `bubble-${Date.now()}-${Math.random()}`,
            userName: payload.userName || match.name,
            userAvatar: payload.userAvatar || match.avatar || '/logo.svg',
            userPin: payload.userPin,
            status: payload.newStatus,
            message: getStatusLabelText(payload.newStatus)
          });

          const nextContacts = prev.map(c => (c.id === match.id ? { ...c, status: payload.newStatus } : c));
          if (currentUser?.pin) {
            try {
              localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(nextContacts));
            } catch {}
          }
          return nextContacts;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusBroadcastChannel);
    };
  }, [currentUser?.pin]);

  // MSN Toasts state
  const [toasts, setToasts] = useState<MSNToast[]>([]);
  const [bufferedToastsCount, setBufferedToastsCount] = useState(0);

  // WLM Nudge / Zump State
  const [isZumping, setIsZumping] = useState(false);

  const isDetoxActive = currentUser?.status === 'desconectado';

  const triggerMsnToast = (toast: MSNToast) => {
    playMsnOnlineChime();
    setToasts(prev => [...prev.slice(-2), toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 4500);
  };

  // Status Handlers
  const handleUpdateStatus = (newStatus: UserStatus, customLabel?: string, customColor?: string) => {
    const wasDetox = currentUser.status === 'desconectado';
    const profileUpdates: Partial<UserProfile> = {
      status: newStatus,
      ...(customLabel !== undefined ? { customStatusLabel: customLabel } : {}),
      ...(customColor !== undefined ? { customStatusColor: customColor } : {})
    };

    setCurrentUser(prev => ({ ...prev, ...profileUpdates }));
    authService.updateProfile(currentUser.id, profileUpdates);

    // Difundir cambio de estado a otros usuarios conectados en tiempo real
    try {
      const statusBroadcastChannel = supabase.channel('burbuja_status_broadcast');
      statusBroadcastChannel.send({
        type: 'broadcast',
        event: 'user_status_changed',
        payload: {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          userPin: currentUser.pin,
          newStatus,
          prevStatus: currentUser.status
        }
      });
    } catch (e) {
      console.warn('Error al transmitir cambio de estado:', e);
    }

    // Reconnecting from Detox
    if (wasDetox && newStatus !== 'desconectado') {
      playMsnOnlineChime();
      triggerMsnToast({
        id: `toast-reconnect-${Date.now()}`,
        title: '¡De vuelta a la Burbuja!',
        message: bufferedToastsCount > 0 
          ? `Te pusiste al día. Tienes ${bufferedToastsCount} novedades comunitarias.` 
          : 'Reconectadx con éxito. Todos los canales restaurados.',
        avatar: currentUser.avatar
      });
      setBufferedToastsCount(0);
    } else if (newStatus === 'desconectado') {
      triggerMsnToast({
        id: `toast-detox-${Date.now()}`,
        title: 'Modo Desconectado Activo',
        message: 'Entrando en Modo Detox. Tus contactos te verán desconectadx.',
        avatar: currentUser.avatar
      });
    } else if (customLabel) {
      triggerMsnToast({
        id: `toast-status-${Date.now()}`,
        title: 'Estado Actualizado',
        message: `Ahora tus contactos te ven como: "${customLabel}"`,
        avatar: currentUser.avatar
      });
    }
  };

  const handleUpdatePersonalMessage = (msg: string) => {
    setCurrentUser(prev => ({ ...prev, personalMessage: msg }));
    authService.updateProfile(currentUser.id, { personalMessage: msg });
    triggerMsnToast({
      id: `toast-msg-${Date.now()}`,
      title: 'Mensaje Actualizado',
      message: `Tus contactos ahora leen: "${msg.slice(0, 30)}..."`,
      avatar: currentUser.avatar
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
    authService.updateProfile(currentUser.id, updates);
    triggerMsnToast({
      id: `toast-profile-${Date.now()}`,
      title: '¡Perfil Actualizado! ✨',
      message: 'Tus cambios en foto, nombre, pronombres y música se han guardado en la nube.',
      avatar: updates.avatar || currentUser.avatar
    });
  };

  const handleToggleWhatsAppBridge = () => {
    const nextVal = !currentUser.allowWhatsAppBridge;
    setCurrentUser(prev => ({ ...prev, allowWhatsAppBridge: nextVal }));
    authService.updateProfile(currentUser.id, { allowWhatsAppBridge: nextVal });
  };

  const handleAddContact = (newContact: Contact) => {
    setContacts(prev => {
      if (prev.some(c => c.pin === newContact.pin)) return prev;
      const updated = [newContact, ...prev];
      if (currentUser?.pin) {
        try {
          localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const handleSelectCommunity = (comm: Community) => {
    setSelectedCommunity(comm);
    supabase
      .from('chat_messages')
      .select('*')
      .eq('community_id', comm.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setChatMessages(
            data.map((m: any) => ({
              id: m.id,
              communityId: m.community_id,
              senderName: m.sender_name,
              senderAvatar: m.sender_avatar || '',
              senderPronouns: m.sender_pronouns || '',
              text: m.text,
              timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
              isZump: !!m.is_zump,
              isModerator: !!m.is_moderator,
              audioUrl: m.audio_url,
              audioDurationSeconds: m.audio_duration_seconds,
              imageUrl: m.image_url
            }))
          );
        } else {
          setChatMessages([]);
        }
      });
  };

  const handleCreateCommunity = (newCommunity: Community) => {
    setCommunities(prev => [newCommunity, ...prev]);
    setSelectedCommunity(newCommunity);
    setActiveTab('comunidades');

    try {
      const savedJoined = JSON.parse(localStorage.getItem(`burbuja_joined_communities_${currentUser.id}`) || '[]');
      if (!savedJoined.includes(newCommunity.id)) {
        localStorage.setItem(`burbuja_joined_communities_${currentUser.id}`, JSON.stringify([...savedJoined, newCommunity.id]));
      }
    } catch {}

    supabase.from('communities').insert([{
      id: newCommunity.id,
      name: newCommunity.name,
      description: newCommunity.description,
      category: newCommunity.category,
      is_closed: !!newCommunity.isClosed,
      pin_code: newCommunity.pinCode || null,
      icon: newCommunity.icon || '🫧',
      creator_id: currentUser.id
    }]).then(() => {});
    triggerMsnToast({
      id: `toast-comm-${Date.now()}`,
      title: '¡Comunidad Creada!',
      message: `Eres 👑 Administrador de "${newCommunity.name}".`,
      avatar: newCommunity.icon
    });
  };

  const handleUpdateCommunity = (communityId: string, updates: Partial<Community>) => {
    setCommunities(prev =>
      prev.map(c => (c.id === communityId ? { ...c, ...updates } : c))
    );
    setSelectedCommunity(prev => (prev.id === communityId ? { ...prev, ...updates } : prev));
    if (managingCommunity?.id === communityId) {
      setManagingCommunity(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleUpdateMemberRole = (communityId: string, userId: string, newRole: CommunityRole) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId && c.members) {
          const updatedMembers = c.members.map(m =>
            m.userId === userId ? { ...m, role: newRole } : m
          );
          return { ...c, members: updatedMembers };
        }
        return c;
      })
    );
    setSelectedCommunity(prev => {
      if (prev.id === communityId && prev.members) {
        return {
          ...prev,
          members: prev.members.map(m => (m.userId === userId ? { ...m, role: newRole } : m))
        };
      }
      return prev;
    });
    if (managingCommunity?.id === communityId && managingCommunity.members) {
      setManagingCommunity(prev =>
        prev
          ? {
              ...prev,
              members: prev.members?.map(m => (m.userId === userId ? { ...m, role: newRole } : m))
            }
          : null
      );
    }
    triggerMsnToast({
      id: `toast-role-${Date.now()}`,
      title: 'Rol Comunitario Actualizado',
      message: `El rol ahora es: ${newRole === 'admin' ? '👑 Administrador' : newRole === 'moderador' ? '🛡️ Moderador' : '💬 Participante'}.`,
      avatar: currentUser.avatar
    });
  };

  const handleMuteMember = (communityId: string, userId: string, muteDurationText: string | null) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId && c.members) {
          const updatedMembers = c.members.map(m =>
            m.userId === userId ? { ...m, isMutedUntil: muteDurationText || undefined } : m
          );
          return { ...c, members: updatedMembers };
        }
        return c;
      })
    );
    setSelectedCommunity(prev => {
      if (prev.id === communityId && prev.members) {
        return {
          ...prev,
          members: prev.members.map(m =>
            m.userId === userId ? { ...m, isMutedUntil: muteDurationText || undefined } : m
          )
        };
      }
      return prev;
    });
    if (managingCommunity?.id === communityId && managingCommunity.members) {
      setManagingCommunity(prev =>
        prev
          ? {
              ...prev,
              members: prev.members?.map(m =>
                m.userId === userId ? { ...m, isMutedUntil: muteDurationText || undefined } : m
              )
            }
          : null
      );
    }
    triggerMsnToast({
      id: `toast-mute-${Date.now()}`,
      title: muteDurationText ? 'Miembro Silenciado' : 'Silencio Revocado',
      message: muteDurationText ? `El usuario ha sido vetado: ${muteDurationText}.` : 'El usuario puede volver a participar en el chat.',
      avatar: currentUser.avatar
    });
  };

  const handleRemoveMember = (communityId: string, userId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId && c.members) {
          const updatedMembers = c.members.filter(m => m.userId !== userId);
          return { ...c, members: updatedMembers, memberCount: Math.max(1, c.memberCount - 1) };
        }
        return c;
      })
    );
    setSelectedCommunity(prev => {
      if (prev.id === communityId && prev.members) {
        return {
          ...prev,
          members: prev.members.filter(m => m.userId !== userId),
          memberCount: Math.max(1, prev.memberCount - 1)
        };
      }
      return prev;
    });
    if (managingCommunity?.id === communityId && managingCommunity.members) {
      setManagingCommunity(prev =>
        prev
          ? {
              ...prev,
              members: prev.members?.filter(m => m.userId !== userId),
              memberCount: Math.max(1, prev.memberCount - 1)
            }
          : null
      );
    }
    triggerMsnToast({
      id: `toast-kick-${Date.now()}`,
      title: 'Miembro Expulsado',
      message: 'Se ha sacado al usuario de la comunidad de forma segura.',
      avatar: currentUser.avatar
    });
  };

  const handleAcceptRequest = (communityId: string, requestId: string) => {
    let acceptedUser: { id: string; name: string; avatar: string; pin: string } | null = null;
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const req = c.pendingRequests?.find(r => r.id === requestId);
          if (req) {
            acceptedUser = { id: req.userId, name: req.userName, avatar: req.userAvatar, pin: req.userPin };
            const updatedRequests = (c.pendingRequests || []).filter(r => r.id !== requestId);
            const newMember: CommunityMember = {
              userId: req.userId,
              userName: req.userName,
              userAvatar: req.userAvatar,
              userPin: req.userPin,
              role: 'participante',
              joinedAt: 'Recién aceptado'
            };
            return {
              ...c,
              pendingRequests: updatedRequests,
              members: [...(c.members || []), newMember],
              memberCount: c.memberCount + 1
            };
          }
        }
        return c;
      })
    );
    if (selectedCommunity.id === communityId) {
      setSelectedCommunity(prev => {
        const req = prev.pendingRequests?.find(r => r.id === requestId);
        if (req) {
          return {
            ...prev,
            pendingRequests: (prev.pendingRequests || []).filter(r => r.id !== requestId),
            members: [
              ...(prev.members || []),
              {
                userId: req.userId,
                userName: req.userName,
                userAvatar: req.userAvatar,
                userPin: req.userPin,
                role: 'participante',
                joinedAt: 'Recién aceptado'
              }
            ],
            memberCount: prev.memberCount + 1
          };
        }
        return prev;
      });
    }
    triggerMsnToast({
      id: `toast-accepted-${Date.now()}`,
      title: 'Solicitud Aprobada',
      message: 'El participante ha sido admitido en el espacio seguro.',
      avatar: acceptedUser ? (acceptedUser as any).avatar : currentUser.avatar
    });
  };

  const handleRejectRequest = (communityId: string, requestId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          return {
            ...c,
            pendingRequests: (c.pendingRequests || []).filter(r => r.id !== requestId)
          };
        }
        return c;
      })
    );
    if (selectedCommunity.id === communityId) {
      setSelectedCommunity(prev => ({
        ...prev,
        pendingRequests: (prev.pendingRequests || []).filter(r => r.id !== requestId)
      }));
    }
    triggerMsnToast({
      id: `toast-reject-${Date.now()}`,
      title: 'Solicitud Denegada',
      message: 'Se rechazó la solicitud de ingreso.',
      avatar: currentUser.avatar
    });
  };

  const handleAddMemberByPin = (communityId: string, pin: string): boolean => {
    const contactMatch = contacts.find(c => c.pin.toUpperCase() === pin.toUpperCase());
    if (!contactMatch) return false;

    let added = false;
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const alreadyMember = c.members?.some(m => m.userId === contactMatch.id || m.userPin === contactMatch.pin);
          if (alreadyMember) return c;
          added = true;
          const newMember: CommunityMember = {
            userId: contactMatch.id,
            userName: contactMatch.name,
            userAvatar: contactMatch.avatar,
            userPin: contactMatch.pin,
            role: 'participante',
            joinedAt: 'Invitado por PIN'
          };
          return {
            ...c,
            members: [...(c.members || []), newMember],
            memberCount: c.memberCount + 1
          };
        }
        return c;
      })
    );

    if (added && selectedCommunity.id === communityId) {
      setSelectedCommunity(prev => ({
        ...prev,
        members: [
          ...(prev.members || []),
          {
            userId: contactMatch.id,
            userName: contactMatch.name,
            userAvatar: contactMatch.avatar,
            userPin: contactMatch.pin,
            role: 'participante',
            joinedAt: 'Invitado por PIN'
          }
        ],
        memberCount: prev.memberCount + 1
      }));
    }
    return added;
  };

  const handleOpenReportMember = (member: CommunityMember) => {
    const contactRef: Contact = {
      id: member.userId,
      name: member.userName,
      pronouns: 'Elle',
      avatar: member.userAvatar,
      pin: member.userPin,
      referredByPin: 'BL-9842K',
      referredByName: 'Alex Rivera',
      status: 'disponible',
      personalMessage: 'Miembro de comunidad',
      currentSong: '',
      allowWhatsAppBridge: false,
      stories: []
    };
    setIsCommunityRolesOpen(false);
    setReportTargetContact(contactRef);
  };

  const handleTogglePinCommunity = (communityId: string) => {
    let nowPinned = false;
    let targetName = '';
    setCommunities(prev => {
      const targetComm = prev.find(c => c.id === communityId);
      const willPin = !targetComm?.isPinned;
      nowPinned = willPin;
      targetName = targetComm?.name || '';

      const updated = prev.map(c => {
        if (c.id === communityId) {
          return { ...c, isPinned: willPin };
        }
        // Solo se puede fijar uno: si se fija este, cualquier otro se des-fija
        if (willPin) {
          return { ...c, isPinned: false };
        }
        return c;
      });

      try {
        const pinnedIds = willPin ? [communityId] : [];
        localStorage.setItem('burbuja_pinned_communities', JSON.stringify(pinnedIds));
      } catch {}

      return updated;
    });

    triggerMsnToast({
      id: `toast-pin-${Date.now()}`,
      title: nowPinned ? '📌 Grupo Fijado' : '📌 Grupo Desfijado',
      message: nowPinned
        ? `"${targetName}" ahora aparecerá fijado de primero.`
        : `"${targetName}" vuelve al orden habitual.`,
      avatar: currentUser.avatar
    });
  };

  const handleSendMessage = (
    text: string, 
    isZump: boolean = false,
    media?: { audioUrl?: string; audioDurationSeconds?: number; imageUrl?: string }
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      communityId: selectedCommunity.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderPronouns: currentUser.pronouns,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isZump,
      audioUrl: media?.audioUrl,
      audioDurationSeconds: media?.audioDurationSeconds,
      imageUrl: media?.imageUrl
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Actualizar última actividad para que el grupo suba al primer lugar de los no fijados
    const nowIso = new Date().toISOString();
    setCommunities(prev =>
      prev.map(c => (c.id === selectedCommunity.id ? { ...c, lastActivityAt: nowIso } : c))
    );
    setSelectedCommunity(prev => (prev.id === selectedCommunity.id ? { ...prev, lastActivityAt: nowIso } : prev));
  };

  const handleTriggerZump = () => {
    setIsZumping(true);
    setTimeout(() => setIsZumping(false), 700);
  };

  const handlePublishMyStory = (mediaUrl: string, caption: string, isOfficial?: boolean) => {
    const newStory = {
      id: `story-${Date.now()}`,
      mediaUrl,
      caption,
      timestamp: 'Justo ahora',
      reactions: []
    };

    if (isOfficial) {
      setOfficialStories(prev => {
        const updated = [newStory, ...prev];
        try {
          localStorage.setItem('burbuja_official_stories', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsOfficialStoryCreation(false);
      triggerMsnToast({
        id: `toast-off-story-${Date.now()}`,
        title: '📢 Estado Oficial Publicado',
        message: 'Tu estado ahora es visible para toda la comunidad, te tengan o no agregado.',
        avatar: '/logo.svg'
      });
    } else {
      setMyStories(prev => [newStory, ...prev]);
      triggerMsnToast({
        id: `toast-story-${Date.now()}`,
        title: 'Historia Publicada',
        message: 'Tu historia de 24h ya está visible para tu red.',
        avatar: currentUser.avatar
      });
    }
  };

  const handleViewMyStory = () => {
    if (myStories.length === 0) return;
    const selfContact: Contact = {
      id: currentUser.id,
      name: currentUser.name,
      pronouns: currentUser.pronouns,
      avatar: currentUser.avatar,
      pin: currentUser.pin,
      status: currentUser.status,
      personalMessage: currentUser.personalMessage,
      currentSong: currentUser.currentSong,
      allowWhatsAppBridge: currentUser.allowWhatsAppBridge,
      stories: myStories
    };
    setSelectedStoryContact(selfContact);
  };

  const handleToggleBlockContact = (contact: Contact, reason?: string) => {
    setContacts(prev =>
      prev.map(c => {
        if (c.id === contact.id) {
          const isNowBlocked = !c.isBlockedByMe;
          return {
            ...c,
            isBlockedByMe: isNowBlocked,
            blockedAt: isNowBlocked ? 'Hoy' : undefined,
            blockReason: isNowBlocked ? (reason || 'Límites personales y tranquilidad') : undefined
          };
        }
        return c;
      })
    );
    triggerMsnToast({
      id: `toast-block-${Date.now()}`,
      title: contact.isBlockedByMe ? 'Contacto Desbloqueado' : 'Contacto Bloqueado',
      message: contact.isBlockedByMe 
        ? `Has restaurado la interacción con ${contact.name}.`
        : `Has bloqueado a ${contact.name}. Motivo registrado con transparencia en Seguridad.`,
      avatar: contact.avatar
    });
  };

  const handleToggleRadarVisible = (active: boolean) => {
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        radarVisible: active
      };
      try {
        localStorage.setItem('burbuja_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser?.id && currentUser.id !== 'guest') {
      authService.updateProfile(currentUser.id, { radarVisible: active });
    }

    triggerMsnToast({
      id: `toast-radar-${Date.now()}`,
      title: active ? 'Tu Burbuja está Activa 🫧' : 'Burbuja Oculta 🫥',
      message: active 
        ? 'Ahora eres visible y puedes explorar personas cercanas.'
        : 'Tu burbuja ahora está oculta para explorar.',
      avatar: currentUser.avatar
    });
  };

  const handleSendConnectionRequest = (target: Contact, introMessage: string) => {
    setSentRadarPins(prev => [...prev, target.pin]);

    const isAdminSending = authService.isSuperadmin(currentUser) || currentUser.pin === SUPERADMIN_PIN;
    const cleanTargetPin = target.pin.toUpperCase().trim();
    const unhyphenTargetPin = cleanTargetPin.replace(/[^A-Z0-9]/g, '');

    const newReq: BubbleConnectionRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fromUserId: currentUser.id,
      fromUserName: isAdminSending ? 'Burbuja LGBTIQ' : currentUser.name,
      fromUserAvatar: isAdminSending ? '/logo.svg' : (currentUser.avatar || '/logo.svg'),
      fromUserPronouns: isAdminSending ? 'Oficial' : (currentUser.pronouns || 'Comunidad'),
      fromUserPin: isAdminSending ? SUPERADMIN_PIN : currentUser.pin,
      introMessage: introMessage?.trim() || '¡Hola! Me gustaría conectar nuestras burbujas en Burbuja LGBTIQA+ 🫧',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distanceKm: target.distanceKm || 0.5,
      city: currentUser.city || 'Barquisimeto & Lara',
      song: currentUser.currentSong || ''
    };

    // 1. Guardar en Supabase tabla connection_requests
    supabase
      .from('connection_requests')
      .insert([{
        id: newReq.id,
        from_user_id: newReq.fromUserId,
        from_user_name: newReq.fromUserName,
        from_user_avatar: newReq.fromUserAvatar,
        from_user_pronouns: newReq.fromUserPronouns,
        from_user_pin: newReq.fromUserPin,
        to_user_pin: cleanTargetPin,
        intro_message: newReq.introMessage,
        distance_km: newReq.distanceKm,
        city: newReq.city,
        song: newReq.song,
        status: 'pendiente'
      }])
      .then(({ error }) => {
        if (error) console.warn('Supabase insert connection request error:', error);
      });

    // 2. Persistir en localStorage bajo múltiples claves para garantizar recepción inmediata
    try {
      const keys = [
        `burbuja_requests_${cleanTargetPin}`,
        `burbuja_requests_${unhyphenTargetPin}`
      ];
      if (target.id) keys.push(`burbuja_requests_${target.id}`);

      keys.forEach(k => {
        const existing: BubbleConnectionRequest[] = JSON.parse(localStorage.getItem(k) || '[]');
        if (!existing.some(r => r.fromUserPin === newReq.fromUserPin)) {
          existing.unshift(newReq);
          localStorage.setItem(k, JSON.stringify(existing));
        }
      });
    } catch (e) {
      console.warn('Error al guardar solicitud localmente:', e);
    }

    triggerMsnToast({
      id: `toast-conn-${Date.now()}`,
      title: '¡Solicitud para Conectar Burbujas enviada! 🫧',
      message: `Le enviaste una invitación a ${target.name}.`,
      avatar: target.avatar
    });
  };

  const handleAcceptBubbleRequest = (req: BubbleConnectionRequest) => {
    const newContact: Contact = {
      id: req.fromUserId,
      name: req.fromUserName,
      pronouns: req.fromUserPronouns,
      avatar: req.fromUserAvatar,
      pin: req.fromUserPin,
      status: 'disponible',
      personalMessage: req.introMessage || '¡Acabamos de conectar burbujas! ✨',
      currentSong: req.song || '',
      distanceKm: req.distanceKm,
      city: req.city,
      allowWhatsAppBridge: false,
      stories: []
    };

    setContacts(prev => {
      if (prev.some(c => c.pin === newContact.pin)) return prev;
      const updated = [newContact, ...prev];
      if (currentUser?.pin) {
        try {
          localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setBubbleRequests(prev => prev.filter(r => r.id !== req.id));

    // Actualizar estado en Supabase
    supabase
      .from('connection_requests')
      .update({ status: 'aceptada' })
      .eq('id', req.id)
      .then(() => {});

    // Eliminar de localStorage del usuario receptor
    try {
      const localKey = `burbuja_requests_${currentUser.pin.toUpperCase()}`;
      const existing: BubbleConnectionRequest[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = existing.filter(r => r.id !== req.id && r.fromUserPin !== req.fromUserPin);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    } catch {}

    // Agregar recíprocamente al solicitante en su lista de contactos guardada
    try {
      const senderKey = `burbuja_contacts_${req.fromUserPin.toUpperCase()}`;
      const senderContacts: Contact[] = JSON.parse(localStorage.getItem(senderKey) || '[]');
      if (!senderContacts.some(c => c.pin === currentUser.pin)) {
        senderContacts.unshift({
          id: currentUser.id,
          name: currentUser.name,
          pronouns: currentUser.pronouns,
          avatar: currentUser.avatar,
          pin: currentUser.pin,
          status: currentUser.status,
          personalMessage: currentUser.personalMessage,
          currentSong: currentUser.currentSong,
          city: currentUser.city,
          allowWhatsAppBridge: currentUser.allowWhatsAppBridge,
          stories: []
        });
        localStorage.setItem(senderKey, JSON.stringify(senderContacts));
      }
    } catch {}

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    triggerMsnToast({
      id: `toast-connected-${Date.now()}`,
      title: '¡Burbujas Conectadas! 🫧✨',
      message: `Ahora puedes chatear directamente con ${req.fromUserName}.`,
      avatar: req.fromUserAvatar
    });
  };

  const handleRejectBubbleRequest = (reqId: string) => {
    setBubbleRequests(prev => prev.filter(r => r.id !== reqId));
    supabase
      .from('connection_requests')
      .update({ status: 'rechazada' })
      .eq('id', reqId)
      .then(() => {});

    try {
      const localKey = `burbuja_requests_${currentUser.pin.toUpperCase()}`;
      const existing: BubbleConnectionRequest[] = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = existing.filter(r => r.id !== reqId);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    } catch {}

    triggerMsnToast({
      id: `toast-reject-bubble-${Date.now()}`,
      title: 'Solicitud descartada',
      message: 'La invitación para conectar burbujas ha sido retirada.',
      avatar: currentUser.avatar
    });
  };

  const handleRemoveContact = (contact: Contact) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.pin !== contact.pin && c.id !== contact.id);
      if (currentUser?.pin) {
        try {
          localStorage.setItem(`burbuja_contacts_${currentUser.pin.toUpperCase()}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    triggerMsnToast({
      id: `toast-rem-contact-${Date.now()}`,
      title: 'Contacto Eliminado',
      message: `Has eliminado a ${contact.name} de tus contactos.`,
      avatar: contact.avatar
    });
  };

  const handleLeaveCommunity = (communityId: string) => {
    const comm = communities.find(c => c.id === communityId);
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          return {
            ...c,
            isJoined: false,
            memberCount: Math.max(0, c.memberCount - 1),
            members: c.members?.filter(m => m.userId !== currentUser.id)
          };
        }
        return c;
      })
    );

    if (selectedCommunity?.id === communityId) {
      setSelectedCommunity(emptyCommunityFallback);
    }

    try {
      const savedJoined = JSON.parse(localStorage.getItem(`burbuja_joined_communities_${currentUser.id}`) || '[]');
      const filtered = savedJoined.filter((id: string) => id !== communityId);
      localStorage.setItem(`burbuja_joined_communities_${currentUser.id}`, JSON.stringify(filtered));
    } catch {}

    supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', currentUser.id)
      .then(() => {});

    triggerMsnToast({
      id: `toast-leave-comm-${Date.now()}`,
      title: 'Comunidad Abandonada',
      message: `Has salido de "${comm?.name || 'la comunidad'}".`,
      avatar: currentUser.avatar
    });
  };

  const handleToggleUserEnabled = (userId: string) => {
    setManagedUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isEnabled: !u.isEnabled } : u))
    );
  };

  const handleGrantInvitations = (userId: string, count: number) => {
    setManagedUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, invitationsRemaining: Math.max(0, u.invitationsRemaining + count) } : u))
    );
  };

  const handleToggleCommunityFreeze = (commId: string) => {
    setCommunities(prev =>
      prev.map(c => (c.id === commId ? { ...c, isFrozen: !c.isFrozen } : c))
    );
  };

  const handleSendBroadcast = (broadcast: GlobalBroadcast) => {
    setGlobalBroadcasts(prev => [broadcast, ...prev]);
    triggerMsnToast({
      id: `toast-bc-${Date.now()}`,
      title: broadcast.urgency === 'alerta_seguridad' ? '🚨 Alerta de Seguridad' : '📢 Comunicado Oficial',
      message: broadcast.title,
      avatar: currentUser.avatar
    });
  };

  const handleSubmitReport = (newRepData: Omit<UserReport, 'id' | 'timestamp' | 'status' | 'inviterAlerted'>) => {
    const newReport: UserReport = {
      ...newRepData,
      id: `rep-${Date.now()}`,
      timestamp: 'Recién emitido',
      status: 'investigando_cadena',
      inviterAlerted: true
    };
    setReports(prev => [newReport, ...prev]);
  };

  const handleUpdateReportStatus = (id: string, status: UserReport['status'], inviterAlerted?: boolean) => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status, ...(inviterAlerted !== undefined ? { inviterAlerted } : {}) } : r))
    );
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(guestUser);
    setIsLoggedIn(false);
    setContacts([]);
    setIsAuthOpen(true);
    triggerMsnToast({
      id: `toast-logout-${Date.now()}`,
      title: 'Sesión cerrada',
      message: 'Has salido de tu cuenta de forma segura.',
      avatar: guestUser.avatar
    });
  };

  const handleDeleteAccountPermanently = () => {
    authService.logout();
    try {
      localStorage.removeItem('burbuja_pinned_communities');
    } catch {}

    setCurrentUser(guestUser);
    setIsLoggedIn(false);
    setContacts([]);
    setIsAuthOpen(true);
    triggerMsnToast({
      id: `toast-del-${Date.now()}`,
      title: 'Cuenta eliminada',
      message: 'Tu cuenta y datos locales han sido borrados de este dispositivo.',
      avatar: ''
    });
  };

  const handleJoinCommunity = (commToJoin: Community) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === commToJoin.id) {
          const newMember: CommunityMember = {
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            userPin: currentUser.pin,
            role: 'participante',
            joinedAt: 'Recién unidx'
          };
          const existingMembers = c.members || [];
          return {
            ...c,
            isJoined: true,
            memberCount: c.memberCount + 1,
            members: [...existingMembers, newMember]
          };
        }
        return c;
      })
    );

    playMsnOnlineChime();
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.6 }
    });

    try {
      const savedJoined = JSON.parse(localStorage.getItem(`burbuja_joined_communities_${currentUser.id}`) || '[]');
      if (!savedJoined.includes(commToJoin.id)) {
        localStorage.setItem(`burbuja_joined_communities_${currentUser.id}`, JSON.stringify([...savedJoined, commToJoin.id]));
      }
    } catch {}

    triggerMsnToast({
      id: `toast-join-${Date.now()}`,
      title: '¡Te has unido a la comunidad! 🌈',
      message: `Ahora formas parte de "${commToJoin.name}". Ya la tienes en Mis Comunidades.`,
      avatar: commToJoin.icon
    });
  };

  const handleOpenDirectChat = (contact: Contact) => {
    setActiveDirectChatContact(contact);
    if (!currentUser?.pin) return;

    const cleanMyPin = currentUser.pin.toUpperCase().trim();
    const contactPin = (contact.pin || contact.id || '').toUpperCase().trim();
    const isOfficial = contact.id === 'superadmin-root' || contact.pin === SUPERADMIN_PIN || contact.name === 'Burbuja LGBTIQ';

    try {
      const stored = localStorage.getItem(`burbuja_dm_last_read_${cleanMyPin}`);
      const lastReadMap = stored ? JSON.parse(stored) : {};
      const nowIso = new Date().toISOString();
      lastReadMap[contactPin] = nowIso;
      lastReadMap[contactPin.replace(/[^A-Z0-9]/g, '')] = nowIso;
      if (contact.id) lastReadMap[contact.id.toUpperCase()] = nowIso;
      if (isOfficial) {
        lastReadMap[SUPERADMIN_PIN] = nowIso;
        lastReadMap['SUPERADMIN-ROOT'] = nowIso;
        setOfficialUnreadCount(0);
      }
      localStorage.setItem(`burbuja_dm_last_read_${cleanMyPin}`, JSON.stringify(lastReadMap));
    } catch {}

    // Resetear contador de no leídos de este contacto inmediatamente en la lista
    setContacts(prev =>
      prev.map(c => {
        if (
          (contact.pin && c.pin?.toUpperCase() === contact.pin.toUpperCase()) ||
          (contact.id && c.id === contact.id)
        ) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  };

  const totalUnreadCount = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0) + officialUnreadCount;

  // Si el usuario está en modo Detox / Desconexión, pantalla completa limpia sin bordes ni contenedor reducido
  if (isLoggedIn && isDetoxActive) {
    return (
      <div className="min-h-screen w-full bg-black text-slate-100 flex flex-col">
        <DetoxStandbyView onReconnect={() => handleUpdateStatus('disponible')} />
        <BubbleStatusNotificationContainer
          notifications={bubbleStatusNotifications}
          onDismiss={(id) => setBubbleStatusNotifications(prev => prev.filter(n => n.id !== id))}
        />
        <MSNToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'light' ? 'light-mode bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    } flex flex-col justify-between`}>
      {/* Banner de Servidor Local / Modo de Pruebas Ficticio */}
      {isLocalServer && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-500 dark:text-amber-400 flex items-center justify-between z-50">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Servidor Local: {useMockData ? 'Base de datos de prueba activa (Ficticia)' : 'Conectado a Supabase real'}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleMockData}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 transition-colors text-[10px] font-bold underline cursor-pointer"
          >
            {useMockData ? 'Cambiar a Supabase Real' : 'Cargar Base de Prueba'}
          </button>
        </div>
      )}

      {/* Barra Superior Fija (Header limpio y minimalista) */}
      {isLoggedIn && !isDetoxActive && (!selectedCommunity || selectedCommunity.id === 'none' || activeTab !== 'comunidades') && (
        <header className={`sticky top-0 z-30 transition-colors backdrop-blur-xl border-b ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200/90 shadow-sm'
            : 'bg-slate-950/90 border-slate-800/80'
        } pt-[max(env(safe-area-inset-top,0px),0.5rem)] px-4 py-2.5`}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Logo size="sm" />
          </div>
        </header>
      )}

      {/* Contenedor de Vistas Principales */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 sm:px-4 pt-3 pb-6">
        {!isLoggedIn ? (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold">
                🫧 Red Social Privada por Invitación
              </span>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                Barquisimeto & Lara
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un entorno seguro, libre de perfiles falsos y con trazabilidad de confianza para personas diversas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-xs mx-auto space-y-2 text-left text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Acceso por <strong>PIN único</strong> o <strong>invitación</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                <span>Cédula protegida por <strong>Hash SHA-256</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                <span>Radar de proximidad con <strong>distancia segura</strong></span>
              </div>
            </div>

            <div className="space-y-2.5 max-w-xs mx-auto">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-pink-600/25 active:scale-95 transition-all"
              >
                Iniciar Sesión / Crear Cuenta
              </button>

              <button
                type="button"
                onClick={() => setIsApkModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-white text-xs font-bold flex items-center justify-between transition-all active:scale-95 shadow-lg group"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Burbuja LGBTIQ+ v1.0.0</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black uppercase tracking-wider animate-pulse">
                  Nueva actualización
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. PESTAÑA: COMUNIDADES (Inicio predeterminado) */}
            {activeTab === 'comunidades' && (
              <CommunitiesTab
                communities={communities}
                posts={posts}
                chatMessages={chatMessages}
                selectedCommunity={selectedCommunity.id !== 'none' ? selectedCommunity : null}
                onSelectCommunity={(comm) => setSelectedCommunity(comm || emptyCommunityFallback)}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                theme={theme}
                isZumping={isZumping}
                onTriggerZump={handleTriggerZump}
                onOpenSharePIN={() => setIsSharePINOpen(true)}
                onOpenCreateCommunity={() => setIsCreateCommunityOpen(true)}
                onOpenExplore={() => setIsExploreOpen(true)}
                onTogglePinCommunity={handleTogglePinCommunity}
                onOpenManageCommunity={() => {
                  setManagingCommunity(selectedCommunity);
                  setIsCommunityRolesOpen(true);
                }}
                onMuteMember={handleMuteMember}
                onAddContact={handleAddContact}
                onOpenReport={(contact) => setReportTargetContact(contact)}
              />
            )}

            {/* 2. PESTAÑA: CONTACTOS / CHATS */}
            {activeTab === 'contactos' && (
              <ContactsTab
                currentUser={currentUser}
                contacts={
                  authService.isSuperadmin(currentUser)
                    ? contacts
                    : (contacts.some(c => c.id === 'superadmin-root' || c.pin === SUPERADMIN_PIN || c.name === 'Burbuja LGBTIQ')
                        ? contacts
                        : [officialBurbujaContact, ...contacts])
                }
                myStories={myStories}
                theme={theme}
                bubbleRequests={bubbleRequests}
                onAcceptBubbleRequest={handleAcceptBubbleRequest}
                onRejectBubbleRequest={handleRejectBubbleRequest}
                onRemoveContact={handleRemoveContact}
                onOpenAddContact={() => setIsAddContactOpen(true)}
                onOpenRadar={() => setIsRadarOpen(true)}
                onOpenDirectChat={handleOpenDirectChat}
                onViewStory={(contact) => setSelectedStoryContact(contact)}
                onOpenCreateStory={() => {
                  setIsOfficialStoryCreation(false);
                  setIsCreateStoryOpen(true);
                }}
                onViewMyStory={handleViewMyStory}
                onOpenReport={(contact) => setReportTargetContact(contact)}
                onToggleBlockContact={handleToggleBlockContact}
                officialContact={officialBurbujaContact}
                isAdmin={authService.isSuperadmin(currentUser)}
                onOpenCreateOfficialStory={() => {
                  setIsOfficialStoryCreation(true);
                  setIsCreateStoryOpen(true);
                }}
              />
            )}

            {/* 3. PESTAÑA: PERFIL DEDICADO */}
            {activeTab === 'perfil' && (
              <ProfileTab
                currentUser={currentUser}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onOpenEditProfile={() => setIsProfileOpen(true)}
                onOpenSharePIN={() => setIsSharePINOpen(true)}
                onOpenSuperadmin={() => setIsSuperadminOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onUpdatePersonalMessage={handleUpdatePersonalMessage}
                onToggleWhatsAppBridge={handleToggleWhatsAppBridge}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccountPermanently}
              />
            )}
          </>
        )}
      </main>

      {/* Barra de Navegación Inferior Fija (Estilo WhatsApp) */}
      {isLoggedIn && (
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          currentUser={currentUser}
          pendingRequestsCount={bubbleRequests.length + totalUnreadCount}
          theme={theme}
          isAdmin={authService.isSuperadmin(currentUser)}
          onOpenAdminMenu={() => setIsAdminMenuOpen(true)}
        />
      )}

      {/* 2. Notificaciones de Estado: Burbuja Flotante que Baja y Explota */}
      <BubbleStatusNotificationContainer
        notifications={bubbleStatusNotifications}
        onDismiss={(id) => setBubbleStatusNotifications(prev => prev.filter(n => n.id !== id))}
      />

      {/* 3. Notificaciones Retro MSN */}
      <MSNToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />

      {/* 4. Modales Globales */}
      <GlobalModals
        currentUser={currentUser}
        contacts={contacts}
        availableContacts={contacts}
        theme={theme}
        reports={reports}
        managingCommunity={managingCommunity}
        selectedCommunity={selectedCommunity}
        communities={communities}
        managedUsers={managedUsers}
        globalBroadcasts={globalBroadcasts}
        onToggleUserEnabled={handleToggleUserEnabled}
        onGrantInvitations={handleGrantInvitations}
        onToggleCommunityFreeze={handleToggleCommunityFreeze}
        onSendBroadcast={handleSendBroadcast}
        isProfileOpen={isProfileOpen}
        isSharePINOpen={isSharePINOpen}
        isAddContactOpen={isAddContactOpen}
        selectedStoryContact={selectedStoryContact}
        isCreateStoryOpen={isCreateStoryOpen}
        reportTargetContact={reportTargetContact}
        isAuthOpen={isAuthOpen}
        isSuperadminOpen={isSuperadminOpen}
        isCreateCommunityOpen={isCreateCommunityOpen}
        isCommunityRolesOpen={isCommunityRolesOpen}
        isRadarOpen={isRadarOpen}
        activeDirectChatContact={activeDirectChatContact}
        sentRequestsPins={sentRadarPins}
        onCloseRadar={() => setIsRadarOpen(false)}
        onToggleRadarVisible={handleToggleRadarVisible}
        onSendConnectionRequest={handleSendConnectionRequest}
        onCloseDirectChat={() => setActiveDirectChatContact(null)}
        onToggleTheme={handleToggleTheme}
        onOpenSharePIN={() => setIsSharePINOpen(true)}
        onCloseProfile={() => setIsProfileOpen(false)}
        onCloseSharePIN={() => setIsSharePINOpen(false)}
        onCloseAddContact={() => setIsAddContactOpen(false)}
        onAddContact={handleAddContact}
        onCloseStoryViewer={() => setSelectedStoryContact(null)}
        onCloseCreateStory={() => {
          setIsCreateStoryOpen(false);
          setIsOfficialStoryCreation(false);
        }}
        onPublishStory={handlePublishMyStory}
        isAdmin={authService.isSuperadmin(currentUser)}
        isOfficialStoryCreation={isOfficialStoryCreation}
        onCloseReport={() => setReportTargetContact(null)}
        onSubmitReport={handleSubmitReport}
        onCloseAuth={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setIsAuthOpen(false);
          if (authService.isSuperadmin(user)) {
            setIsSuperadminOpen(true);
          }
        }}
        onCloseSuperadmin={() => setIsSuperadminOpen(false)}
        onUpdateReportStatus={handleUpdateReportStatus}
        onCloseCreateCommunity={() => setIsCreateCommunityOpen(false)}
        onCreateCommunity={handleCreateCommunity}
        onCloseCommunityRoles={() => {
          setIsCommunityRolesOpen(false);
          setManagingCommunity(null);
        }}
        onUpdateCommunity={handleUpdateCommunity}
        onUpdateMemberRole={handleUpdateMemberRole}
        onMuteMember={handleMuteMember}
        onRemoveMember={handleRemoveMember}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onAddMemberByPin={handleAddMemberByPin}
        onOpenReportMember={handleOpenReportMember}
        onToggleWhatsAppBridge={handleToggleWhatsAppBridge}
        onUpdateStatus={handleUpdateStatus}
        onUpdateProfile={handleUpdateProfile}
        onLeaveCommunity={handleLeaveCommunity}
      />

      {/* Modal de Explorar Comunidades */}
      <ExploreCommunitiesModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        communities={communities}
        posts={posts}
        currentUser={currentUser}
        theme={theme}
        onJoinCommunity={handleJoinCommunity}
        onSelectCommunity={(comm) => {
          setIsExploreOpen(false);
          handleSelectCommunity(comm);
          setActiveTab('comunidades');
        }}
      />

      {/* Modal de Descarga de APK Android */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Menú Inferior de Control Admin */}
      <AdminBottomMenu
        isOpen={isAdminMenuOpen}
        onClose={() => setIsAdminMenuOpen(false)}
        onOpenCreateCommunity={() => setIsCreateCommunityOpen(true)}
        onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
        onOpenCreateOfficialStory={() => {
          setIsOfficialStoryCreation(true);
          setIsCreateStoryOpen(true);
        }}
        onOpenContactsAsAdmin={() => {
          setActiveTab('contactos');
          triggerMsnToast({
            id: `toast-admin-chat-${Date.now()}`,
            title: 'Modo Burbuja LGBTIQ Activo',
            message: 'Tus chats se enviarán con la identidad oficial de la plataforma.',
            avatar: '/logo.svg'
          });
        }}
        onOpenSuperadmin={() => setIsSuperadminOpen(true)}
        theme={theme}
      />

      {/* Modal de Transmisión de Difusión Global */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onSendBroadcast={handleSendBroadcast}
      />
    </div>
  );
}

export default App;
