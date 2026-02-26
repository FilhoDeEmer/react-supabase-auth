import { useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Página não encontrada"
      subtitle="A página que você está tentando acessar não existe ou foi movida."
      footer={
        <span>
          Sleep Calc • Desenvolvido por{" "}
          <span className="text-zinc-200">GIT: FilhoDeEmer</span>
        </span>
      }
    >
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-indigo-400 tracking-tight">
            404
          </h1>

          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Parece que você se perdeu no mundo Pokémon...
            Vamos te levar de volta ao caminho certo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            className="h-10 px-6"
            onClick={() => navigate("/dashboard")}
          >
            Ir para Dashboard
          </Button>

          <Button
            variant="secondary"
            className="h-10 px-6"
            onClick={() => navigate("/sobre")}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}