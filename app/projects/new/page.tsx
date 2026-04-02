"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { createProject } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("O nome do projeto é obrigatório."); return; }
    setSaving(true);
    const project = createProject({ name: name.trim(), description: description.trim() || undefined, start_date: startDate || undefined, end_date: endDate || undefined });
    router.push(`/projects/${project.id}`);
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-xl mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-2 text-on_surface_variant hover:text-on_surface text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-3xl font-semibold text-on_surface tracking-tight mb-8">Novo Projeto</h1>

        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-on_surface mb-2">Nome do Projeto <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: API de Pagamentos v2" className="input-field focus-pulse" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on_surface mb-2">Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o objetivo deste projeto..." rows={3} className="input-field focus-pulse resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on_surface mb-2">Início</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field focus-pulse" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on_surface mb-2">Prazo</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field focus-pulse" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Criando..." : "Criar Projeto"}</button>
            <Link href="/projects" className="btn-ghost">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
