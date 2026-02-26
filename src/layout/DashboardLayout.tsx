import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import {
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Star,
  LeafyGreen,
  Package2,
  Menu,
  LogOut,
  Info,
  MapPinned,
  LogIn,
  X,
} from "lucide-react";
import UserAvatar from "../components/ui/UserAvatar";

type DashboardLayoutProps = {
  title?: string;
  children: React.ReactNode;
};

type SidebarContentProps = {
  onNavigate?: () => void;
  collapsed?: boolean;
};

function SidebarContent({ onNavigate, collapsed }: SidebarContentProps) {
  const linkBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition";
  const linkActive = "bg-zinc-800 text-zinc-100";
  const linkInactive = "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100";
  const labelClass = collapsed ? "hidden" : "block";

  const tt = (label: string) => (collapsed ? label : undefined);

  return (
    <div className="h-full flex flex-col">
      {/* Branding / Logo */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <Link to="/dashboard" className="font-semibold text-zinc-100">
          Sleep
        </Link>
        {!collapsed && <p className="text-xs text-zinc-400 mt-1">Menu</p>}
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1">
        <NavLink
          to="/dashboard"
          end
          title={tt("Mapa")}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <MapPinned className="h-4 w-4" />
          <span className={labelClass}>Mapa</span>
        </NavLink>

        <NavLink
          to="/dashboard/banco"
          title={tt("Banco")}
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
          title={tt("Pokédex")}
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
          title={tt("Receitas")}
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
          title={tt("Ingredientes")}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <LeafyGreen className="h-4 w-4" />
          <span className={labelClass}>Ingredientes</span>
        </NavLink>

        <NavLink
          to="/dashboard/skills"
          title={tt("Skills")}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Star className="h-4 w-4" />
          <span className={labelClass}>Skills</span>
        </NavLink>

        <NavLink
          to="/sobre"
          title={tt("Sobre")}
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Info className="h-4 w-4" />
          <span className={labelClass}>Sobre</span>
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          title={tt("Settings")}
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
  const { user, signOut, profile, profileLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const expandedW = "lg:w-64";
  const collapsedW = "lg:w-20";
  const desktopSidebarWidth = collapsed ? collapsedW : expandedW;
  const desktopPaddingLeft = collapsed ? "lg:pl-20" : "lg:pl-64";

  const navigate = useNavigate();
  const location = useLocation();

  // trava scroll quando mobile drawer abre
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setTimeout(() => menuBtnRef.current?.focus(), 0);
  };

  // fecha no ESC (mobile)
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  if (profileLoading) return <p>Carregando perfil...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Backdrop mobile */}
      {mobileOpen && (
        <button
          title="Fechar menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeMobile}
          aria-label="Fechar menu"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-800 bg-zinc-950 lg:hidden transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="h-14 px-3 flex items-center justify-end border-b border-zinc-800">
          <Button
            variant="ghost"
            onClick={closeMobile}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <SidebarContent onNavigate={closeMobile} />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 ${desktopSidebarWidth} lg:block border-r border-zinc-800 bg-zinc-950 transition-[width] duration-200`}
      >
        <div className="h-14 px-3 flex items-center justify-end border-b border-zinc-800" />
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">
        <div
          className={`h-14 px-4 flex items-center justify-between ${desktopPaddingLeft}`}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
              className="hidden lg:inline-flex"
            >
              {collapsed ? (
                <ChevronRight className="hidden sm:flex h-4 w-4" />
              ) : (
                <ChevronLeft className="hidden sm:flex h-4 w-4" />
              )}
            </Button>

            <button
              ref={menuBtnRef}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-900 transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <h1 className="text-sm sm:text-base font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {user && profile ? (
              <>
                <UserAvatar size={36} />
                <div className="hidden sm:block text-right">
                  <p className="text-sm">{profile.display_name}</p>
                </div>
              </>
            ) : null}

            <Button
              onClick={async () => {
                try {
                  if (user) {
                    await signOut?.();
                    navigate("/sobre", { replace: true });
                  } else {
                    navigate("/login", {
                      state: { from: location.pathname },
                      replace: true,
                    });
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              variant="primary"
              className="w-auto h-10 px-4"
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </>
              )}
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