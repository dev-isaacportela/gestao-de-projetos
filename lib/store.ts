"use client";
import { Project, Task, Category, ChecklistItem, TimeEntry, ProjectWithProgress, Document } from "@/types";
import { getPriority } from "./utils";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

// ── Storage helpers ────────────────────────────────────────────────────────
function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Categories ─────────────────────────────────────────────────────────────
export function getCategories(): Category[] {
  const cats = get<Category[]>("ppm_categories", []);
  if (cats.length === 0) {
    // seed defaults
    const defaults: Category[] = [
      { id: uid(), user_id: "local", name: "Desenvolvimento Backend", color: "#1b31e7", created_at: now() },
      { id: uid(), user_id: "local", name: "Desenvolvimento Frontend", color: "#3e51ff", created_at: now() },
      { id: uid(), user_id: "local", name: "Reunião", color: "#00ccf9", created_at: now() },
      { id: uid(), user_id: "local", name: "Planejamento", color: "#7c3aed", created_at: now() },
      { id: uid(), user_id: "local", name: "Revisão / QA", color: "#059669", created_at: now() },
    ];
    set("ppm_categories", defaults);
    return defaults;
  }
  return cats;
}

export function createCategory(name: string, color: string): Category {
  const cats = getCategories();
  const cat: Category = { id: uid(), user_id: "local", name, color, created_at: now() };
  set("ppm_categories", [...cats, cat]);
  return cat;
}

export function updateCategory(id: string, name: string, color: string): void {
  const cats = getCategories().map(c => c.id === id ? { ...c, name, color } : c);
  set("ppm_categories", cats);
  // update tasks that use this category (name is just for display via join)
}

export function deleteCategory(id: string): void {
  const cats = getCategories().filter(c => c.id !== id);
  set("ppm_categories", cats);
}

