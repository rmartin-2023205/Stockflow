import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Loader2,
  Check,
  X,
  RefreshCw,
  FolderTree,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CategoriesView() {
  const { role } = useAuth();
  const isOwner = role === 'OWNER';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al obtener las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Error al guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.deleteCategory(id);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Error al eliminar la categoría.');
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
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>Categorías de Productos</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organiza tu inventario en familias de productos para facilitar búsquedas y reportes de ventas.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Categoría</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-mono">Cargando categorías...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-[#0D1017] border border-red-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-300">{error}</p>
          <button
            onClick={fetchCategories}
            className="px-3.5 py-1.5 rounded-xl bg-[#141A24] border border-[#232B3A] text-xs text-white hover:bg-[#1B2332] cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#0D1017] border border-[#1A212F] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#121622] border border-[#1E2536] flex items-center justify-center text-slate-500 mx-auto">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">Sin categorías configuradas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Crea categorías como "Bebidas", "Abarrotes" o "Limpieza" para clasificar los productos de tu negocio.
          </p>
          {isOwner && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Categoría</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-[#0D1017] border border-[#1A212F] hover:border-emerald-500/30 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Package className="w-3 h-3 text-slate-500" />
                        <span>{cat._count?.products ?? 0} artículos</span>
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
                        title="Editar categoría"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[32px]">
                  {cat.description || (
                    <span className="italic text-slate-600">Sin descripción adicional</span>
                  )}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#161B26] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>ID: {cat.id.slice(0, 8)}...</span>
                <span className="text-emerald-400/80">Activa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Categoría */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-md bg-[#0D1017] border border-[#1A212F] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
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

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ej. Bebidas y Refrescos"
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={2}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Breve detalle sobre los artículos pertenecientes a esta categoría..."
                  className="w-full bg-[#121622] border border-[#1E2536] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !deleting && setDeleteId(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-sm bg-[#0D1017] border border-red-500/30 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Eliminar categoría?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Los productos asignados quedarán como "Sin categoría".
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-[#161C28] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
