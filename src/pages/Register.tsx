import { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import AuthLayout from '../layout/AuthLayout';

export default function Register() {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg(null);
        setErrorMsg(null);
        setLoading(true);

        try {
            await signUp(email, password);
            setMsg("Conta criada! Verifique seu e-mail para confirmar sua conta.");
            setTimeout(() => navigate('/login'), 900);
        } catch (error: any) {
            setErrorMsg(error.message ?? "Falha no cadastro.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Criar conta"
            subtitle="Preencha os campos abaixo para criar sua conta."
            footer={
                <span>
                    Desenvolvido como protótipo por{" "}
                    <span className="text-zinc-200">GIT: FilhoDeEmer</span>
                </span>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm text-zinc-300" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm text-zinc-300" htmlFor="password">
                        Senha
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-11 rounded-lg bg-zinc-950/60 border border-zinc-800 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60"
                    />
                </div>

                {msg && <p>{msg}</p>}
                {errorMsg && <p style={{color: 'crimson'}}>{errorMsg}</p>} 

                <button disabled={loading} type='submit'>
                    {loading ? "Criando..." : "Criar"}
                </button>
            </form>

            <div style={{marginTop: 12}}>
                <Link to='/login'>Já tem uma conta? Entre</Link>
            </div>
        </AuthLayout>
    );
}