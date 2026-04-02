"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";
import { getProjectById, getTasksByProject, getProjectsWithProgress } from "@/lib/store";
import { Task, ProjectWithProgress } from "@/types";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function KanbanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo");

  const reload = useCallback(() => {
    const p = getProjectById(id);
    if (!p) { router.push("/projects"); return; }
    const ps = getProjectsWithProgress();
    const pw = ps.find(x => x.id === id);
    setProject(pw || { ...p, progress: 0, total_tasks: 0, done_tasks: 0 });
    setTasks(getTasksByProject(id));
  }, [id, router]);

  useEffect(() => { reload(); }, [reload]);

  if (!project) return <AppLayout><div className="p-8" /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-outline_variant/10 px-6 py-3 flex items-center gap-2 text-sm">
          <Link href="/projects" className="text-on_surface_variant hover:text-on_surface transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Projetos
          </Link>
          <ChevronRight size={14} className="text-outline_variant" />
          <Link href={`/projects/${id}`} className="text-on_surface_variant hover:text-on_surface transition-colors">{project.name}</Link>
          <ChevronRight size={14} className="text-outline_variant" />
          <span className="text-on_surface font-medium">Kanban</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-surface_container_low rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-xs text-on_surface_variant">{project.progress}%</span>
            </div>
            <button onClick={() => { setNewTaskStatus("todo"); setSelectedTask(null); setShowNewTask(true); }}
              className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Nova Tarefa
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard
            projectId={id}
            tasks={tasks}
            onTaskClick={t => { setSelectedTask(t); setShowNewTask(false); }}
            onAddTask={s => { setNewTaskStatus(s); setSelectedTask(null); setShowNewTask(true); }}
            onReload={reload}
          />
        </div>
      </div>

      {(showNewTask || selectedTask) && (
        <TaskModal
          projectId={id}
          task={selectedTask}
          defaultStatus={newTaskStatus}
          onClose={() => { setShowNewTask(false); setSelectedTask(null); reload(); }}
        />
      )}
    </AppLayout>
  );
}
