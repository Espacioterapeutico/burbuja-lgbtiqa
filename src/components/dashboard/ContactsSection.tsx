import React, { useState } from 'react';
import { 
  Music, 
  MessageCircle, 
  UserX, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  AlertTriangle,
  Plus,
  Globe,
  Check,
  X
} from 'lucide-react';
import type { Contact, BubbleConnectionRequest } from '../../types';
import { STATUS_CONFIG, StatusBadge } from '../StatusBadge';
import { BlockedDossiersSection } from './BlockedDossiersSection';
import { SoapBubble } from '../SoapBubble';

interface ContactsSectionProps {
  contacts: Contact[];
  onOpenAddContact?: () => void;
  onViewStory: (contact: Contact) => void;
  onOpenReport: (contact: Contact) => void;
  onToggleBlockContact: (contact: Contact, reason?: string) => void;
  onOpenDirectChat?: (contact: Contact) => void;
  onOpenRadar?: () => void;
  bubbleRequests?: BubbleConnectionRequest[];
  onAcceptBubbleRequest?: (req: BubbleConnectionRequest) => void;
  onRejectBubbleRequest?: (reqId: string) => void;
}

const BLOCK_REASONS = [
  'Límites personales y tranquilidad',
  'Mensajes incómodos o insistentes',
  'Incompatibilidad de valores',
  'Falta de respeto o comentarios fuera de lugar',
  'Comportamiento sospechoso o comercial'
];

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  onOpenAddContact,
  onViewStory,
  onOpenReport,
  onToggleBlockContact,
  onOpenDirectChat,
  onOpenRadar,
  bubbleRequests = [],
  onAcceptBubbleRequest,
  onRejectBubbleRequest
}) => {
  const [showRequestsTray, setShowRequestsTray] = useState(true);
  const [inspectedRequest, setInspectedRequest] = useState<BubbleConnectionRequest | null>(null);
  const [blockingTarget, setBlockingTarget] = useState<Contact | null>(null);
  const [selectedBlockReason, setSelectedBlockReason] = useState(BLOCK_REASONS[0]);
  const [customBlockReason, setCustomBlockReason] = useState('');

  const activeContacts = contacts.filter(c => !c.isBlockedByMe && !c.hasBlockedMe);
  const blockedContacts = contacts.filter(c => c.isBlockedByMe || c.hasBlockedMe);

  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingTarget) return;

    const finalReason = customBlockReason.trim() || selectedBlockReason;
    onToggleBlockContact(blockingTarget, finalReason);
    setBlockingTarget(null);
    setCustomBlockReason('');
  };

  return (
    <div className="space-y-3.5 text-left">
      {/* 1. Header con Conteo y Botones Burbuja idénticos a Mis Comunidades: + y 🌐 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Mis Contactos ({activeContacts.length})
        </span>

        {/* Burbujas de Jabón Auténticas (como en Mis Comunidades): + y 🌐 */}
        <div className="flex items-center gap-2.5">
          {/* Burbuja de Jabón con el + adentro (Agregar contacto por PIN / QR) */}
          {onOpenAddContact && (
            <SoapBubble
              idPrefix="bubble-add-contact"
              sizeClass="w-9 h-9"
              glow="pink"
              onClick={onOpenAddContact}
              title="Agregar Contacto por PIN o QR (+)"
            >
              <Plus 
                className="w-4.5 h-4.5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" 
                strokeWidth={2.8} 
              />
            </SoapBubble>
          )}

          {/* Burbuja con el logo de las rayitas (Globe 🌐) para Explorar Personas */}
          {onOpenRadar && (
            <SoapBubble
              idPrefix="bubble-explore-contacts"
              sizeClass="w-9 h-9"
              glow="cyan"
              onClick={onOpenRadar}
              title="Explorar personas y conectar burbujas (🌐)"
            >
              <Globe 
                className="w-4.5 h-4.5 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-110" 
                strokeWidth={2.4} 
              />
            </SoapBubble>
          )}
        </div>
      </div>

      {/* 2. Bandeja de Solicitudes pendientes de "Conectar Burbujas 🫧" */}
      {bubbleRequests.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-slate-900 border border-pink-500/30 p-2.5 space-y-2 shadow-md animate-in fade-in">
          <div 
            onClick={() => setShowRequestsTray(!showRequestsTray)}
            className="flex items-center justify-between cursor-pointer select-none px-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">🫧</span>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Solicitudes para Conectar Burbujas</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-pink-600 text-white font-black">
                  {bubbleRequests.length}
                </span>
              </h4>
            </div>

            <button type="button" className="p-1 text-slate-400 hover:text-white">
              {showRequestsTray ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showRequestsTray && (
            <div className="space-y-1.5 pt-0.5">
              {bubbleRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-pink-500/30 transition-all"
                >
                  {/* Foto de perfil + Nombre (en una sola línea) - Clic en foto o nombre abre perfil */}
                  <div
                    onClick={() => setInspectedRequest(req)}
                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer group"
                    title="Toca para ver el perfil completo"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={req.fromUserAvatar}
                        alt={req.fromUserName}
                        className="w-8 h-8 rounded-full object-cover border border-pink-500/80 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[8px] leading-none">🫧</span>
                    </div>

                    <div className="min-w-0 flex-1 flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white truncate group-hover:text-pink-300 transition-colors">
                        {req.fromUserName}
                      </span>
                      <span className="text-[10px] text-pink-400 shrink-0 font-medium">
                        ({req.fromUserPronouns})
                      </span>
                      {req.city && (
                        <span className="text-[9px] text-cyan-300 font-mono shrink-0 hidden sm:inline">
                          • {req.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones en la misma línea: Check (✓) y Equis (✕) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAcceptBubbleRequest?.(req)}
                      className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                      title="Aceptar y Conectar Burbujas (✓)"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRejectBubbleRequest?.(req.id)}
                      className="w-7 h-7 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/40 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                      title="Rechazar solicitud (✕)"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Lista de Contactos Activos (Al tocar cualquier contacto se abre el Chat 1 a 1) */}
      <div className="space-y-2.5">
        {activeContacts.length === 0 && (
          <div className="py-8 text-center text-slate-500 rounded-3xl bg-slate-900/40 border border-slate-800 text-xs space-y-2">
            <p>Aún no tienes contactos en esta lista.</p>
            {onOpenRadar && (
              <button
                type="button"
                onClick={onOpenRadar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 text-pink-300 border border-pink-500/40 font-bold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Explorar personas cercanas 🫧</span>
              </button>
            )}
          </div>
        )}

        {activeContacts.map((contact) => {
          const hasStory = contact.stories && contact.stories.length > 0;

          return (
            <div
              key={contact.id}
              onClick={() => onOpenDirectChat?.(contact)}
              className="group relative flex items-center justify-between p-3.5 rounded-3xl bg-slate-900/75 hover:bg-slate-900 border border-slate-800/80 hover:border-pink-500/50 transition-all shadow-sm cursor-pointer"
              title="Toca para abrir el chat privado 1 a 1"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Avatar / Historia */}
                <div
                  onClick={(e) => {
                    if (hasStory) {
                      e.stopPropagation();
                      onViewStory(contact);
                    }
                  }}
                  className={`relative shrink-0 ${hasStory ? 'cursor-pointer' : ''}`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className={`w-12 h-12 rounded-2xl object-cover border ${
                      hasStory ? 'border-pink-500 ring-2 ring-pink-500/40' : 'border-slate-800'
                    }`}
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                      STATUS_CONFIG[contact.status].dotColor
                    }`}
                  />
                </div>

                {/* Info del Contacto */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-pink-300 transition-colors truncate">
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-pink-300 font-semibold">{contact.pronouns}</span>
                    <StatusBadge status={contact.status} size="sm" showLabel={false} />
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[190px] sm:max-w-[240px]">
                    {contact.personalMessage}
                  </p>

                  {contact.currentSong && (
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono mt-0.5 truncate">
                      <Music className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{contact.currentSong}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Indicador de Chatear 1 a 1 */}
                <button
                  type="button"
                  onClick={() => onOpenDirectChat?.(contact)}
                  className="p-2 rounded-xl bg-pink-600/10 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/30 transition-all active:scale-95"
                  title="Abrir chat privado 1 a 1"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {contact.allowWhatsAppBridge && contact.whatsAppNumber && (
                  <a
                    href={`https://wa.me/${contact.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                      '¡Hola! Te contacto desde la Burbuja LGBTIQ+ 👋'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 transition-colors"
                    title="Contacto externo por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </a>
                )}

                {/* Botón de Bloqueo Transparente */}
                <button
                  onClick={() => setBlockingTarget(contact)}
                  className="p-2 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-amber-950/40 border border-transparent hover:border-amber-900/40 transition-colors"
                  title="Bloquear contacto con motivo transparente"
                >
                  <UserX className="w-4 h-4" />
                </button>

                {/* Botón de Reportar */}
                <button
                  onClick={() => onOpenReport(contact)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors"
                  title="Reportar usuario (Alarma de corresponsabilidad)"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL DE BLOQUEO CON MOTIVO TRANSPARENTE (SIN GHOSTING) */}
      {blockingTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-600/70 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-950 border border-amber-700 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Bloqueo Transparente</h3>
                <p className="text-[11px] text-slate-400">Sin ghosting ni evasión de límites</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vas a bloquear a <strong className="text-white">{blockingTarget.name}</strong>. En Burbuja no existe el ghosting: 
              indica el motivo para que quede registrado en su expediente de seguridad y sea visible con respeto:
            </p>

            <form onSubmit={handleConfirmBlock} className="space-y-3">
              <div className="space-y-1.5">
                {BLOCK_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedBlockReason === reason
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="blockReason"
                      checked={selectedBlockReason === reason}
                      onChange={() => setSelectedBlockReason(reason)}
                      className="accent-amber-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Nota adicional (opcional):
                </label>
                <input
                  type="text"
                  value={customBlockReason}
                  onChange={(e) => setCustomBlockReason(e.target.value)}
                  placeholder="Detalle breve para el registro..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBlockingTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Confirmar Bloqueo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Solicitud (al presionar la foto o el perfil) */}
      {inspectedRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 text-left">
            {/* Cabecera: Avatar grande + Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={inspectedRequest.fromUserAvatar}
                    alt={inspectedRequest.fromUserName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-base">🫧</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {inspectedRequest.fromUserName}
                  </h3>
                  <p className="text-xs text-pink-400 font-medium">
                    ({inspectedRequest.fromUserPronouns})
                  </p>
                  <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                    PIN: {inspectedRequest.fromUserPin}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedRequest(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ubicación y cercanía */}
            {inspectedRequest.city && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-3 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>{inspectedRequest.city} • a {inspectedRequest.distanceKm} km de ti</span>
              </div>
            )}

            {/* Mensaje de saludo para conectar */}
            {inspectedRequest.introMessage && (
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mensaje para Conectar Burbujas 🫧
                </span>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{inspectedRequest.introMessage}"
                </p>
              </div>
            )}

            {/* Canción favorita */}
            {inspectedRequest.song && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
                <Music className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{inspectedRequest.song}</span>
              </div>
            )}

            {/* Acciones: Conectar o Pasar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onAcceptBubbleRequest?.(inspectedRequest);
                  setInspectedRequest(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>Conectar Burbujas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRejectBubbleRequest?.(inspectedRequest.id);
                  setInspectedRequest(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Pasar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Fichas de Bloqueo & Seguridad (Conservadas para denuncias) */}
      <BlockedDossiersSection
        blockedContacts={blockedContacts}
        onToggleBlockContact={onToggleBlockContact}
        onOpenReport={onOpenReport}
      />
    </div>
  );
};
