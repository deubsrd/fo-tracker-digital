import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Trophy,
  FileBarChart,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Comando", icon: LayoutDashboard },
  { to: "/alunos", label: "Tropa", icon: Users },
  { to: "/fo-positivo", label: "FO+", icon: ShieldCheck },
  { to: "/fo-negativo", label: "FO-", icon: ShieldAlert },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b border-border bg-sidebar/95 backdrop-blur px-4 h-14 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil text-xs font-bold">
            CFC
          </div>
          <span className="font-stencil text-sm">CFC 2026</span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-2 rounded hover:bg-accent"
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-30 h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border p-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded bg-gradient-gold grid place-items-center text-gold-foreground font-stencil font-bold shadow-gold">
                CFC
              </div>
              <div>
                <div className="font-stencil text-sm text-gold">CFC 2026</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Exército Brasileiro
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/20 text-foreground border-l-2 border-gold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="font-stencil tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 rounded bg-sidebar-accent/60 px-3 py-2.5">
              <div className="size-9 rounded-full bg-primary grid place-items-center text-primary-foreground font-bold text-sm">
                {user?.nome?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user?.nome}</div>
                <div className="text-[10px] uppercase tracking-widest text-gold">
                  {user?.patente}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                aria-label="Sair"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
