import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import {
  Home,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Star,
  LeafyGreen,
  Package2
} from "lucide-react";

type DashboardLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

function SidebarContent({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const linkBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition";
  const linkActive = "bg-zinc-800 text-zinc-100";
  const linkInactive = "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100";
  const labelClass = collapsed ? "hidden" : "block";

  return (
    <div className="h-full flex flex-col">
      {/* Branding / Logo */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <Link to="/dashboard" className="font-semibold text-zinc-100">
          Sleep
        </Link>
        {!collapsed && <p className="text-xs text-zinc-400 mt-1">Dashboard</p>}
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1">
        <NavLink
          to="/dashboard"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Home className="h-4 w-4" />
          <span className={labelClass}>Home</span>
        </NavLink>
        <NavLink
          to="/dashboard/banco"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Package2 className="h-4 w-4" />
          <span className={labelClass}>Banco</span>
        </NavLink>
        <NavLink
          to="/dashboard/pokedex"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <BookOpen className="h-4 w-4" />
          <span className={labelClass}>Pokédex</span>
        </NavLink>
        <NavLink
          to="/dashboard/receitas"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <CookingPot className="h-4 w-4" />
          <span className={labelClass}>Receitas</span>
        </NavLink>
        <NavLink
          to="/dashboard/ingredientes"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <LeafyGreen  className="h-4 w-4" />
          <span className={labelClass}>Ingredientes</span>
        </NavLink>
        <NavLink
          to="/dashboard/skills"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Star className="h-4 w-4" />
          <span className={labelClass}>Skills</span>
        </NavLink>

        {/*Exemplo para criação de novos links*/}
        <NavLink
          to="/dashboard/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Settings className="h-4 w-4" />
          <span className={labelClass}>Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 py-4 border-t border-zinc-800 text-xs text-zinc-400">
        {collapsed ? (
          <span className="text-zinc-200">GIT</span>
        ) : (
          <>
            GIT: <span className="text-zinc-200">FilhoDeEmer</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  title = "Dashboard",
  children,
}: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const desktopSidebarWidth = collapsed ? "lg:w-20" : "lg:w-64";
  const desktopPaddingLeft = collapsed ? "lg:pl-20" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-10 overflow-x-hidden">
      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 ${desktopSidebarWidth} lg:block border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200`}
      >
        {/*Botão Colapsar*/}
        <div className="h-14 px-3 flex items-center justify-end border-b border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <SidebarContent collapsed={collapsed} />
      </aside>
      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 lg:hidden transform transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/*Topbar Full Width  */}

      {/* Main Content Area */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <div
          className={`h-14 px-4 flex items-center justify-between ${desktopPaddingLeft}`}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              ☰ {/*colocar icone*/}
            </button>

            <h1 className="text-sm sm:text-base font-semibold"> {title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-zinc-400">Logado como</p>
              <p className="text-sm">{user?.email}</p>
            </div>

            <Button
              onClick={() => signOut()}
              variant="primary"
              className="w-auto h-10 px-4"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>
      {/* Content */}
      <div className={desktopPaddingLeft}>
        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
