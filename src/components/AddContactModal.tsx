import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  KeyRound, 
  UserCheck, 
  AlertCircle, 
  Camera, 
  CameraOff, 
  RefreshCw
} from 'lucide-react';
import type { Contact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
  availableContacts: Contact[];
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
  availableContacts
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Contact | null>(null);
  const [mode, setMode] = useState<'pin' | 'qr'>('pin');

  // Camera State
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
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

  const handleCaptureQrImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect / simulate match from photo
    const sample = availableContacts[0] || {
      id: `c-qr-${Date.now()}`,
      name: 'Contacto QR Escaneado',
      pronouns: 'Ella / Elle',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      pin: 'BL-7711Q',
      status: 'disponible',
      personalMessage: '¡Conectadxs por QR presencial! 🏳️‍🌈',
      currentSong: 'Troye Sivan - Rush',
      allowWhatsAppBridge: true,
      stories: []
    };
    setSuccess(sample);
    onAddContact(sample);
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
    setSuccess(null);
    setError(null);
    setPinInput('');
    onClose();
  };

  const handleSearchAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanPin = pinInput.trim().toUpperCase();
    if (!cleanPin) {
      setError('Por favor escribe un PIN de 8 caracteres.');
      return;
    }

    const found = availableContacts.find(c => c.pin.toUpperCase() === cleanPin);
    if (!found) {
      // Mock generator if testing arbitrary PIN
      const mockNew: Contact = {
        id: `mock-${Date.now()}`,
        name: `Usuario ${cleanPin.slice(-4)}`,
        pronouns: 'Elle / He',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        pin: cleanPin,
        status: 'disponible',
        personalMessage: '¡Nuevo contacto vinculado a la red! ✨',
        currentSong: 'Lady Gaga - Born This Way',
        allowWhatsAppBridge: false,
        stories: []
      };
      setSuccess(mockNew);
      onAddContact(mockNew);
    } else {
      setSuccess(found);
      onAddContact(found);
    }
  };

  const handleSimulateOrCaptureScan = () => {
    const sample = availableContacts[0] || {
      id: `c-qr-${Date.now()}`,
      name: 'Camille (Contacto QR)',
      pronouns: 'Ella',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      pin: 'BL-9999Q',
      status: 'disponible',
      personalMessage: '¡Conectadxs por QR presencial! 🏳️‍🌈',
      currentSong: 'Madonna - Vogue',
      allowWhatsAppBridge: true,
      whatsAppNumber: '+5491199990000',
      stories: []
    };
    setSuccess(sample);
    onAddContact(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Vincular Nuevo Contacto</h3>
        <p className="text-xs text-slate-400 mb-5">
          Agrega personas a tu red de confianza mediante su PIN o escaneando su código QR con tu cámara.
        </p>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 rounded-xl p-1 mb-5">
          <button
            onClick={() => setMode('pin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'pin' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Por PIN (8 dígitos)</span>
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'qr' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Escanear QR</span>
          </button>
        </div>

        {/* MODO A: INGRESO POR PIN */}
        {mode === 'pin' ? (
          <form onSubmit={handleSearchAndAdd} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ejemplo: BL-6621B"
                maxLength={9}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-2xl py-3 px-4 text-center font-mono text-lg tracking-widest text-pink-300 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-2xl text-left">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">{success.name} ({success.pronouns})</p>
                  <p className="text-[11px] text-emerald-400/80">¡Vinculadx exitosamente a tu red!</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm rounded-xl shadow-md transition-transform active:scale-95"
            >
              Vincular por PIN
            </button>
          </form>
        ) : (
          /* MODO B: ESCANEO POR CÁMARA (QR) */
          <div className="space-y-4">
            {/* Input nativo de cámara móvil que funciona SIEMPRE incluso por HTTP */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCaptureQrImage}
            />

            <div className="relative w-56 h-56 mx-auto border-2 border-dashed border-pink-500/70 rounded-3xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center p-2 shadow-inner">
              {/* Live Video Feed */}
              {cameraStream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {/* Aiming Reticle & Animated Scan Laser */}
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
                  <span className="text-rose-300 font-bold mb-1">Visor en vivo no disponible</span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {cameraError}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-xs text-slate-400">
                  <Camera className="w-12 h-12 text-pink-400 mb-2" />
                  <span className="text-white font-semibold mb-1">Cámara lista para escanear</span>
                  <p className="text-[10px] text-slate-400">
                    Apunta la cámara al código QR de la otra persona.
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Tomar Foto del QR con tu Cámara</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateOrCaptureScan}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Escanear Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('pin')}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <span>Por PIN</span>
                </button>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-3 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-2xl text-left">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">{success.name} ({success.pronouns})</p>
                  <p className="text-[11px] text-emerald-400/80">¡Vinculadx exitosamente por QR!</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/60 pt-3">
          🔒 <strong>Red de Confianza Privada:</strong> En Burbuja LGBTIQ+ la vinculación es recíproca y segura sin necesidad de entregar tu número de teléfono personal.
        </div>
      </div>
    </div>
  );
};
