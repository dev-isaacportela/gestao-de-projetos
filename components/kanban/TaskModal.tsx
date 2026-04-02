"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Task, Category } from "@/types";
import {
  createTask, updateTask, updateTaskStatus, deleteTask,
  getCategories,
  addChecklistItem, toggleChecklistItem, deleteChecklistItem,
  addTimeEntry, deleteTimeEntry,
  getTaskById,
} from "@/lib/store";
import { cn, getPriorityColor, getPriorityLabel, formatSeconds } from "@/lib/utils";
import {
  X, Trash2, Play, Pause, Plus, Check, Minus,
  Clock, StickyNote, ListChecks, Tag
} from "lucide-react";

interface Props {
  projectId: string;
  task: Task | null;
  defaultStatus: Task["status"];
  onClose: () => void;
}

export default function TaskModal({ projectId, task: initialTask, defaultStatus, onClose }: Props) {
  const [task, setTask] = useState<Task | null>(initialTask);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isNew] = useState(!initialTask);

  // Form state (new task)
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [formError, setFormError] = useState("");

  // Checklist
  const [newItemText, setNewItemText] = useState("");

  // Timer
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef<number>(0);

  // Manual time
  const [manualH, setManualH] = useState("");
  const [manualM, setManualM] = useState("");
  const [manualNote, setManualNote] = useState("");

  // Tab
  const [tab, setTab] = useState<"details" | "checklist" | "time">("details");

  const reload = useCallback(() => {
    if (task?.id) {
      const t = getTaskById(task.id);
      if (t) setTask(t);
    }
  }, [task?.id]);

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    if (initialTask) {
      setTitle(initialTask.title);
      setNotes(initialTask.notes || "");
      setCategoryId(initialTask.category_id);
      setIsUrgent(initialTask.is_urgent);
      setIsImportant(initialTask.is_important);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      startedAtRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  function handleSaveNew() {
    if (!title.trim()) { setFormError("Título é obrigatório."); return; }
    if (!categoryId) { setFormError("Selecione uma categoria."); return; }
    const created = createTask({ project_id: projectId, title: title.trim(), notes: notes.trim() || undefined, is_urgent: isUrgent, is_important: isImportant, category_id: categoryId });
    if (defaultStatus !== "todo") {
      updateTaskStatus(created.id, defaultStatus);
    }
    onClose();
  }

  function handleSaveExisting() {
    if (!task) return;
    if (!title.trim()) { setFormError("Título é obrigatório."); return; }
    updateTask(task.id, { title: title.trim(), notes: notes.trim() || null, category_id: categoryId, is_urgent: isUrgent, is_important: isImportant });
    reload();
  }

  function handleDelete() {
    if (!task) return;
    if (!confirm("Excluir esta tarefa?")) return;
    deleteTask(task.id);
    onClose();
  }

  function handleStopTimer() {
    setRunning(false);
    if (elapsed > 0 && task) {
      addTimeEntry(task.id, elapsed);
      setElapsed(0);
      reload();
    }
  }

  function handleAddManualTime() {
    if (!task) return;
    const h = parseInt(manualH || "0");
    const m = parseInt(manualM || "0");
    const secs = h * 3600 + m * 60;
    if (secs <= 0) return;
    addTimeEntry(task.id, secs, manualNote.trim() || undefined);
    setManualH(""); setManualM(""); setManualNote("");
    reload();
  }

  function handleAddChecklist() {
    if (!task || !newItemText.trim()) return;
    addChecklistItem(task.id, newItemText.trim());
    setNewItemText("");
    reload();
  }

  function handleToggleChecklist(itemId: string) {
    toggleChecklistItem(itemId);
    reload();
  }

  function handleDeleteChecklist(itemId: string) {
    deleteChecklistItem(itemId);
    reload();
  }

  function handleDeleteTimeEntry(entryId: string) {
    deleteTimeEntry(entryId);
    reload();
  }

  const checklist = task?.checklist_items || [];
  const timeEntries = task?.time_entries || [];

  return (
    <div className="fixed inset-0 bg-on_surface/20 backdrop-blur-sm z-50 flex items-center justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline_variant/10">
          <h2 className="font-semibold text-on_surface">{isNew ? "Nova Tarefa" : "Detalhes da Tarefa"}</h2>
          <div className="flex items-center gap-1">
            {!isNew && (
              <button onClick={handleDelete} className="p-2 rounded-DEFAULT hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-DEFAULT hover:bg-surface_container_low text-on_surface_variant transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs (existing task only) */}
        {!isNew && (
          <div className="flex border-b border-outline_variant/10 px-5">
            {([["details", "Detalhes", StickyNote], ["checklist", "Checklist", ListChecks], ["time", "Tempo", Clock]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn("flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === id ? "border-primary text-primary" : "border-transparent text-on_surface_variant hover:text-on_surface")}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* DETAILS TAB */}
          {(isNew || tab === "details") && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on_surface_variant mb-1.5">Título <span className="text-red-500">*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="O que precisa ser feito?" className="input-field focus-pulse text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-on_surface_variant mb-1.5">Categoria <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                        categoryId === cat.id ? "text-white shadow-sm scale-105" : "bg-surface_container_low text-on_surface_variant hover:bg-surface_container_high")}
                      style={categoryId === cat.id ? { backgroundColor: cat.color } : {}}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eisenhower */}
              <div>
                <label className="block text-xs font-medium text-on_surface_variant mb-1.5">Prioridade (Matriz de Eisenhower)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setIsUrgent(!isUrgent)}
                    className={cn("flex items-center gap-2 px-3 py-2.5 rounded-DEFAULT text-sm font-medium transition-all duration-150 border",
                      isUrgent ? "bg-orange-50 border-orange-300 text-orange-700" : "border-outline_variant/30 text-on_surface_variant hover:bg-surface_container_low")}>
                    <div className={cn("w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0",
                      isUrgent ? "bg-orange-400 border-orange-400" : "border-outline_variant")}>
                      {isUrgent && <Check size={10} className="text-white" />}
                    </div>
                    Urgente
                  </button>
                  <button onClick={() => setIsImportant(!isImportant)}
                    className={cn("flex items-center gap-2 px-3 py-2.5 rounded-DEFAULT text-sm font-medium transition-all duration-150 border",
                      isImportant ? "bg-blue-50 border-blue-300 text-blue-700" : "border-outline_variant/30 text-on_surface_variant hover:bg-surface_container_low")}>
                    <div className={cn("w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0",
                      isImportant ? "bg-blue-400 border-blue-400" : "border-outline_variant")}>
                      {isImportant && <Check size={10} className="text-white" />}
                    </div>
                    Importante
                  </button>
                </div>
                {(isUrgent || isImportant) && (
                  <p className={cn("text-xs mt-2 px-2 py-1 rounded-full inline-block",
                    getPriorityColor(isUrgent && isImportant ? "do_now" : isUrgent ? "delegate" : "schedule"))}>
                    → {getPriorityLabel(isUrgent && isImportant ? "do_now" : isUrgent ? "delegate" : "schedule")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-on_surface_variant mb-1.5">Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalhes, contexto, links..." rows={3} className="input-field focus-pulse text-sm resize-none" />
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <button onClick={isNew ? handleSaveNew : handleSaveExisting} className="btn-primary w-full">
                {isNew ? "Criar Tarefa" : "Salvar Alterações"}
              </button>
            </div>
          )}

          {/* CHECKLIST TAB */}
          {!isNew && tab === "checklist" && (
            <div>
              <div className="flex gap-2 mb-4">
                <input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddChecklist()}
                  placeholder="Adicionar item..." className="input-field focus-pulse text-sm flex-1" />
                <button onClick={handleAddChecklist} className="btn-primary px-3"><Plus size={16} /></button>
              </div>

              {checklist.length === 0 ? (
                <p className="text-sm text-on_surface_variant/60 text-center py-8">Nenhum item no checklist</p>
              ) : (
                <div className="space-y-2">
                  {checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-DEFAULT hover:bg-surface_container_low group transition-colors">
                      <button onClick={() => handleToggleChecklist(item.id)}
                        className={cn("w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          item.is_done ? "bg-emerald-500 border-emerald-500" : "border-outline_variant hover:border-primary")}>
                        {item.is_done && <Check size={11} className="text-white" />}
                      </button>
                      <span className={cn("flex-1 text-sm", item.is_done && "line-through text-on_surface_variant/60")}>{item.text}</span>
                      <button onClick={() => handleDeleteChecklist(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-all">
                        <Minus size={13} />
                      </button>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-outline_variant/10">
                    <div className="flex justify-between text-xs text-on_surface_variant mb-1.5">
                      <span>{checklist.filter(i => i.is_done).length}/{checklist.length} concluídos</span>
                    </div>
                    <div className="h-1.5 bg-surface_container_low rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-300"
                        style={{ width: `${checklist.length > 0 ? Math.round((checklist.filter(i => i.is_done).length / checklist.length) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TIME TAB */}
          {!isNew && tab === "time" && (
            <div className="space-y-5">
              {/* Timer */}
              <div className="surface-card p-4 text-center">
                <p className="text-3xl font-semibold text-on_surface tracking-tight mb-3 font-mono">
                  {formatSeconds(elapsed)}
                </p>
                {!running ? (
                  <button onClick={() => setRunning(true)} className="btn-primary inline-flex items-center gap-2">
                    <Play size={16} /> Iniciar Cronômetro
                  </button>
                ) : (
                  <button onClick={handleStopTimer} className="btn-secondary inline-flex items-center gap-2">
                    <Pause size={16} /> Parar e Salvar
                  </button>
                )}
              </div>

              {/* Manual */}
              <div>
                <p className="text-xs font-medium text-on_surface_variant mb-2">Adicionar Tempo Manualmente</p>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input type="number" min="0" value={manualH} onChange={e => setManualH(e.target.value)} placeholder="Horas" className="input-field focus-pulse text-sm" />
                  </div>
                  <div className="flex-1">
                    <input type="number" min="0" max="59" value={manualM} onChange={e => setManualM(e.target.value)} placeholder="Minutos" className="input-field focus-pulse text-sm" />
                  </div>
                </div>
                <input value={manualNote} onChange={e => setManualNote(e.target.value)} placeholder="Nota opcional" className="input-field focus-pulse text-sm mb-2" />
                <button onClick={handleAddManualTime} className="btn-primary w-full text-sm">Adicionar Tempo</button>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-outline_variant/10">
                <span className="text-sm font-medium text-on_surface">Total registrado</span>
                <span className="text-sm font-semibold text-primary">{formatSeconds(task?.total_time_seconds || 0)}</span>
              </div>

              {/* Entries */}
              {timeEntries.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-on_surface_variant mb-2">Registros</p>
                  <div className="space-y-1.5">
                    {timeEntries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-DEFAULT bg-surface_container_low group">
                        <div>
                          <span className="text-sm font-medium text-on_surface">{formatSeconds(entry.seconds)}</span>
                          {entry.note && <span className="text-xs text-on_surface_variant ml-2">{entry.note}</span>}
                          <p className="text-[10px] text-on_surface_variant/60 mt-0.5">{new Date(entry.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                        <button onClick={() => handleDeleteTimeEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
