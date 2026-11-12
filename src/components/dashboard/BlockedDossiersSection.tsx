import React, { useState } from 'react';
import { ShieldOff, AlertCircle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import type { Contact } from '../../types';

interface BlockedDossiersSectionProps {
  blockedContacts: Contact[];
  onToggleBlockContact: (contact: Contact, reason?: string) => void;
  onOpenReport: (contact: Contact) => void;
}

export const BlockedDossiersSection: React.FC<BlockedDossiersSectionProps> = ({
  blockedContacts,
  onToggleBlockContact,
  onOpenReport
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (blockedContacts.length === 0) return null;

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
      {/* Barra de cabecera interactiva y discreta para Plegar / Desplegar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer select-none transition-all group"
      >
        <div className="flex items-center gap-2">
          <ShieldOff className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          <h4 className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
            Fichas de Bloqueo & Seguridad ({blockedContacts.length})
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
          <span>{isExpanded ? 'Ocultar' : 'Mostrar'}</span>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 group-hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Lista de Fichas (Solo visible cuando se pulsa Mostrar) */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
          <div className="px-1 text-[10px] text-slate-500 leading-tight">
            🛡️ Las fichas se resguardan de forma segura para permitir denuncias o auditorías si hubo abusos, sin borrar evidencias.
          </div>

          {blockedContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-3xl bg-slate-950/90 border border-rose-900/40 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-11 h-11 rounded-2xl object-cover grayscale opacity-75 border border-slate-700"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                      ✕
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{contact.name}</span>
                      <span className="text-[10px] font-mono text-pink-300 font-semibold">{contact.pin}</span>
                    </div>

                    {contact.hasBlockedMe ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold text-rose-400 bg-rose-950/70 border border-rose-800/50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Este usuario te ha bloqueado
                        </span>
                        {contact.blockReason && (
                          <p className="text-[11px] text-slate-300 font-medium">
                            Motivo declarado: <span className="italic text-rose-300 font-semibold">"{contact.blockReason}"</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800/50 px-2 py-0.5 rounded-full">
                          Has bloqueado a este usuario
                        </span>
                        {contact.blockReason && (
                          <p className="text-[11px] text-slate-300 font-medium">
                            Motivo registrado: <span className="italic text-amber-300 font-semibold">"{contact.blockReason}"</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {contact.isBlockedByMe && (
                  <button
                    onClick={() => onToggleBlockContact(contact)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                  >
                    Desbloquear
                  </button>
                )}
              </div>

              {/* Preserved Accountability Lineage Box */}
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="leading-relaxed">
                  🔒 <strong>Ficha protegida contra evasión:</strong> En Burbuja LGBTIQ+, el bloqueo no borra las evidencias ni exime de responsabilidad. 
                  El referente de este usuario es: <strong className="text-purple-300">{contact.referredByName || 'Val Martínez'} ({contact.referredByPin || 'BL-4410A'})</strong>.
                </p>
              </div>

              {/* Direct Report Button on the Blocked Card */}
              <button
                onClick={() => onOpenReport(contact)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-bold transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Denunciar a este usuario y notificar a su referente</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
