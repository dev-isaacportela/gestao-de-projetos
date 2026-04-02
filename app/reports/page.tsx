"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getReportData, getProjects, getTasks } from "@/lib/store";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3, Clock, CheckSquare, FolderOpen } from "lucide-react";
import { formatSecondsLong } from "@/lib/utils";

export default function ReportsPage() {
  const [data, setData] = useState<{ timeByCat: any[]; doneTasksByCat: any[] }>({ timeByCat: [], doneTasksByCat: [] });
  const [totalTime, setTotalTime] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    const d = getReportData();
    setData(d);
    setTotalTime(d.timeByCat.reduce((a, c) => a + c.seconds, 0));
    setTotalDone(d.doneTasksByCat.reduce((a, c) => a + c.count, 0));
    setTotalProjects(getProjects().length);
  }, []);

  const hasTimeData = data.timeByCat.length > 0;
  const hasDoneData = data.doneTasksByCat.length > 0;

  const CustomTooltipTime = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white rounded-DEFAULT px-3 py-2 shadow-glass text-xs">
          <p className="font-medium text-on_surface">{payload[0].name}</p>
          <p className="text-on_surface_variant">{formatSecondsLong(payload[0].payload.seconds)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-on_surface_variant text-sm mb-1">Inteligência do seu trabalho</p>
          <h1 className="text-3xl font-semibold text-on_surface tracking-tight">Relatórios</h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="surface-card p-5">
            <FolderOpen size={20} className="text-primary mb-3" strokeWidth={1.75} />
            <p className="text-2xl font-semibold text-on_surface tracking-tight">{totalProjects}</p>
            <p className="text-xs text-on_surface_variant mt-1">Projetos</p>
          </div>
          <div className="surface-card p-5">
            <CheckSquare size={20} className="text-emerald-600 mb-3" strokeWidth={1.75} />
            <p className="text-2xl font-semibold text-on_surface tracking-tight">{totalDone}</p>
            <p className="text-xs text-on_surface_variant mt-1">Tarefas Concluídas</p>
          </div>
          <div className="surface-card p-5">
            <Clock size={20} className="text-blue-600 mb-3" strokeWidth={1.75} />
            <p className="text-2xl font-semibold text-on_surface tracking-tight">{formatSecondsLong(totalTime)}</p>
            <p className="text-xs text-on_surface_variant mt-1">Tempo Total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart - time by category */}
          <div className="surface-card p-6">
            <h2 className="text-sm font-semibold text-on_surface mb-5">Tempo por Categoria</h2>
            {hasTimeData ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.timeByCat} dataKey="seconds" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {data.timeByCat.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipTime />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-on_surface_variant/40">
                <BarChart3 size={36} strokeWidth={1} className="mb-2" />
                <p className="text-sm">Registre tempo em tarefas para ver dados aqui</p>
              </div>
            )}
          </div>

          {/* Bar chart - done tasks by category */}
          <div className="surface-card p-6">
            <h2 className="text-sm font-semibold text-on_surface mb-5">Tarefas Concluídas por Categoria</h2>
            {hasDoneData ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.doneTasksByCat} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#444556" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#444556" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "none", borderRadius: "1rem", boxShadow: "0 12px 40px rgba(25,28,30,0.08)", fontSize: 12 }}
                    cursor={{ fill: "#dfe0ff" }}
                  />
                  <Bar dataKey="count" name="Tarefas" radius={[8, 8, 0, 0]}>
                    {data.doneTasksByCat.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-on_surface_variant/40">
                <BarChart3 size={36} strokeWidth={1} className="mb-2" />
                <p className="text-sm">Conclua tarefas para ver dados aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
