"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  getProjectById, getProjectsWithProgress, getTasksByProject,
  getChecklistItems, toggleChecklistItem, addChecklistItem, deleteChecklistItem,
  getTimeEntries, addTimeEntry, deleteTimeEntry,
  getDocuments, addDocument, deleteDocument,
  getProjectNotes, saveProjectNotes,
  updateTaskStatus,
} from "@/lib/store";
import { Task, ProjectWithProgress, ChecklistItem, TimeEntry, Document } from "@/types";
import { cn, formatSeconds, getPriorityColor, getPriorityLabel } from "@/lib/utils";
import {
  ArrowLeft, Pencil, Plus, Play, Pause, RotateCcw,
  Check, Minus, Upload, Trash2, FileText, Clock,
  ChevronRight, LayoutKanban, X,
} from "lucide-react";

// ── Circular progress ──────────────────────────────────────────────────────
function CircularProgress({ value }: { value: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f2f4f6" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#pg)" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1b31e7" />
          <stop offset="100%" stopColor="#3e51ff" />
        </linearGradient>
      </defs>
      <text x="70" y="65" textAnchor="middle" className="text-xl font-bold" fill="#191c1e" fontSize="22" fontWeight="700">{value}%</text>
      <text x="70" y="83" textAnchor="middle" fill="#444556" fontSize="10" fontWeight="500">CONCLUÍDO</text>
    </svg>
  );
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<ProjectWithProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // Focus session timer (project-level)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<number>(0);

  // Checklist new item
  const [newCheckText, setNewCheckText] = useState("");

  // Manual time
  const [showManualTime, setShowManualTime] = useState(false);
  const [manualH, setManualH] = useState("");
  const [manualM, setManualM] = useState("");

  // Active tab for task list
  const [taskFilter, setTaskFilter] = useState<"all" | "todo" | "doing" | "done">("all");

  // Notes auto-save
  const notesTimer = useRef<NodeJS.Timeout | null>(null);

  const reload = useCallback(() => {
    const p = getProjectById(id);
    if (!p) { router.push("/projects"); return; }
    const ps = getProjectsWithProgress();
    const pw = ps.find(x => x.id === id);
    setProject(pw || { ...p, progress: 0, total_tasks: 0, done_tasks: 0 });
    setTasks(getTasksByProject(id));
    setDocs(getDocuments(id));
    setNotes(getProjectNotes(id));
    setLoading(false);
  }, [id, router]);

  useEffect(() => { reload(); }, [reload]);

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      startRef.current = Date.now() - timerElapsed * 1000;
      timerRef.current = setInterval(() => {
        setTimerElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  function handleStopTimer() {
    setTimerRunning(false);
    if (timerElapsed > 0 && selectedTaskId) {
      addTimeEntry(selectedTaskId, timerElapsed);
      setTimerElapsed(0);
      reload();
    }
  }

  function handleResetTimer() {
    setTimerRunning(false);
    setTimerElapsed(0);
  }

  function handleAddManualTime() {
    const taskId = selectedTaskId || tasks[0]?.id;
    if (!taskId) return;
    const secs = (parseInt(manualH || "0") * 3600) + (parseInt(manualM || "0") * 60);
    if (secs <= 0) return;
    addTimeEntry(taskId, secs, "Manual");
    setManualH(""); setManualM(""); setShowManualTime(false);
    reload();
  }

  function handleToggleChecklist(taskId: string, itemId: string) {
    toggleChecklistItem(itemId);
    reload();
  }

  function handleAddChecklist(taskId: string) {
    if (!newCheckText.trim()) return;
    addChecklistItem(taskId, newCheckText.trim());
    setNewCheckText("");
    reload();
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      const size = file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      addDocument(id, file.name, size, file.type, data);
      reload();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleNotesChange(val: string) {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => saveProjectNotes(id, val), 800);
  }

  function handleMoveTask(taskId: string, status: Task["status"]) {
    updateTaskStatus(taskId, status);
    reload();
  }

  // Time entries for selected task or all project tasks
  const allTimeEntries = tasks.flatMap(t => getTimeEntries().filter(e => e.task_id === t.id));
  const totalProjectTime = tasks.reduce((a, t) => a + t.total_time_seconds, 0);

  const filteredTasks = tasks.filter(t =>
    taskFilter === "all" ? true : t.status === taskFilter
  );

  // All checklist items across tasks (for the "focus" view — use first doing task)
  const focusTask = tasks.find(t => t.status === "doing") || tasks[0];
  const focusChecklist = focusTask?.checklist_items || [];
  const focusDone = focusChecklist.filter(i => i.is_done).length;

  // Recent time entries (last 5)
  const recentEntries = [...allTimeEntries]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  // Format timer display
  const hh = String(Math.floor(timerElapsed / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timerElapsed % 3600) / 60)).padStart(2, "0");
  const ss = String(timerElapsed % 60).padStart(2, "0");

  if (loading) return <AppLayout><div className="p-8" /></AppLayout>;
  if (!project) return null;

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto bg-surface">
        {/* ── Top bar ── */}
        <div className="bg-white border-b border-outline_variant/10 px-6 py-3 flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-on_surface_variant hover:text-on_surface transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Projetos
          </Link>
          <ChevronRight size={14} className="text-outline_variant" />
          <span className="text-on_surface font-medium">{project.name}</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href={`/projects/${id}/kanban`} className="btn-ghost flex items-center gap-1.5 text-xs py-1.5">
              <LayoutKanban size={14} /> Ver Kanban
            </Link>
            <Link href={`/projects/${id}/edit`} className="btn-ghost flex items-center gap-1.5 text-xs py-1.5">
              <Pencil size={14} /> Editar
            </Link>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* ── Hero row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* Project header card */}
            <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-glass">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full",
                      project.progress === 100 ? "bg-emerald-100 text-emerald-700" :
                      project.progress > 50 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {project.progress === 100 ? "✓ CONCLUÍDO" : project.progress > 50 ? "● EM ANDAMENTO" : "● INICIANDO"}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-on_surface tracking-tight mb-2">{project.name}</h1>
                  {project.description && (
                    <p className="text-on_surface_variant text-sm leading-airy max-w-lg">{project.description}</p>
                  )}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-on_surface">{formatSeconds(totalProjectTime)}</p>
                      <p className="text-xs text-on_surface_variant mt-0.5">Tempo Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-on_surface">{project.done_tasks}/{project.total_tasks}</p>
                      <p className="text-xs text-on_surface_variant mt-0.5">Tarefas Feitas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-on_surface">{tasks.filter(t => t.status === "doing").length}</p>
                      <p className="text-xs text-on_surface_variant mt-0.5">Em Progresso</p>
                    </div>
                  </div>
                </div>
                <CircularProgress value={project.progress} />
              </div>
            </div>

            {/* Focus Session Timer */}
            <div className="bg-white rounded-lg p-5 shadow-glass flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-primary tracking-widest uppercase">Focus Session</p>
                {selectedTaskId && (
                  <button onClick={() => setSelectedTaskId(null)} className="text-xs text-on_surface_variant hover:text-on_surface transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Task selector */}
              <select
                value={selectedTaskId || ""}
                onChange={e => setSelectedTaskId(e.target.value || null)}
                className="text-xs bg-surface_container_low rounded-DEFAULT px-2 py-1.5 text-on_surface_variant mb-3 outline-none w-full"
              >
                <option value="">Selecionar tarefa...</option>
                {tasks.filter(t => t.status !== "done").map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>

              {/* Big timer */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-4xl font-bold text-on_surface tracking-tight font-mono">
                  {hh}:{mm}:{ss}
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                {!timerRunning ? (
                  <button
                    onClick={() => setTimerRunning(true)}
                    disabled={!selectedTaskId}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Play size={15} fill="white" /> Iniciar
                  </button>
                ) : (
                  <button onClick={handleStopTimer} className="btn-primary flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600">
                    <Pause size={15} fill="white" /> Parar
                  </button>
                )}
                <button onClick={handleResetTimer} className="p-2.5 rounded-DEFAULT bg-surface_container_low hover:bg-surface_container_high text-on_surface_variant transition-colors">
                  <RotateCcw size={16} />
                </button>
              </div>

              <button onClick={() => setShowManualTime(!showManualTime)} className="text-xs text-primary hover:underline mt-3 text-center">
                + Adicionar Tempo Manual
              </button>

              {showManualTime && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <input type="number" min="0" value={manualH} onChange={e => setManualH(e.target.value)} placeholder="h" className="input-field text-sm text-center" />
                    <input type="number" min="0" max="59" value={manualM} onChange={e => setManualM(e.target.value)} placeholder="min" className="input-field text-sm text-center" />
                  </div>
                  <button onClick={handleAddManualTime} className="btn-primary w-full text-xs py-2">Salvar</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Main content + sidebar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT: Tasks + Notes */}
            <div className="lg:col-span-2 space-y-5">

              {/* Active Tasks */}
              <div className="bg-white rounded-lg shadow-glass">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline_variant/10">
                  <h2 className="font-semibold text-on_surface">Tarefas</h2>
                  <div className="flex items-center gap-1">
                    {(["all", "todo", "doing", "done"] as const).map(f => (
                      <button key={f} onClick={() => setTaskFilter(f)}
                        className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all",
                          taskFilter === f ? "bg-primary text-white" : "text-on_surface_variant hover:bg-surface_container_low"
                        )}>
                        {f === "all" ? "Todas" : f === "todo" ? "A Fazer" : f === "doing" ? "Fazendo" : "Feitas"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-outline_variant/5">
                  {filteredTasks.length === 0 ? (
                    <p className="text-center text-on_surface_variant text-sm py-8">Nenhuma tarefa</p>
                  ) : filteredTasks.map(task => (
                    <div key={task.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface_container_low/50 group transition-colors">
                      {/* Status dot */}
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                        task.status === "done" ? "bg-emerald-500" :
                        task.status === "doing" ? "bg-primary" : "bg-slate-300"
                      )} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("text-sm font-medium text-on_surface truncate",
                            task.status === "done" && "line-through text-on_surface_variant"
                          )}>{task.title}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0", getPriorityColor(task.priority))}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {task.category && (
                            <span className="text-[10px] text-on_surface_variant">{task.category.name}</span>
                          )}
                          {task.total_time_seconds > 0 && (
                            <span className="text-[10px] text-on_surface_variant flex items-center gap-1">
                              <Clock size={9} /> {formatSeconds(task.total_time_seconds)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick move */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== "todo" && (
                          <button onClick={() => handleMoveTask(task.id, "todo")}
                            className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            A Fazer
                          </button>
                        )}
                        {task.status !== "doing" && (
                          <button onClick={() => handleMoveTask(task.id, "doing")}
                            className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                            Fazendo
                          </button>
                        )}
                        {task.status !== "done" && (
                          <button onClick={() => handleMoveTask(task.id, "done")}
                            className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                            Feita
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Checklist (for the doing task) */}
              {focusTask && (
                <div className="bg-white rounded-lg shadow-glass">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-outline_variant/10">
                    <div>
                      <h2 className="font-semibold text-on_surface">Checklist</h2>
                      <p className="text-xs text-on_surface_variant mt-0.5">{focusTask.title}</p>
                    </div>
                    <span className="text-xs text-primary font-medium">{focusDone} de {focusChecklist.length} Concluídos</span>
                  </div>

                  <div className="p-4 space-y-2">
                    {focusChecklist.length === 0 && (
                      <p className="text-sm text-on_surface_variant/60 text-center py-4">Nenhum item ainda</p>
                    )}
                    {focusChecklist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-DEFAULT bg-surface_container_low group">
                        <button onClick={() => handleToggleChecklist(focusTask.id, item.id)}
                          className={cn("w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all",
                            item.is_done ? "bg-primary border-primary" : "border-outline_variant hover:border-primary"
                          )}>
                          {item.is_done && <Check size={11} className="text-white" />}
                        </button>
                        <span className={cn("flex-1 text-sm", item.is_done && "line-through text-on_surface_variant/50")}>
                          {item.text}
                        </span>
                        <button onClick={() => { deleteChecklistItem(item.id); reload(); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-all">
                          <Minus size={13} />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-3">
                      <input value={newCheckText} onChange={e => setNewCheckText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddChecklist(focusTask.id)}
                        placeholder="+ Adicionar subtarefa..." className="input-field text-sm flex-1" />
                      <button onClick={() => handleAddChecklist(focusTask.id)} className="btn-primary px-3">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Research Notes */}
              <div className="bg-white rounded-lg shadow-glass">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline_variant/10">
                  <h2 className="font-semibold text-on_surface">Notas do Projeto</h2>
                  <span className="text-xs text-on_surface_variant">Salvo automaticamente</span>
                </div>
                <div className="p-4">
                  <textarea
                    value={notes}
                    onChange={e => handleNotesChange(e.target.value)}
                    placeholder="Adicione notas, contexto, links, decisões importantes..."
                    rows={6}
                    className="w-full text-sm text-on_surface leading-airy bg-transparent outline-none resize-none placeholder:text-on_surface_variant/40"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Time Log + Resources */}
            <div className="space-y-5">

              {/* Time Log */}
              <div className="bg-white rounded-lg shadow-glass">
                <div className="px-5 py-4 border-b border-outline_variant/10">
                  <h2 className="font-semibold text-on_surface flex items-center gap-2">
                    <Clock size={15} className="text-primary" /> Time Log
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  {recentEntries.length === 0 ? (
                    <p className="text-sm text-on_surface_variant/60 text-center py-4">Nenhum registro ainda</p>
                  ) : recentEntries.map(entry => {
                    const task = tasks.find(t => t.id === entry.task_id);
                    const date = new Date(entry.created_at);
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <div key={entry.id} className="flex items-start justify-between group">
                        <div>
                          <p className="text-xs text-on_surface_variant/60 uppercase tracking-wide">
                            {isToday ? "HOJE" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                          </p>
                          <p className="text-sm text-on_surface mt-0.5 truncate max-w-[140px]">
                            {entry.note || task?.title || "Registro"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-primary">{formatSeconds(entry.seconds)}</span>
                          <button onClick={() => { deleteTimeEntry(entry.id); reload(); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-on_surface_variant hover:text-red-400 transition-all">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-outline_variant/10 flex items-center justify-between">
                    <span className="text-xs font-semibold text-on_surface_variant uppercase tracking-wide">Total Investido</span>
                    <span className="text-base font-bold text-primary">{formatSeconds(totalProjectTime)}</span>
                  </div>
                </div>
              </div>

              {/* Resources / Documents */}
              <div className="bg-white rounded-lg shadow-glass">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline_variant/10">
                  <h2 className="font-semibold text-on_surface">Recursos</h2>
                  <label className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 cursor-pointer">
                    <Upload size={13} /> Upload
                    <input type="file" className="hidden" onChange={handleUpload} />
                  </label>
                </div>

                <div className="p-4 space-y-2">
                  {docs.length === 0 ? (
                    <label className="flex flex-col items-center justify-center py-8 rounded-DEFAULT border-2 border-dashed border-outline_variant/30 cursor-pointer hover:border-primary/40 hover:bg-primary_fixed/20 transition-all group">
                      <Upload size={24} className="text-outline_variant group-hover:text-primary transition-colors mb-2" />
                      <p className="text-sm text-on_surface_variant group-hover:text-primary transition-colors">Solte arquivos aqui</p>
                      <p className="text-xs text-on_surface_variant/50 mt-1">PDF, Imagens, Docs...</p>
                      <input type="file" className="hidden" onChange={handleUpload} />
                    </label>
                  ) : (
                    <>
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-DEFAULT bg-surface_container_low group hover:bg-surface_container_high transition-colors">
                          <div className="w-8 h-8 rounded-DEFAULT bg-primary_fixed flex items-center justify-center flex-shrink-0">
                            <FileText size={15} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={doc.data} download={doc.name}
                              className="text-sm font-medium text-on_surface hover:text-primary transition-colors truncate block">
                              {doc.name}
                            </a>
                            <p className="text-xs text-on_surface_variant">{doc.size}</p>
                          </div>
                          <button onClick={() => { deleteDocument(doc.id); reload(); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <label className="flex items-center justify-center gap-2 py-2 text-xs text-primary hover:underline cursor-pointer mt-1">
                        <Plus size={12} /> Adicionar arquivo
                        <input type="file" className="hidden" onChange={handleUpload} />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
