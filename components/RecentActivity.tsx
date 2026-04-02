"use client";
import { Task } from "@/types";
import { Calendar, CheckCircle, MessageSquare, Upload } from "lucide-react";

interface Activity {
  id: string;
  type: "task_completed" | "comment" | "document_uploaded" | "task_created";
  user: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface Props {
  tasks: Task[];
  documents?: Array<{ name: string; uploadedAt: string }>;
}

export default function RecentActivity({ tasks, documents = [] }: Props) {
  const getActivities = (): Activity[] => {
    const activities: Activity[] = [];

    // Add completed tasks
    tasks
      .filter(t => t.status === "done")
      .slice(0, 3)
      .forEach(task => {
        activities.push({
          id: task.id,
          type: "task_completed",
          user: "Você",
          description: `Completou a tarefa ${task.title}`,
          timestamp: new Date(task.updated_at).toLocaleDateString("pt-BR"),
          icon: <CheckCircle size={16} className="text-emerald-500" />,
        });
      });

    // Add documents
    documents.slice(0, 2).forEach((doc, idx) => {
      activities.push({
        id: `doc-${idx}`,
        type: "document_uploaded",
        user: "Você",
        description: `Enviou ${doc.name}`,
        timestamp: doc.uploadedAt,
        icon: <Upload size={16} className="text-blue-500" />,
      });
    });

    return activities.slice(0, 5);
  };

  const activities = getActivities();

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-sm text-on_surface_variant text-center py-6">
          Nenhuma atividade recente
        </p>
      ) : (
        activities.map(activity => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-surface_container_low/50 hover:bg-surface_container_low transition-colors"
          >
            <div className="flex-shrink-0 mt-1">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on_surface">
                {activity.description}
              </p>
              <p className="text-xs text-on_surface_variant mt-0.5">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
