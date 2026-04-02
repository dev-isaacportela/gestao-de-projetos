"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, TrendingUp, Clock, CheckSquare, FolderOpen } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { getProjectsWithProgress, getTasks, getTimeEntries } from "@/lib/store";
import { ProjectWithProgress } from "@/types";
import { formatSecondsLong } from "@/lib/utils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [doneTasks, setDoneTasks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ps = getProjectsWithProgress();
    const tasks = getTasks();
    const entries = getTimeEntries();
    setProjects(ps);
    setTotalTime(entries.reduce((a, e) => a + e.seconds, 0));
    setDoneTasks(tasks.filter(t => t.status === "done").length);
    setLoading(false);
  }, []);

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    { label: "Projetos Ativos", value: projects.length, icon: FolderOpen, color: "text-primary" },
    { label: "Tarefas Concluídas", value: doneTasks, icon: CheckSquare, color: "text-green-600" },
    { label: "Tempo Total", value: formatSecondsLong(totalTime), icon: Clock, color: "text-blue-600" },
    { label: "Progresso Médio", value: `${avgProgress}%`, icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-on_surface_variant text-sm mb-1">Bem-vindo de volta</p>
            <h1 className="text-3xl font-semibold text-on_surface tracking-tight">Dashboard</h1>
          </div>
          <Link href="/projects/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Novo Projeto
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="surface-card p-5">
              <div className={`${s.color} mb-3`}><s.icon size={22} strokeWidth={1.75} /></div>
              <p className="text-2xl font-semibold text-on_surface tracking-tight">{s.value}</p>
              <p className="text-xs text-on_surface_variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-on_surface mb-4 tracking-tight">Projetos Recentes</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="surface-card p-6 h-40 animate-pulse bg-surface_container_low" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <FolderOpen size={40} className="text-on_surface_variant/30 mx-auto mb-3" />
              <p className="text-on_surface_variant text-sm">Nenhum projeto ainda.</p>
              <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus size={14} /> Criar primeiro projeto
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="surface-card p-6 hover:shadow-glow transition-all duration-300 group cursor-pointer block">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-on_surface group-hover:text-primary transition-colors leading-tight">{project.name}</h3>
                    <span className="text-xs text-on_surface_variant bg-surface_container_low px-2 py-1 rounded-full ml-2 flex-shrink-0">{project.progress}%</span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-on_surface_variant mb-4 line-clamp-2 leading-airy">{project.description}</p>
                  )}
                  <div className="mt-auto">
                    <div className="h-1.5 bg-surface_container_low rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="text-xs text-on_surface_variant mt-2">{project.done_tasks} de {project.total_tasks} tarefas concluídas</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
