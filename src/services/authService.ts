import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export const SUPERADMIN_PIN = 'BL-94X7A';

export const SUPERADMIN_PROFILE: UserProfile = {
  id: 'superadmin-root',
  name: 'Superadmin / Fundador',
  pronouns: 'Sistema',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  pin: SUPERADMIN_PIN,
  referredByPin: 'RAIZ',
  referredByName: 'Sistema Central',
  status: 'disponible',
  personalMessage: 'Cuenta de Supervisión y Auditoría del Sistema 🛡️',
  currentSong: '',
  allowWhatsAppBridge: false,
  whatsAppNumber: '',
  invitationsRemaining: 999,
  reputationScore: 100,
  radarVisible: false,
  city: 'Barquisimeto'
};

// Helper para calcular un hash seguro y enmascarado de cédula
export function hashCedula(cedulaRaw: string): string {
  const clean = cedulaRaw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length < 5) return clean;
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-3);
  return `${prefix}***${suffix}`;
}

// Genera un PIN aleatorio único en formato BL-XXXXX (ej: BL-8291K)
export function generateRandomPin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const candidate = `BL-${randomCode}`;
  return candidate === SUPERADMIN_PIN ? generateRandomPin() : candidate;
}

export interface RegisterParams {
  referralPin: string;
  cedula: string;
  name: string;
  pronouns: string;
  avatar?: string;
}

