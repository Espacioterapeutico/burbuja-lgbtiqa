import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  UserX, 
  Clock, 
  VolumeX, 
  Volume2, 
  Lock, 
  Globe, 
  Edit3, 
  UserPlus, 
  Check, 
  AlertTriangle,
  Users,
  Search
} from 'lucide-react';
import type { 
  Community, 
  CommunityMember, 
  CommunityRole, 
  UserProfile,
  Contact
} from '../types';

interface CommunityRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community;
  currentUser: UserProfile;
  availableContacts: Contact[];
  onUpdateCommunity: (communityId: string, updates: Partial<Community>) => void;
  onUpdateMemberRole: (communityId: string, userId: string, newRole: CommunityRole) => void;
  onMuteMember: (communityId: string, userId: string, muteDurationText: string | null) => void;
  onRemoveMember: (communityId: string, userId: string) => void;
  onAcceptRequest: (communityId: string, requestId: string) => void;
  onRejectRequest: (communityId: string, requestId: string) => void;
  onAddMemberByPin: (communityId: string, pin: string) => boolean;
  onOpenReportMember: (member: CommunityMember) => void;
}

const PRESET_ICONS = ['🌆', '🎬', '🏳️‍⚧️', '📖', '🎨', '☕', '🌿', '🪩', '💜', '📢', '🤝', '🏕️', '⚽', '💻', '✨'];

