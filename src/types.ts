export type StandardUserStatus = 
  | 'disponible' 
  | 'ocupado' 
  | 'en_crisis' 
  | 'en_fiesta' 
  | 'ausente' 
  | 'desconectado';

export type UserStatus = StandardUserStatus | 'personalizado' | (string & {});

export interface CustomStatusItem {
  id: string;
  label: string;
  color: string; // Color HEX (#ec4899) o nombre
  emoji?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  pronouns: string;
  avatar: string;
  pin: string; // 8 characters, e.g. BL-9842K
  referredByPin: string; // PIN of the person who referred them
  referredByName: string;
  status: UserStatus;
  customStatusLabel?: string;
  customStatusColor?: string;
  customStatuses?: CustomStatusItem[];
  personalMessage: string;
  currentSong: string;
  allowWhatsAppBridge: boolean;
  whatsAppNumber: string;
  invitationsRemaining: number;
  reputationScore: number;
  radarVisible?: boolean; // Si la persona activó su burbuja en el radar de exploración
  city?: string;
}

export interface Contact {
  id: string;
  name: string;
  pronouns: string;
  avatar: string;
  pin: string;
  referredByPin?: string;
  referredByName?: string;
  status: UserStatus;
  customStatusLabel?: string;
  customStatusColor?: string;
  personalMessage: string;
  currentSong: string;
  allowWhatsAppBridge: boolean;
  whatsAppNumber?: string;
  isBlockedByMe?: boolean;
  hasBlockedMe?: boolean;
  blockedAt?: string;
  blockReason?: string; // Motivo transparente del bloqueo visible para la persona
  distanceKm?: number; // Distancia aproximada para el radar de burbujas
  city?: string; // Ciudad (ej: Barquisimeto, Cabudare)
  isMuted?: boolean; // Silenciar notificaciones de conexión y cambios de estado
  unreadCount?: number; // Contador de mensajes no leídos (n)
  lastMessage?: string; // Último mensaje enviado o recibido
  lastMessageTime?: string; // Hora del último mensaje
  stories: {
    id: string;
    mediaUrl: string;
    caption: string;
    timestamp: string;
    reactions: { emoji: string; count: number }[];
  }[];
}

export interface BubbleConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  fromUserPronouns: string;
  fromUserPin: string;
  introMessage: string;
  timestamp: string;
  distanceKm?: number;
  city?: string;
  song?: string;
}

export type CommunityRole = 'admin' | 'moderador' | 'participante';

export interface CommunityMember {
  userId: string;
  userName: string;
  userAvatar: string;
  userPin: string;
  role: CommunityRole;
  joinedAt: string;
  isMutedUntil?: string; // e.g. "Silenciado por 24 horas"
}

export interface CommunityRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userPin: string;
  requestedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  isClosed: boolean;
  pinCode?: string;
  icon: string;
  memberCount: number;
  activeNow: number; // For the 3-person quorum requirement
  tags: string[];
  creatorId?: string;
  members?: CommunityMember[];
  pendingRequests?: CommunityRequest[];
  lastActivityAt?: string;
  isPinned?: boolean;
  isJoined?: boolean;
  isFrozen?: boolean; // Congelada/clausurada por Superadmin
  bannedWords?: string[]; // Sistema de betado de palabras
  bannedWordAction?: 'replace' | 'mute' | 'both'; // Acción: sustituir con "bububu" o "burbuja", o mutear
  replacementWords?: string[]; // Palabras sustitutas (default: ['bububu', 'burbuja'])
  autoMuteDuration?: string; // e.g. "Silenciado por 24 horas"
}

export type PostType = 'video' | 'image' | 'text';

export interface CommunityPost {
  id: string;
  communityId: string;
  type: PostType;
  creatorName: string;
  creatorAvatar: string;
  creatorPin: string;
  title?: string;
  content: string; // Text content or description
  mediaUrl?: string;
  videoUrl?: string;
  musicTrack?: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  postBg?: string;
  createdAt?: string;
  avgWatchTimeSeconds?: number; // Tiempo promedio de permanencia en segundos
  retentionRate?: number; // Tasa de retención (ej: 0.90 = vio el 90% del contenido)
  feedCategory?: 'top_engagement' | 'fresh_discovery';
  algorithmReason?: 'engagement_top' | 'discovery_fresh';
}

export interface ChatMessage {
  id: string;
  communityId: string;
  senderName: string;
  senderAvatar: string;
  senderPronouns: string;
  text: string;
  timestamp: string;
  isZump?: boolean;
  isModerator?: boolean;
  audioUrl?: string; // Nota de voz instantánea
  audioDurationSeconds?: number;
  imageUrl?: string; // Foto instantánea
  isViewOnce?: boolean; // Multimedia para ver una sola vez
  isViewed?: boolean; // Si la foto para ver una vez ya fue abierta
  deliveryStatus?: 'sending' | 'sent' | 'delivered'; // Estado: reloj, check o sobrecito abierto
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserAvatar: string;
  reportedUserPin: string;
  inviterPin: string;
  inviterName: string;
  reason: string;
  detail: string;
  timestamp: string;
  status: 'pendiente' | 'investigando_cadena' | 'resuelto' | 'sancionado';
  inviterAlerted: boolean;
}

export interface MSNToast {
  id: string;
  title: string;
  message: string;
  avatar: string;
  statusType?: UserStatus;
}

export interface ManagedUser {
  id: string;
  name: string;
  pronouns: string;
  avatar: string;
  pin: string;
  cedulaHash: string;
  referredByPin: string;
  referredByName: string;
  status: UserStatus;
  isEnabled: boolean; // Habilitado o suspendido/inhabilitado
  joinedDate: string;
  city: string;
  invitationsRemaining: number;
  reputationScore: number;
  personalMessage: string;
  createdCommunityIds?: string[];
}

export interface GlobalBroadcast {
  id: string;
  title: string;
  message: string;
  urgency: 'informativo' | 'alerta_seguridad';
  sentAt: string;
  authorName: string;
}