export const authService = {
  isSuperadmin(user?: UserProfile | null): boolean {
    if (!user) return false;
    return user.id === 'superadmin-root' || user.pin === SUPERADMIN_PIN;
  },

  // REGISTRO CON CÉDULA HASH Y CÓDIGO DE INVITACIÓN
  async register(params: RegisterParams): Promise<UserProfile> {
    const cleanReferral = params.referralPin.trim().toUpperCase();
    const cleanCedula = params.cedula.trim().toUpperCase();
    const cedulaHashVal = hashCedula(cleanCedula);

    // 1. Verificar si la cédula ya está registrada en Supabase o registro local
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('cedula_hash', cedulaHashVal)
      .maybeSingle();

    const localDirectory: any[] = JSON.parse(localStorage.getItem('burbuja_local_profiles') || '[]');
    const existingLocal = localDirectory.find((p) => p.cedula_hash === cedulaHashVal);

    if (existingUser || existingLocal) {
      throw new Error('Este número de cédula ya tiene una cuenta activa en la Burbuja.');
    }

    // 2. Verificar código de invitación (PIN del Superadmin Fundador BL-94X7A o de otro miembro)
    let inviterName = 'Superadmin / Fundador';
    let inviterPin = SUPERADMIN_PIN;

    const isFounderCode =
      cleanReferral === SUPERADMIN_PIN ||
      cleanReferral === 'BL-ORIGEN' ||
      cleanReferral === 'BL-FUNDADOR';

    if (!isFounderCode) {
      const { data: inviter } = await supabase
        .from('profiles')
        .select('*')
        .eq('pin', cleanReferral)
        .maybeSingle();

      const localInviter = localDirectory.find((p) => p.pin === cleanReferral);
      const targetInviter = inviter || localInviter;

      if (!targetInviter) {
        throw new Error('El PIN de invitación ingresado no existe en la red.');
      }

      if (targetInviter.invitations_remaining <= 0) {
        throw new Error('Ese código de invitación ya no tiene pases disponibles.');
      }

      inviterName = targetInviter.name;
      inviterPin = targetInviter.pin;

      if (inviter) {
        await supabase
          .from('profiles')
          .update({ invitations_remaining: Math.max(0, inviter.invitations_remaining - 1) })
          .eq('id', inviter.id);
      }
    }

    // 3. Generar PIN al azar único para este nuevo usuario
    let newPin = generateRandomPin();
    let attempts = 0;
    while (attempts < 5) {
      const { data: collision } = await supabase
        .from('profiles')
        .select('id')
        .eq('pin', newPin)
        .maybeSingle();
      if (!collision && !localDirectory.some((p) => p.pin === newPin)) break;
      newPin = generateRandomPin();
      attempts++;
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
    ];
    const chosenAvatar = params.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const profileData = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: params.name.trim(),
      pronouns: params.pronouns || 'Elle / He',
      avatar: chosenAvatar,
      pin: newPin,
      cedula_hash: cedulaHashVal,
      referred_by_pin: inviterPin,
      referred_by_name: inviterName,
      status: 'disponible',
      personal_message: '¡Recién llegadx a la Burbuja! 🏳️‍🌈✨',
      current_song: '',
      allow_whatsapp_bridge: false,
      whatsapp_number: '',
      invitations_remaining: 3,
      reputation_score: 100,
      radar_visible: false,
      city: 'Barquisimeto',
      is_enabled: true
    };

    const { error: insertErr } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (insertErr) {
      console.warn('Aviso al insertar en Supabase (guardando respaldo local):', insertErr.message);
    }

    try {
      localDirectory.push(profileData);
      localStorage.setItem('burbuja_local_profiles', JSON.stringify(localDirectory));
    } catch {}

    const userProfile: UserProfile = {
      id: profileData.id,
      name: profileData.name,
      pronouns: profileData.pronouns,
      avatar: profileData.avatar,
      pin: profileData.pin,
      referredByPin: profileData.referred_by_pin,
      referredByName: profileData.referred_by_name,
      status: profileData.status as any,
      personalMessage: profileData.personal_message,
      currentSong: profileData.current_song,
      allowWhatsAppBridge: profileData.allow_whatsapp_bridge,
      whatsAppNumber: profileData.whatsapp_number,
      invitationsRemaining: profileData.invitations_remaining,
      reputationScore: profileData.reputation_score,
      radarVisible: profileData.radar_visible,
      city: profileData.city
    };

    try {
      localStorage.setItem('burbuja_user', JSON.stringify(userProfile));
    } catch {}

    return userProfile;
  },

  // LOGIN POR PIN (Soporta tanto el PIN del Superadmin BL-94X7A como el PIN personal del usuario)
  async loginWithPin(pinInput: string): Promise<UserProfile> {
    const cleanPin = pinInput.trim().toUpperCase();

    // 1. Verificar si es la cuenta exclusiva del Superadmin / Fundador
    if (cleanPin === SUPERADMIN_PIN) {
      try {
        localStorage.setItem('burbuja_user', JSON.stringify(SUPERADMIN_PROFILE));
      } catch {}
      return SUPERADMIN_PROFILE;
    }

    // 2. Buscar cuenta de usuario normal en Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('pin', cleanPin)
      .maybeSingle();

    const localDirectory: any[] = JSON.parse(localStorage.getItem('burbuja_local_profiles') || '[]');
    const localProfile = localDirectory.find((p) => p.pin === cleanPin);
    const found = profile || localProfile;

    if (!found) {
      throw new Error('No se encontró ninguna cuenta registrada con ese PIN.');
    }

    if (found.is_enabled === false) {
      throw new Error('Esta cuenta ha sido inhabilitada por moderación.');
    }

    const userProfile: UserProfile = {
      id: found.id,
      name: found.name,
      pronouns: found.pronouns,
      avatar: found.avatar,
      pin: found.pin,
      referredByPin: found.referred_by_pin,
      referredByName: found.referred_by_name,
      status: found.status as any,
      personalMessage: found.personal_message,
      currentSong: found.current_song,
      allowWhatsAppBridge: found.allow_whatsapp_bridge,
      whatsAppNumber: found.whatsapp_number,
      invitationsRemaining: found.invitations_remaining,
      reputationScore: found.reputation_score,
      radarVisible: found.radar_visible,
      city: found.city
    };

    try {
      localStorage.setItem('burbuja_user', JSON.stringify(userProfile));
    } catch {}

    return userProfile;
  },

  // RECUPERAR SESIÓN GUARDADA
  getSavedUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem('burbuja_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  // ACTUALIZAR PERFIL EN SUPABASE Y LOCALSTORAGE
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!userId || userId === 'guest' || userId === 'superadmin-root') return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.pronouns !== undefined) dbUpdates.pronouns = updates.pronouns;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.personalMessage !== undefined) dbUpdates.personal_message = updates.personalMessage;
    if (updates.currentSong !== undefined) dbUpdates.current_song = updates.currentSong;
    if (updates.allowWhatsAppBridge !== undefined) dbUpdates.allow_whatsapp_bridge = updates.allowWhatsAppBridge;
    if (updates.whatsAppNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsAppNumber;
    if (updates.radarVisible !== undefined) dbUpdates.radar_visible = updates.radarVisible;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    }

    try {
      const current = this.getSavedUser();
      if (current && current.id === userId) {
        localStorage.setItem('burbuja_user', JSON.stringify({ ...current, ...updates }));
      }
    } catch {}
  },

  // CERRAR SESIÓN
  logout() {
    try {
      localStorage.removeItem('burbuja_user');
    } catch {}
  }
};
