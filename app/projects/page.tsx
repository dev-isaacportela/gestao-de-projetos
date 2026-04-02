"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FolderOpen, Trash2, Pencil } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { getProjectsWithProgress, deleteProject } from "@/lib/store";
import { ProjectWithProgress } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  function load() {
    setProjects(getProjectsWithProgress());
    setLoading(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir este projeto e todas as suas tarefas? Esta ação não pode ser desfeita.")) return;
    deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-on_surface_variant text-sm mb-1">Seus espaços de trabalho</p>
            <h1 className="text-3xl font-semibold text-on_surface tracking-tight">Projetos</h1>
          </div>
          <Link href="/projects/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Novo Projeto
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="surface-card p-6 h-20 animate-pulse bg-surface_container_low" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="surface-card p-16 text-center">
            <FolderOpen size={48} className="text-on_surface_variant/20 mx-auto mb-4" />
            <p className="text-on_surface_variant">Nenhum projeto criado ainda.</p>
            <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2 mt-5">
              <Plus size={14} /> Criar projeto
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="surface-card p-5 flex items-center gap-5 group hover:shadow-glow transition-all duration-200">
                <Link href={`/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-on_surface group-hover:text-primary transition-colors">{p.name}</h3>
                    <span className="text-xs text-on_surface_variant bg-surface_container_low px-2 py-0.5 rounded-full">{p.progress}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-surface_container_low rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary_container rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-on_surface_variant flex-shrink-0">{p.done_tasks}/{p.total_tasks} tarefas</span>
                  </div>
                </Link>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/projects/${p.id}/edit`} className="p-2 rounded-DEFAULT hover:bg-surface_container_low text-on_surface_variant hover:text-primary transition-colors">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-DEFAULT hover:bg-red-50 text-on_surface_variant hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
