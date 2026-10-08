import { Link } from "@tanstack/react-router";
import { Route as RouteIcon, Briefcase, Settings, GraduationCap, Bell } from "lucide-react";
import type { ReactNode } from "react";
import { mockProfile } from "@/lib/mock-data";

const NAV = [
  { to: "/", label: "Mon parcours", icon: RouteIcon },
  { to: "/offres", label: "Offres", icon: Briefcase },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const initials = mockProfile.prenom[0] + mockProfile.nom[0];
  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Extranet CFA</p>
            <p className="text-xs text-muted-foreground">Portail apprenti</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{initials}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{mockProfile.prenom} {mockProfile.nom}</p>
            <p className="truncate text-xs text-muted-foreground">Candidat</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:px-8 md:py-4">
          <h1 className="text-lg font-bold md:text-xl">{title}</h1>
          <button aria-label="Notifications" className="relative grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
