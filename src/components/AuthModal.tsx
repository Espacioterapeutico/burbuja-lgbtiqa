import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form state
  const [referralPin, setReferralPin] = useState('');
  const [regName, setRegName] = useState('');
  const [regPronouns, setRegPronouns] = useState('Elle / He');
  const [regEmail, setRegEmail] = useState('');

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Simulating Google OAuth (Gmail)
    const googleUser: UserProfile = {
      id: `google-${Date.now()}`,
      name: 'Usuario Google / Gmail',
      pronouns: 'Ella / She',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      pin: `BL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referredByPin: 'BL-9842K',
      referredByName: 'Alex Rivera',
      status: 'disponible',
      personalMessage: 'Conectadx con cuenta de Google ✨',
      currentSong: 'Raye - Genesis',
      allowWhatsAppBridge: true,
      whatsAppNumber: '+584123334455',
      invitationsRemaining: 3,
      reputationScore: 100
    };
    onLoginSuccess(googleUser);
    onClose();
  };

  const handleClassicLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPass) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const mockUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: loginEmail.split('@')[0] || 'Miembro Burbuja',
      pronouns: 'Elle / He',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      pin: `BL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      referredByPin: 'BL-9842K',
      referredByName: 'Alex Rivera',
      status: 'disponible',
      personalMessage: 'Iniciando sesión en la Burbuja 🌈',
      currentSong: '',
      allowWhatsAppBridge: true,
      whatsAppNumber: '+584149998877',
      invitationsRemaining: 3,
      reputationScore: 100
    };

    onLoginSuccess(mockUser);
    onClose();
  };

  const handleRegisterWithReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPin = referralPin.trim().toUpperCase();
    if (!cleanPin) {
      setError('El PIN de referido de 8 caracteres es OBLIGATORIO para registrarte.');
      return;
    }

    if (!regName.trim()) {
      setError('Por favor indica tu nombre o apodo.');
      return;
    }

    // Generate their own 8-character PIN
    const generatedPin = `BL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newUser: UserProfile = {
      id: `new-${Date.now()}`,
      name: regName.trim(),
      pronouns: regPronouns,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      pin: generatedPin,
      referredByPin: cleanPin,
      referredByName: 'Referente de Confianza',
      status: 'disponible',
      personalMessage: '¡Recién llegadx a la Burbuja! 🏳️‍🌈',
      currentSong: '',
      allowWhatsAppBridge: true,
      whatsAppNumber: '',
      invitationsRemaining: 3,
      reputationScore: 100
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo in Modal */}
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>

        {/* Tabs: Login vs Register with Referral PIN */}
        <div className="flex bg-slate-800/80 rounded-2xl p-1 mb-5">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'login' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'register' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Crear con Invitación
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' ? (
          <div className="space-y-4">
            {/* Google Gmail Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google (Gmail)</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-[10px] text-slate-500 font-bold uppercase">o con correo</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            <form onSubmit={handleClassicLogin} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Entrar a la Burbuja
              </button>
            </form>
          </div>
        ) : (
          /* TAB 2: REGISTER WITH MANDATORY REFERRAL PIN */
          <form onSubmit={handleRegisterWithReferral} className="space-y-3 text-left">
            {/* Mandatory Referral PIN Field */}
            <div className="p-3 bg-pink-950/30 border border-pink-500/40 rounded-2xl space-y-1.5">
              <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                <span>PIN de Referido (Obligatorio)</span>
              </label>
              <input
                type="text"
                placeholder="Ejemplo: BL-9842K"
                maxLength={9}
                value={referralPin}
                onChange={(e) => setReferralPin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-pink-500/60 focus:border-pink-400 rounded-xl py-2 px-3 text-center font-mono text-sm tracking-widest text-pink-200 placeholder:text-slate-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block leading-tight">
                Emitido por un usuario existente. La red de confianza protege a la comunidad.
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Nombre o Apodo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={regPronouns}
                  onChange={(e) => setRegPronouns(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none w-full"
                >
                  <option>Elle / He</option>
                  <option>Ella / She</option>
                  <option>Él / Him</option>
                  <option>Otro / Prefiero no decir</option>
                </select>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  placeholder="Correo (o Gmail)"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>
                Al crear tu cuenta el sistema generará automáticamente tu propio PIN de 8 caracteres y tus 3 invitaciones.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
            >
              Validar PIN y Crear Mi Cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
