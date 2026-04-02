"use client";
import { useEffect, useRef, useState } from "react";
import { Task } from "@/types";
import { cn, getPriorityColor, getPriorityLabel, formatSeconds } from "@/lib/utils";
import { Clock, CheckSquare, Play, Pause } from "lucide-react";
import { addTimeEntry } from "@/lib/store";

interface Props {
  task: Task;
  isDragging: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onTimerChange?: (taskId: string, running: boolean) => void;
  onReload: () => void;
}

export default function TaskCard({
  task, isDragging, onClick, onDragStart, onDragEnd, onTimerChange, onReload,
}: Props) {
  const checklist = task.checklist_items || [];
  const done = checklist.filter(i => i.is_done).length;
  const checkProgress = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : null;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function handleToggleTimer(e: React.MouseEvent) {
    e.stopPropagation(); // don't open modal
    if (running) {
      // stop & save
      setRunning(false);
      onTimerChange?.(task.id, false);
      if (elapsed > 0) {
        addTimeEntry(task.id, elapsed);
        setElapsed(0);
        onReload();
      }
    } else {
      setRunning(true);
      onTimerChange?.(task.id, true);
    }
  }

  const totalDisplay = running
    ? task.total_time_seconds + elapsed
    : task.total_time_seconds;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "bg-white rounded-DEFAULT p-3.5 cursor-pointer shadow-glass group",
        "hover:shadow-glow transition-all duration-200 select-none",
        isDragging && "opacity-40 rotate-1 scale-105",
        running && "ring-2 ring-primary/40"
      )}
    >
      {/* Priority + Category */}
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
      <p className="text-sm font-medium text-on_surface leading-snug mb-3 group-hover:text-primary transition-colors">
        {task.title}
      </p>

      {/* Timer row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          {/* Live timer display */}
          <span className={cn(
            "flex items-center gap-1 text-[11px] font-mono transition-colors",
            running ? "text-primary font-semibold" : "text-on_surface_variant"
          )}>
            <Clock size={11} className={running ? "text-primary" : ""} />
            {formatSeconds(totalDisplay)}
          </span>

          {/* Checklist */}
          {checkProgress !== null && (
            <span className="flex items-center gap-1 text-[11px] text-on_surface_variant">
              <CheckSquare size={11} /> {done}/{checklist.length}
            </span>
          )}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={handleToggleTimer}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-150",
            running
              ? "bg-primary text-white shadow-glow scale-110"
              : "bg-surface_container_low text-on_surface_variant hover:bg-primary hover:text-white opacity-0 group-hover:opacity-100"
          )}
        >
          {running ? <Pause size={10} fill="white" /> : <Play size={10} />}
        </button>
      </div>

      {/* Checklist progress bar */}
      {checkProgress !== null && (
        <div className="mt-2 h-1 bg-surface_container_low rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-300"
            style={{ width: `${checkProgress}%` }}
          />
        </div>
      )}

      {/* Running indicator pulse */}
      {running && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary font-medium">Contando...</span>
        </div>
      )}
    </div>
  );
}
