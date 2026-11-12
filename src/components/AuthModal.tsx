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
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile } from '../types';
import { authService } from '../services/authService';
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
  const [tab, setTab] = useState<'login' | 'register'>('register');
  
  // Login form state
  const [loginPin, setLoginPin] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPronouns, setRegPronouns] = useState('Elle / He');
  const [regCedula, setRegCedula] = useState('');
  const [referralPin, setReferralPin] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<UserProfile | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  // LOGIN POR PIN
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanPin = loginPin.trim().toUpperCase();

    if (!cleanPin) {
      setError('Por favor introduce tu PIN (ej: BL-XXXXX).');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.loginWithPin(cleanPin);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onLoginSuccess(user);
      onClose?.();
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con el PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTRO CON CÉDULA Y CÓDIGO DE INVITACIÓN
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regName.trim();
    const cleanCedula = regCedula.trim().toUpperCase();
    const cleanReferral = referralPin.trim().toUpperCase();

    if (!cleanName) {
      setError('Por favor ingresa tu nombre o apodo.');
      return;
    }

    if (!cleanCedula || cleanCedula.length < 5) {
      setError('Por favor ingresa un número de cédula válido (ej: V-12345678).');
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
        cedula: cleanCedula,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>

        {/* Si el usuario recién se registró, le mostramos su PIN de bienvenida */}
        {createdUser ? (
          <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">¡Bienvenidx a la Burbuja!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Hola <strong className="text-pink-300">{createdUser.name}</strong>, tu cuenta ha sido creada exitosamente en la red de Lara.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-pink-500/50 space-y-2">
              <span className="text-[10px] font-black uppercase text-pink-300 tracking-wider block">
                Tu PIN Personal de Acceso
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
                ⚠️ <strong>Guarda este código.</strong> No usamos contraseñas tradicionales: tu PIN es tu llave para iniciar sesión en cualquier dispositivo.
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
            {/* Tabs: Registrarme vs Iniciar Sesión con PIN */}
            <div className="flex bg-slate-800/80 rounded-2xl p-1 mb-4">
              <button
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'register' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Crear Cuenta (Invitación)
              </button>
              <button
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === 'login' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar con mi PIN
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: REGISTRO CON CÉDULA Y CÓDIGO DE INVITACIÓN */}
            {tab === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3 text-left">
                {/* Nombre o Apodo */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                    Nombre o Apodo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="¿Cómo te decimos?"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pronombres */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 block">
                    Pronombres
                  </label>
                  <select
                    value={regPronouns}
                    onChange={(e) => setRegPronouns(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none w-full"
                  >
                    <option>Elle / He</option>
                    <option>Ella / She</option>
                    <option>Él / Him</option>
                    <option>Prefiero no decir</option>
                  </select>
                </div>

                {/* Cédula de Identidad con aviso de Hash de Privacidad */}
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
                  <span className="text-[9px] text-slate-500 block mt-0.5 leading-tight">
                    🔒 Tu cédula se cifra en el servidor (ej: <code>V-24***456</code>). Solo se usa para evitar cuentas duplicadas y nunca es visible.
                  </span>
                </div>

                {/* Código de Invitación */}
                <div className="p-3 bg-pink-950/20 border border-pink-500/40 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                      <span>Código de Invitación</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: BL-7K9A2 o BL-FUNDADOR"
                    maxLength={14}
                    value={referralPin}
                    onChange={(e) => setReferralPin(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-950 border border-pink-500/60 focus:border-pink-400 rounded-xl py-2 px-3 text-center font-mono text-sm tracking-widest text-pink-200 placeholder:text-slate-600 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Emitido por un usuario de confianza.</span>
                    <button
                      type="button"
                      onClick={() => setReferralPin('BL-FUNDADOR')}
                      className="text-pink-400 hover:text-pink-300 underline font-semibold"
                    >
                      Soy el Fundador
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>
                    Al registrarte, el sistema te generará al azar tu propio PIN personal y 3 invitaciones.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando en la Burbuja...</span>
                    </>
                  ) : (
                    <span>Crear Mi Cuenta & Recibir PIN</span>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: INICIAR SESIÓN CON PIN PERSONAL */
              <form onSubmit={handlePinLogin} className="space-y-4 text-left">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-pink-300 tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-pink-400" />
                    <span>Tu PIN Personal</span>
                  </label>
                  <input
                    type="text"
                    placeholder="BL-XXXXX"
                    maxLength={10}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.toUpperCase())}
                    required
                    className="w-full bg-slate-900 border border-pink-500/60 focus:border-pink-400 rounded-xl py-3 px-3 text-center font-mono text-lg tracking-widest text-white placeholder:text-slate-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block text-center leading-tight">
                    Ingresa el PIN aleatorio que se te asignó al crear tu cuenta.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando PIN...</span>
                    </>
                  ) : (
                    <span>Entrar a mi Burbuja</span>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
