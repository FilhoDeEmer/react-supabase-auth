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
        <div className="min-h-screen bg-linear-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
            <div className="min-h-screen flex">
                {/* Coluna esquerda */}
                <div className="w-full max-w-xl flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        <div className="rouded-2x1 border border-zinc-800 bg-zinc-900/60 shadow-xl backdrop-blur p-6 sm:p-8">
                        <div className="mb-6">
                            <h1 className="text-2x1 font-semibold tracking-tight">{title}</h1>
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
                {/* Coluna direita */}
                <div className="hidden lg:flex flex-1 items-center justify-center p-10">
                    <div className="max-w-lg text-zinc-300">
                        {brandLeft ?? (
                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400">Bem-vindo</p>
                                <h2 className="text-3x1  font-semibold text-zinc-100">
                                    Protótipo de autenticalção com Supabase e React
                                </h2>
                                <p className="text-zinc-400">
                                    Estudos de tela de login, rotas e sessão com Supabase.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div> 
    );
}