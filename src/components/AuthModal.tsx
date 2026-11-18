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
  ArrowLeft,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  HelpCircle
} from 'lucide-react';
import { Logo } from './Logo';
import type { UserProfile } from '../types';
import { 
  authService, 
  COLLECTIVE_OPTIONS, 
  type CollectiveCode,
  SECURITY_QUESTIONS_1,
  SECURITY_QUESTIONS_2
} from '../services/authService';
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
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>('login');
  
  // Login form state
  const [loginPin, setLoginPin] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regCollective, setRegCollective] = useState<CollectiveCode>('G');
  const [regPronouns, setRegPronouns] = useState('Él / Him');
  const [regCedula, setRegCedula] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [referralPin, setReferralPin] = useState('');

  // Preguntas de seguridad para registro
  const [regQuestion1, setRegQuestion1] = useState(SECURITY_QUESTIONS_1[0]);
  const [customQuestion1, setCustomQuestion1] = useState('');
  const [regAnswer1, setRegAnswer1] = useState('');

  const [regQuestion2, setRegQuestion2] = useState(SECURITY_QUESTIONS_2[0]);
  const [customQuestion2, setCustomQuestion2] = useState('');
  const [regAnswer2, setRegAnswer2] = useState('');

  // Estado para recuperación de contraseña sin correo
  const [recoverStep, setRecoverStep] = useState<1 | 2>(1);
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverUserData, setRecoverUserData] = useState<{
    userId: string;
    name: string;
    avatar: string;
    pin: string;
    question1: string;
    question2: string;
  } | null>(null);
  const [recoverAnswer1, setRecoverAnswer1] = useState('');
  const [recoverAnswer2, setRecoverAnswer2] = useState('');
  const [recoverNewPass, setRecoverNewPass] = useState('');
  const [recoverConfirmPass, setRecoverConfirmPass] = useState('');
  const [showRecoverPass, setShowRecoverPass] = useState(false);

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

  // REGISTRO CON 2 PREGUNTAS DE SEGURIDAD PARA RECUPERACIÓN SIN CORREO
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = regName.trim();
    const cleanCedula = regCedula.trim().toUpperCase();
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

    if (cleanPass.length < 4) {
      setError('Tu contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Resolver preguntas de seguridad seleccionadas o personalizadas
    const finalQ1 = regQuestion1 === '__custom__' ? customQuestion1.trim() : regQuestion1;
    const finalA1 = regAnswer1.trim();
    const finalQ2 = regQuestion2 === '__custom__' ? customQuestion2.trim() : regQuestion2;
    const finalA2 = regAnswer2.trim();

    if (!finalQ1 || !finalA1) {
      setError('Por favor completa la Pregunta de Seguridad 1 y su respuesta.');
      return;
    }

    if (!finalQ2 || !finalA2) {
      setError('Por favor completa la Pregunta de Seguridad 2 y su respuesta.');
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
        password: cleanPass,
        securityQuestion1: finalQ1,
        securityAnswer1: finalA1,
        securityQuestion2: finalQ2,
        securityAnswer2: finalA2,
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

  // RECUPERACIÓN PASO 1: CARGAR PREGUNTAS DE SEGURIDAD
  const handleSearchSecurityQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanId = recoverIdentifier.trim().toUpperCase();

    if (!cleanId) {
      setError('Por favor ingresa tu PIN o Cédula.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.getSecurityQuestions(cleanId);
      setRecoverUserData(data);
      setRecoverStep(2);
    } catch (err: any) {
      setError(err?.message || 'Error al buscar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // RECUPERACIÓN PASO 2: VERIFICAR RESPUESTAS Y ACTUALIZAR CONTRASEÑA
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recoverAnswer1.trim()) {
      setError('Por favor responde la primera pregunta de seguridad.');
      return;
    }

    if (!recoverAnswer2.trim()) {
      setError('Por favor responde la segunda pregunta de seguridad.');
      return;
    }

    if (recoverNewPass.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (recoverNewPass !== recoverConfirmPass) {
      setError('Las contraseñas no coinciden. Verifica que estén escritas igual.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await authService.resetPasswordWithSecurityQuestions({
        rawIdentifier: recoverIdentifier,
        answer1: recoverAnswer1,
        answer2: recoverAnswer2,
        newPassword: recoverNewPass
      });

      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      onLoginSuccess(updatedUser);
      onClose?.();
    } catch (err: any) {
      setError(err?.message || 'Error al restablecer la contraseña.');
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
      <div className="relative w-full min-h-dvh sm:min-h-0 sm:max-w-md sm:my-auto rounded-none sm:rounded-3xl bg-slate-900 border-0 sm:border border-slate-800/80 pt-12 pb-8 px-5 sm:p-7 shadow-2xl text-center flex flex-col justify-center overflow-x-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl pointer-events-none rounded-full" />

        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-10 sm:top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>

        {/* SI EL USUARIO RECIÉN SE REGISTRÓ, MOSTRAR PIN ASIGNADO */}
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
                ⚠️ <strong>Guarda tu PIN.</strong> Para entrar a tu cuenta usarás este PIN junto con tu contraseña. Si alguna vez la olvidas, tus 2 preguntas de seguridad te permitirán cambiarla directamente sin necesidad de correos.
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
            {/* Tabs: Iniciar Sesión vs Crear Cuenta (oculto en modo recuperación) */}
            {tab !== 'recover' && (
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
            )}

            {/* Error Notification */}
            {error && (
              <div className="mb-3.5 flex items-start gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl text-left animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: INICIAR SESIÓN CON PIN O CÉDULA + CONTRASEÑA */}
            {tab === 'login' && (
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
                    <label className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-pink-400" />
                        <span>Contraseña</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTab('recover');
                          setRecoverStep(1);
                          setRecoverIdentifier(loginPin);
                          setError(null);
                        }}
                        className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors font-medium"
                      >
                        ¿Olvidaste tu clave?
                      </button>
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

                <div className="text-center pt-1 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(null); }}
                    className="text-xs text-slate-400 hover:text-pink-300 transition-colors"
                  >
                    ¿Aún no tienes cuenta? <span className="text-pink-400 font-bold underline">Crear cuenta</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: CREAR CUENTA CON 2 PREGUNTAS DE SEGURIDAD PARA RECUPERACIÓN PRIVADA */}
            {tab === 'register' && (
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

                {/* SECCIÓN: 2 PREGUNTAS DE SEGURIDAD (RECUPERACIÓN PRIVADA SIN CORREO) */}
                <div className="p-3 bg-slate-950/90 border border-pink-500/30 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-pink-300">
                    <HelpCircle className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block">
                        2 Preguntas de Seguridad
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        Para recuperar tu clave sin correos ni números telefónicos.
                      </span>
                    </div>
                  </div>

                  {/* Pregunta 1 */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">
                      Pregunta de Seguridad 1:
                    </label>
                    <select
                      value={regQuestion1}
                      onChange={(e) => setRegQuestion1(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      {SECURITY_QUESTIONS_1.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                      <option value="__custom__">Escribir mi propia pregunta...</option>
                    </select>
                    {regQuestion1 === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Escribe tu pregunta personalizada..."
                        value={customQuestion1}
                        onChange={(e) => setCustomQuestion1(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 mt-1"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Tu respuesta a la pregunta 1"
                      value={regAnswer1}
                      onChange={(e) => setRegAnswer1(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  {/* Pregunta 2 */}
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <label className="text-[9px] font-bold text-slate-300 uppercase tracking-wider block">
                      Pregunta de Seguridad 2:
                    </label>
                    <select
                      value={regQuestion2}
                      onChange={(e) => setRegQuestion2(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      {SECURITY_QUESTIONS_2.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                      <option value="__custom__">Escribir mi propia pregunta...</option>
                    </select>
                    {regQuestion2 === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Escribe tu pregunta personalizada..."
                        value={customQuestion2}
                        onChange={(e) => setCustomQuestion2(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 mt-1"
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Tu respuesta a la pregunta 2"
                      value={regAnswer2}
                      onChange={(e) => setRegAnswer2(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
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
                      <span>Creando cuenta segura...</span>
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

            {/* TAB 3: RECUPERACIÓN DE CONTRASEÑA CON PREGUNTAS DE SEGURIDAD (SIN CORREO) */}
            {tab === 'recover' && (
              <div className="space-y-3.5 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (recoverStep === 2) {
                        setRecoverStep(1);
                      } else {
                        setTab('login');
                      }
                      setError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{recoverStep === 2 ? 'Cambiar PIN/Cédula' : 'Volver a Iniciar Sesión'}</span>
                  </button>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                    Paso {recoverStep} de 2
                  </span>
                </div>

                {/* PASO 1: INGRESAR PIN O CÉDULA */}
                {recoverStep === 1 && (
                  <form onSubmit={handleSearchSecurityQuestions} className="space-y-3">
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-pink-300">
                        <HelpCircle className="w-4 h-4 text-pink-400 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Recuperar Contraseña</h4>
                          <p className="text-[10px] text-slate-400">
                            Ingresa tu PIN o Cédula para cargar tus 2 preguntas de seguridad.
                          </p>
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Tu PIN o Cédula:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: BG-LYMEN o V-24123456"
                          maxLength={18}
                          value={recoverIdentifier}
                          onChange={(e) => setRecoverIdentifier(e.target.value.toUpperCase())}
                          required
                          autoFocus
                          className="w-full bg-slate-900 border border-pink-500/60 focus:border-pink-400 rounded-xl py-2.5 px-3 text-center font-mono text-sm tracking-wide text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !recoverIdentifier.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Buscando cuenta...</span>
                        </>
                      ) : (
                        <>
                          <span>Continuar</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* PASO 2: RESPONDER PREGUNTAS Y DEFINIR NUEVA CLAVE */}
                {recoverStep === 2 && recoverUserData && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                    {/* Header con datos de la cuenta */}
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/80 border border-pink-500/30">
                      <img
                        src={recoverUserData.avatar}
                        alt={recoverUserData.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.svg';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {recoverUserData.name}
                        </h4>
                        <span className="font-mono text-[10px] text-pink-300 bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-800/50">
                          {recoverUserData.pin}
                        </span>
                      </div>
                    </div>

                    {/* Preguntas de Seguridad */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-pink-300 block">
                          1. {recoverUserData.question1}
                        </label>
                        <input
                          type="text"
                          placeholder="Tu respuesta a la pregunta 1"
                          value={recoverAnswer1}
                          onChange={(e) => setRecoverAnswer1(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <label className="text-[10px] font-bold text-pink-300 block">
                          2. {recoverUserData.question2}
                        </label>
                        <input
                          type="text"
                          placeholder="Tu respuesta a la pregunta 2"
                          value={recoverAnswer2}
                          onChange={(e) => setRecoverAnswer2(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Nueva Contraseña:
                        </label>
                        <div className="relative">
                          <input
                            type={showRecoverPass ? 'text' : 'password'}
                            placeholder="Mínimo 4 caracteres"
                            value={recoverNewPass}
                            onChange={(e) => setRecoverNewPass(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl py-2 pl-3 pr-9 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRecoverPass(!showRecoverPass)}
                            className="absolute right-3 top-2 text-slate-400 hover:text-white"
                          >
                            {showRecoverPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                          Confirmar Nueva Contraseña:
                        </label>
                        <input
                          type={showRecoverPass ? 'text' : 'password'}
                          placeholder="Repite la nueva contraseña"
                          value={recoverConfirmPass}
                          onChange={(e) => setRecoverConfirmPass(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verificando y cambiando clave...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Cambiar Contraseña y Entrar</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
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
