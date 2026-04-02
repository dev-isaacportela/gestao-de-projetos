"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/store";
import { Category } from "@/types";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#1b31e7","#3e51ff","#00ccf9","#7c3aed","#059669",
  "#dc2626","#ea580c","#d97706","#0284c7","#be185d",
];

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { setCategories(getCategories()); }, []);

  function reload() { setCategories(getCategories()); }

  function handleCreate() {
    if (!newName.trim()) return;
    createCategory(newName.trim(), newColor);
    setNewName(""); setNewColor(PRESET_COLORS[0]); setShowNew(false);
    reload();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color);
  }

  function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    updateCategory(editingId, editName.trim(), editColor);
    setEditingId(null);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria? As tarefas que a usam perderão a referência visual, mas não serão deletadas.")) return;
    deleteCategory(id);
    reload();
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-on_surface_variant text-sm mb-1">Personalize sua experiência</p>
          <h1 className="text-3xl font-semibold text-on_surface tracking-tight">Configurações</h1>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-primary" />
              <h2 className="font-semibold text-on_surface">Categorias</h2>
              <span className="text-xs text-on_surface_variant bg-surface_container_low px-2 py-0.5 rounded-full">{categories.length}</span>
            </div>
            <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 text-xs px-3 py-2">
              <Plus size={14} /> Nova Categoria
            </button>
          </div>

          {/* New category form */}
          {showNew && (
            <div className="mb-4 p-4 bg-primary_fixed/30 rounded-DEFAULT space-y-3">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreate()}
                placeholder="Nome da categoria" className="input-field focus-pulse text-sm" autoFocus />
              <div>
                <p className="text-xs text-on_surface_variant mb-2">Cor</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={cn("w-7 h-7 rounded-full transition-transform", newColor === c && "scale-125 ring-2 ring-offset-2 ring-primary")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn-primary text-xs px-3 py-2">Criar</button>
                <button onClick={() => setShowNew(false)} className="btn-ghost text-xs">Cancelar</button>
              </div>
            </div>
          )}

          {/* Categories list */}
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-DEFAULT hover:bg-surface_container_low group transition-colors">
                {editingId === cat.id ? (
                  <>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: editColor }} />
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                      className="flex-1 text-sm bg-transparent outline-none border-b border-primary pb-0.5" autoFocus />
                    <div className="flex gap-1 flex-wrap">
                      {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => setEditColor(c)}
                          className={cn("w-5 h-5 rounded-full transition-transform", editColor === c && "scale-125 ring-1 ring-offset-1 ring-primary")}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <button onClick={handleSaveEdit} className="p-1.5 rounded-DEFAULT bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                      <Check size={13} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-DEFAULT hover:bg-surface_container_high text-on_surface_variant transition-colors">
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm text-on_surface">{cat.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(cat)} className="p-1.5 rounded-DEFAULT hover:bg-surface_container_high text-on_surface_variant hover:text-primary transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-DEFAULT hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
