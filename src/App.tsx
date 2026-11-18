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
import { authService } from './services/authService';
import { supabase } from './lib/supabase';
import { Logo } from './components/Logo';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { Smartphone, Radio, Share2 } from 'lucide-react';
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
  const [selectedCommunity, setSelectedCommunity] = useState<Community>(() => useMockData && communitiesMock.length > 0 ? communitiesMock[0] : emptyCommunityFallback);
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

  // Cargar usuarios, comunidades y denuncias reales desde Supabase (solo si no estamos usando la base ficticia local)
  useEffect(() => {
    if (useMockData) return;

    supabase.from('communities').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const mapped: Community[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          category: c.category || 'General',
          icon: c.icon || '🫧',
          isPinned: false,
          isJoined: true,
          isClosed: !!c.is_closed,
          isFrozen: !!c.is_frozen,
          creatorId: c.creator_id,
          memberCount: 1,
          activeNow: 1,
          tags: [c.category || 'General'],
          members: []
        }));
        setCommunities(mapped);
        setSelectedCommunity(mapped[0]);
      }
    });

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
  }, [isLoggedIn, isSuperadminOpen]);

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
  const handleUpdateStatus = (newStatus: UserStatus) => {
    const wasDetox = currentUser.status === 'desconectado';
    setCurrentUser(prev => ({ ...prev, status: newStatus }));
    authService.updateProfile(currentUser.id, { status: newStatus });

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
      return [newContact, ...prev];
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
      avatar: currentUser.avatar
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

  const handlePublishMyStory = (mediaUrl: string, caption: string) => {
    const newStory = {
      id: `story-${Date.now()}`,
      mediaUrl,
      caption,
      timestamp: 'Justo ahora',
      reactions: []
    };
    setMyStories(prev => [newStory, ...prev]);
    triggerMsnToast({
      id: `toast-story-${Date.now()}`,
      title: 'Historia Publicada',
      message: 'Tu historia de 24h ya está visible para tu red.',
      avatar: currentUser.avatar
    });
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
    setCurrentUser(prev => ({
      ...prev,
      radarVisible: active
    }));
    triggerMsnToast({
      id: `toast-radar-${Date.now()}`,
      title: active ? 'Tu Burbuja está Activa 🫧' : 'Burbuja Oculta 🫥',
      message: active 
        ? 'Ahora eres visible y puedes explorar personas cercanas.'
        : 'Tu burbuja ahora está oculta para explorar.',
      avatar: currentUser.avatar
    });
  };

  const handleSendConnectionRequest = (target: Contact, _introMessage: string) => {
    setSentRadarPins(prev => [...prev, target.pin]);
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

    setContacts(prev => [newContact, ...prev]);
    setBubbleRequests(prev => prev.filter(r => r.id !== req.id));

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
    triggerMsnToast({
      id: `toast-reject-bubble-${Date.now()}`,
      title: 'Solicitud descartada',
      message: 'La invitación para conectar burbujas ha sido retirada.',
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

    triggerMsnToast({
      id: `toast-join-${Date.now()}`,
      title: '¡Te has unido a la comunidad! 🌈',
      message: `Ahora formas parte de "${commToJoin.name}". Ya la tienes en Mis Comunidades.`,
      avatar: commToJoin.icon
    });
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'light' ? 'light-mode bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    } flex flex-col justify-between ${
      isDetoxActive ? 'filter grayscale contrast-105' : ''
    }`}>
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

      {/* Barra Superior Fija (Header estilo nativo WhatsApp / App móvil) */}
      {isLoggedIn && !isDetoxActive && (!selectedCommunity || selectedCommunity.id === 'none' || activeTab !== 'comunidades') && (
        <header className={`sticky top-0 z-30 transition-colors backdrop-blur-xl border-b ${
          theme === 'light'
            ? 'bg-white/90 border-slate-200/90 shadow-sm'
            : 'bg-slate-950/90 border-slate-800/80'
        } pt-[max(env(safe-area-inset-top,0px),0.5rem)] px-4 py-2.5`}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsApkModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs transition-all active:scale-95 shadow-sm"
                title="Descargar App Android (.APK)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>APK</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRadarOpen(true)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-pink-500 transition-all active:scale-95 shadow-sm"
                title="Radar de Cercanía"
              >
                <Radio className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsSharePINOpen(true)}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-purple-500 transition-all active:scale-95 shadow-sm"
                title="Compartir Pase de Invitación"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
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
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Descargar App para Android (.APK)</span>
              </button>
            </div>
          </div>
        ) : isDetoxActive ? (
          <DetoxStandbyView onReconnect={() => handleUpdateStatus('disponible')} />
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
                contacts={contacts}
                myStories={myStories}
                theme={theme}
                bubbleRequests={bubbleRequests}
                onAcceptBubbleRequest={handleAcceptBubbleRequest}
                onRejectBubbleRequest={handleRejectBubbleRequest}
                onOpenAddContact={() => setIsAddContactOpen(true)}
                onOpenRadar={() => setIsRadarOpen(true)}
                onOpenDirectChat={(contact) => setActiveDirectChatContact(contact)}
                onViewStory={(contact) => setSelectedStoryContact(contact)}
                onOpenCreateStory={() => setIsCreateStoryOpen(true)}
                onViewMyStory={handleViewMyStory}
                onOpenReport={(contact) => setReportTargetContact(contact)}
                onToggleBlockContact={handleToggleBlockContact}
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
      {isLoggedIn && !isDetoxActive && (
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          currentUser={currentUser}
          pendingRequestsCount={bubbleRequests.length}
          theme={theme}
        />
      )}

      {/* 3. Notificaciones Retro MSN */}
      {!isDetoxActive && (
        <MSNToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        />
      )}

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
        onCloseCreateStory={() => setIsCreateStoryOpen(false)}
        onPublishStory={handlePublishMyStory}
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
    </div>
  );
}

export default App;
