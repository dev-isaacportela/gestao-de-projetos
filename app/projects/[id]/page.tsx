"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import DocumentUploader from "@/components/DocumentUploader";
import RecentActivity from "@/components/RecentActivity";
import ProjectStats from "@/components/ProjectStats";
import ActiveTasks from "@/components/ActiveTasks";
import { getProjectById, getTasksByProject, getProjectsWithProgress } from "@/lib/store";
import { Task, ProjectWithProgress } from "@/types";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  if (loading) return <AppLayout><div className="p-8 animate-pulse" /></AppLayout>;
  if (!project) return null;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-outline_variant/10 bg-surface_container_lowest">
          <div className="flex items-start justify-between max-w-full">
            <div className="flex items-start gap-4 flex-1">
              <Link href="/projects" className="p-2 rounded-DEFAULT hover:bg-surface_container_low text-on_surface_variant transition-colors mt-0.5">
                <ArrowLeft size={18} />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    EM PROGRESSO
                  </div>
                  <h1 className="text-2xl font-semibold text-on_surface tracking-tight">{project.name}</h1>
                </div>
                {project.description && (
                  <p className="text-sm text-on_surface_variant mt-2">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/projects/${id}/edit`} className="btn-ghost flex items-center gap-2">
                <Pencil size={14} /> Editar
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Stats */}
            <ProjectStats project={project} tasks={tasks} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Active Tasks & Documents */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Tasks Section */}
                <div className="bg-surface_container_lowest rounded-lg p-6 border border-outline_variant/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-on_surface">Tarefas Ativas</h2>
                    <span className="text-xs text-on_surface_variant">{tasks.filter(t => t.status !== "done").length} tarefas</span>
                  </div>
                  <ActiveTasks tasks={tasks} />
                </div>

                {/* Documents Section */}
                <div className="bg-surface_container_lowest rounded-lg p-6 border border-outline_variant/10">
                  <h2 className="text-lg font-semibold text-on_surface mb-4">Documentações</h2>
                  <DocumentUploader projectId={id} />
                </div>
              </div>

              {/* Right Column - Progress & Activity */}
              <div className="space-y-6">
                {/* Progress Circle */}
                <div className="bg-surface_container_lowest rounded-lg p-6 border border-outline_variant/10 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-surface_container"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${project.progress * 2.83} 283`}
                        className="text-primary transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-on_surface">{project.progress}%</p>
                      <p className="text-xs text-on_surface_variant">COMPLETO</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-surface_container_lowest rounded-lg p-6 border border-outline_variant/10">
                  <h2 className="text-lg font-semibold text-on_surface mb-4">Atividade Recente</h2>
                  <RecentActivity tasks={tasks} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
