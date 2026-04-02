"use client";
import { ProjectWithProgress, Task } from "@/types";
import { Clock, ListTodo, CheckCircle, Users } from "lucide-react";

interface Props {
  project: ProjectWithProgress;
  tasks: Task[];
}

export default function ProjectStats({ project, tasks }: Props) {
  const totalHours = Math.round(
    tasks.reduce((sum, t) => sum + t.total_time_seconds, 0) / 3600
  );
  const tasksInProgress = tasks.filter(t => t.status === "doing").length;
  const activeTasks = tasks.filter(t => t.status !== "done");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Hours */}
      <div className="bg-surface_container_low rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-on_surface_variant mb-2">Total de Horas</p>
            <p className="text-2xl font-semibold text-on_surface">{totalHours}h</p>
            <p className="text-xs text-on_surface_variant mt-2">
              {tasks.filter(t => t.total_time_seconds > 0).length} tarefas com tempo
            </p>
          </div>
          <Clock className="w-5 h-5 text-primary/60" />
        </div>
      </div>

      {/* Tasks Progress */}
      <div className="bg-surface_container_low rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-on_surface_variant mb-2">Progresso das Tarefas</p>
            <p className="text-2xl font-semibold text-on_surface">
              {project.done_tasks}/{project.total_tasks}
            </p>
            <p className="text-xs text-on_surface_variant mt-2">
              {project.progress}% concluído
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500/60" />
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-surface_container_low rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-on_surface_variant mb-2">Em Progresso</p>
            <p className="text-2xl font-semibold text-on_surface">{tasksInProgress}</p>
            <p className="text-xs text-on_surface_variant mt-2">
              {activeTasks.length} tarefas ativas
            </p>
          </div>
          <ListTodo className="w-5 h-5 text-primary/60" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="bg-surface_container_low rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-on_surface_variant mb-2">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-on_surface">Em Andamento</p>
            </div>
            <p className="text-xs text-on_surface_variant mt-2">
              Começado há {Math.floor(Math.random() * 30) + 1} dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
