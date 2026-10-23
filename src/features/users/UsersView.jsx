import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  Trash2,
  AlertCircle,
  Loader2,
  Check,
  X,
  Mail,
  Lock,
  User,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

export default function UsersView() {
  const { role, user: currentUser } = useAuth();
  const isOwner = role === 'OWNER';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!isOwner) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMembers();
      setMembers(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al obtener personal de la organización.');
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (!isOwner) {
    return (
      <div className="p-16 rounded-2xl bg-[#0D1017] border border-[#1A212F] text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Acceso Restringido a Propietarios</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          La administración de cajeros y miembros de la organización es exclusiva para el rol de Propietario.
        </p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      await api.addMember(formData);
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.message || 'Error al crear cajero.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (membershipId) => {
    setDeleting(true);
    try {
      await api.removeMember(membershipId);
      setDeleteId(null);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Error al revocar acceso.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#161B26]">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Gestión de Personal y Cajeros</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administra los roles, accesos y permisos de los cajeros en tu organización.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo Cajero</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Cargando personal...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-[#0D1017] border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const isSelf = m.user.id === currentUser?.id;
            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {m.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{m.user.name}</span>
                          {isSelf && (
                            <span className="text-[10px] text-slate-500 font-normal font-mono">
                              (Tú)
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        m.role === 'OWNER'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {m.role === 'OWNER' ? 'PROPIETARIO' : 'CAJERO'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#161B26] text-[11px] text-slate-500 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      <span>{formatDate(m.joinedAt)}</span>
                    </span>
                    <span className="text-emerald-400/80">Acceso Activo</span>
                  </div>
                </div>

                {!isSelf && m.role !== 'OWNER' && (
                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="w-full py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revocar Acceso</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Cajero */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-md bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1A212F] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Contratar Nuevo Cajero</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cajero@mitienda.com"
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#161B26]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Crear Acceso de Cajero</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Revocación */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !deleting && setDeleteId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-sm bg-[#0D1017] border border-red-500/30 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Revocar acceso?</h3>
                <p className="text-xs text-slate-400">
                  El usuario ya no podrá iniciar sesión ni cobrar en esta tienda.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Revocando...</span>
                  </>
                ) : (
                  <span>Sí, Revocar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
