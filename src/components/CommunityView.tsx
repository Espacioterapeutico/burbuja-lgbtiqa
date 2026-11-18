import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Zap, 
  Send, 
  X, 
  Music,
  Users,
  ArrowLeft,
  ShieldCheck,
  Crown,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Flame,
  Compass,
  Bookmark,
  CheckCircle2,
  MessageCircle,
  MoreVertical,
  Camera,
  Mic,
  Play,
  Pause,
  UserPlus,
  UserCheck,
  Flag,
  Share2,
  BarChart2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Community, CommunityPost, ChatMessage, UserProfile, CommunityRole, Contact } from '../types';
import { playZumpSound, playVoiceNoteAudio, stopVoiceNoteAudio } from '../utils/sound';
import { build7525Feed } from '../utils/feedAlgorithm';

interface CommunityViewProps {
  communities: Community[];
  selectedCommunity: Community;
  onSelectCommunity: (comm: Community) => void;
  posts: CommunityPost[];
  chatMessages: ChatMessage[];
  onSendMessage: (
    text: string, 
    isZump?: boolean,
    media?: { audioUrl?: string; audioDurationSeconds?: number; imageUrl?: string }
  ) => void;
  currentUser: UserProfile;
  isZumping: boolean;
  onTriggerZump: () => void;
  onOpenSharePIN: () => void;
  onBack?: () => void;
  onOpenCreateCommunity?: () => void;
  onOpenManageCommunity?: () => void;
  onMuteMember?: (communityId: string, userId: string, muteDurationText: string | null) => void;
  onAddContact?: (contact: Contact) => void;
  onOpenReport?: (contact: Contact) => void;
}

interface PostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorPin: string;
  text: string;
  timestamp: string;
}

