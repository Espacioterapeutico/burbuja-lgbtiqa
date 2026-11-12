import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Contact, UserReport } from '../types';
import { playAlarmSound } from '../utils/sound';

interface ReportUserModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<UserReport, 'id' | 'timestamp' | 'status' | 'inviterAlerted'>) => void;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  contact,
  isOpen,
  onClose,
  onSubmitReport
}) => {
  const [reason, setReason] = useState('Acoso o invasión a la privacidad');
  const [detail, setDetail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen || !contact) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playAlarmSound();
    onSubmitReport({
      reportedUserId: contact.id,
      reportedUserName: contact.name,
      reportedUserAvatar: contact.avatar,
      reportedUserPin: contact.pin,
      inviterPin: contact.referredByPin || 'BL-ORIGIN',
      inviterName: contact.referredByName || 'Usuario Fundador',
      reason,
      detail: detail.trim() || 'Sin detalles adicionales especificados.'
    });

    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/50 p-6 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {sent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Denuncia Registrada</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Se ha emitido la alarma preventiva. El portal de moderación está investigando al usuario y ha vinculado a su invitador en la cadena de confianza.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">Reportar Conducta Inapropiada</h3>
                <p className="text-[11px] text-slate-400">Protección del espacio seguro comunitario</p>
              </div>
            </div>

            {/* Target User Info */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-white">{contact.name}</p>
                <p className="text-[10px] font-mono text-pink-300">PIN: {contact.pin}</p>
              </div>
            </div>

            {/* Chain Responsibility Alert */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Alarma de Responsabilidad Compartida</span>
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                En Burbuja LGBTIQ+, quien invita asume corresponsabilidad por la conducta de su invitado. 
                Al denunciar a <strong>{contact.name}</strong>, el sistema abrirá un expediente prioritario con su referente: 
                <strong className="text-white"> {contact.referredByName || 'Carolina Méndez'} ({contact.referredByPin || 'BL-1100R'})</strong>.
              </p>
            </div>

            {/* Reason selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Motivo de la denuncia:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option>Acoso o invasión a la privacidad</option>
                <option>Discurso de odio, transfobia o discriminación</option>
                <option>Perfil falso o captación sospechosa externa</option>
                <option>Spam o comercialización indebida</option>
                <option>Vulneración de las normas de convivencia</option>
              </select>
            </div>

            {/* Details input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Describe lo ocurrido (opcional):
              </label>
              <textarea
                rows={3}
                placeholder="Explica qué norma comunitaria fue vulnerada..."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-transform active:scale-95"
            >
              Emitir Denuncia y Notificar Moderación
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
