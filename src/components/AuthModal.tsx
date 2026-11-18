import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  User, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  Smartphone,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile } from '../types';
import { authService, COLLECTIVE_OPTIONS, type CollectiveCode } from '../services/authService';
import { ApkDownloadModal } from './ApkDownloadModal';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  canClose = false
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginPin, setLoginPin] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regCollective, setRegCollective] = useState<CollectiveCode>('G');
  const [regPronouns, setRegPronouns] = useState('Él / Him');
  const [regCedula, setRegCedula] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [referralPin, setReferralPin] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  if (!isOpen) return null;

  // LOGIN POR PIN O CÉDULA + CONTRASEÑA
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanIdentifier = loginPin.trim().toUpperCase();

    if (!cleanIdentifier) {
      setError('Por favor introduce tu PIN o Cédula.');
      return;
    }

    if (!loginPass.trim()) {
      setError('Por favor introduce tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.loginWithPin(cleanIdentifier, loginPass);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onLoginSuccess(user);
      onClose?.();
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRO CON COLECTIVO, CÉDULA, CORREO, CONTRASEÑA Y CÓDIGO DE INVITACIÓN
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regName.trim();
    const cleanCedula = regCedula.trim().toUpperCase();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim();
    const cleanReferral = referralPin.trim().toUpperCase();

    if (!cleanName) {
      setError('Por favor ingresa tu nombre o apodo.');
      return;
    }

    if (!cleanCedula || cleanCedula.length < 5) {
      setError('Por favor ingresa un número de cédula válido (ej: V-24123456).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido para recuperación de cuenta.');
      return;
    }

    if (cleanPass.length < 4) {
      setError('Tu contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (!cleanReferral) {
      setError('El código de invitación es obligatorio para ingresar a la Burbuja.');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await authService.register({
        name: cleanName,
        pronouns: regPronouns,
        collective: regCollective,
        cedula: cleanCedula,
        email: cleanEmail,
        password: cleanPass,
        referralPin: cleanReferral
      });

      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      setCreatedUser(newUser);
    } catch (err: any) {
      setError(err?.message || 'Error al registrar tu cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard?.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  const handleFinishRegistration = () => {
    if (createdUser) {
      onLoginSuccess(createdUser);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-950 sm:bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full min-h-dvh sm:min-h-0 sm:max-w-md sm:my-auto rounded-none sm:rounded-3xl bg-slate-900 border-0 sm:border border-slate-800/80 pt-14 pb-8 px-5 sm:p-7 shadow-2xl text-center flex flex-col justify-center overflow-x-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-12 sm:top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>

        {/* Si el usuario recién se registró, le mostramos su PIN personalizado según su colectivo */}
        {createdUser ? (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">¡Bienvenidx a la Burbuja!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Hola <strong className="text-pink-300">{createdUser.name}</strong>, tu cuenta ha sido creada exitosamente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-pink-500/50 space-y-2">
              <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider block">
                Tu PIN Personal asignado
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black text-white tracking-widest bg-pink-950/60 px-3 py-1 rounded-xl border border-pink-500/40">
                  {createdUser.pin}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPin(createdUser.pin)}
                  className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-colors"
                  title="Copiar PIN"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-amber-200/90 leading-tight">
                ⚠️ <strong>Guarda tu PIN.</strong> Para entrar a tu cuenta usarás este PIN junto con la contraseña que acabas de crear.
              </p>
            </div>

            <button
              onClick={handleFinishRegistration}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Entrar a mi Burbuja</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Tabs: Iniciar Sesión vs Crear Cuenta */}
            <div className="flex bg-slate-800/80 rounded-2xl p-1 mb-4">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'login' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'register' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: INICIAR SESIÓN CON PIN O CÉDULA + CONTRASEÑA */}
            {tab === 'login' ? (
              <form onSubmit={handlePinLogin} className="space-y-3.5 text-left">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                        <span>Tu PIN o Cédula</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">PIN o Cédula V-...</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: BL-94X7A o V-24123456"
                      maxLength={18}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.toUpperCase())}
                      required
                      autoFocus
                      className="w-full bg-slate-900 border border-pink-500/60 focus:border-pink-400 rounded-xl py-2.5 px-3 text-center font-mono text-sm tracking-wide text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5 mb-1">
                      <Lock className="w-3.5 h-3.5 text-pink-400" />
                      <span>Contraseña</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        placeholder="Tu contraseña secreta"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Entrar a mi Burbuja</span>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(null); }}
                    className="text-xs text-slate-400 hover:text-pink-300 transition-colors"
                  >
                    ¿Aún no tienes cuenta? <span className="text-pink-400 font-bold underline">Crear cuenta</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: CREAR CUENTA CON COLECTIVO (BL-, BG-, BB-...), CORREO, CONTRASEÑA E INVITACIÓN */
              <form onSubmit={handleRegister} className="space-y-2.5 text-left">
                {/* Nombre y Pronombres en fila compacta */}
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                      Nombre o Apodo
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="¿Cómo te decimos?"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 pl-8 pr-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                      Pronombres
                    </label>
                    <select
                      value={regPronouns}
                      onChange={(e) => setRegPronouns(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-xs text-slate-200 focus:outline-none w-full"
                    >
                      <option>Él / Him</option>
                      <option>Ella / She</option>
                      <option>Elle / He</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>

                {/* Selector de Colectivo */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>Colectivo</span>
                  </label>
                  <select
                    value={regCollective}
                    onChange={(e) => setRegCollective(e.target.value as CollectiveCode)}
                    className="bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none w-full"
                  >
                    {COLLECTIVE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cédula de Identidad */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-pink-400" />
                      <span>Cédula de Identidad</span>
                    </label>
                    <span className="text-[9px] text-pink-400/80">Protegida por Hash</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: V-24123456"
                    value={regCedula}
                    onChange={(e) => setRegCedula(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>

                {/* Correo Electrónico (para recuperar contraseña) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Correo Electrónico</span>
                    <span className="text-[9px] text-slate-400 font-normal">Para recuperar clave</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                    Crea tu Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type={showRegPass ? 'text' : 'password'}
                      placeholder="Mínimo 4 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 pl-8 pr-9 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white"
                    >
                      {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Código de Invitación */}
                <div className="p-2.5 bg-pink-950/20 border border-pink-500/40 rounded-2xl space-y-1">
                  <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                    <span>Código de Invitación</span>
                  </label>
                  <input
                    type="text"
                    placeholder="B_-XXXXX"
                    maxLength={14}
                    value={referralPin}
                    onChange={(e) => setReferralPin(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-950 border border-pink-500/60 focus:border-pink-400 rounded-xl py-1.5 px-3 text-center font-mono text-sm tracking-widest text-pink-200 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <span>Crear cuenta</span>
                  )}
                </button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setError(null); }}
                    className="text-xs text-slate-400 hover:text-pink-300 transition-colors"
                  >
                    ¿Ya tienes tu PIN? <span className="text-pink-400 font-bold underline">Iniciar sesión</span>
                  </button>
                </div>
              </form>
            )}

            {/* Botón Descargar APK para Android */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsApkModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-950/90 hover:bg-slate-800/90 border border-emerald-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group active:scale-95 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-200 block group-hover:text-emerald-300 transition-colors">
                      Descargar Burbuja LGBTIQ+ v1.0.0
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Instalador oficial directo para Android (.APK)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-lg animate-pulse">
                  <span>Nueva actualización</span>
                </div>
              </button>
            </div>
          </>
        )}

        <ApkDownloadModal
          isOpen={isApkModalOpen}
          onClose={() => setIsApkModalOpen(false)}
        />
      </div>
    </div>
  );
};
