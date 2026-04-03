"use client";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getReportData, getProjects, getTasks } from "@/lib/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, Clock, CheckSquare, FolderOpen, Zap, Share2, Target, Sparkles, CircleDot } from "lucide-react";
import { formatSecondsLong } from "@/lib/utils";

const heatmapColors = ["bg-slate-100", "bg-slate-300", "bg-indigo-100", "bg-indigo-300", "bg-indigo-500", "bg-indigo-700"];

function getHeatmapIntensity(index: number, total: number) {
  if (total === 0) return 0;
  const ratio = index / total;
  if (ratio < 0.15) return 1;
  if (ratio < 0.35) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.85) return 4;
  return 5;
}

function buildAnnualGrid(rawValue: number) {
  const cells = [];
  const filledCells = Math.min(364, Math.max(12, Math.round(rawValue / 3600) * 8));
  for (let i = 0; i < 364; i++) {
    const intensity = getHeatmapIntensity(i < filledCells ? i : 0, filledCells || 1);
    cells.push({ key: i, intensity });
  }
  return cells;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<{ timeByCat: any[]; doneTasksByCat: any[] }>({ timeByCat: [], doneTasksByCat: [] });
  const [totalTime, setTotalTime] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    const source = getReportData();
    setReportData(source);
    setTotalTime(source.timeByCat.reduce((acc, cur) => acc + cur.seconds, 0));
    setTotalProjects(getProjects().length);
  }, []);

  const allTasks = getTasks();
  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
  const focusHours = Math.round(totalTime / 3600);
  const taskFlow = allTasks.length > 0 ? Math.round((allTasks.filter((t) => t.status === "todo").length / allTasks.length) * 100) : 0;

  const topCategories = reportData.timeByCat
    .slice()
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 4);

  const annualGrid = useMemo(() => buildAnnualGrid(totalTime), [totalTime]);
  const timeDistribution = reportData.timeByCat.length
    ? reportData.timeByCat.map((item) => ({ name: item.name, value: Math.round(item.seconds / 3600 * 10) / 10, color: item.color }))
    : [{ name: "Sem dados", value: 1, color: "#CBD5E1" }];

  const efficiencyLabel = taskCompletionRate > 80 ? "Excellent" : taskCompletionRate > 60 ? "Good" : "Needs focus";

  const cardItems = [
    { icon: Clock, title: "Focus Hours", value: `${focusHours}h`, trend: "+12%", color: "text-indigo-600" },
    { icon: Zap, title: "Efficiency", value: `${taskCompletionRate}%`, trend: "Optimal", color: "text-emerald-600" },
    { icon: Share2, title: "Task Flow", value: `${taskFlow}%`, trend: "Stable", color: "text-violet-600" },
    { icon: Target, title: "Deep Work", value: `${Math.min(99, Math.round((focusHours / 20) * 100))}%`, trend: "High", color: "text-sky-600" },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-on_surface_variant">Analytics Central</p>
            <h1 className="text-3xl font-bold tracking-tight">Live Sync</h1>
          </div>
          <span className="rounded-full bg-emerald-500/10 text-emerald-600 text-xs px-3 py-1 font-semibold">LIVE SYNC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {cardItems.map(({ icon: Icon, title, value, trend, color }) => (
            <div key={title} className="surface-card p-5 border border-slate-200/70">
              <div className="flex items-center justify-between mb-4">
                <Icon size={18} className={color} />
                <span className="text-xs text-on_surface_variant">{title}</span>
              </div>
              <h3 className="text-2xl font-semibold text-on_surface">{value}</h3>
              <p className="text-xs text-on_surface_variant mt-1">{trend}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 surface-card p-5 border border-slate-200/70">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Annual Density</h2>
              <span className="text-xs text-on_surface_variant">Activity intensity mapped across the current calendar year</span>
            </div>
            <div className="overflow-hidden rounded-xl bg-slate-50 p-4">
              <div className="grid grid-cols-52 grid-rows-7 gap-1">
                {annualGrid.map((cell) => (
                  <div
                    key={cell.key}
                    className={`${heatmapColors[cell.intensity]} h-2 w-2 rounded-sm`}
                    title={`Density ${cell.intensity}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card p-5 border border-slate-200/70">
            <h2 className="text-lg font-semibold mb-2">Time Distribution</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={timeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {timeDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {timeDistribution.slice(0, 4).map((slice) => (
                <div key={slice.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span>{slice.name}</span>
                  </div>
                  <span>{slice.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-card p-6 border border-slate-200/70 mb-8 bg-gradient-to-r from-indigo-50 via-white to-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                <CircleDot size={12} /> Weekly Focus Insight
              </div>
              <h3 className="mt-3 text-xl font-bold">Your peak productivity window has shifted 45 minutes earlier this week.</h3>
              <p className="mt-2 text-sm text-on_surface_variant">We’ve noticed a 23% increase in completed tasks when starting before 9:00 AM.</p>
            </div>
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Optimize my schedule</button>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Productivity Clusters</h2>
          <button className="text-sm font-medium text-blue-600">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCategories.map((cluster) => (
            <div key={cluster.name} className="surface-card p-4 border border-slate-200/70">
              <div className="flex items-center justify-between mb-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cluster.color }} />
                <span className="text-xs text-on_surface_variant">{Math.round((cluster.seconds / totalTime) * 100)}%</span>
              </div>
              <h3 className="text-sm font-semibold">{cluster.name}</h3>
              <p className="text-xs text-on_surface_variant mt-1">{Math.round(cluster.seconds / 3600 * 10) / 10}h</p>
            </div>
          ))}
          {topCategories.length === 0 && (
            <div className="surface-card p-4 text-center text-on_surface_variant">Sem dados disponíveis ainda.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
