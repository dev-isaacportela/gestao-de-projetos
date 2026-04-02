"use client";
import { Task } from "@/types";
import { cn, getPriorityColor, getPriorityLabel, formatSeconds } from "@/lib/utils";
import { Clock, CheckSquare } from "lucide-react";

interface Props {
  task: Task;
  isDragging: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function TaskCard({ task, isDragging, onClick, onDragStart, onDragEnd }: Props) {
  const checklist = task.checklist_items || [];
  const done = checklist.filter(i => i.is_done).length;
  const checkProgress = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "bg-white rounded-DEFAULT p-3.5 cursor-pointer shadow-glass group",
        "hover:shadow-glow transition-all duration-200 select-none",
        isDragging && "opacity-40 rotate-1 scale-105"
      )}
    >
      {/* Priority badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", getPriorityColor(task.priority))}>
          {getPriorityLabel(task.priority)}
        </span>
        {task.category && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: task.category.color + "cc" }}
          >
            {task.category.name}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-on_surface leading-snug mb-2 group-hover:text-primary transition-colors">
        {task.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2">
        {task.total_time_seconds > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-on_surface_variant">
            <Clock size={11} /> {formatSeconds(task.total_time_seconds)}
          </span>
        )}
        {checkProgress !== null && (
          <span className="flex items-center gap-1 text-[11px] text-on_surface_variant">
            <CheckSquare size={11} /> {done}/{checklist.length}
          </span>
        )}
      </div>

      {/* Checklist progress */}
      {checkProgress !== null && (
        <div className="mt-2 h-1 bg-surface_container_low rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-300"
            style={{ width: `${checkProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
