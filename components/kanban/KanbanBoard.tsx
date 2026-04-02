"use client";
import { useState } from "react";
import { Task } from "@/types";
import { updateTaskStatus } from "@/lib/store";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";

const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "todo",  label: "A Fazer",  color: "bg-slate-400" },
  { id: "doing", label: "Fazendo",  color: "bg-primary" },
  { id: "done",  label: "Feita",    color: "bg-emerald-500" },
];

interface Props {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: Task["status"]) => void;
  onReload: () => void;
}

export default function KanbanBoard({ tasks, onTaskClick, onAddTask, onReload }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<Task["status"] | null>(null);

  function handleDragStart(e: React.DragEvent, taskId: string) {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, status: Task["status"]) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOver(status);
  }

  function handleDrop(e: React.DragEvent, status: Task["status"]) {
    e.preventDefault();
    if (dragging) {
      updateTaskStatus(dragging, status);
      onReload();
    }
    setDragging(null);
    setOver(null);
  }

  function handleDragEnd() {
    setDragging(null);
    setOver(null);
  }

  return (
    <div className="flex gap-5 h-full overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div
            key={col.id}
            className={cn(
              "flex flex-col flex-shrink-0 w-72 rounded-lg transition-all duration-200",
              over === col.id ? "ring-2 ring-primary/30 bg-primary_fixed/30" : "bg-surface_container_low"
            )}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={e => handleDrop(e, col.id)}
            onDragLeave={() => setOver(null)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", col.color)} />
                <span className="text-sm font-semibold text-on_surface">{col.label}</span>
                <span className="text-xs text-on_surface_variant bg-white px-1.5 py-0.5 rounded-full ml-1">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col.id)}
                className="p-1 rounded-DEFAULT hover:bg-white text-on_surface_variant hover:text-primary transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[120px]">
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={dragging === task.id}
                  onClick={() => onTaskClick(task)}
                  onDragStart={e => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {colTasks.length === 0 && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="w-full mt-1 py-4 rounded-DEFAULT border-2 border-dashed border-outline_variant/30 text-xs text-on_surface_variant/50 hover:border-primary/30 hover:text-primary/50 transition-all duration-200"
                >
                  + Adicionar tarefa
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
