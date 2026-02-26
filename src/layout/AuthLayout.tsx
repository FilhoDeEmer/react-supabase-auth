import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  brandLeft?: React.ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  brandLeft,
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen grid lg:grid-cols-2 bg-cover bg-center relative"
      style={{ backgroundImage: "url(/bg.jpg)" }}
    >
      {/* Overlay escuro */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/80 via-zinc-950/85 to-black/90 backdrop-blur-sm" />

      {/* Coluna esquerda */}
      <div className="hidden lg:flex items-center justify-center p-10 relative z-10">
        <div className="max-w-lg text-zinc-300">
          {brandLeft ?? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">Sleep Calc</p>

              <h2 className="text-3xl font-semibold text-zinc-100">
                Descubra o melhor time para cada ilha no Pokémon Sleep.
                Simulação baseada em:
              </h2>

              <ul className="space-y-2 text-sm text-zinc-400">
                <li>🍓 Berry favorita (×2)</li>
                <li>🏝️ Bônus percentual da ilha</li>
                <li>⏱️ Helps por dia efetivo</li>
                <li>⚡ Nature + Sub Skills</li>
                <li>📊 Força total estimada por dia</li>
              </ul>

              <p className="text-xs text-zinc-500 pt-4">
                Projeto independente, não afiliado à Pokémon Company, Nintendo
                ou Creatures Inc.
              </p>

              <div className="pt-6">
                <Button
                  variant="secondary"
                  className="w-auto h-10 px-4"
                  onClick={() => navigate("/dashboard/pokedex", { replace: true })}
                >
                  <span>Ver Pokédex</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coluna direita */}
      <div className="w-full flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
              )}
            </div>

            {children}
          </div>

          {footer && (
            <div className="mt-4 text-center text-sm text-zinc-400">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}