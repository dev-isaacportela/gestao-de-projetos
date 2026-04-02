import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPriority(isUrgent: boolean, isImportant: boolean): Priority {
  if (isUrgent && isImportant) return "do_now";
  if (!isUrgent && isImportant) return "schedule";
  if (isUrgent && !isImportant) return "delegate";
  return "eliminate";
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    do_now: "Fazer Agora",
    schedule: "Agendar",
    delegate: "Delegar",
    eliminate: "Eliminar / Adiar",
  };
  return labels[priority];
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    do_now: "bg-red-100 text-red-700",
    schedule: "bg-blue-100 text-blue-700",
    delegate: "bg-yellow-100 text-yellow-700",
    eliminate: "bg-gray-100 text-gray-500",
  };
  return colors[priority];
}

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatSecondsLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}
