export type Priority = "do_now" | "schedule" | "delegate" | "eliminate";
export type TaskStatus = "todo" | "doing" | "done";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  notes: string | null;
  status: TaskStatus;
  is_urgent: boolean;
  is_important: boolean;
  priority: Priority;
  category_id: string;
  category?: Category;
  total_time_seconds: number;
  position: number;
  created_at: string;
  updated_at: string;
  checklist_items?: ChecklistItem[];
  time_entries?: TimeEntry[];
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  text: string;
  is_done: boolean;
  position: number;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  seconds: number;
  note: string | null;
  created_at: string;
}

export interface ProjectWithProgress extends Project {
  progress: number;
  total_tasks: number;
  done_tasks: number;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  size: string;
  type: string;
  data: string;
  created_at: string;
}
