import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function isApkAlreadyDownloadedOrInstalled(): boolean {
  try {
    if (localStorage.getItem('burbuja_apk_downloaded') === 'true') return true;
    const ua = navigator.userAgent || '';
    if (ua.includes('; wv)') || ua.includes('Version/4.0 Chrome/') || ua.includes('BurbujaAndroid')) {
      return true;
    }
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      return true;
    }
  } catch {}
  return false;
}

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloaded?: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  onDownloaded
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    try {
      localStorage.setItem('burbuja_apk_downloaded', 'true');
    } catch {}

    setDownloadStarted(true);
    onDownloaded?.();

    const link = document.createElement('a');
    link.href = '/downloads/burbuja-lgbtiqa.apk';
    link.download = 'burbuja-lgbtiqa.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-emerald-500/20 via-pink-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono Android / Smartphone */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-pink-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <Smartphone className="w-8 h-8" />
        </div>

        <div className="space-y-1 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Versión Oficial Android • v1.0</span>
          </span>
          <h3 className="text-lg font-black text-white">Burbuja LGBTIQA+ (.APK)</h3>
          <p className="text-xs text-slate-400">
            Instalador directo para tu teléfono, seguro y libre de tiendas.
          </p>
        </div>

        {/* Beneficios */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Conexión Total:</strong> Mismos contactos y chats en vivo de la red.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Actualizaciones Automáticas:</strong> Se sincroniza sola con el servidor.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
            <span><strong>Privacidad:</strong> Sin rastreadores comerciales ni datos a terceros.</span>
          </div>
        </div>

        {/* Botón Principal de Descarga */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Archivo APK (Android)</span>
        </button>

        {downloadStarted && (
          <p className="text-[11px] text-emerald-400 font-medium mt-2 animate-in fade-in">
            ¡Descarga iniciada! Revisa las notificaciones de tu teléfono.
          </p>
        )}

        {/* Guía de instalación desplegable */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-left">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
              <span>¿Cómo instalar en mi teléfono?</span>
            </span>
            {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showInstructions && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-[10px] text-slate-300 space-y-2 animate-in fade-in">
              <p>
                <strong>Paso 1:</strong> Al terminar la descarga, toca la notificación o busca el archivo <code>burbuja-lgbtiqa.apk</code> en la carpeta <em>Descargas</em>.
              </p>
              <p>
                <strong>Paso 2:</strong> Toca <strong>Instalar</strong>. Si Android te muestra una advertencia de <em>"Fuentes desconocidas"</em>, entra a <em>Ajustes</em> y activa <em>"Permitir desde esta fuente"</em>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
