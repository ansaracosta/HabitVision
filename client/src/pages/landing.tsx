import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, BarChart2, Smartphone } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-primary">HabiTracker</h1>
        <Button asChild className="bg-primary text-white shadow-md hover:bg-primary/90">
          <a href="/api/login">Entrar</a>
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <CheckCircle className="h-4 w-4" />
            Controle seus hábitos e evolua todo dia
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Transforme seus{" "}
            <span className="text-primary">hábitos</span> em resultados
          </h2>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Acompanhe seus hábitos diários, sessões de estudo e uso do celular.
            Visualize seu progresso e mantenha a consistência.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-primary text-white shadow-lg hover:bg-primary/90 text-base px-8 py-6 h-auto rounded-xl"
          >
            <a href="/api/login">Começar agora com Google</a>
          </Button>

          <p className="text-sm text-gray-400 mt-4">
            Gratuito. Sem cartão de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hábitos Diários</h3>
            <p className="text-sm text-gray-500">
              Crie e acompanhe hábitos personalizados com lembretes e histórico completo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Planos de Estudo</h3>
            <p className="text-sm text-gray-500">
              Trilhas estruturadas de Frontend, Algoritmos e Lógica de Programação.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Estatísticas</h3>
            <p className="text-sm text-gray-500">
              Visualize seu progresso com gráficos detalhados e métricas de desempenho.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-400">
        © 2026 HabiTracker · Todos os direitos reservados
      </footer>
    </div>
  );
}