export const CommunityRolesModal: React.FC<CommunityRolesModalProps> = ({
  isOpen,
  onClose,
  community,
  currentUser,
  availableContacts,
  onUpdateCommunity,
  onUpdateMemberRole,
  onMuteMember,
  onRemoveMember,
  onAcceptRequest,
  onRejectRequest,
  onAddMemberByPin,
  onOpenReportMember
}) => {
  // Determine current user's role in this community
  const myMemberRecord = community.members?.find(m => m.userId === currentUser.id);
  const myRole: CommunityRole = myMemberRecord?.role || (community.creatorId === currentUser.id ? 'admin' : 'participante');

  const isAdmin = myRole === 'admin';
  const isModerator = myRole === 'moderador';
  const canModerate = isAdmin || isModerator;

  const [activeTab, setActiveTab] = useState<'miembros' | 'solicitudes' | 'ajustes' | 'palabras_vetadas'>('miembros');
  const [memberSearch, setMemberSearch] = useState('');
  const [addPinInput, setAddPinInput] = useState('');
  const [addPinFeedback, setAddPinFeedback] = useState<string | null>(null);

  // Group settings draft (Admin only)
  const [editName, setEditName] = useState(community.name);
  const [editDescription, setEditDescription] = useState(community.description);
  const [editIcon, setEditIcon] = useState(community.icon);
  const [editIsClosed, setEditIsClosed] = useState(community.isClosed);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Palabras vetadas y automuteo / sustitución por bububu o burbuja
  const [bannedWords, setBannedWords] = useState<string[]>(community.bannedWords || []);
  const [newBannedWordInput, setNewBannedWordInput] = useState('');
  const [autoMuteDuration, setAutoMuteDuration] = useState<string>(community.autoMuteDuration || 'Silenciado por 24 horas');
  const [bannedWordsSavedToast, setBannedWordsSavedToast] = useState(false);
  const [simulatorText, setSimulatorText] = useState('Ese mensaje es puro odio y solo genera pelea');

  const getSimulatedText = (text: string) => {
    let result = text;
    bannedWords.forEach((word, idx) => {
      const clean = word.trim();
      if (!clean) return;
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, idx % 2 === 0 ? 'bububu' : 'burbuja');
    });
    return result;
  };

  useEffect(() => {
    setBannedWords(community.bannedWords || []);
    setAutoMuteDuration(community.autoMuteDuration || 'Silenciado por 24 horas');
  }, [community]);

  const handleAddBannedWord = (e?: React.FormEvent, customWord?: string) => {
    if (e) e.preventDefault();
    const word = (customWord || newBannedWordInput).trim().toLowerCase();
    if (!word) return;
    if (bannedWords.includes(word)) return;
    const updated = [...bannedWords, word];
    setBannedWords(updated);
    setNewBannedWordInput('');
    onUpdateCommunity(community.id, {
      bannedWords: updated,
      autoMuteDuration
    });
    setBannedWordsSavedToast(true);
    setTimeout(() => setBannedWordsSavedToast(false), 2500);
  };

  const handleRemoveBannedWord = (wordToRemove: string) => {
    const updated = bannedWords.filter(w => w !== wordToRemove);
    setBannedWords(updated);
    onUpdateCommunity(community.id, {
      bannedWords: updated,
      autoMuteDuration
    });
    setBannedWordsSavedToast(true);
    setTimeout(() => setBannedWordsSavedToast(false), 2500);
  };

  // Active mute dropdown for a member
  const [mutingUserId, setMutingUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const members = community.members || [];
  const requests = community.pendingRequests || [];

  const filteredMembers = members.filter(m =>
    m.userName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.userPin.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdateCommunity(community.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      icon: editIcon,
      isClosed: editIsClosed
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPinInput.trim()) return;
    const cleanPin = addPinInput.trim().toUpperCase();
    const success = onAddMemberByPin(community.id, cleanPin);
    if (success) {
      setAddPinFeedback(`✓ ¡Miembro ${cleanPin} agregado con éxito!`);
      setAddPinInput('');
    } else {
      setAddPinFeedback('✕ PIN no encontrado o el usuario ya pertenece a esta comunidad.');
    }
    setTimeout(() => setAddPinFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-md">
              {community.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white truncate max-w-[180px] sm:max-w-xs">
                  {community.name}
                </h3>
                {community.isClosed && <Lock className="w-3.5 h-3.5 text-amber-400" />}
              </div>

              {/* My Role Indicator */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400">Tu rol:</span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                    <Crown className="w-3 h-3 text-amber-400" />
                    👑 Administrador
                  </span>
                )}
                {isModerator && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    🛡️ Moderador
                  </span>
                )}
                {!isAdmin && !isModerator && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <Users className="w-3 h-3" />
                    💬 Participante
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles & Permissions Helper Banner */}
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {isAdmin && '👑 Tienes control total: nombre, foto, roles, ingresos y expulsiones.'}
            {isModerator && '🛡️ Puedes silenciar (betar), expulsar, reportar y aceptar ingresos.'}
            {!canModerate && '💬 Espacio de convivencia segura. Visualiza a lxs integrantes del grupo.'}
          </span>
          <span className="font-mono text-pink-400 font-bold shrink-0 ml-2">
            {members.length} miembros
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('miembros')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'miembros'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Miembros ({members.length})</span>
          </button>

          {community.isClosed && (
            <button
              onClick={() => setActiveTab('solicitudes')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'solicitudes'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Solicitudes ({requests.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('ajustes')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ajustes'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ajustes</span>
            </button>
          )}

          {canModerate && (
            <button
              onClick={() => setActiveTab('palabras_vetadas')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'palabras_vetadas'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Palabras Vetadas ({bannedWords.length})</span>
            </button>
          )}
        </div>

        {/* Tab 1: MIEMBROS & GESTIÓN DE ROLES */}
        {activeTab === 'miembros' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Search and Add Member Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar miembro por nombre o PIN..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Admin: Add Member by PIN */}
              {isAdmin && (
                <div className="space-y-2">
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar miembro por PIN (ej: BL-1199X)..."
                      value={addPinInput}
                      onChange={(e) => setAddPinInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-purple-800/60 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-mono text-purple-200 placeholder:text-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-md shadow-purple-950/40"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </form>

                  {/* Quick-suggest from contacts who aren't yet members */}
                  {availableContacts.filter(c => !members.some(m => m.userPin === c.pin)).length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-slate-400">
                      <span className="shrink-0 font-medium">Invitar:</span>
                      {availableContacts
                        .filter(c => !members.some(m => m.userPin === c.pin))
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setAddPinInput(c.pin)}
                            className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-white shrink-0 font-mono transition-colors"
                            title={`Autocompletar PIN de ${c.name}`}
                          >
                            +{c.name.split(' ')[0]} ({c.pin})
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {addPinFeedback && (
                <p className="text-[11px] font-semibold text-center text-pink-300 bg-pink-950/60 py-1 px-2 rounded-lg border border-pink-800/50">
                  {addPinFeedback}
                </p>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-2.5">
              {filteredMembers.map((member) => {
                const isTargetSelf = member.userId === currentUser.id;
                const isTargetAdmin = member.role === 'admin';
                const canModifyTarget = isAdmin ? !isTargetSelf : (isModerator && !isTargetAdmin && !isTargetSelf);

                return (
                  <div
                    key={member.userId}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={member.userAvatar}
                            alt={member.userName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          {member.role === 'admin' && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs" title="Administrador">👑</span>
                          )}
                          {member.role === 'moderador' && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs" title="Moderador">🛡️</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{member.userName}</span>
                            {isTargetSelf && (
                              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold">Tú</span>
                            )}
                            <span className="text-[10px] font-mono text-pink-300 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-900/40">
                              {member.userPin}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            {/* Role Badge */}
                            {member.role === 'admin' && (
                              <span className="text-[10px] font-bold text-amber-400">👑 Administrador</span>
                            )}
                            {member.role === 'moderador' && (
                              <span className="text-[10px] font-bold text-purple-400">🛡️ Moderador</span>
                            )}
                            {member.role === 'participante' && (
                              <span className="text-[10px] font-medium text-slate-400">💬 Participante</span>
                            )}

                            <span className="text-[10px] text-slate-500">• {member.joinedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Member Status / Muted Badge */}
                      {member.isMutedUntil && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[10px] font-bold shrink-0">
                          <VolumeX className="w-3 h-3 text-rose-400" />
                          <span>{member.isMutedUntil}</span>
                        </div>
                      )}
                    </div>

                    {/* Moderation & Admin Control Toolbar */}
                    {canModifyTarget && (
                      <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                        {/* Admin: Role Switcher */}
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-[10px]">Rol:</span>
                            <select
                              value={member.role}
                              onChange={(e) => onUpdateMemberRole(community.id, member.userId, e.target.value as CommunityRole)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-200 focus:outline-none"
                            >
                              <option value="participante">💬 Participante</option>
                              <option value="moderador">🛡️ Moderador</option>
                              <option value="admin">👑 Administrador</option>
                            </select>
                          </div>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                          {/* Mute / Betar Button */}
                          <div className="relative">
                            {member.isMutedUntil ? (
                              <button
                                onClick={() => onMuteMember(community.id, member.userId, null)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold"
                                title="Quitar silenciado"
                              >
                                <Volume2 className="w-3 h-3 text-emerald-400" />
                                <span>Desilenciar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setMutingUserId(mutingUserId === member.userId ? null : member.userId)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-900/50 text-[10px] font-semibold"
                                title="Betar/Silenciar temporalmente"
                              >
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Betar</span>
                              </button>
                            )}

                            {/* Mute Duration Selector Popover */}
                            {mutingUserId === member.userId && (
                              <div className="absolute right-0 bottom-full mb-1 w-44 bg-slate-900 border border-amber-800/80 rounded-xl shadow-xl p-1.5 z-20 space-y-1">
                                <div className="text-[9px] font-bold uppercase text-slate-400 px-1.5 py-0.5">
                                  Silenciar por:
                                </div>
                                <button
                                  onClick={() => {
                                    onMuteMember(community.id, member.userId, 'Silenciado por 1 hora');
                                    setMutingUserId(null);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-[10px] text-slate-200"
                                >
                                  ⏳ 1 Hora
                                </button>
                                <button
                                  onClick={() => {
                                    onMuteMember(community.id, member.userId, 'Silenciado por 24 horas');
                                    setMutingUserId(null);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-[10px] text-slate-200"
                                >
                                  ⏳ 24 Horas
                                </button>
                                <button
                                  onClick={() => {
                                    onMuteMember(community.id, member.userId, 'Silenciado por 7 días');
                                    setMutingUserId(null);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-[10px] text-slate-200"
                                >
                                  ⏳ 7 Días
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Expel / Sacar Button */}
                          <button
                            onClick={() => onRemoveMember(community.id, member.userId)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[10px] font-semibold"
                            title="Sacar de la comunidad"
                          >
                            <UserX className="w-3 h-3 text-rose-400" />
                            <span>Sacar</span>
                          </button>

                          {/* Report Button */}
                          <button
                            onClick={() => onOpenReportMember(member)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold"
                            title="Reportar al Superadmin y alertar referente"
                          >
                            <AlertTriangle className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No se encontraron miembros con ese nombre o PIN.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: SOLICITUDES DE INGRESO (Grupos Cerrados) */}
        {activeTab === 'solicitudes' && community.isClosed && (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-300 space-y-1">
              <p className="font-semibold text-purple-200">
                🔒 Solicitudes de Admisión
              </p>
              <p>
                Como {isAdmin ? 'Administrador' : 'Moderador'}, puedes revisar quién desea unirse y aceptar o denegar su entrada.
              </p>
            </div>

            <div className="space-y-2">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.userAvatar}
                      alt={req.userName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{req.userName}</span>
                        <span className="text-[10px] font-mono text-pink-300 bg-pink-950/60 px-1.5 py-0.2 rounded border border-pink-900/40">
                          {req.userPin}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Solicitó unirse {req.requestedAt}
                      </span>
                    </div>
                  </div>

                  {canModerate ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onAcceptRequest(community.id, req.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceptar</span>
                      </button>
                      <button
                        onClick={() => onRejectRequest(community.id, req.id)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                      >
                        <span>Rechazar</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">Pendiente de revisión</span>
                  )}
                </div>
              ))}

              {requests.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  🎉 ¡No hay solicitudes pendientes! Todas las personas interesadas ya han sido procesadas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: AJUSTES DE GRUPO (Solo Administrador) */}
        {activeTab === 'ajustes' && isAdmin && (
          <form onSubmit={handleSaveSettings} className="p-4 space-y-4 overflow-y-auto flex-1">
            {settingsSavedToast && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold text-center animate-in fade-in">
                ✓ Ajustes de la comunidad actualizados correctamente
              </div>
            )}

            {/* Change Icon */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Cambiar Ícono
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
                {PRESET_ICONS.map((ico) => (
                  <button
                    type="button"
                    key={ico}
                    onClick={() => setEditIcon(ico)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform ${
                      editIcon === ico
                        ? 'bg-pink-600 scale-110 shadow ring-2 ring-pink-400 text-white'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre de la Comunidad
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Descripción & Normas
              </label>
              <textarea
                required
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* Privacy: Abierto vs Cerrado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Modo de Acceso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditIsClosed(false)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    !editIsClosed
                      ? 'bg-pink-950/40 border-pink-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Abierta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditIsClosed(true)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 ${
                    editIsClosed
                      ? 'bg-purple-950/40 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Cerrada</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md shadow-pink-950/50 transition-colors"
            >
              Guardar Cambios de la Comunidad
            </button>
          </form>
        )}

        {/* Tab 4: SISTEMA DE PALABRAS VETADAS & SUSTITUCIÓN POR BUBUBU / BURBUJA */}
        {activeTab === 'palabras_vetadas' && (
          <div className="p-4 space-y-4 overflow-y-auto flex-1 animate-in fade-in duration-200">
            {/* Banner Informativo */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <span className="text-sm">🫧</span>
                <span>Filtro Divertido: Sustitución por "Bububu" o "Burbuja"</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Cuando alguien escriba una palabra vetada de esta lista, el sistema no bloqueará agresivamente el mensaje, sino que <strong className="text-cyan-300">reemplazará automáticamente la palabra por "bububu" o "burbuja"</strong> para mantener la convivencia sana y divertida.
              </p>
            </div>

            {/* Formulario para agregar palabra */}
            <form onSubmit={handleAddBannedWord} className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Palabra prohibida a vetar:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ej. odio, pelea, insultos, hater..."
                    value={newBannedWordInput}
                    onChange={(e) => setNewBannedWordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newBannedWordInput.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
                >
                  Vetar Palabra
                </button>
              </div>
            </form>

            {/* Sugerencias Rápidas */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Sugerencias para vetar:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['odio', 'pelea', 'grosero', 'hater', 'toxic', 'spoiler'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddBannedWord(undefined, suggestion)}
                    disabled={bannedWords.includes(suggestion)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      bannedWords.includes(suggestion)
                        ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-900/40 active:scale-95'
                    }`}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulador en Vivo */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span>🧪</span>
                <span>Simulador en vivo de sustitución:</span>
              </span>
              <input
                type="text"
                value={simulatorText}
                onChange={(e) => setSimulatorText(e.target.value)}
                placeholder="Escribe una frase de prueba..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              />
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-900/50 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Resultado en el chat:</span>
                <p className="text-white font-medium italic">
                  "{getSimulatedText(simulatorText)}"
                </p>
              </div>
            </div>

            {/* Lista de Palabras Vetadas Activas */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Palabras vetadas en este grupo ({bannedWords.length})
                </span>
                {bannedWordsSavedToast && (
                  <span className="text-[11px] font-bold text-emerald-400 animate-in fade-in">
                    ✓ Reglas actualizadas
                  </span>
                )}
              </div>

              {bannedWords.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  {bannedWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm animate-in zoom-in-95"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBannedWord(word)}
                        className="p-0.5 rounded-full hover:bg-cyan-900 text-cyan-400 hover:text-white transition-colors"
                        title={`Desvetar "${word}"`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-xs">
                  No hay palabras vetadas en este momento. Los miembros pueden escribir libremente.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
