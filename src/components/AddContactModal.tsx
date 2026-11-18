import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  KeyRound, 
  AlertCircle, 
  Camera, 
  CameraOff, 
  RefreshCw,
  Send,
  CheckCircle2,
  MapPin,
  Music,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type { Contact, UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
  availableContacts?: Contact[];
  currentUser?: UserProfile;
  contacts?: Contact[];
  onSendConnectionRequest?: (target: Contact, introMessage: string) => void;
  isAdmin?: boolean;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
  availableContacts = [],
  currentUser,
  contacts = [],
  onSendConnectionRequest,
  isAdmin = false
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundContact, setFoundContact] = useState<Contact | null>(null);
  const [introMessage, setIntroMessage] = useState('¡Hola! Me gustaría conectar nuestras burbujas en Burbuja LGBTIQA+ 🫧');
  const [requestSent, setRequestSent] = useState(false);
  const [adminDirectAdded, setAdminDirectAdded] = useState(false);
  const [mode, setMode] = useState<'pin' | 'qr'>('pin');

  // Camera State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera cleanly
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Start real camera when entering QR mode
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraStarting(true);
    try {
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Al entrar por IP local (HTTP), los navegadores móviles exigen HTTPS para el visor en vivo. Puedes usar el botón de abajo para tomar una foto del QR directamente con tu cámara.');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador móvil no tiene soporte directo para streaming de video sin HTTPS. Usa el botón de captura de cámara abajo.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraError('Permiso a la cámara denegado. Permite el acceso a la cámara en los ajustes de tu navegador o toma una foto del código.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setCameraError('No se encontró ninguna cámara disponible en este dispositivo.');
      } else {
        setCameraError(e.message || 'Error al iniciar la cámara.');
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Handle mode change
  useEffect(() => {
    if (mode === 'qr' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, isOpen]);

  // Bind video element when stream is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  if (!isOpen) return null;

  const handleClose = () => {
    stopCamera();
    setFoundContact(null);
    setError(null);
    setPinInput('');
    setRequestSent(false);
    setAdminDirectAdded(false);
    onClose();
  };

  const handleResetSearch = () => {
    setFoundContact(null);
    setError(null);
    setRequestSent(false);
    setAdminDirectAdded(false);
  };

  const searchProfileByPin = async (rawPin: string) => {
    setError(null);
    setFoundContact(null);
    setRequestSent(false);
    setAdminDirectAdded(false);

    const cleanPin = rawPin.trim().toUpperCase();
    if (!cleanPin) {
      setError('Por favor escribe un código PIN (ejemplo: BL-94X7A o BG-LYMEN).');
      return;
    }

    // 1. Validar que no sea su propio PIN
    if (currentUser && currentUser.pin.toUpperCase() === cleanPin) {
      setError('No puedes agregarte a ti mismx con tu propio PIN.');
      return;
    }

    // 2. Validar que no esté ya agregado en contactos
    const alreadyContact = contacts.find(c => c.pin.toUpperCase() === cleanPin);
    if (alreadyContact) {
      setError(`"${alreadyContact.name}" (${cleanPin}) ya está en tu lista de contactos.`);
      return;
    }

    setIsSearching(true);

    try {
      let resolved: Contact | null = null;

      // A. Buscar en Supabase en la tabla 'profiles'
      try {
        const { data: profile, error: sbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('pin', cleanPin)
          .maybeSingle();

        if (profile && !sbError) {
          resolved = {
            id: profile.id,
            name: profile.name,
            pronouns: profile.pronouns || 'Comunidad',
            avatar: profile.avatar || '/logo.svg',
            pin: profile.pin,
            status: (profile.status as any) || 'disponible',
            personalMessage: profile.personal_message || '¡Miembro de Burbuja LGBTIQA+! 🫧',
            currentSong: profile.current_song || '',
            city: profile.city || 'Barquisimeto & Lara',
            allowWhatsAppBridge: !!profile.allow_whatsapp_bridge,
            whatsAppNumber: profile.whatsapp_number,
            stories: []
          };
        }
      } catch (err) {
        console.warn('Error al consultar Supabase:', err);
      }

      // B. Si no se encontró en Supabase, buscar en el registro local ('burbuja_local_profiles')
      if (!resolved) {
        try {
          const localDirectory: any[] = JSON.parse(localStorage.getItem('burbuja_local_profiles') || '[]');
          const lp = localDirectory.find((p: any) => p.pin?.toUpperCase() === cleanPin);
          if (lp) {
            resolved = {
              id: lp.id || `local-${cleanPin}`,
              name: lp.name,
              pronouns: lp.pronouns || 'Comunidad',
              avatar: lp.avatar || '/logo.svg',
              pin: lp.pin,
              status: (lp.status as any) || 'disponible',
              personalMessage: lp.personal_message || '¡Miembro de Burbuja LGBTIQA+! 🫧',
              currentSong: lp.current_song || '',
              city: lp.city || 'Barquisimeto & Lara',
              allowWhatsAppBridge: !!lp.allow_whatsapp_bridge,
              whatsAppNumber: lp.whatsapp_number,
              stories: []
            };
          }
        } catch (err) {
          console.warn('Error al consultar directorio local:', err);
        }
      }

      // C. Si aún no se encontró, revisar en contactos disponibles o precargados
      if (!resolved && availableContacts.length > 0) {
        const foundInAvailable = availableContacts.find(c => c.pin.toUpperCase() === cleanPin);
        if (foundInAvailable) {
          resolved = foundInAvailable;
        }
      }

      // D. SI NO EXISTE: NUNCA CREAR UN USUARIO FICTICIO. Mostrar mensaje de error claro.
      if (!resolved) {
        setError(`No existe ningún usuario registrado con el PIN "${cleanPin}". Verifica que el código esté bien escrito.`);
        return;
      }

      // ¡Perfil real encontrado!
      setFoundContact(resolved);
    } catch (err) {
      setError('Ocurrió un error al buscar el perfil. Por favor intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProfileByPin(pinInput);
  };

  const handleSendRequest = () => {
    if (!foundContact) return;
    if (onSendConnectionRequest) {
      onSendConnectionRequest(foundContact, introMessage.trim());
    }
    setRequestSent(true);
  };

  const handleAdminDirectAdd = () => {
    if (!foundContact) return;
    onAddContact(foundContact);
    setAdminDirectAdded(true);
  };

  const handleCaptureQrImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Si la imagen tiene un nombre con el PIN o el usuario la sube, intentamos detectar
    // o pedimos confirmación del PIN escaneado
    setError('Foto de QR recibida. Si tu dispositivo no pudo decodificar el código automáticamente, por favor ingresa el PIN del usuario en la pestaña "Por PIN".');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Vincular Contacto</h3>
        <p className="text-xs text-slate-400 mb-4">
          Conecta con personas reales de Burbuja mediante su PIN personal o escaneando su código QR.
        </p>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 rounded-xl p-1 mb-4">
          <button
            onClick={() => { setMode('pin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'pin' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Por PIN (Código)</span>
          </button>
          <button
            onClick={() => { setMode('qr'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'qr' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Escanear QR</span>
          </button>
        </div>

        {/* MODO A: INGRESO Y BÚSQUEDA POR PIN */}
        {mode === 'pin' && (
          <div className="space-y-4 text-left">
            {!foundContact && !requestSent && (
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ejemplo: BG-LYMEN"
                    maxLength={10}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.toUpperCase());
                      if (error) setError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest text-pink-300 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 p-3 rounded-2xl animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSearching || !pinInput.trim()}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Buscando usuario real...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Buscar Perfil por PIN</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* VISTA PREVIA DEL PERFIL ENCONTRADO */}
            {foundContact && !requestSent && !adminDirectAdded && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="rounded-2xl bg-slate-950/80 border border-pink-500/30 p-4 space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={foundContact.avatar}
                        alt={foundContact.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-500/60 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.svg';
                        }}
                      />
                      <span className="absolute -bottom-1 -right-1 text-xs">🫧</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-white text-base truncate">
                          {foundContact.name}
                        </h4>
                        <span className="text-[11px] text-pink-400/90 font-medium">
                          ({foundContact.pronouns})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-pink-950/60 text-pink-300 border border-pink-800/50">
                          {foundContact.pin}
                        </span>
                        <StatusBadge status={foundContact.status} />
                      </div>
                    </div>
                  </div>

                  {foundContact.personalMessage && (
                    <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{foundContact.personalMessage}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    {foundContact.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        {foundContact.city}
                      </span>
                    )}
                    {foundContact.currentSong && (
                      <span className="flex items-center gap-1 truncate">
                        <Music className="w-3 h-3 text-pink-400 shrink-0" />
                        <span className="truncate">{foundContact.currentSong}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Mensaje de presentación para la solicitud */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Mensaje de presentación (opcional):
                  </label>
                  <textarea
                    rows={2}
                    value={introMessage}
                    onChange={(e) => setIntroMessage(e.target.value)}
                    placeholder="Escribe un mensaje para presentarte..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Mandar Solicitud para Conectar Burbujas 🫧</span>
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleAdminDirectAdd}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Vincular Directamente (Admin ⚡)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="w-full py-2 text-slate-400 hover:text-white text-xs transition-colors text-center"
                  >
                    Buscar otro PIN
                  </button>
                </div>
              </div>
            )}

            {/* CONFIRMACIÓN DE SOLICITUD ENVIADA */}
            {requestSent && foundContact && (
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-800/60 p-4 space-y-3 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base">
                  ¡Solicitud enviada a {foundContact.name}! 🫧
                </h4>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  Le llegará una notificación a su bandeja de contactos. En cuanto acepte tu invitación, sus burbujas se conectarán y podrán chatear.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    Buscar otro PIN
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}

            {/* CONFIRMACIÓN DE VINCULACIÓN DIRECTA (ADMIN) */}
            {adminDirectAdded && foundContact && (
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-800/60 p-4 space-y-3 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <UserCheck className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-white text-base">
                  ¡Contacto vinculado con éxito! ⚡
                </h4>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  Has agregado directamente a <strong>{foundContact.name}</strong> a tu lista de contactos como Administrador.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODO B: ESCANEO POR CÁMARA (QR) */}
        {mode === 'qr' && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCaptureQrImage}
            />

            <div className="relative w-56 h-56 mx-auto border-2 border-dashed border-pink-500/70 rounded-3xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-2 shadow-inner">
              {cameraStream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-4 border-2 border-pink-400/80 rounded-2xl pointer-events-none" />
                  <div className="absolute inset-x-6 top-1/2 h-0.5 bg-pink-500 shadow-[0_0_10px_#ec4899] animate-bounce pointer-events-none" />
                </>
              ) : isCameraStarting ? (
                <div className="flex flex-col items-center justify-center text-slate-400 text-xs p-4">
                  <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mb-2" />
                  <span>Iniciando cámara...</span>
                  <span className="text-[10px] text-slate-500 mt-1">Concede permiso en tu navegador</span>
                </div>
              ) : cameraError ? (
                <div className="flex flex-col items-center justify-center text-center p-3 text-xs">
                  <CameraOff className="w-9 h-9 text-rose-400 mb-1.5" />
                  <span className="text-rose-300 font-bold mb-1">Visor no disponible</span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {cameraError}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-xs text-slate-400">
                  <Camera className="w-12 h-12 text-pink-400 mb-2" />
                  <span className="text-white font-semibold mb-1">Cámara lista</span>
                  <p className="text-[10px] text-slate-400">
                    Apunta la cámara al código QR de la otra persona.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 p-3 rounded-2xl text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Tomar Foto del QR con tu Cámara</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('pin')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Ingresar PIN manualmente
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/60 pt-3">
          🔒 <strong>Consentimiento Mutuo:</strong> En Burbuja LGBTIQA+ nadie es añadido sin su consentimiento. Al ingresar un PIN se enviará una solicitud para conectar burbujas de forma transparente.
        </div>
      </div>
    </div>
  );
};
