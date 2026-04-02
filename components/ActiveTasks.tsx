"use client";
import { Task } from "@/types";
import { Badge, ChevronRight, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function ActiveTasks({ tasks, onTaskClick }: Props) {
  const activeTasks = tasks.filter(t => t.status !== "done").slice(0, 5);

  const getPriorityColor = (isUrgent: boolean, isImportant: boolean) => {
    if (isUrgent && isImportant) return "bg-error/10 text-error";
    if (isUrgent) return "bg-warning/10 text-warning";
    if (isImportant) return "bg-primary/10 text-primary";
    return "bg-surface_container text-on_surface";
  };

  const getPriorityLabel = (isUrgent: boolean, isImportant: boolean) => {
    if (isUrgent && isImportant) return "Urgent & Important";
    if (isUrgent) return "Urgent";
    if (isImportant) return "Important";
    return "Normal";
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-slate-100 text-slate-700";
      case "doing":
        return "bg-blue-100 text-blue-700";
      case "done":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "A Fazer";
      case "doing":
        return "Em Progresso";
      case "done":
        return "Feita";
      default:
        return status;
    }
  };

  if (activeTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-on_surface_variant">Nenhuma tarefa ativa</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeTasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onTaskClick?.(task)}
          className="p-4 bg-white rounded-lg border border-outline_variant/20 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-on_surface text-sm leading-snug group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(task.is_urgent, task.is_important)}`}>
                  {task.is_urgent && task.is_important ? "🔴" : task.is_urgent ? "🟠" : task.is_important ? "🔵" : "⚪"}
                </span>
              </div>

              {/* Description */}
              {task.notes && (
                <p className="text-xs text-on_surface_variant line-clamp-1 mb-2">
                  {task.notes}
                </p>
              )}

              {/* Category and Status */}
              <div className="flex items-center gap-2 flex-wrap">
                {task.category && (
                  <span className="px-2 py-1 bg-surface_container rounded text-xs font-medium text-on_surface">
                    {task.category.name}
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight size={18} className="flex-shrink-0 text-on_surface_variant group-hover:text-primary transition-colors mt-1" />
          </div>
        </div>
      ))}

      {activeTasks.length > 0 && (
        <div className="pt-2">
          <button className="w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
            Ver todas as tarefas →
          </button>
        </div>
      )}
    </div>
  );
}
