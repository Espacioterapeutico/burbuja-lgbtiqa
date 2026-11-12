import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  Compass, 
  Megaphone, 
  Search, 
  Check, 
  X, 
  UserX, 
  UserCheck, 
  BellRing, 
  Sparkles, 
  Plus, 
  Minus, 
  Snowflake, 
  Flame, 
  Send
} from 'lucide-react';
import type { UserReport, Community, ManagedUser, GlobalBroadcast } from '../types';

interface SuperadminPortalProps {
  reports: UserReport[];
  communities: Community[];
  users: ManagedUser[];
  broadcasts?: GlobalBroadcast[];
  onUpdateReportStatus: (id: string, status: UserReport['status'], inviterAlerted?: boolean) => void;
  onToggleUserEnabled?: (userId: string) => void;
  onGrantInvitations?: (userId: string, count: number) => void;
  onToggleCommunityFreeze?: (commId: string) => void;
  onSendBroadcast?: (broadcast: GlobalBroadcast) => void;
  onClose: () => void;
}

export const SuperadminPortal: React.FC<SuperadminPortalProps> = ({
  reports,
  communities,
  users = [],
  broadcasts = [],
  onUpdateReportStatus,
  onToggleUserEnabled,
  onGrantInvitations,
  onToggleCommunityFreeze,
  onSendBroadcast,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'denuncias' | 'comunidades' | 'comunicados'>('usuarios');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // --- TAB USUARIOS STATE ---
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'todos' | 'activos' | 'inhabilitados'>('todos');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(users[0] || null);

  // --- TAB DENUNCIAS STATE ---
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(reports[0] || null);

  // --- TAB COMUNIDADES STATE ---
  const [commSearch, setCommSearch] = useState('');

  // --- TAB COMUNICADOS STATE ---
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'informativo' | 'alerta_seguridad'>('informativo');

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3800);
  };

  // Filtrado de Usuarios
  const filteredUsers = users.filter((u) => {
    const query = userSearch.toLowerCase().trim();
    const matchesQuery = 
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.pin.toLowerCase().includes(query) ||
      u.cedulaHash.toLowerCase().includes(query) ||
      u.city.toLowerCase().includes(query);

    if (!matchesQuery) return false;
    if (userFilter === 'activos') return u.isEnabled;
    if (userFilter === 'inhabilitados') return !u.isEnabled;
    return true;
  });

  // Filtrado de Comunidades
  const filteredCommunities = communities.filter((c) => {
    const q = commSearch.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  // Acciones de Denuncia
  const handleAlertInviter = (reportId: string, inviterName: string) => {
    onUpdateReportStatus(reportId, 'investigando_cadena', true);
    showFeedback(`🔔 Alarma enviada a ${inviterName}. Se le ha notificado que debe responder por su referido.`);
  };

  const handleSanctionUser = (reportId: string, userName: string, userId?: string) => {
    onUpdateReportStatus(reportId, 'sancionado');
    if (userId && onToggleUserEnabled) {
      const user = users.find(u => u.id === userId);
      if (user && user.isEnabled) {
        onToggleUserEnabled(userId);
      }
    }
    showFeedback(`⛔ Usuario ${userName} suspendido e inhabilitado de la plataforma.`);
  };

  const handleResolve = (reportId: string) => {
    onUpdateReportStatus(reportId, 'resuelto');
    showFeedback('✅ Expediente resuelto y archivado en el registro de confianza.');
  };

  // Envío de Broadcast
  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    const newBroadcast: GlobalBroadcast = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      urgency: broadcastUrgency,
      sentAt: 'Justo ahora',
      authorName: 'Equipo Superadmin Burbuja'
    };

    onSendBroadcast?.(newBroadcast);
    setBroadcastTitle('');
    setBroadcastMessage('');
    showFeedback('📢 Comunicado global emitido con éxito a toda la red.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col overflow-y-auto animate-in fade-in duration-200 text-left">
      {/* 1. Header Superior del Superadmin */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-purple-300 shadow-md">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Portal de Superadmin</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                Solo Monitoreo
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Panel de monitoreo silencioso y auditoría. Cuenta invisible sin chat, sin contactos públicos ni exposición a usuarios.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors shadow-sm active:scale-95 flex items-center gap-1.5"
        >
          <span>Volver a la App</span>
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </header>

      {/* 2. Pestañas de Navegación del Superadmin */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 sm:px-6 sticky top-[57px] z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === 'usuarios'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de Usuarios ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('denuncias')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === 'denuncias'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Denuncias & Casos ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comunidades')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === 'comunidades'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Comunidades ({communities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comunicados')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              activeTab === 'comunicados'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Avisos Globales ({broadcasts.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-emerald-950/95 border-2 border-emerald-500 rounded-2xl text-xs text-emerald-200 font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-3 max-w-md">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 3. Contenido Principal */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        
        {/* ======================= PESTAÑA 1: USUARIOS ======================= */}
        {activeTab === 'usuarios' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Barra de Filtros y Buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, PIN, cédula hash o ciudad..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setUserFilter('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userFilter === 'todos' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setUserFilter('activos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userFilter === 'activos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Activos ({users.filter(u => u.isEnabled).length})
                </button>
                <button
                  onClick={() => setUserFilter('inhabilitados')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userFilter === 'inhabilitados' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inhabilitados ({users.filter(u => !u.isEnabled).length})
                </button>
              </div>
            </div>

            {/* Layout Dual: Lista de Usuarios + Expediente Detallado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda: Tabla/Lista de Usuarios */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Usuarios Encontrados ({filteredUsers.length})
                  </span>
                  <span className="text-[10px] text-slate-500">Toca para abrir expediente</span>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                    No se encontraron usuarios con ese criterio.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-950/30'
                            : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-white truncate">{u.name}</span>
                              <span className="text-[10px] text-pink-400 shrink-0 font-medium">({u.pronouns})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              <span className="text-purple-300 font-bold">{u.pin}</span>
                              <span>•</span>
                              <span>{u.cedulaHash}</span>
                              <span>•</span>
                              <span className="text-cyan-300 truncate">{u.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón On/Off Rápido */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleUserEnabled?.(u.id);
                              showFeedback(
                                u.isEnabled 
                                  ? `⛔ Usuario ${u.name} inhabilitado.` 
                                  : `✅ Usuario ${u.name} habilitado.`
                              );
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition-all flex items-center gap-1 ${
                              u.isEnabled
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-700'
                                : 'bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-700'
                            }`}
                            title={u.isEnabled ? 'Clic para inhabilitar cuenta' : 'Clic para reactivar cuenta'}
                          >
                            {u.isEnabled ? (
                              <>
                                <UserCheck className="w-3 h-3 text-emerald-400" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 text-rose-400" />
                                <span>Inhabilitado</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Columna Derecha: Expediente Completo del Usuario Seleccionado */}
              <div className="lg:col-span-7">
                {selectedUser ? (
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
                    {/* Cabecera del Expediente */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={selectedUser.avatar}
                            alt=""
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                          />
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                            selectedUser.isEnabled ? 'bg-emerald-400' : 'bg-rose-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white">{selectedUser.name}</h3>
                            <span className="text-xs text-pink-400">({selectedUser.pronouns})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>PIN: <strong className="text-purple-300">{selectedUser.pin}</strong></span>
                            <span>•</span>
                            <span>Cédula Hash: <strong className="text-slate-300">{selectedUser.cedulaHash}</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Botón On/Off Grande */}
                      <button
                        type="button"
                        onClick={() => {
                          onToggleUserEnabled?.(selectedUser.id);
                          showFeedback(
                            selectedUser.isEnabled
                              ? `⛔ Se ha inhabilitado el acceso a ${selectedUser.name}.`
                              : `✅ Se ha restaurado el acceso de ${selectedUser.name}.`
                          );
                        }}
                        className={`py-2 px-4 rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          selectedUser.isEnabled
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {selectedUser.isEnabled ? (
                          <>
                            <UserX className="w-4 h-4" />
                            <span>Inhabilitar Usuario</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Habilitar Usuario</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Datos Generales y Reputación */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Reputación</span>
                        <span className="text-base font-black text-emerald-400 mt-0.5 block">
                          {selectedUser.reputationScore}%
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Pases Disponibles</span>
                        <span className="text-base font-black text-purple-300 mt-0.5 block">
                          {selectedUser.invitationsRemaining}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ciudad</span>
                        <span className="text-xs font-bold text-cyan-300 mt-1 block truncate">
                          {selectedUser.city}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Registro</span>
                        <span className="text-xs font-medium text-slate-300 mt-1 block">
                          {selectedUser.joinedDate}
                        </span>
                      </div>
                    </div>

                    {/* Trazabilidad de Cadena (¿Quién lo invitó y a quién invitó él?) */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        🔗 Trazabilidad de la Cadena de Confianza
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Padrino */}
                        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
                          <span className="text-[10px] text-purple-400 font-bold block mb-0.5">Invitado por (Padrino):</span>
                          <p className="font-extrabold text-white">{selectedUser.referredByName}</p>
                          <p className="text-[10px] font-mono text-purple-300 mt-0.5">PIN: {selectedUser.referredByPin}</p>
                        </div>

                        {/* Personas a quienes él invitó */}
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">
                            Referidos en su cadena:
                          </span>
                          {users.filter(u => u.referredByPin === selectedUser.pin).length > 0 ? (
                            <div className="space-y-1 mt-1">
                              {users.filter(u => u.referredByPin === selectedUser.pin).map(ref => (
                                <div key={ref.id} className="flex items-center justify-between text-[11px]">
                                  <span className="text-white font-medium">{ref.name}</span>
                                  <span className="text-slate-400 font-mono text-[9px]">{ref.pin}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic mt-1">Aún no ha invitado a nadie.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comunidades Creadas por este usuario */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          👑 Comunidades Creadas ({
                            communities.filter(c => c.creatorId === selectedUser.id || selectedUser.createdCommunityIds?.includes(c.id)).length
                          })
                        </span>
                      </div>

                      {communities.filter(c => c.creatorId === selectedUser.id || selectedUser.createdCommunityIds?.includes(c.id)).length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Este usuario no ha fundado comunidades todavía.</p>
                      ) : (
                        <div className="space-y-2">
                          {communities
                            .filter(c => c.creatorId === selectedUser.id || selectedUser.createdCommunityIds?.includes(c.id))
                            .map((comm) => (
                              <div
                                key={comm.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{comm.icon}</span>
                                  <div>
                                    <h4 className="font-bold text-white">{comm.name}</h4>
                                    <p className="text-[10px] text-slate-400">
                                      {comm.category} • {comm.memberCount} miembros
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {comm.isFrozen && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                                      ❄️ Congelada
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => onToggleCommunityFreeze?.(comm.id)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                                  >
                                    {comm.isFrozen ? 'Reactivar' : 'Congelar'}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Gestión de Cuota de Pases de Invitación */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white">Gestionar Invitaciones</h4>
                        <p className="text-[10px] text-slate-400">
                          Tiene {selectedUser.invitationsRemaining} pases para invitar personas a la red
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onGrantInvitations?.(selectedUser.id, -1);
                            showFeedback(`Se retiró 1 invitación a ${selectedUser.name}.`);
                          }}
                          disabled={selectedUser.invitationsRemaining <= 0}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-40 border border-slate-800"
                          title="Restar 1 invitación"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onGrantInvitations?.(selectedUser.id, 1);
                            showFeedback(`Se otorgó +1 invitación a ${selectedUser.name}.`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1"
                          title="Sumar 1 invitación"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+1 Pase</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onGrantInvitations?.(selectedUser.id, 3);
                            showFeedback(`Se otorgaron +3 invitaciones a ${selectedUser.name}.`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 text-xs font-bold"
                          title="Sumar 3 invitaciones"
                        >
                          <span>+3 Pases</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-xs text-slate-500">
                    Selecciona un usuario de la lista izquierda para auditar su expediente.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================= PESTAÑA 2: DENUNCIAS ======================= */}
        {activeTab === 'denuncias' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Métricas de Seguridad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Denuncias Activas</span>
                <span className="text-2xl font-black text-rose-400 mt-1 block">
                  {reports.filter(r => r.status !== 'resuelto').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Alarmas a Referentes</span>
                <span className="text-2xl font-black text-amber-300 mt-1 block">
                  {reports.filter(r => r.inviterAlerted).length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Índice Confianza</span>
                <span className="text-2xl font-black text-purple-300 mt-1 block">99.2%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Casos Resueltos</span>
                <span className="text-2xl font-black text-emerald-300 mt-1 block">
                  {reports.filter(r => r.status === 'resuelto').length}
                </span>
              </div>
            </div>

            {/* Layout Dual de Denuncias */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Columna de Casos */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Expedientes Registrados ({reports.length})
                </h3>

                <div className="space-y-2.5">
                  {reports.map((rep) => {
                    const isSelected = selectedReport?.id === rep.id;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReport(rep)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/20'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rep.reportedUserAvatar}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="text-xs font-bold text-white">{rep.reportedUserName}</p>
                              <p className="text-[10px] font-mono text-pink-300">{rep.reportedUserPin}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              rep.status === 'sancionado'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : rep.status === 'investigando_cadena'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>

                        <p className="text-xs text-rose-300 font-semibold mb-1">
                          {rep.reason}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {rep.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Columna de Detalle del Caso & Acciones */}
              <div className="lg:col-span-7">
                {selectedReport ? (
                  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                          Expediente #{selectedReport.id} • {selectedReport.timestamp}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Arbitraje Comunitario
                        </h3>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950/70 text-rose-300 border border-rose-800/60">
                        {selectedReport.reason}
                      </span>
                    </div>

                    {/* Trazabilidad: Quién lo invitó */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Trazabilidad de la Cadena (¿Quién responde por este acceso?)
                      </span>
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50">
                        <span className="text-[9px] uppercase font-black text-purple-400 tracking-wider block">
                          Padrino / Referente Directo:
                        </span>
                        <p className="text-xs font-bold text-white mt-0.5">{selectedReport.inviterName}</p>
                        <p className="text-[10px] font-mono text-purple-300">PIN: {selectedReport.inviterPin}</p>
                      </div>
                    </div>

                    {/* Detalle de la denuncia */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Descripción aportada por la víctima o denunciante:
                      </span>
                      <p className="text-slate-200 leading-relaxed italic">
                        "{selectedReport.detail}"
                      </p>
                    </div>

                    {/* Acciones del Superadmin */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Acciones de Moderación:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleAlertInviter(selectedReport.id, selectedReport.inviterName)}
                          className="py-2.5 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>Alertar Padrino</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSanctionUser(selectedReport.id, selectedReport.reportedUserName, selectedReport.reportedUserId)}
                          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Inhabilitar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResolve(selectedReport.id)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          <span>Resolver Caso</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-xs text-slate-500">
                    Selecciona un caso para ver los detalles.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================= PESTAÑA 3: COMUNIDADES ======================= */}
        {activeTab === 'comunidades' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar comunidad por nombre o categoría..."
                  value={commSearch}
                  onChange={(e) => setCommSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-2xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Total: <strong>{filteredCommunities.length}</strong> espacios seguros
              </span>
            </div>

            {/* Cuadrícula de Comunidades con Control de Congelación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunities.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-4 rounded-3xl border transition-all ${
                    comm.isFrozen
                      ? 'bg-cyan-950/20 border-cyan-800/60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{comm.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span>{comm.name}</span>
                          {comm.isFrozen && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
                              ❄️ Congelada
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-pink-400 font-medium">{comm.category}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleCommunityFreeze?.(comm.id);
                        showFeedback(
                          comm.isFrozen
                            ? `🔥 Comunidad "${comm.name}" reactivada.`
                            : `❄️ Comunidad "${comm.name}" congelada por moderación.`
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                        comm.isFrozen
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700'
                      }`}
                    >
                      {comm.isFrozen ? (
                        <>
                          <Flame className="w-3.5 h-3.5 text-amber-300" />
                          <span>Reactivar</span>
                        </>
                      ) : (
                        <>
                          <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Congelar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                    <span>{comm.memberCount} miembros</span>
                    <span>{comm.isClosed ? '🔒 Con código' : '🌐 Abierta'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= PESTAÑA 4: COMUNICADOS GLOBALES ======================= */}
        {activeTab === 'comunicados' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-150">
            {/* Formulario de Emisión */}
            <form onSubmit={handleCreateBroadcast} className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Emitir Comunicado Oficial a la Red</h3>
                  <p className="text-[11px] text-slate-400">
                    Este mensaje aparecerá a todos los miembros de la Burbuja en tiempo real.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Título del Comunicado
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Ej: Aviso de Seguridad: Recomendaciones para encuentros en Lara"
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Mensaje Detallado
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Escribe el mensaje claro y empático para toda la comunidad..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nivel de Urgencia
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-bold transition-all ${
                    broadcastUrgency === 'informativo'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="urgency"
                      checked={broadcastUrgency === 'informativo'}
                      onChange={() => setBroadcastUrgency('informativo')}
                      className="accent-amber-500"
                    />
                    <span>ℹ️ Informativo / Cultural</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer text-xs font-bold transition-all ${
                    broadcastUrgency === 'alerta_seguridad'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="urgency"
                      checked={broadcastUrgency === 'alerta_seguridad'}
                      onChange={() => setBroadcastUrgency('alerta_seguridad')}
                      className="accent-rose-500"
                    />
                    <span>🚨 Alerta de Seguridad</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comunicado a Todos los Miembros</span>
              </button>
            </form>

            {/* Historial de Comunicados */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Historial de Avisos Emitidos ({broadcasts.length})
              </span>

              {broadcasts.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
                  No se han emitido comunicados globales aún.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {broadcasts.map((bc) => (
                    <div
                      key={bc.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          bc.urgency === 'alerta_seguridad'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {bc.urgency === 'alerta_seguridad' ? '🚨 Seguridad' : 'ℹ️ Informativo'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{bc.sentAt}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-white">{bc.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{bc.message}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Por: {bc.authorName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