// Icono de UNA SOLA BURBUJA de jabón traslúcida con brillo especular y arcoíris iridiscente
export const SingleBubbleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`}>
    <defs>
      <linearGradient id="singleBubbleRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.95" />
        <stop offset="22%" stopColor="#f43f5e" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.85" />
        <stop offset="65%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.95" />
      </linearGradient>

      <radialGradient id="singleBubbleGlass" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="25%" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.1" />
        <stop offset="82%" stopColor="#f472b6" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.32" />
      </radialGradient>
    </defs>

    <circle
      cx="50"
      cy="50"
      r="44"
      fill="url(#singleBubbleGlass)"
      stroke="url(#singleBubbleRainbow)"
      strokeWidth="4"
    />

    <path
      d="M26 38 A 30 30 0 0 1 54 20"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeOpacity="0.95"
    />

    <circle cx="28" cy="46" r="2.4" fill="#ffffff" fillOpacity="0.85" />
    <circle cx="70" cy="74" r="2" fill="#ffffff" fillOpacity="0.5" />
  </svg>
);

export const CommunityView: React.FC<CommunityViewProps> = ({
  selectedCommunity,
  posts,
  chatMessages,
  onSendMessage,
  currentUser,
  onOpenSharePIN,
  onBack,
  onOpenManageCommunity,
  onMuteMember,
  onAddContact,
  onOpenReport
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [activePostIndex, setActivePostIndex] = useState(0);

  // Modales adicionales solicitados
  const [selectedPostMetrics, setSelectedPostMetrics] = useState<CommunityPost | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<Contact | null>(null);
  const [activeDirectChatUser, setActiveDirectChatUser] = useState<Contact | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [addedContactPins, setAddedContactPins] = useState<Record<string, boolean>>({});

  // Mensajería 1 a 1 en directo (Direct Messages)
  const [directMessages, setDirectMessages] = useState<Record<string, ChatMessage[]>>({
    'BL-4410A': [
      {
        id: 'dm-1',
        communityId: 'direct',
        senderName: 'Val Martínez',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        senderPronouns: 'Ella',
        text: '¡Hola Alex! Qué bueno que conectemos por acá 🌈 Me encantó tu último aporte.',
        timestamp: '15:10'
      }
    ],
    'BL-6621B': [
      {
        id: 'dm-2',
        communityId: 'direct',
        senderName: 'Andrés Gil',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        senderPronouns: 'Él',
        text: '¡Hola! Vi que te interesan las tardes de juegos de mesa en Barquisimeto.',
        timestamp: '16:02'
      }
    ]
  });
  const [directInputMessage, setDirectInputMessage] = useState('');
  const [directAttachedPhoto, setDirectAttachedPhoto] = useState<string | null>(null);

  // Multimedia en Chat Grupal
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // Reproductor de Audio / Notas de voz
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Alertas de palabras vetadas y sustitución bububu
  const [bannedWordAlert, setBannedWordAlert] = useState<{ word: string; duration: string } | null>(null);
  const [substitutedToast, setSubstitutedToast] = useState<{ original: string; replacedWith: string } | null>(null);

  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const chatPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const directPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Posición del Botón de Chat Arrastrable / Flotante
  const [chatBubblePos, setChatBubblePos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('community_chat_bubble_pos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: 200, y: 75 };
  });

  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const dragChatRef = useRef({
    startX: 0,
    startY: 0,
    initX: 200,
    initY: 75,
    hasMoved: false
  });

  // Ajuste inicial según el ancho del contenedor en móvil/escritorio
  useEffect(() => {
    if (mainContainerRef.current) {
      const width = mainContainerRef.current.clientWidth;
      setChatBubblePos(prev => {
        if (!localStorage.getItem('community_chat_bubble_pos')) {
          return { x: Math.max(16, width - 74), y: 80 };
        }
        return prev;
      });
    }
  }, []);

  // Handlers de arrastre táctil (Móvil)
  const handleBubbleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragChatRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initX: chatBubblePos.x,
      initY: chatBubblePos.y,
      hasMoved: false
    };
    setIsDraggingChat(true);
  };

  const handleBubbleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingChat) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragChatRef.current.startX;
    const dy = touch.clientY - dragChatRef.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      dragChatRef.current.hasMoved = true;
    }
    const container = mainContainerRef.current;
    const bubbleSize = 58;
    const maxX = (container ? container.clientWidth : 380) - bubbleSize - 12;
    const maxY = (container ? container.clientHeight : 700) - bubbleSize - 16;
    const newX = Math.max(12, Math.min(maxX, dragChatRef.current.initX + dx));
    const newY = Math.max(65, Math.min(maxY, dragChatRef.current.initY + dy));
    setChatBubblePos({ x: newX, y: newY });
  };

  const handleBubbleTouchEnd = () => {
    setIsDraggingChat(false);
    if (!dragChatRef.current.hasMoved) {
      setIsChatOpen(true);
    } else {
      try {
        localStorage.setItem('community_chat_bubble_pos', JSON.stringify(chatBubblePos));
      } catch {}
    }
  };

  // Handlers de arrastre con mouse (Escritorio / Laptop)
  const handleBubbleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragChatRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: chatBubblePos.x,
      initY: chatBubblePos.y,
      hasMoved: false
    };
    setIsDraggingChat(true);
  };

  useEffect(() => {
    if (!isDraggingChat) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragChatRef.current.startX;
      const dy = e.clientY - dragChatRef.current.startY;
      if (Math.hypot(dx, dy) > 6) {
        dragChatRef.current.hasMoved = true;
      }
      const container = mainContainerRef.current;
      const bubbleSize = 58;
      const maxX = (container ? container.clientWidth : 380) - bubbleSize - 12;
      const maxY = (container ? container.clientHeight : 700) - bubbleSize - 16;
      const newX = Math.max(12, Math.min(maxX, dragChatRef.current.initX + dx));
      const newY = Math.max(65, Math.min(maxY, dragChatRef.current.initY + dy));
      setChatBubblePos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingChat(false);
      if (!dragChatRef.current.hasMoved) {
        setIsChatOpen(true);
      } else {
        try {
          localStorage.setItem('community_chat_bubble_pos', JSON.stringify(chatBubblePos));
        } catch {}
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingChat, chatBubblePos]);

  // Favoritos / Guardados
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('saved_community_posts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Comentarios específicos por post
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>({
    'p-bqto-1': [
      {
        id: 'c-1',
        authorName: 'Carlos Mendoza',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        authorPin: 'BL-8190C',
        text: '¡Me anoto para el café en Nueva Segovia! Llevo mi cuaderno de bocetos ☕🎨',
        timestamp: 'Hace 2 horas'
      },
      {
        id: 'c-2',
        authorName: 'Val Martínez',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        authorPin: 'BL-4410A',
        text: '¡Qué lindo plan! Yo puedo pasar después de las 4pm 🙌',
        timestamp: 'Hace 1 hora'
      }
    ],
    'p-bqto-2': [
      {
        id: 'c-3',
        authorName: 'Andrés Gil',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        authorPin: 'BL-6621B',
        text: '¡Qué fotaza! La luz dorada del Obelisco y el Monumento al Sol es mágica ✨',
        timestamp: 'Hace 3 horas'
      }
    ],
    'p-bqto-3': [
      {
        id: 'c-4',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        authorPin: 'BL-9842K',
        text: 'Totalmente de acuerdo, esa librería tiene un patio precioso para leer en calma 📖🌿',
        timestamp: 'Hace 45 min'
      }
    ]
  });

  const currentPosts = posts.filter(p => p.communityId === selectedCommunity.id);

  // Algoritmo 75% Engagement y 25% Descubrimiento Fresco
  const algorithmicPosts = useMemo(() => {
    return build7525Feed(currentPosts);
  }, [currentPosts]);

  // Regla de Quorum: Mínimo 3 personas para abrir el chat
  const hasQuorum = selectedCommunity.activeNow >= 3;

  // Rol del usuario en la comunidad
  const myMemberRecord = selectedCommunity.members?.find(m => m.userId === currentUser.id);
  const myRole: CommunityRole = myMemberRecord?.role || (selectedCommunity.creatorId === currentUser.id ? 'admin' : 'participante');
  const isUserMuted = !!myMemberRecord?.isMutedUntil;

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const isLiked = !prev[postId];
      if (isLiked) {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ec4899', '#f43f5e', '#a855f7']
        });
      }
      return { ...prev, [postId]: isLiked };
    });
  };

  const toggleSavePost = (postId: string) => {
    setSavedPosts(prev => {
      const next = { ...prev, [postId]: !prev[postId] };
      try {
        localStorage.setItem('saved_community_posts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Función para sustituir palabras vetadas por "bububu" o "burbuja"
  const filterAndReplaceBannedWords = (text: string) => {
    const banned = selectedCommunity.bannedWords || [];
    if (banned.length === 0) return { sanitized: text, hadReplacements: false, wordsReplaced: [] as string[] };

    let result = text;
    const wordsReplaced: string[] = [];
    const replacements = selectedCommunity.replacementWords && selectedCommunity.replacementWords.length > 0
      ? selectedCommunity.replacementWords
      : ['bububu', 'burbuja'];

    banned.forEach(word => {
      const clean = word.trim();
      if (!clean) return;
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');

      if (regex.test(result)) {
        wordsReplaced.push(clean);
        result = result.replace(regex, () => {
          const chosen = replacements[Math.floor(Math.random() * replacements.length)];
          return chosen;
        });
      }
    });

    return {
      sanitized: result,
      hadReplacements: wordsReplaced.length > 0,
      wordsReplaced
    };
  };

  // Manejo de Audio (Grabación de Nota de Voz en Chat Grupal)
  const handleStartVoiceRecording = () => {
    if (isUserMuted) return;
    setIsRecordingAudio(true);
    setRecordingDurationSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDurationSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingAudio(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setRecordingDurationSeconds(0);
  };

  const handleSendVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = Math.max(1, recordingDurationSeconds);
    setIsRecordingAudio(false);
    setRecordingDurationSeconds(0);

    onSendMessage(
      '🎙️ Nota de voz enviada',
      false,
      {
        audioUrl: 'mock-voice-recording',
        audioDurationSeconds: duration
      }
    );
  };

  // Manejo de Fotos Instantáneas (Chat Grupal)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAttachDemoPhoto = () => {
    const demoPhotos = [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    ];
    setAttachedPhoto(demoPhotos[Math.floor(Math.random() * demoPhotos.length)]);
  };

  // Enviar mensaje en Chat Grupal
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUserMuted) return;
    if (!inputMessage.trim() && !attachedPhoto) return;

    const messageText = inputMessage.trim();
    const { sanitized, hadReplacements, wordsReplaced } = filterAndReplaceBannedWords(messageText);

    if (hadReplacements) {
      setSubstitutedToast({
        original: wordsReplaced.join(', '),
        replacedWith: 'bububu / burbuja'
      });
      setTimeout(() => setSubstitutedToast(null), 3500);

      if (selectedCommunity.bannedWordAction === 'mute' || selectedCommunity.bannedWordAction === 'both') {
        const duration = selectedCommunity.autoMuteDuration || 'Silenciado por 24 horas';
        onMuteMember?.(selectedCommunity.id, currentUser.id, `${duration} por usar palabra vetada: "${wordsReplaced.join(', ')}"`);
        setBannedWordAlert({ word: wordsReplaced.join(', '), duration });
        playZumpSound();
      }
    }

    onSendMessage(
      sanitized || (attachedPhoto ? '📷 Foto instantánea compartida' : ''),
      false,
      attachedPhoto ? { imageUrl: attachedPhoto } : undefined
    );

    setInputMessage('');
    setAttachedPhoto(null);
  };

  const handleSendZump = () => {
    if (isUserMuted) return;
    playZumpSound();
    onSendMessage('ha enviado un ¡Zump! ⚡', true);
  };

  // Reproducción de Notas de Voz
  const handleTogglePlayAudio = (id: string, durationSec: number = 6) => {
    if (playingAudioId === id) {
      stopVoiceNoteAudio();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      playVoiceNoteAudio(durationSec, () => {
        setPlayingAudioId(null);
      });
    }
  };

  // Abrir Perfil al hacer clic en avatar o nombre en el chat
  const handleOpenUserProfile = (senderName: string, senderAvatar: string, senderPronouns: string) => {
    const memberRecord = selectedCommunity.members?.find(m => m.userName.toLowerCase() === senderName.toLowerCase());

    const profileTarget: Contact = {
      id: memberRecord?.userId || `user-${Date.now()}`,
      name: senderName,
      pronouns: senderPronouns || 'Elle',
      avatar: senderAvatar,
      pin: memberRecord?.userPin || '',
      referredByName: '',
      referredByPin: '',
      status: 'disponible',
      personalMessage: 'Miembro de esta comunidad 🫧',
      currentSong: '',
      allowWhatsAppBridge: false,
      stories: []
    };

    setSelectedChatUser(profileTarget);
  };

  // Abrir Chat 1 a 1 desde el modal de perfil
  const handleStartDirectChat = (target: Contact) => {
    setSelectedChatUser(null);
    setActiveDirectChatUser(target);
  };

  // Agregar contacto desde el perfil
  const handleAddUserToContacts = (target: Contact) => {
    if (onAddContact) {
      onAddContact(target);
    }
    setAddedContactPins(prev => ({ ...prev, [target.pin]: true }));
    setToastNotification(`¡${target.name} se agregó a tus contactos de Burbuja!`);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Enviar mensaje en Chat 1 a 1
  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectChatUser) return;
    if (!directInputMessage.trim() && !directAttachedPhoto) return;

    const targetPin = activeDirectChatUser.pin;
    const newMsg: ChatMessage = {
      id: `dm-${Date.now()}`,
      communityId: 'direct',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderPronouns: currentUser.pronouns,
      text: directInputMessage.trim() || (directAttachedPhoto ? '📷 Foto enviada' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: directAttachedPhoto || undefined
    };

    setDirectMessages(prev => ({
      ...prev,
      [targetPin]: [...(prev[targetPin] || []), newMsg]
    }));

    setDirectInputMessage('');
    setDirectAttachedPhoto(null);

    // Respuesta simulada automática del contacto para dar vida al chat 1 a 1
    setTimeout(() => {
      const replies = [
        `¡Hola ${currentUser.name.split(' ')[0]}! Qué lindo que me escribas por acá en privado 🫧 Me alegra mucho coincidir en ${selectedCommunity.name}.`,
        `¡Me encantó tu mensaje! Totalmente de acuerdo contigo, este espacio se siente súper seguro y tranquilo ✨`,
        `¡Sii! Quedamos en contacto directo por acá 💜 Cuenta conmigo para cualquier plan o conversa.`
      ];
      const botReply: ChatMessage = {
        id: `dm-reply-${Date.now()}`,
        communityId: 'direct',
        senderName: activeDirectChatUser.name,
        senderAvatar: activeDirectChatUser.avatar,
        senderPronouns: activeDirectChatUser.pronouns,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDirectMessages(prev => ({
        ...prev,
        [targetPin]: [...(prev[targetPin] || []), botReply]
      }));
    }, 1200);
  };

  // Comentarios en post
  const handleAddPostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsPostId || !newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    const { sanitized, hadReplacements, wordsReplaced } = filterAndReplaceBannedWords(commentText);

    if (hadReplacements) {
      setSubstitutedToast({
        original: wordsReplaced.join(', '),
        replacedWith: 'bububu / burbuja'
      });
      setTimeout(() => setSubstitutedToast(null), 3500);

      if (selectedCommunity.bannedWordAction === 'mute' || selectedCommunity.bannedWordAction === 'both') {
        const duration = selectedCommunity.autoMuteDuration || 'Silenciado por 24 horas';
        onMuteMember?.(selectedCommunity.id, currentUser.id, `${duration} por usar palabra vetada: "${wordsReplaced.join(', ')}"`);
        setBannedWordAlert({ word: wordsReplaced.join(', '), duration });
        playZumpSound();
      }
    }

    const newComment: PostComment = {
      id: `comm-${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorPin: currentUser.pin,
      text: sanitized,
      timestamp: 'Justo ahora'
    };

    setPostComments(prev => ({
      ...prev,
      [activeCommentsPostId]: [...(prev[activeCommentsPostId] || []), newComment]
    }));

    setNewCommentText('');
  };

  // Scroll Snap del feed vertical
  const handleScroll = () => {
    const container = feedContainerRef.current;
    if (!container) return;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activePostIndex && index >= 0 && index <= algorithmicPosts.length) {
      setActivePostIndex(index);
    }
  };

  const scrollNext = () => {
    const container = feedContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: container.clientHeight, behavior: 'smooth' });
  };

  const scrollPrev = () => {
    const container = feedContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: -container.clientHeight, behavior: 'smooth' });
  };

  const activeCommentPost = algorithmicPosts.find(p => p.id === activeCommentsPostId);
  const activePostCommentList = activeCommentsPostId ? (postComments[activeCommentsPostId] || []) : [];

  return (
    <div
      ref={mainContainerRef}
      className="community-view relative w-full max-w-md mx-auto h-[calc(100dvh-65px)] sm:h-[740px] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800 animate-in fade-in duration-300"
    >
      {/* Burbuja Flotante y Arrastrable de Chat (UNA SOLA BURBUJA de jabón traslúcida) */}
      {!isChatOpen && (
        <div
          style={{
            position: 'absolute',
            left: `${chatBubblePos.x}px`,
            top: `${chatBubblePos.y}px`,
            zIndex: 40,
            touchAction: 'none'
          }}
          onTouchStart={handleBubbleTouchStart}
          onTouchMove={handleBubbleTouchMove}
          onTouchEnd={handleBubbleTouchEnd}
          onMouseDown={handleBubbleMouseDown}
          className={`cursor-grab active:cursor-grabbing select-none relative w-14 h-14 flex items-center justify-center transition-transform duration-100 ${
            isDraggingChat
              ? 'scale-115 drop-shadow-[0_10px_20px_rgba(236,72,153,0.55)]'
              : 'hover:scale-110 active:scale-95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] hover:drop-shadow-[0_8px_20px_rgba(236,72,153,0.45)]'
          }`}
          title="Burbuja de Chat (Toca para abrir el chat, arrastra para moverla)"
        >
          <SingleBubbleIcon className="w-14 h-14" />

          {/* Insignia de Quorum o Conteo en vivo */}
          <div
            className={`absolute -top-1 -right-1 z-20 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg border border-white/40 pointer-events-none ${
              hasQuorum
                ? 'bg-emerald-600 shadow-emerald-950/60 ring-1 ring-emerald-400'
                : 'bg-amber-600 shadow-amber-950/60 ring-1 ring-amber-400'
            }`}
          >
            {hasQuorum ? selectedCommunity.activeNow : `${selectedCommunity.activeNow}/3`}
          </div>

          {hasQuorum && (
            <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/50 animate-ping pointer-events-none" />
          )}
        </div>
      )}

      {/* 1. Header Flotante Superior (TikTok style) */}
      <div className="absolute top-0 inset-x-0 z-30 px-3.5 pt-3.5 pb-8 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
        {/* Volver */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-transform active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden xs:inline">Volver</span>
          </button>
        )}

        {/* Nombre de la Comunidad y Miembros - Siempre blanco y legible en cualquier tema */}
        <div className="flex items-center gap-2 min-w-0 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-center shadow-lg community-feed-header">
          <span className="text-lg shrink-0">{selectedCommunity.icon}</span>
          <div className="truncate text-left">
            <h3 
              className="font-bold text-xs !text-white keep-white truncate drop-shadow-md"
              style={{ color: '#ffffff' }}
            >
              {selectedCommunity.name}
            </h3>
            <p 
              className="text-[10px] !text-slate-200 keep-white drop-shadow font-medium"
              style={{ color: '#e2e8f0' }}
            >
              {selectedCommunity.memberCount} miembros
            </p>
          </div>
        </div>

        {/* Botón Chat Grupal / Quorum */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsChatOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all active:scale-95 shadow-md border ${
              hasQuorum
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
            }`}
            title="Abrir Chat Grupal"
          >
            <SingleBubbleIcon className="w-4 h-4" />
            <span className="text-[11px]">{hasQuorum ? `Chat (${selectedCommunity.activeNow})` : `${selectedCommunity.activeNow}/3`}</span>
          </button>

          {/* Gestionar Admin/Mod */}
          {onOpenManageCommunity && (
            <button
              onClick={onOpenManageCommunity}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 backdrop-blur-md shadow-md"
              title="Gestionar roles"
            >
              {myRole === 'admin' ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : myRole === 'moderador' ? (
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              ) : (
                <Users className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Feed Vertical Formato TikTok (Scroll Snap 1 Publicación por Pantalla Completa) */}
      {algorithmicPosts.length > 0 ? (
        <div
          ref={feedContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {algorithmicPosts.map((post, idx) => {
            const isLiked = !!likedPosts[post.id];
            const isSaved = !!savedPosts[post.id];
            const currentComments = (postComments[post.id] || []).length + post.commentsCount;

            return (
              <div
                key={post.id}
                className="w-full h-full snap-start snap-always shrink-0 relative flex flex-col justify-between overflow-hidden bg-slate-950 select-none"
                style={{ scrollSnapStop: 'always' }}
              >
                {/* FONDO / CONTENIDO MULTIMEDIA */}
                <div className="absolute inset-0 z-0">
                  {post.type === 'video' && post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover"
                      loop
                      autoPlay
                      muted={isMuted}
                      playsInline
                    />
                  ) : post.type === 'image' && post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title || 'Publicación'}
                      className="w-full h-full object-cover"
                      onClick={() => setZoomImage(post.mediaUrl || null)}
                    />
                  ) : (
                    /* Tarjeta de Texto Estilo Estado Retro */
                    <div className={`w-full h-full bg-gradient-to-br ${post.postBg || 'from-pink-950 via-purple-950 to-slate-950'} flex flex-col items-center justify-center p-8 text-center`}>
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-lg">
                        <Sparkles className="w-7 h-7 text-pink-300 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-black text-white leading-snug drop-shadow-md max-w-xs mb-3">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-200 leading-relaxed max-w-xs drop-shadow">
                        "{post.content}"
                      </p>
                    </div>
                  )}

                  {/* Gradiente de Oscurecimiento para Contraste de Texto */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />
                </div>

                {/* COLUMNA DERECHA DE ACCIONES VERTICALES (TikTok / Reels Style) */}
                <div className="absolute right-3.5 bottom-20 z-20 flex flex-col items-center gap-3.5 pointer-events-auto">
                  {/* Avatar del Creador */}
                  <div 
                    onClick={() => handleOpenUserProfile(post.creatorName, post.creatorAvatar, 'Elle')}
                    className="relative cursor-pointer group"
                    title={`Ver perfil de ${post.creatorName}`}
                  >
                    <img
                      src={post.creatorAvatar}
                      alt={post.creatorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-500 shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center text-[9px] text-white">
                      ✓
                    </div>
                  </div>

                  {/* 1. Botón de Like */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(post.id);
                    }}
                    className="flex flex-col items-center gap-0.5 text-white active:scale-125 transition-transform"
                  >
                    <div className={`p-2.5 rounded-full ${isLiked ? 'bg-pink-600/90' : 'bg-black/50 hover:bg-black/70'} backdrop-blur-md shadow-md`}>
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">
                      {post.likes + (isLiked ? 1 : 0)}
                    </span>
                  </button>

                  {/* 2. Botón de Comentarios */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentsPostId(post.id);
                    }}
                    className="flex flex-col items-center gap-0.5 text-white active:scale-125 transition-transform"
                  >
                    <div className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md shadow-md">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] font-bold drop-shadow">
                      {currentComments}
                    </span>
                  </button>

                  {/* 3. Botón de Favorito / Guardar */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavePost(post.id);
                    }}
                    className="flex flex-col items-center gap-0.5 text-white active:scale-125 transition-transform"
                    title={isSaved ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}
                  >
                    <div className={`p-2.5 rounded-full ${isSaved ? 'bg-amber-500/90' : 'bg-black/50 hover:bg-black/70'} backdrop-blur-md shadow-md`}>
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                    </div>
                    <span className="text-[10px] font-bold drop-shadow">
                      {isSaved ? 'Guardado' : 'Favorito'}
                    </span>
                  </button>

                  {/* 4. Botón de Sonido (si es video) */}
                  {post.type === 'video' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-md active:scale-95 transition-transform"
                      title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5 text-pink-400" />}
                    </button>
                  )}

                  {/* 5. TRES PUNTICOS (...): Métricas del creador y opciones avanzadas */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPostMetrics(post);
                    }}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-md active:scale-95 transition-transform"
                    title="Métricas de la publicación y opciones"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>

                  {/* Disco de música giratorio (si tiene pista) */}
                  {post.musicTrack && (
                    <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-lg animate-spin" style={{ animationDuration: '4s' }}>
                      <Music className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  )}
                </div>

                {/* OVERLAY INFERIOR: USUARIO, TÍTULO, DESCRIPCIÓN Y AUDIO (Limpio, sin tags algorítmicos públicos) */}
                <div className="absolute bottom-4 left-4 right-18 z-20 text-white space-y-1.5 pointer-events-auto">
                  {/* Nombre y Apellido del autor + PIN (Tocar para ver perfil) */}
                  <div 
                    onClick={() => handleOpenUserProfile(post.creatorName, post.creatorAvatar, 'Elle')}
                    className="flex items-center gap-2 cursor-pointer group w-fit"
                  >
                    <span className="font-bold text-sm drop-shadow-md group-hover:text-pink-300 transition-colors">
                      {post.creatorName}
                    </span>
                    <span className="text-[10px] font-mono text-pink-300 bg-pink-950/70 border border-pink-800/40 px-1.5 py-0.2 rounded">
                      {post.creatorPin}
                    </span>
                  </div>

                  {/* Título (si no es tipo texto puro) */}
                  {post.type !== 'text' && post.title && (
                    <h4 className="font-bold text-xs leading-snug drop-shadow-md">
                      {post.title}
                    </h4>
                  )}

                  {/* Contenido / Caption */}
                  {post.type !== 'text' && post.content && (
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed drop-shadow-md">
                      {post.content}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-pink-400 drop-shadow">
                      {post.tags.map(t => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Music Ticker */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium drop-shadow pt-0.5">
                    <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
                    <span className="truncate">{post.musicTrack || 'Audio original de la comunidad'}</span>
                  </div>
                </div>

                {/* Indicador de posición (ej: 1 de 3) */}
                <div className="absolute top-16 right-4 z-20 text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {idx + 1} / {algorithmicPosts.length}
                </div>
              </div>
            );
          })}

          {/* PANTALLA FINAL: HAS LLEGADO AL FINAL */}
          <div
            className="w-full h-full snap-start snap-always shrink-0 relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-black select-none"
            style={{ scrollSnapStop: 'always' }}
          >
            <div className="w-16 h-16 rounded-3xl bg-pink-950/60 border border-pink-700/60 flex items-center justify-center mb-4 shadow-xl">
              <CheckCircle2 className="w-8 h-8 text-pink-400" />
            </div>

            <h3 className="text-lg font-extrabold text-white mb-2">
              Has llegado al final de las publicaciones
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">
              Has visto todo el contenido disponible en <strong>{selectedCommunity.name}</strong> por ahora. ¡Vuelve más tarde o comparte una nueva publicación!
            </p>

            <div className="w-full max-w-xs space-y-2.5">
              <button
                onClick={() => {
                  if (feedContainerRef.current) {
                    feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Volver al inicio</span>
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Ir al Chat Grupal ({selectedCommunity.activeNow})</span>
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 font-semibold text-xs transition-all"
                >
                  Volver a Mis Comunidades
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <p className="text-sm">Aún no hay publicaciones en esta comunidad.</p>
        </div>
      )}

      {/* Flechas de Navegación Vertical Rápida (para escritorio) */}
      {algorithmicPosts.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-25 flex flex-col gap-1.5 hidden md:flex pointer-events-auto">
          <button
            onClick={scrollPrev}
            disabled={activePostIndex === 0}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 backdrop-blur-md border border-white/10 transition-transform active:scale-90"
            title="Publicación anterior"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            disabled={activePostIndex >= algorithmicPosts.length}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 backdrop-blur-md border border-white/10 transition-transform active:scale-90"
            title="Siguiente publicación"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Panel de Comentarios de la Publicación (Slide-up Bottom Sheet) */}
      {activeCommentsPostId && activeCommentPost && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header de Comentarios */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-pink-400" />
                <span>Comentarios</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800/50">
                  {activePostCommentList.length + activeCommentPost.commentsCount}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                Publicación de {activeCommentPost.creatorName}
              </p>
            </div>

            <button
              onClick={() => setActiveCommentsPostId(null)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de Comentarios */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {activePostCommentList.map((comm) => (
              <div key={comm.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <img
                  src={comm.authorAvatar}
                  alt={comm.authorName}
                  onClick={() => handleOpenUserProfile(comm.authorName, comm.authorAvatar, 'Elle')}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700 cursor-pointer hover:ring-2 hover:ring-pink-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div 
                      onClick={() => handleOpenUserProfile(comm.authorName, comm.authorAvatar, 'Elle')}
                      className="flex items-center gap-1.5 truncate cursor-pointer"
                    >
                      <span className="font-bold text-xs text-white truncate hover:underline">{comm.authorName}</span>
                      <span className="text-[9px] font-mono text-pink-300 bg-pink-950/60 px-1 rounded">
                        {comm.authorPin}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{comm.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {comm.text}
                  </p>
                </div>
              </div>
            ))}

            {activePostCommentList.length === 0 && (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">Aún no hay comentarios en esta publicación.</p>
                <p className="text-[11px] text-slate-400">¡Sé la primera persona en opinar!</p>
              </div>
            )}
          </div>

          {/* Formulario para agregar comentario */}
          <form onSubmit={handleAddPostComment} className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2.5 px-4 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Panel de Chat Grupal Desplegable (Con Audio, Foto Instantánea y Perfiles al Clic) */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Chat Top Bar */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{selectedCommunity.icon}</span>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  {selectedCommunity.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedCommunity.activeNow} personas activas • Quorum mínimo: 3
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasQuorum && !isUserMuted && (
                <button
                  onClick={handleSendZump}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-transform active:scale-90"
                  title="Guiño al Zumbido de Windows Live Messenger"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>¡Zump!</span>
                </button>
              )}

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content: Quorum Gate vs Messages */}
          {!hasQuorum ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center shadow-inner">
                <Users className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Invita a más personas para empezar
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Para garantizar conversaciones vivas y seguras, el chat de <strong>{selectedCommunity.name}</strong> requiere al menos <strong>3 personas conectadas</strong> para habilitarse.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                <span>Conectados actualmente:</span>
                <strong className="text-white">{selectedCommunity.activeNow} / 3</strong>
              </div>

              <button
                onClick={onOpenSharePIN}
                className="w-full max-w-xs flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                <span>Invitar Contactos con mi PIN</span>
              </button>
            </div>
          ) : (
            <>
              {/* Lista de Mensajes del Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                <div className="text-center py-1">
                  <span className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    💡 Toca la foto o nombre de un miembro para ver su perfil o escribirle en privado
                  </span>
                </div>

                {chatMessages.map((msg) => {
                  if (msg.isZump) {
                    return (
                      <div
                        key={msg.id}
                        className="flex items-center justify-center gap-2 py-2 px-3 my-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse text-center"
                      >
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{msg.senderName} {msg.text}</span>
                      </div>
                    );
                  }

                  const isMe = msg.senderName === currentUser.name;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar interactivo: clic abre perfil */}
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        onClick={() => handleOpenUserProfile(msg.senderName, msg.senderAvatar, msg.senderPronouns)}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700 cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all active:scale-90"
                        title={`Ver perfil de ${msg.senderName}`}
                      />

                      <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* Nombre interactivo: clic abre perfil */}
                        <div 
                          onClick={() => handleOpenUserProfile(msg.senderName, msg.senderAvatar, msg.senderPronouns)}
                          className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 cursor-pointer hover:text-pink-300"
                        >
                          <span className="font-semibold text-slate-300 hover:underline">{msg.senderName}</span>
                          <span>({msg.senderPronouns})</span>
                          <span>• {msg.timestamp}</span>
                        </div>

                        {/* Mensaje de texto o contenido multimedia */}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                            isMe
                              ? 'bg-pink-600 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {/* 1. Foto Instantánea Adjunta */}
                          {msg.imageUrl && (
                            <div className="rounded-xl overflow-hidden border border-white/10 max-w-xs shadow">
                              <img
                                src={msg.imageUrl}
                                alt="Foto compartida"
                                className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setZoomImage(msg.imageUrl || null)}
                              />
                            </div>
                          )}

                          {/* 2. Nota de Voz Instantánea */}
                          {msg.audioUrl && (
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/30 border border-white/10 min-w-[210px]">
                              <button
                                type="button"
                                onClick={() => handleTogglePlayAudio(msg.id, msg.audioDurationSeconds || 6)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                                  playingAudioId === msg.id ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-pink-500 text-white'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-slate-950" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                )}
                              </button>

                              {/* Ecualizador / Forma de onda visual */}
                              <div className="flex-1 flex items-center gap-1 h-5 px-1">
                                {[0.4, 0.7, 0.3, 0.9, 0.6, 0.8, 0.4, 0.95, 0.5, 0.75, 0.3].map((h, i) => (
                                  <span
                                    key={i}
                                    className={`w-1 rounded-full transition-all duration-200 ${
                                      playingAudioId === msg.id ? 'bg-pink-300 animate-pulse' : 'bg-slate-400'
                                    }`}
                                    style={{
                                      height: playingAudioId === msg.id ? `${Math.max(20, Math.sin((i + 1) * Date.now()) * 100)}%` : `${h * 100}%`
                                    }}
                                  />
                                ))}
                              </div>

                              <span className="text-[10px] font-mono font-bold text-slate-300 shrink-0">
                                0:0{msg.audioDurationSeconds || 6}
                              </span>
                            </div>
                          )}

                          {/* 3. Texto del mensaje */}
                          {msg.text && (
                            <p>{msg.text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de entrada o aviso de silenciado */}
              {isUserMuted ? (
                <div className="p-4 bg-rose-950/80 border-t border-rose-800 text-rose-200 text-xs flex items-center justify-center gap-2 text-center">
                  <VolumeX className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <p className="font-bold">Has sido silenciadx en esta comunidad</p>
                    <p className="text-[11px] text-rose-300/80">({myMemberRecord?.isMutedUntil || 'Temporalmente'}). Cuida las normas del grupo.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border-t border-slate-800">
                  {/* Previsualización de Foto Instantánea antes de enviar */}
                  {attachedPhoto && (
                    <div className="p-2.5 px-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={attachedPhoto}
                          alt="Foto instantánea"
                          className="w-12 h-12 rounded-xl object-cover border border-pink-500 shadow"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Foto instantánea adjunta</p>
                          <p className="text-[10px] text-slate-400">Lista para publicar en el chat</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedPhoto(null)}
                        className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Estado de Grabación de Audio Activa */}
                  {isRecordingAudio ? (
                    <div className="p-3 px-4 flex items-center justify-between bg-rose-950/70 border-t border-rose-800/80 animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span className="text-xs font-mono font-bold text-rose-200">
                          Grabando nota de voz: 00:0{recordingDurationSeconds}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelVoiceRecording}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSendVoiceRecording}
                          className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Audio</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Formulario de Entrada con Botones de Cámara y Micrófono */
                    <form onSubmit={handleSendChat} className="p-3">
                      {/* Input oculto para subir/tomar foto real con la cámara del dispositivo */}
                      <input
                        type="file"
                        ref={chatPhotoInputRef}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />

                      <div className="flex items-center gap-1.5">
                        {/* Botón de Cámara para Foto Instantánea */}
                        <button
                          type="button"
                          onClick={() => chatPhotoInputRef.current?.click()}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-pink-400 border border-slate-800 transition-colors"
                          title="Tomar o adjuntar foto instantánea"
                        >
                          <Camera className="w-4 h-4" />
                        </button>

                        {/* Botón de Micrófono para Nota de Voz */}
                        <button
                          type="button"
                          onClick={handleStartVoiceRecording}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
                          title="Grabar nota de voz"
                        >
                          <Mic className="w-4 h-4" />
                        </button>

                        {/* Campo de texto */}
                        <input
                          type="text"
                          placeholder={`Escribe en ${selectedCommunity.name}...`}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        />

                        {/* Botón Enviar */}
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() && !attachedPhoto}
                          className="p-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Accesos rápidos de prueba de foto */}
                      {!attachedPhoto && (
                        <div className="flex items-center justify-between pt-1.5 px-1 text-[10px] text-slate-400">
                          <button
                            type="button"
                            onClick={handleAttachDemoPhoto}
                            className="text-pink-400 hover:underline flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Probar con foto demo</span>
                          </button>
                          <span>🔒 Chat seguro con filtro Bububu 🫧</span>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 5. MODAL DE MÉTRICAS DE LA PUBLICACIÓN (Accedido desde los 3 punticos) */}
      {selectedPostMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-950/60 text-pink-400 border border-pink-800/40">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Métricas de la Publicación</h3>
                  <p className="text-[11px] text-slate-400">Herramientas para creadores de contenido</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPostMetrics(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fila de Datos Clave */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">⏱️ Permanencia Promedio</span>
                <span className="text-lg font-black text-white font-mono">
                  {selectedPostMetrics.avgWatchTimeSeconds || 6.4}s
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">
                  +18% sobre la media
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">📈 Tasa de Retención</span>
                <span className="text-lg font-black text-cyan-300 font-mono">
                  {Math.round((selectedPostMetrics.retentionRate || 0.88) * 100)}%
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Vieron el post completo
                </span>
              </div>
            </div>

            {/* Clasificación en el Algoritmo */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Distribución en el Feed Comunitario
              </span>
              <div className="flex items-center gap-2">
                {selectedPostMetrics.feedCategory === 'fresh_discovery' ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Descubrimiento Fresco (25% del feed)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Alta Interacción (75% del feed)</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                El sistema impulsa publicaciones auténticas garantizando que el 25% del feed sea contenido nuevo de creadores emergentes.
              </p>
            </div>

            {/* Interacciones acumuladas */}
            <div className="flex items-center justify-around py-2.5 px-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-center">
              <div>
                <span className="text-sm font-black text-white block">
                  {selectedPostMetrics.likes + (likedPosts[selectedPostMetrics.id] ? 1 : 0)}
                </span>
                <span className="text-[10px] text-slate-400">Me gusta</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div>
                <span className="text-sm font-black text-white block">
                  {(postComments[selectedPostMetrics.id] || []).length + selectedPostMetrics.commentsCount}
                </span>
                <span className="text-[10px] text-slate-400">Comentarios</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div>
                <span className="text-sm font-black text-white block">
                  {savedPosts[selectedPostMetrics.id] ? 1 : 0}
                </span>
                <span className="text-[10px] text-slate-400">Guardados</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPostMetrics(null);
                  setToastNotification('Enlace copiado al portapapeles 🔗');
                  setTimeout(() => setToastNotification(null), 3000);
                }}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Publicación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE PERFIL DE USUARIO AL TOCAR FOTO/NOMBRE EN EL CHAT */}
      {selectedChatUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedChatUser.avatar}
                    alt={selectedChatUser.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500 shadow-lg"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">{selectedChatUser.name}</h3>
                  <p className="text-xs text-pink-400 font-medium">({selectedChatUser.pronouns})</p>
                  <span className="inline-block mt-0.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/40">
                    PIN: {selectedChatUser.pin}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedChatUser(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensaje Personal / Bio */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Sobre mí:</span>
              "{selectedChatUser.personalMessage || 'Explorando la burbuja y compartiendo en comunidad 🌈'}"
            </div>

            {/* Canción y Cadena de Invitación */}
            <div className="space-y-1.5 text-xs">
              {selectedChatUser.currentSong && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300">
                  <Music className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="truncate">{selectedChatUser.currentSong}</span>
                </div>
              )}

              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Cadena de Invitación:</span>
                <span className="font-semibold text-slate-300">
                  Invitadx por {selectedChatUser.referredByName || 'Carolina Méndez'}
                </span>
              </div>
            </div>

            {/* 3 Botones de Acción Claves */}
            <div className="space-y-2 pt-2">
              {/* Botón 1: Chat 1 a 1 */}
              <button
                type="button"
                onClick={() => handleStartDirectChat(selectedChatUser)}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>💬 Chat 1 a 1 (Mensaje Privado)</span>
              </button>

              {/* Botón 2: Agregar a Contactos */}
              <button
                type="button"
                onClick={() => handleAddUserToContacts(selectedChatUser)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {addedContactPins[selectedChatUser.pin] ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">En tus Contactos</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span>➕ Agregar a Contactos</span>
                  </>
                )}
              </button>

              {/* Botón 3: Reportar */}
              {onOpenReport && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChatUser;
                    setSelectedChatUser(null);
                    onOpenReport(target);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reportar Usuario</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. CHAT 1 A 1 (Direct Messages) */}
      {activeDirectChatUser && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header del Chat 1 a 1 */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveDirectChatUser(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative">
                <img
                  src={activeDirectChatUser.avatar}
                  alt={activeDirectChatUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-pink-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-900" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                  {activeDirectChatUser.name}
                  <span className="text-[10px] font-normal text-pink-300">({activeDirectChatUser.pronouns})</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">
                  En línea • {activeDirectChatUser.pin}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveDirectChatUser(null)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de Mensajes 1 a 1 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            <div className="text-center py-2 space-y-1">
              <span className="text-[11px] font-semibold text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 inline-block">
                🔒 Conversación privada y cifrada punto a punto
              </span>
              <p className="text-[10px] text-slate-500">
                Los mensajes en este chat solo son visibles entre tú y {activeDirectChatUser.name}.
              </p>
            </div>

            {(directMessages[activeDirectChatUser.pin] || []).map((msg) => {
              const isMe = msg.senderName === currentUser.name;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                  />
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mb-0.5">
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                        isMe
                          ? 'bg-pink-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Foto"
                          className="w-full h-auto max-h-40 rounded-xl object-cover cursor-pointer"
                          onClick={() => setZoomImage(msg.imageUrl || null)}
                        />
                      )}
                      {msg.text && <p>{msg.text}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Entrada del Chat 1 a 1 */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            {directAttachedPhoto && (
              <div className="mb-2 p-2 rounded-xl bg-slate-950 flex items-center justify-between border border-slate-800">
                <img src={directAttachedPhoto} alt="Foto" className="w-10 h-10 rounded-lg object-cover" />
                <span className="text-[11px] text-slate-300">Foto lista para enviar</span>
                <button onClick={() => setDirectAttachedPhoto(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendDirectMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={directPhotoInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') setDirectAttachedPhoto(reader.result);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => directPhotoInputRef.current?.click()}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-pink-400 border border-slate-800"
                title="Tomar o adjuntar foto"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`Mensaje privado para ${activeDirectChatUser.name.split(' ')[0]}...`}
                value={directInputMessage}
                onChange={(e) => setDirectInputMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!directInputMessage.trim() && !directAttachedPhoto}
                className="p-2.5 rounded-2xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. LIGHTBOX / ZOOM DE FOTO A PANTALLA COMPLETA */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in"
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomImage}
            alt="Vista ampliada"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Toast Notificación General */}
      {toastNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-pink-500 shadow-2xl backdrop-blur-md text-xs text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-sm">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Toast Notificación de Sustitución por bububu / burbuja */}
      {substitutedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400 shadow-2xl backdrop-blur-md text-xs text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 max-w-sm">
          <span className="text-lg shrink-0">🫧</span>
          <p className="leading-snug text-slate-200">
            Palabra vetada <strong className="text-cyan-300">"{substitutedToast.original}"</strong> sustituida automáticamente por <strong className="text-pink-300 font-bold">"bububu"</strong> o <strong className="text-cyan-300 font-bold">"burbuja"</strong> ✨
          </p>
        </div>
      )}

      {/* Modal de Alerta: Palabra Vetada y Muteo Automático */}
      {bannedWordAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-rose-600/80 p-5 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-700 mx-auto flex items-center justify-center text-rose-400">
              <VolumeX className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">¡Palabra Vetada Detectada!</h3>
              <p className="text-xs text-rose-300 font-semibold">
                Has escrito la palabra prohibida: <span className="underline font-bold text-white">"{bannedWordAlert.word}"</span>
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Por las reglas de convivencia establecidas por el creador de esta comunidad, has sido <strong className="text-rose-400">silenciadx automáticamente ({bannedWordAlert.duration})</strong>. Tu mensaje no ha sido publicado.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBannedWordAlert(null)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