// ── Projects ───────────────────────────────────────────────────────────────
export function getProjects(): Project[] {
  return get<Project[]>("ppm_projects", []);
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function createProject(data: { name: string; description?: string; start_date?: string; end_date?: string }): Project {
  const projects = getProjects();
  const project: Project = {
    id: uid(),
    user_id: "local",
    name: data.name,
    description: data.description || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    created_at: now(),
    updated_at: now(),
  };
  set("ppm_projects", [...projects, project]);
  return project;
}

export function updateProject(id: string, data: Partial<Project>): void {
  const projects = getProjects().map(p => p.id === id ? { ...p, ...data, updated_at: now() } : p);
  set("ppm_projects", projects);
}

export function deleteProject(id: string): void {
  set("ppm_projects", getProjects().filter(p => p.id !== id));
  // cascade delete tasks
  const tasks = getTasks().filter(t => t.project_id !== id);
  set("ppm_tasks", tasks);
  // cascade delete checklist + time entries
  const taskIds = getTasks().filter(t => t.project_id === id).map(t => t.id);
  set("ppm_checklist", getChecklistItems().filter(c => !taskIds.includes(c.task_id)));
  set("ppm_time_entries", getTimeEntries().filter(e => !taskIds.includes(e.task_id)));
}

export function getProjectsWithProgress(): ProjectWithProgress[] {
  const projects = getProjects();
  const tasks = getTasks();
  return projects.map(p => {
    const ptasks = tasks.filter(t => t.project_id === p.id);
    const done = ptasks.filter(t => t.status === "done").length;
    const total = ptasks.length;
    return { ...p, progress: total > 0 ? Math.round((done / total) * 100) : 0, total_tasks: total, done_tasks: done };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export function getTasks(): Task[] {
  return get<Task[]>("ppm_tasks", []);
}

export function getTasksByProject(projectId: string): Task[] {
  const tasks = getTasks().filter(t => t.project_id === projectId);
  const cats = getCategories();
  const entries = getTimeEntries();
  return tasks.map(t => ({
    ...t,
    category: cats.find(c => c.id === t.category_id),
    checklist_items: getChecklistItems().filter(c => c.task_id === t.id).sort((a, b) => a.position - b.position),
    time_entries: entries.filter(e => e.task_id === t.id),
  })).sort((a, b) => a.position - b.position);
}

export function getTaskById(id: string): Task | undefined {
  const t = getTasks().find(t => t.id === id);
  if (!t) return undefined;
  const cats = getCategories();
  return {
    ...t,
    category: cats.find(c => c.id === t.category_id),
    checklist_items: getChecklistItems().filter(c => c.task_id === t.id).sort((a, b) => a.position - b.position),
    time_entries: getTimeEntries().filter(e => e.task_id === t.id),
  };
}

export function createTask(data: {
  project_id: string;
  title: string;
  notes?: string;
  is_urgent: boolean;
  is_important: boolean;
  category_id: string;
}): Task {
  const tasks = getTasks();
  const priority = getPriority(data.is_urgent, data.is_important);
  const posInStatus = tasks.filter(t => t.project_id === data.project_id && t.status === "todo").length;
  const task: Task = {
    id: uid(),
    project_id: data.project_id,
    user_id: "local",
    title: data.title,
    notes: data.notes || null,
    status: "todo",
    is_urgent: data.is_urgent,
    is_important: data.is_important,
    priority,
    category_id: data.category_id,
    total_time_seconds: 0,
    position: posInStatus,
    created_at: now(),
    updated_at: now(),
  };
  set("ppm_tasks", [...tasks, task]);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): void {
  const tasks = getTasks().map(t => {
    if (t.id !== id) return t;
    const updated = { ...t, ...data, updated_at: now() };
    if (data.is_urgent !== undefined || data.is_important !== undefined) {
      updated.priority = getPriority(
        data.is_urgent !== undefined ? data.is_urgent : t.is_urgent,
        data.is_important !== undefined ? data.is_important : t.is_important,
      );
    }
    return updated;
  });
  set("ppm_tasks", tasks);
}

export function updateTaskStatus(taskId: string, newStatus: Task["status"]): void {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  const posInNewStatus = tasks.filter(t => t.project_id === task.project_id && t.status === newStatus).length;
  set("ppm_tasks", tasks.map(t => t.id === taskId ? { ...t, status: newStatus, position: posInNewStatus, updated_at: now() } : t));
}

export function deleteTask(id: string): void {
  set("ppm_tasks", getTasks().filter(t => t.id !== id));
  set("ppm_checklist", getChecklistItems().filter(c => c.task_id !== id));
  set("ppm_time_entries", getTimeEntries().filter(e => e.task_id !== id));
}

export function addTimeToTask(taskId: string, seconds: number): void {
  const tasks = getTasks().map(t => t.id === taskId ? { ...t, total_time_seconds: t.total_time_seconds + seconds, updated_at: now() } : t);
  set("ppm_tasks", tasks);
}

// ── Checklist ──────────────────────────────────────────────────────────────
export function getChecklistItems(): ChecklistItem[] {
  return get<ChecklistItem[]>("ppm_checklist", []);
}

export function addChecklistItem(taskId: string, text: string): ChecklistItem {
  const items = getChecklistItems();
  const pos = items.filter(i => i.task_id === taskId).length;
  const item: ChecklistItem = { id: uid(), task_id: taskId, text, is_done: false, position: pos, created_at: now() };
  set("ppm_checklist", [...items, item]);
  return item;
}

export function toggleChecklistItem(id: string): void {
  set("ppm_checklist", getChecklistItems().map(i => i.id === id ? { ...i, is_done: !i.is_done } : i));
}

export function deleteChecklistItem(id: string): void {
  set("ppm_checklist", getChecklistItems().filter(i => i.id !== id));
}

// ── Time Entries ───────────────────────────────────────────────────────────
export function getTimeEntries(): TimeEntry[] {
  return get<TimeEntry[]>("ppm_time_entries", []);
}

export function addTimeEntry(taskId: string, seconds: number, note?: string): TimeEntry {
  const entries = getTimeEntries();
  const entry: TimeEntry = { id: uid(), task_id: taskId, user_id: "local", seconds, note: note || null, created_at: now() };
  set("ppm_time_entries", [...entries, entry]);
  addTimeToTask(taskId, seconds);
  return entry;
}

export function deleteTimeEntry(id: string): void {
  const entries = getTimeEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  set("ppm_time_entries", entries.filter(e => e.id !== id));
  // subtract from task total
  const tasks = getTasks().map(t => t.id === entry.task_id ? { ...t, total_time_seconds: Math.max(0, t.total_time_seconds - entry.seconds) } : t);
  set("ppm_tasks", tasks);
}

// ── Reports ────────────────────────────────────────────────────────────────
export function getReportData() {
  const tasks = getTasks();
  const cats = getCategories();
  const entries = getTimeEntries();

  // time by category
  const timeByCat = cats.map(cat => {
    const catTaskIds = tasks.filter(t => t.category_id === cat.id).map(t => t.id);
    const secs = entries.filter(e => catTaskIds.includes(e.task_id)).reduce((a, e) => a + e.seconds, 0);
    return { name: cat.name, color: cat.color, seconds: secs, hours: Math.round(secs / 360) / 10 };
  }).filter(c => c.seconds > 0);

  // done tasks by category
  const doneTasksByCat = cats.map(cat => {
    const done = tasks.filter(t => t.category_id === cat.id && t.status === "done").length;
    return { name: cat.name, color: cat.color, count: done };
  }).filter(c => c.count > 0);

  return { timeByCat, doneTasksByCat };
}

// ── Documents ──────────────────────────────────────────────────────────────

export function getDocuments(projectId: string): Document[] {
  return get<Document[]>("ppm_documents", []).filter(d => d.project_id === projectId);
}

export function addDocument(projectId: string, name: string, size: string, type: string, data: string): Document {
  const docs = get<Document[]>("ppm_documents", []);
  const doc: Document = { id: uid(), project_id: projectId, name, size, type, data, created_at: now() };
  set("ppm_documents", [...docs, doc]);
  return doc;
}

export function deleteDocument(id: string): void {
  set("ppm_documents", get<Document[]>("ppm_documents", []).filter(d => d.id !== id));
}

// ── Notes ─────────────────────────────────────────────────────────────────
export function getProjectNotes(projectId: string): string {
  return get<string>(`ppm_notes_${projectId}`, "");
}

export function saveProjectNotes(projectId: string, notes: string): void {
  set(`ppm_notes_${projectId}`, notes);
}
