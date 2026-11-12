import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import type { UserProfile } from '../types';

interface SharePINModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const SharePINModal: React.FC<SharePINModalProps> = ({ user, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinLink = `https://burbuja.lgbt/join?pin=${user.pin}`;
  const whatsappMessage = encodeURIComponent(
    `🌈 ¡Hola! Te invito a unirte a Burbuja LGBTIQ+, una red comunitaria segura y exclusiva por invitación.\n\n🔑 Mi PIN de referido exclusivo es: *${user.pin}*\n🔗 O entra directamente con este enlace: ${joinLink}\n\n¡Súmate a la red de confianza!`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(user.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-center overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-1.5 mb-1 text-pink-400 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tu Llave de Confianza</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">PIN y Código QR Personal</h3>
        <p className="text-xs text-slate-400 mb-5 max-w-[260px] mx-auto">
          Comparte tu PIN de 8 caracteres para sumar contactos de confianza a la Burbuja.
        </p>

        {/* QR Card */}
        <div className="inline-block p-4 bg-white rounded-2xl shadow-inner mb-4">
          <QRCodeSVG
            value={joinLink}
            size={168}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ec4899'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        {/* PIN Display with Copy Button */}
        <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-4">
          <div className="text-left pl-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Tu PIN Exclusivo</span>
            <span className="text-lg font-mono font-black tracking-widest text-transparent bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 bg-clip-text">
              {user.pin}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Reputation Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-purple-950/40 border border-purple-800/40 rounded-xl py-2 px-3 mb-5">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            Tienes <strong className="text-purple-300 font-bold">{user.invitationsRemaining} invitaciones</strong> disponibles por reputación.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartir Invitación por WhatsApp</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Únete a Burbuja LGBTIQ+',
                  text: `Mi PIN de acceso a Burbuja LGBTIQ+ es ${user.pin}`,
                  url: joinLink,
                });
              } else {
                handleCopy();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Más opciones para compartir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
