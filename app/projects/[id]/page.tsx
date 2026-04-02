"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskModal from "@/components/kanban/TaskModal";
import { getProjectById, getTasksByProject, getProjectsWithProgress } from "@/lib/store";
import { Project, Task, ProjectWithProgress } from "@/types";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    const p = getProjectById(id);
    if (!p) { router.push("/projects"); return; }
    const ps = getProjectsWithProgress();
    const pw = ps.find(x => x.id === id);
    setProject(pw || { ...p, progress: 0, total_tasks: 0, done_tasks: 0 });
    setTasks(getTasksByProject(id));
    setLoading(false);
  }, [id, router]);

  useEffect(() => { reload(); }, [reload]);

  function handleAddTask(status: Task["status"]) {
    setNewTaskStatus(status);
    setSelectedTask(null);
    setShowNewTask(true);
  }

  function handleTaskClick(task: Task) {
    setSelectedTask(task);
    setShowNewTask(false);
  }

  function handleModalClose() {
    setShowNewTask(false);
    setSelectedTask(null);
    reload();
  }

  if (loading) return <AppLayout><div className="p-8 animate-pulse" /></AppLayout>;
  if (!project) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-outline_variant/10 bg-white">
          <div className="flex items-start justify-between max-w-full">
            <div className="flex items-start gap-4">
              <Link href="/projects" className="p-2 rounded-DEFAULT hover:bg-surface_container_low text-on_surface_variant transition-colors mt-0.5">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-on_surface tracking-tight">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-on_surface_variant mt-1 leading-airy">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 bg-surface_container_low rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs text-on_surface_variant">{project.progress}% concluído</span>
                  </div>
                  <span className="text-xs text-on_surface_variant">{project.done_tasks}/{project.total_tasks} tarefas</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/projects/${id}/edit`} className="btn-ghost flex items-center gap-2">
                <Pencil size={14} /> Editar
              </Link>
              <button onClick={() => handleAddTask("todo")} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> Nova Tarefa
              </button>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard
            projectId={id}
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onReload={reload}
          />
        </div>
      </div>

      {/* Modal */}
      {(showNewTask || selectedTask) && (
        <TaskModal
          projectId={id}
          task={selectedTask}
          defaultStatus={newTaskStatus}
          onClose={handleModalClose}
        />
      )}
    </AppLayout>
  );
}
