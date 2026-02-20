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
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-linear-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* Coluna esquerda */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-10">
        <div className="max-w-lg text-zinc-300">
          {brandLeft ?? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">Sleep Calc</p>
              <h2 className="text-3x1  font-semibold text-zinc-100">
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
                Projeto independente, não afiliado à Pokémon Company, Nintendo ou Creatures Inc.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Coluna direita */}
      <div className="w-full max-w-xl flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl backdrop-blur p-6 sm:p-8">
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
