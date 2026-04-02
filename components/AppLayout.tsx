"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, BarChart3, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/reports", icon: BarChart3, label: "Relatórios" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white shadow-glass flex flex-col py-8 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-8 h-8 rounded-DEFAULT bg-gradient-to-br from-primary to-primary_container flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-on_surface tracking-tight">Personal PM</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary_fixed text-primary"
                    : "text-on_surface_variant hover:bg-surface_container_low hover:text-on_surface"
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="text-xs text-on_surface_variant/50 px-3">v2.0 MVP</p>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
